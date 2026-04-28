# Cross-cutting JS hooks & client architecture

**Date:** 2026-04-28
**Auditor:** Claude Opus 4.7 (cross-cutting subagent)
**Score:** 🟡
**Hooks audited:** 16

## TL;DR

Lifecycle hygiene is good — every hook removes the listeners it adds in `destroyed()`/`_unbind()` and the `_unbind`-then-`_bind` re-entry pattern is consistent. But four cross-cutting failures bite: every `localStorage` call is uncaught (Safari private mode crashes the hook on mount, killing the LiveSocket), `ExoCommandPalette` registers a *page-global* `Cmd+K` handler with no opt-out (collides with browser/host shortcuts and across multiple instances), `ExoOverlay` traps focus in JS only and never sets `inert` on the rest of the page (WAI-ARIA dialog spec violation), and `tabs/swap/toast` ship as interactive components with **no hook at all**. Trigger composition via wrapper-spans + `_findControl` is excellent for popover/dropdown but not adopted by tooltip/hover_card/context_menu, leaving server-rendered HTML non-interactive until the hook mounts.

## Hook inventory

| Hook | Registered | Lifecycle clean | Doc listeners | localStorage safe | a11y wiring | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| ExoAccordion | 🟢 | 🟢 paired add/remove `accordion.js:106-109` | n/a | n/a | 🟢 `aria-expanded` synced on mount/update | No `updated()` re-bind needed — only delegated listeners |
| ExoCarousel | 🟢 | 🟡 missing `updated()` `carousel.js:5-50` | n/a | n/a | 🔴 no `aria-disabled` on prev/next at boundaries | Stale refs if track re-renders |
| ExoCollapsible | 🟢 | 🟢 `collapsible.js:30-32` | n/a | n/a | 🟢 `aria-expanded` synced | Hidden checkbox state lost on patch (no `phx-update="ignore"`) |
| ExoCombobox | 🟢 | 🟢 `_unbind` clears every ref `combobox.js:193-214` | n/a | n/a | 🟡 `aria-busy` missing on loading | `setTimeout(200)` blur-detect (`:93-99`) is flaky |
| ExoCommandPalette | 🟢 | 🟢 `command_palette.js:226-250` | 🔴 `document.keydown` Cmd+K — global, opt-in absent `:74-80` | n/a | 🟢 `aria-activedescendant` synced | Singleton-by-default, but API allows multiple instances → both open |
| ExoContextMenu | 🟢 | 🟢 `context_menu.js:123-147` | 🟢 capture-phase `pointerdown/click/contextmenu` removed | n/a | 🟡 tabindex/role applied client-side `:13-16` (FOIASS until JS) | `_bindCloseListeners` re-runs `removeEventListener` defensively |
| ExoDropdownMenu | 🟢 | 🟢 `dropdown_menu.js:26-32` | n/a | n/a | 🟡 no Escape, no typeahead | Relies on popover dismiss for close |
| ExoHoverCard | 🟢 | 🟢 `hover_card.js:69-92` | n/a | n/a | 🔴 `role="tooltip"` on rich content (overlay.ex) | Two `setTimeout` cleared in `_unbind` |
| ExoMenubar | 🟢 | 🟢 `menubar.js:240-258` | 🟢 `document.pointerdown` capture-phase removed | n/a | 🟢 full ARIA menubar wiring | `_focusOutTimer` cleared on unbind |
| ExoOverlay | 🟢 | 🟢 `overlay.js:184-197` | 🟢 capture-phase `keydown/pointerdown/click` removed; MutationObserver disconnected | n/a | 🟡 JS-only focus trap; outside content not `inert` | Document-level pointerdown fires on every page click |
| ExoPopover | 🟢 | 🟢 `popover.js:85-101` | n/a | n/a | 🟢 `aria-expanded`/`aria-haspopup` synced | `_findControl` mutates inner role/tabindex non-idempotently on every `updated()` `:65-68` |
| ExoRating | 🟢 | 🟢 `rating.js:53-61` | n/a | n/a | 🟡 `attr :id` not declared in `form.ex:817-824` → hook crashes with no id | `_setValue` dispatches `input`+`change` |
| ExoSelect | 🟢 | 🟡 `select.js:122-139` doesn't clear refs the way other hooks do | n/a | n/a | 🟡 focus-managed listbox (not `aria-activedescendant`) | No `Tab` to commit — only Enter/Space |
| ExoSidebar | 🟢 | 🟢 `sidebar.js:28-32` | n/a | 🔴 `localStorage.setItem/getItem` uncaught `:22,42` | 🔴 no `aria-expanded`, no `aria-controls`, no Escape, no `inert`, no focus trap | `matchMedia` listener never attached — viewport flip mid-session not handled |
| ExoThemeToggle | 🟢 | 🟢 `theme_toggle.js:17-21` | n/a | 🔴 `localStorage.getItem/setItem` uncaught `:11,24` | 🔴 no `aria-pressed` mirror | No `prefers-color-scheme` listener — `system` mode is read-once |
| ExoTooltip | 🟢 | 🟢 `tooltip.js:116-136` | n/a | n/a | 🟡 anchor wrapper adds extra tab stop | Module-scope `lastHideTime` is shared across all tooltips on page (intentional skip-delay), but means tests must reset between cases |

## Recurring patterns

### 1. `_unbind`-then-`_bind` re-entry on `mounted()` and `updated()`

- **Where:** `combobox.js:2-4`, `command_palette.js:2-4`, `context_menu.js:2-4`, `dropdown_menu.js:2-4`, `hover_card.js:2-4`, `menubar.js:2-4`, `overlay.js:11-14`, `popover.js:2-4`, `rating.js:2-4`, `select.js:2-4`, `tooltip.js:9-11`. `accordion.js:14-109`, `carousel.js:4-50`, `collapsible.js:7-43`, `sidebar.js:7-47`, `theme_toggle.js:1-43` use the older split-style.
- **Impact:** The new pattern is correct and idempotent; the legacy hooks (`accordion`, `carousel`, `theme_toggle`) skip `updated()` entirely. `ExoCarousel` will hold stale refs to `this.track`/`this.viewport` if LiveView morphs the slide list.
- **Fix recipe:** Migrate `accordion`, `carousel`, `theme_toggle` to the `_bind`/`_unbind` re-entry pattern.

### 2. Uncaught `localStorage` access

- **Where:** `sidebar.js:22` (set), `sidebar.js:42` (get); `theme_toggle.js:11` (get), `theme_toggle.js:24` (set).
- **Impact:** Safari private mode + storage-disabled + cross-origin iframes throw `SecurityError`/`QuotaExceededError`. The throw propagates out of `mounted()` → LiveSocket aborts the hook. Sidebar layout breaks completely; theme toggle locks out all interaction.
- **Fix recipe:** Wrap each in `try { ... } catch { /* ignore */ }`. Have a non-throwing helper `safeStorage.get(key)`/`safeStorage.set(key, val)` shared across hooks.

### 3. Page-global keyboard listeners with no opt-out

- **Where:** `command_palette.js:80` (`document.keydown` for `Cmd+K`/`Ctrl+K`).
- **Impact:** Multiple palettes on one page → both toggle. Host application loses control over the shortcut. Users with their own `Cmd+K` flow are overridden silently.
- **Fix recipe:** Gate the global listener on a `data-global-shortcut` attribute (default off, opt-in via component attr `global_shortcut={true}`). Document the singleton-vs-instance contract.

### 4. JS-only focus trap, no outside `inert`

- **Where:** `overlay.js:139-162` traps `Tab`/`Shift+Tab` inside `_panel`. `inert` is set on the dialog wrapper only when closed (`overlay.ex:102,438,513`). Page content behind the open dialog never becomes inert.
- **Impact:** WAI-ARIA dialog spec violated. AT users can navigate outside. If two overlays mount or JS fails, the trap is gone.
- **Fix recipe:** In `overlay.js:_activate`, set `inert` on `body > *:not(#dialog-id)` (or use the `<dialog>` element). Restore in `_deactivate`.

### 5. Tabindex/role applied client-side rather than in HEEx

- **Where:** `command_palette.js:17-30` (sets `role="option"`, `tabindex="-1"` on items), `context_menu.js:13-16` (sets `tabindex`, `role`, `aria-haspopup` on trigger), `menubar.js:13-33` (sets `tabindex`, `aria-expanded`, `role="menuitem"`), `popover.js:65-72` (sets `role="button"`, `tabindex="0"`, `type="button"`).
- **Impact:** Server-rendered HTML is non-interactive until JS mounts. Flash of inaccessible state, especially on slow connections or when LiveView socket is delayed. Also makes SSR-only consumers (no LiveView) unusable.
- **Fix recipe:** Emit these attributes from the HEEx templates. Hooks should *verify*, not *create*.

### 6. `_findControl`/`_prepareControl` is not idempotent on `updated()`

- **Where:** `popover.js:43-72`. Each `updated()` re-runs `_prepareControl` which sets `role="button"`, `tabindex="0"`, `type="button"` on `_control`.
- **Impact:** Setting the same attribute repeatedly is a no-op for HTML, but if `_findControl` selects a *different* element on re-bind (e.g. content slot reordered), the *old* element retains forced attributes. No cleanup of mutations made to the inner element.
- **Fix recipe:** Track the mutated element on `_bind` and revert on `_unbind`.

## Lifecycle leaks (concrete)

| Hook | `addEventListener` calls | Cleanup verified |
| --- | --- | --- |
| ExoAccordion | `el.keydown` `:26`, `el.click` `:60` | `:107-108` 🟢 |
| ExoCarousel | `prev.click` `:37`, `next.click` `:38`, `el.keydown` `:40` | `:47-49` 🟢 |
| ExoCollapsible | `el.click` `:12` | `:31` 🟢 |
| ExoCombobox | `clear.click` `:71`, `popover.toggle` `:84`, `search.focus/blur` `:100-101`, `search.input` `:123`, `listbox.click` `:133`, `popover.keydown` `:157` + `setTimeout` `:36, 93, 112` | `_unbind` clears all + `clearTimeout(_debounceTimer)` `:194` 🟢 |
| ExoCommandPalette | `document.keydown` `:80`, `el.keydown` `:123`, `input.input` `:126`, `el.pointermove` `:133`, `el.click` `:146`, `backdrop.click` `:150` | `:227-234` 🟢 |
| ExoContextMenu | `trigger.contextmenu` `:32`, `trigger.keydown` `:40`, `document.{pointerdown,mousedown,click,contextmenu}` capture `:74-77`, `menu.click` `:95`, `menu.keydown` `:120` + 2× `requestAnimationFrame` | `:124-133` 🟢 |
| ExoDropdownMenu | `menu.keydown` `:24` | `:27-29` 🟢 |
| ExoHoverCard | `el.pointerenter/leave` `:47-48`, `trigger.focusin/out` `:49-50`, `content.focusin/out` `:51-52`, `el.keydown` `:53` + 2× `setTimeout` | `:70-79`, `clearTimeout(_showTimeout/_hideTimeout)` `:80-81` 🟢 |
| ExoMenubar | `el.click` `:50`, `el.pointerover` `:58`, `el.keydown` `:70`, `document.pointerdown` capture `:75`, `el.focusout` `:83` + `setTimeout` `:79` | `:241-246` 🟢 |
| ExoOverlay | `document.{keydown,pointerdown,click}` capture `:35-37`, `MutationObserver` `:38-41` + `requestAnimationFrame` `:95, 109` | `:184-188` 🟢 disconnect + remove |
| ExoPopover | `trigger.click` `:38`, `trigger.keydown` `:39`, `popover.toggle` `:40` | `:86-92` 🟢 |
| ExoRating | `el.click` `:29`, `el.change` `:30` | `:54-55` 🟢 |
| ExoSelect | `popover.toggle` `:28`, `listbox.click` `:36`, `listbox.keydown` `:76` | `:122-131` 🟢 |
| ExoSidebar | `toggle.change` `:25` | `:29-31` 🟢 |
| ExoThemeToggle | per-button `click` `:12` | `:18-20` 🟢 |
| ExoTooltip | `wrapper.{mouseenter,mouseleave}` `:73-74`, `anchor.{focusin,focusout}` `:75-76`, `wrapper.keydown` `:77` + `setTimeout` `:35`, `requestAnimationFrame` `:37` | `:117-125` 🟢 |

**No leaked observers or intervals. The only `MutationObserver` (overlay.js:33) is disconnected. No `setInterval` calls anywhere. `setTimeout` calls all stored in `this._*Timer`/`this._timeout` and cleared on `_unbind`.**

## Server↔client contracts

| Hook | `pushEvent` | `handleEvent` | Server-side `handle_event` expected |
| --- | --- | --- | --- |
| ExoCombobox | `combobox.js:113` `pushEvent(onFilter, {query})` | none | `onFilter` event handler in parent LV |
| ExoOverlay | none — reads `data-state` from `Phoenix.LiveView.JS` | none | `show_modal/hide_modal` JS commands set `data-state` |
| All others | none | none | none |

**Findings:**
- ExoUI hooks are almost entirely client-only. State ownership is split: open/closed for popover/select/combobox lives client-side (Popover API); for modal/drawer/sheet it lives in `Phoenix.LiveView.JS` server commands and is read by `ExoOverlay` via `data-state` attribute (`overlay.js:64`).
- `combobox.js:111-115` fires-and-forgets `pushEvent` for server filter. **No handshake** — when the server stops loading, the hook can't tell. The `loading` attr is one-way (server → client only). Consumers must server-render `loading=false` to clear UI state.
- No hook calls `pushEventTo(this.el, ...)` — every server interaction is broadcast to the parent LiveView, not scoped to component.

## Native API usage and fallbacks

- **Popover API consumers:** `popover.js:77-81`, `combobox.js:89, 96, 191`, `select.js:64, 108`, `tooltip.js:30, 36, 50`. All wrap `showPopover()`/`hidePopover()` in `try/catch (_err) {}` — silent failures on browsers without support.
- **Popover fallback:** Tooltip has CSS-only `:hover` fallback (`tooltip.css:48-52`, per category report). Popover/select/combobox have no fallback path — broken on IE/old Safari.
- **Anchor positioning:** Detected once at module load (`tooltip.js:3-4`: `CSS.supports('position-area', 'top')`). When absent, `_positionFallback` (`tooltip.js:94-114`) computes top/left manually. Only `tooltip` has fallback; `popover`, `select`, `combobox` rely on CSS `position-anchor` with no JS fallback (broken layout on Firefox <125, Safari <17.4).
- **`inert`:** Used by `overlay.js:92, 104` (set/remove on dialog itself); component templates set `inert={!@show}` (`overlay.ex:28, 391, 461`). Outside content never marked inert — see Pattern #4.
- **`requestAnimationFrame`:** `command_palette.js:50`, `context_menu.js:48, 57`, `combobox.js:40-43`, `overlay.js:95, 109`, `sidebar.js:15`, `tooltip.js:37`. All used to defer focus or layout reads after DOM mutation. No leaks.

## localStorage safety

| Call | File:line | try/catch? |
| --- | --- | --- |
| `getItem('exo-sidebar-collapsed')` | `sidebar.js:42` | 🔴 no |
| `setItem('exo-sidebar-collapsed', ...)` | `sidebar.js:22` | 🔴 no |
| `getItem('exo-theme')` | `theme_toggle.js:24` | 🔴 no |
| `setItem('exo-theme', value)` | `theme_toggle.js:11` | 🔴 no |

**Every single `localStorage` call across the codebase is unprotected.** Safari private mode + storage-blocked browsers throw on access; the unhandled exception kills `mounted()`, and LiveView doesn't retry. This is the most dangerous cross-cutting bug in the JS layer.

## Hook coverage gaps

| Component | Where | Why a hook is needed |
| --- | --- | --- |
| `tabs/1` | `data_display.ex:250-279` | Not a real ARIA tabs widget — needs `ExoTabs` for roving tabindex, `aria-controls`, arrow keys, Home/End. Per category report `04-data-display:101-103`. |
| `swap/1` | `core.ex:359-360` | Both `<:on>` and `<:off>` slots render simultaneously; checkbox is `aria-hidden` + `tabindex="-1"`. No JS hook to drive `aria-pressed`. Per `01-core-components:75, 82`. |
| `toast_container` | `feedback.ex:83-107` | No `setTimeout` auto-dismiss, no pause-on-hover/focus, no Escape close, no swipe. Needs `ExoToast`. Per `05-feedback:402-411`. |
| `pagination` (disabled-as-span) | `data_display.ex:320-322, 348-350` | Renders disabled buttons as `<span>` — focus order break. Hook could fix DOM, but better fixed in HEEx. |
| `swap`/`tabs`/`toast` are interactive components shipped without hooks. | — | Highest priority gap. |

**Soft gap (existing hook insufficient):**
- `sidebar.js` does not handle the mobile drawer (no focus trap, no `inert`, no Escape). Per `07-layouts-and-app-shell:226-244`.
- `dropdown_menu.js` lacks Escape, typeahead, `Tab` skip-out. Per `03-overlay-and-menu:239`.
- `theme_toggle.js` lacks `prefers-color-scheme` listener for `system` mode. Per `01-core-components:101`.

## Dead hooks / orphans

- **No orphans.** Every file in `assets/js/hooks/` is imported and registered in `assets/js/index.js:1-37` (verified all 16). All 16 named exports `Exo<Name>` follow convention.
- **Indirectly unused:** `ExoPopover` is registered globally (`index.js:7`) but **`select` and `combobox` re-implement open/close internally** rather than mounting the popover hook. Per `02-form-components:281-285`. They both expect a `popovertarget` ID and read `:popover-open` directly. Possibly intentional — the popover hook only handles trigger composition + ARIA — but it means the same `toggle` event has two listeners in some configurations (`select.js:28` and `popover.js:40` if both hooks are attached).
- **`ExoCollapsible` consumers:** Only `overlay.ex:347` uses the hook. No `phx-update="ignore"` on the rendered checkbox, so a parent template re-render resets `checked` state. Per `03-overlay-and-menu:111`.

## Top 10 critical hook issues

1. **Every `localStorage` call is unprotected** — `sidebar.js:22,42`, `theme_toggle.js:11,24`. Safari private mode kills the hook on mount.
2. **Outside content never made `inert` when modal/drawer/sheet open** — `overlay.js:81-99`. Focus trap is JS-only. WAI-ARIA dialog violation.
3. **`Cmd+K` is page-global with no opt-out** — `command_palette.js:80`. Multiple palettes both open; host shortcuts overridden.
4. **Three components ship without hooks**: `tabs` (no roving tabindex, no panels), `swap` (keyboard-inaccessible), `toast` (no auto-dismiss).
5. **`ExoRating` requires `id` but `attr :id` is not declared** — `form.ex:817-824`. Hook crashes in any LV not using Storybook. Per `02-form-components:198-200`.
6. **Tabindex/role applied client-side** in `command_palette.js:17-30`, `context_menu.js:13-16`, `menubar.js:13-33`, `popover.js:65-68`. SSR HTML non-interactive until JS mounts.
7. **`combobox` server-filter has no completion handshake** — `combobox.js:111-115`. `loading` attr is one-way; UI cannot re-enable until parent re-renders.
8. **`theme_toggle` ignores `prefers-color-scheme` change events** — `theme_toggle.js:34-38`. `system` mode reads OS theme once at mount.
9. **`carousel` has no `updated()` re-bind** — `carousel.js:5-50`. Stale refs if track re-renders. No `aria-disabled` on prev/next at scroll boundaries.
10. **`popover._findControl` mutates inner element role/tabindex non-idempotently** — `popover.js:65-72`. `updated()` re-runs without checking if the control changed; previously-mutated element keeps forced attributes.

## Quick wins

- Wrap all four `localStorage.*` calls in `try/catch`. Effort: 5 min.
- Add `attr :id, :string, required: true` to `rating/1` (`form.ex:817`). Effort: 1 min.
- Move `tabindex`/`role`/`aria-haspopup` out of `command_palette.js:17-30`, `context_menu.js:13-16`, `menubar.js:13-33` into HEEx templates. Effort: 1h.
- Add `prefers-color-scheme` listener to `theme_toggle.js`. Effort: 15 min.
- Add `updated()` to `carousel.js`, `theme_toggle.js`, `accordion.js` (delegated listeners only need re-bind for ref refresh). Effort: 30 min.
- Gate `Cmd+K` on `data-global-shortcut` attribute (default off). Effort: 10 min.

## Strategic recommendations

1. **Promote `ExoOverlay` to handle outside-`inert`.** In `_activate`/`_deactivate` (`overlay.js:81-112`), iterate `body > *:not(#dialog-id)` and toggle `inert`. Same primitive should be reused by `sidebar` mobile drawer (currently has zero focus management).
2. **Adopt the popover wrapper-span + `_findControl` pattern for `tooltip`, `hover_card`, `context_menu`.** Eliminates the double tab-stop in tooltip and the non-interactive SSR HTML in hover_card/context_menu.
3. **Build `ExoTabs`, `ExoSwap`, `ExoToast`.** Three missing hooks for components already in the public API. Toast also needs the `phx-update="stream"` already present in `feedback.ex:85` to be paired with per-toast lifecycle (mount: start timer; destroyed: cancel).
4. **Standardize the `_unbind`/`_bind` re-entry pattern** across all 16 hooks. `accordion`, `carousel`, `theme_toggle`, `sidebar` are the legacy stragglers.
5. **Decide ownership of `ExoPopover` vs hook-internal popover handling.** `select.js`/`combobox.js` duplicate the `aria-expanded` sync that `popover.js:18-23` already does. Either compose them or document why not.
6. **Server↔client handshake for `combobox` server filter.** Add a `handleEvent("combobox:loading_done", ...)` listener so the hook can clear UI state independent of the parent re-render cycle.
7. **Consider portaling dialogs to `<body>`** — would make outside-`inert` trivial and would avoid the focus-trap dependency entirely (the native `<dialog>` element does both for free).

## Open questions

1. Is `command_palette` intended as a singleton page-wide widget, or composable like `popover`? The global `Cmd+K` implies the former, but the API allows multiple instances.
2. Should `ExoPopover` be the single source of truth for `aria-expanded`/`aria-haspopup`, with select/combobox/dropdown_menu composing it instead of duplicating? Right now they share contract but not code.
3. Should hooks be allowed to mutate HEEx-emitted attributes (current `_findControl` behaviour) or required to be observe-only? Current pattern is fragile under template churn.
4. Can the library standardize on `<dialog>` or remain on `<div role="dialog">`? `<dialog>` would eliminate the JS focus trap entirely.
5. Should `localStorage` access be centralized in a `safeStorage` helper module shared by all hooks, or is per-hook `try/catch` sufficient?
