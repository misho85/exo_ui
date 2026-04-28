# Audit: Overlay & Menu

**Date:** 2026-04-28
**Auditor:** Claude Opus 4.7 (subagent)
**Score:** 🟡 has problems
**Maturity:** ~70% (subjective vs shadcn/Radix dialog + menu primitives)

## TL;DR

The overlay/menu surface is the most ambitious area of ExoUI and several pieces are genuinely solid (popover composition fix, native Popover API for `popover`/`dropdown_menu`/`tooltip`, the new shared `ExoOverlay` hook, menubar keyboard nav, command palette filtering). But the dialog contract is not uniform: `modal`/`confirm_modal` cannot be opened from outside (`show_modal/1` is private, `lib/exo_ui/components/overlay.ex:89`), `command_palette` lies about being a dialog while keeping `aria-modal="true"` on a wrapper that never receives focus management, and outside content is never set `inert` when a modal is open — meaning the "focus trap" depends solely on a JS Tab handler. Trigger-composition is fixed for `popover`/`dropdown_menu` but `tooltip` and `hover_card` still wrap content in trigger wrappers without an `as_child`-style escape hatch, and `context_menu` items render twice when a separator is set (one button with empty label per separator entry).

## Surface map

### Public functions (`lib/exo_ui/components.ex:53-67`)

- `modal/1`, `confirm_modal/1` — dialog with backdrop, title, actions
- `popover/1` — native Popover API floating panel
- `dropdown_menu/1` — popover-backed `role="menu"`
- `dropdown/1` — **deprecated** (`lib/exo_ui/components.ex:58`), still re-exported
- `tooltip/1` — anchored, `popover="manual"` upgrade in JS
- `collapsible/1` — checkbox-driven CSS-only show/hide
- `drawer/1` — side panel, public `show_drawer/1`+`hide_drawer/1`
- `sheet/1` — slide-out panel; `show_sheet/1`/`hide_sheet/1` only on `ExoUI.Components.Overlay` (NOT delegated)
- `hover_card/1` — pointer-driven card with delays
- `context_menu/1` — right-click menu
- `command_palette/1` — dialog with combobox+listbox, Cmd+K binding
- `menubar/1` — horizontal menu bar with sub-menus

### Source modules

- `lib/exo_ui/components/overlay.ex` (748 LOC) — every overlay component lives here
- `lib/exo_ui/components.ex:53-74` — public delegation surface
- `assets/js/hooks/overlay.js` (NEW, 201 LOC) — shared focus-trap, Escape, focus-restore for `modal`/`drawer`/`sheet`
- `assets/js/hooks/popover.js` (104 LOC) — bind to `data-popover-target`, wire aria-expanded
- `assets/js/hooks/dropdown_menu.js` (35 LOC) — arrow/Home/End on `role="menu"`
- `assets/js/hooks/tooltip.js` (140 LOC) — popover upgrade + JS-positioning fallback
- `assets/js/hooks/hover_card.js` (95 LOC) — pointer/focus delays, Escape close
- `assets/js/hooks/context_menu.js` (151 LOC) — right-click + keyboard, viewport clamping
- `assets/js/hooks/command_palette.js` (254 LOC) — Cmd+K, filter, aria-activedescendant
- `assets/js/hooks/menubar.js` (262 LOC) — full WAI-ARIA menubar nav
- `assets/js/hooks/collapsible.js` (44 LOC) — toggle hidden checkbox

### Tests

- `test/exo_ui/components/modal_test.exs` (4 tests) — show/closed state, role, title, alertdialog
- `test/exo_ui/components/popover_test.exs` (12 tests) — incl. nested-button regression
- `test/exo_ui/components/dropdown_menu_test.exs` (16 tests)
- `test/exo_ui/components/dropdown_test.exs` (1 test) — basic
- `test/exo_ui/components/tooltip_test.exs` (16 tests)
- `test/exo_ui/components/hover_card_test.exs` (1 test)
- `test/exo_ui/components/context_menu_test.exs` (2 tests)
- `test/exo_ui/components/command_palette_test.exs` (3 tests)
- `test/exo_ui/components/menubar_test.exs` (1 test)
- `test/exo_ui/components/sheet_test.exs` (4 tests)
- `test/exo_ui/components/drawer_test.exs` (13 tests)
- `test/exo_ui/components/collapsible_test.exs` (10 tests)
- `test/exo_ui/components/interactive_forwarding_test.exs:45-194` — class/rest forwarding for every overlay
- `test/browser/popover.spec.js` (2 specs)
- `test/browser/dropdown_menu.spec.js` (1 spec)
- `test/browser/tooltip.spec.js` (2 specs)
- `test/browser/hover_card.spec.js` (1 spec)
- `test/browser/context_menu.spec.js` (1 spec)
- `test/browser/command_palette.spec.js` (4 specs)
- `test/browser/menubar.spec.js` (2 specs)
- `test/browser/overlay.spec.js` (3 specs — modal/sheet/drawer Escape+focus restore)
- NO browser specs: `confirm_modal`, `dropdown` (deprecated), `collapsible`

### Storybook

- All 13 components have a `*.story.exs` (`storybook/stories/components/`). Modal is `:component` style, the rest are `:page` style.

## What works (with proofs)

- **Trigger composition is real for popover/dropdown_menu.** `popover/1` wraps the trigger slot in a `<span data-exo="popover-trigger">` (`lib/exo_ui/components/overlay.ex:122-132`); `popover.js:43-57` finds an inner button/link inside the wrapper and binds aria-haspopup/aria-expanded onto that real control. `popover_test.exs:117-132` and `dropdown_menu_test.exs:167-182` lock in `button button == 0`. This is the cleanest solution in the library.
- **Native Popover API is wired correctly.** Popover content uses `popover={@mode}` (default `auto`) at `overlay.ex:135`, dropdown items use `popovertarget={@id} popovertargetaction="hide"` at `overlay.ex:243-244`, and `popover.css:64-71` transitions only on `:popover-open` with `allow-discrete` for Safari behavior. `tooltip.js:30` upgrades to `popover="manual"` to enter the top layer.
- **`ExoOverlay` hook centralizes the dialog contract.** One hook for `modal`/`drawer`/`sheet` (`overlay.js:47-61`): focus restoration via `_pendingInvoker` capture in document-level pointerdown listener (lines 165-173), Escape close by clicking the close button (line 135), Tab/Shift+Tab focus loop within `_panel` (lines 139-162), all listeners removed in `_unbind()` (lines 184-197). Storybook spec at `test/browser/overlay.spec.js:22-60` confirms focus restore for `sheet` and `drawer`.
- **Menubar matches WAI-ARIA pattern closely.** `menubar.js` does roving tabindex (line 15), ArrowLeft/Right at the bar, ArrowUp/Down inside menus, Home/End, Escape close, ArrowRight from inside a menu opens the next menu's first item (lines 154-167) — verified by `menubar.spec.js:28-65`.
- **Command palette has aria-activedescendant + roving listbox.** Input gets `role="combobox"` + `aria-controls` (`command_palette.js:33-35`), each option gets `role="option"` (line 19), `aria-activedescendant` is synced (line 220), Cmd+K toggles open (line 75), Escape closes (line 83), filter state survives. `command_palette.spec.js:51-76` proves Enter on filtered match selects.
- **Inert is at least set on the closed dialog itself.** `overlay.ex:28,391,461` set `inert={!@show}` so a closed modal/drawer/sheet cannot trap Tab into hidden content. `JS.set_attribute({"inert","true"})` flips it on close (`overlay.ex:102,438,513`).
- **Listeners are reliably cleaned up.** Every hook has a paired `_unbind()`: `popover.js:85-101`, `dropdown_menu.js:26-32`, `tooltip.js:116-136`, `hover_card.js:69-92`, `context_menu.js:123-147`, `command_palette.js:226-250`, `menubar.js:240-258`, `overlay.js:184-197`, `collapsible.js:30-32`. No window/document listener is added without removal.
- **Forwarding contract is tested.** `interactive_forwarding_test.exs:45-194` asserts that every overlay places `class` and rest attrs on the right node (popover→content, dropdown_menu→menu, tooltip→content, the rest→root). This catches a whole class of refactor regressions.

## What is missing or half-done

- **Outside content is never `inert` when a modal is open.** The README implies `aria-modal="true"` (`overlay.ex:39,400,471`) but `inert` is only on the dialog wrapper itself. Screen readers can still announce content underneath; the only thing keeping focus in is the JS Tab handler at `overlay.js:139-162`, which fails the moment a consumer renders multiple overlays or the panel re-mounts.
- **`modal` cannot be opened from outside.** `show_modal/1` and `hide_modal/1` are `defp` (`overlay.ex:89,98`) and not re-exported in `components.ex:53-74`. The only way to open a modal is to flip the `show` assign in LiveView state, which forces a server roundtrip. By contrast, `drawer`/`sheet`/`command_palette` ship `show_*`/`hide_*` as `def`.
- **`confirm_modal` does the same.** It composes the (private) `hide_modal/2` from inside its action buttons (`overlay.ex:80-83`). Because the function isn't exposed, downstream apps cannot reuse the same close pipeline elsewhere.
- **`command_palette` has no public `show_*` re-export** in `components.ex` — only on `Overlay`.
- **Required dialog title is NOT enforced.** `modal/1`, `drawer/1`, `sheet/1`, `command_palette/1` all make the title slot/attr optional (`overlay.ex:17,380,450`); `aria-labelledby` is only set when the slot is present (`overlay.ex:40,401,472`). A dialog without an accessible name is a spec violation.
- **`modal` and `drawer` do NOT use `phx-mounted` + `show_drawer` symmetry.** Modal does (`overlay.ex:30`), sheet does (`overlay.ex:463`), drawer does NOT (`overlay.ex:383-395` has no `phx-mounted`). Opening with `show={true}` won't fire `focus_first` for drawer.
- **`hover_card` uses `role="tooltip"` for non-tooltip content** (`overlay.ex:549`). The Radix equivalent is rich content and is not a tooltip — should be `role` omitted or appropriate landmark. Combined with `aria-describedby` on the trigger (`overlay.ex:541`), the entire card's content gets read as a tooltip description, which destroys long-form content readability.
- **`context_menu` separator path renders empty buttons.** `overlay.ex:578-588` runs the `:if={!item[:separator]}` branch for every entry, including separator entries — but the separator branch is a sibling, not an alternative, so a separator entry produces both a `<div role="separator">` AND a `<button data-exo="context-menu-item">` with an empty label. The render test passes only because `length(items) == 2` for `[Copy, sep, Delete]` and `length(separator) == 1`, but the test `context_menu_test.exs:38-43` is wrong on the math: with a separator entry, `<:item label="" separator />` adds a button with empty label. Visual: every separator becomes a clickable empty row.

  Re-reading: `<:item label="" separator />` will render the separator (`:if={item[:separator]}` is truthy) and ALSO render the button (`:if={!item[:separator]}` evaluates the truthiness of `separator` which is `true` → button is skipped). OK, the `!item[:separator]` does filter. **Retraction:** this is fine. (Marking corrected note to keep.)
- **`tooltip` lacks a true accessible-name path for non-text triggers.** `tooltip-anchor` is a `<span tabindex="0">` (`overlay.ex:312-318`). When a consumer wraps a button (`storybook/tooltip.story.exs:11-13`), there are now TWO tab stops (anchor span + the inner button) — a keyboard user has to Tab through both.
- **`menubar` Cmd+K conflict.** `command_palette.js:74-79` registers a global `Ctrl+K`/`Cmd+K`. If a consumer renders both a menubar and a command palette on the same page, no precedence is documented.
- **No reduced-motion handling.** None of the CSS files (`popover.css`, `tooltip.css`, `hover-card.css`, `context-menu.css`, `command-palette.css`, `menubar.css`, `sheet.css`, `drawer.css`, `collapsible.css`) wrap their `transition`/`animation` rules in `@media (prefers-reduced-motion: reduce)`. `sheet.css:115-145` has 300ms slide-in animations that play unconditionally.
- **No tokenization for overlay-specific surfaces.** `tokens.css` exposes only `--exo-tooltip-bg`/`--exo-tooltip-fg`. Backdrops are hardcoded `oklch(0% 0 0 / 0.4)` in `modal.css:17`, `rgb(0 0 0 / 0.5)` in `sheet.css:16`, `oklch(0% 0 0 / 0.5)` in `drawer.css:15`, `rgb(0 0 0 / 0.5)` in `command-palette.css:15` — three different forms for the same conceptual color.
- **`dropdown` (deprecated) still ships in production CSS.** `dropdown.css:1-80` styles a separate `[data-exo="dropdown"]` selector; the active component is `[data-exo="dropdown-menu"]`. Both coexist.

## Per-component table

| Component | Status | Findings (file:line) | Recommended work |
| --- | --- | --- | --- |
| `modal` | 🔴 P0 | `show_modal`/`hide_modal` private at `overlay.ex:89,98`; outside content not `inert`; `aria-labelledby` skipped when title omitted (`overlay.ex:40`) | Promote to `def`, expose via `components.ex`, document title as required, add outside-`inert` |
| `confirm_modal` | 🟡 P1 | Inherits modal issues; `phx-click` on `<.button>` is OK but cancel/confirm handlers cannot be customized to *not* close (`overlay.ex:80-83`) | Add `keep_open` option; expose `show_confirm/1` |
| `popover` | 🟢 OK | Span wrapper + `_findControl` avoids nested-button (`overlay.ex:122`, `popover.js:43-57`); fallback CSS at `popover.css:89-109` | None |
| `dropdown_menu` | 🟢 OK | Roving via `dropdown_menu.js:9-23`; missing typeahead and Tab-out-closes | Add typeahead (chars within 500ms) |
| `dropdown` (deprecated) | 🟡 P2 | `@doc deprecated` set in `components.ex:58`; underlying impl at `overlay.ex:269-293` not marked at module level; CSS at `dropdown.css` still ships | Remove in next major; or move CSS into `dropdown_menu.css` |
| `tooltip` | 🟡 P1 | Double tab-stop: span anchor wraps button content (`overlay.ex:312-318`); CSS-only fallback path may flicker on Safari before hook upgrades to popover (`tooltip.css:48-52`) | Strip wrapper or set `tabindex="-1"` when inner control is focusable |
| `collapsible` | 🟡 P1 | Hidden checkbox driving CSS state means Phoenix patches that rerender the section reset `checked` (`overlay.ex:348-355`); no `phx-update="ignore"`; only one body region — no support for accordion-style group | Use `aria-expanded`-driven CSS, drop checkbox; or annotate with `phx-update="ignore"` |
| `drawer` | 🟡 P1 | No `phx-mounted={@show && show_drawer(@id)}` (compare `overlay.ex:383-395` to modal at `:30`); opening with `show={true}` doesn't focus first focusable on initial render | Add `phx-mounted` like modal/sheet |
| `sheet` | 🟡 P1 | `class={[@show && "open", @class]}` overwrites consumer string with array (`overlay.ex:464`); two state sources (`open` class + `data-state`); `<:title>` optional but `aria-labelledby` only added when present (`overlay.ex:472`) | Use `data-state` only; require title |
| `hover_card` | 🟡 P1 | `role="tooltip"` on a rich card (`overlay.ex:549`); `aria-describedby` forces SR to read the whole card as the trigger's description (`overlay.ex:541`); no Cmd+arrow keyboard open path | Drop `role`, switch to `aria-haspopup="dialog"` + `aria-expanded`, expose `aria-labelledby` |
| `context_menu` | 🟡 P1 | Tabindex/role applied JS-side (`context_menu.js:13-16`) — server-rendered HTML missing them = flash of inaccessible state on first paint; document-level capture-phase listeners on every menu instance (`context_menu.js:74-77`); no submenu support | Render `tabindex`/`role` server-side |
| `command_palette` | 🟡 P1 | Global Cmd+K listener (`command_palette.js:80`) collides with browser/sibling apps; legacy `inner_block` slot mixed with new `:item` slot (`overlay.ex:601,673-675`); `show_command_palette` not in `components.ex` | Make Cmd+K opt-in via attr; deprecate inner_block |
| `menubar` | 🟢 OK | Tight WAI-ARIA implementation; one hole — pointerover only re-opens if `openIndex >= 0` (`menubar.js:54`), so hover never auto-opens; matches Radix |  Keep |

Status legend: P0 (incorrect/misleading public API), P1 (works but below shadcn bar), P2 (polish), OK (acceptable).

## Dialog contract scorecard

| Requirement | `modal` | `confirm_modal` | `sheet` | `drawer` | `command_palette` |
| --- | --- | --- | --- | --- | --- |
| `role="dialog"` (or `alertdialog`) | 🟢 `overlay.ex:38` | 🟢 `overlay.ex:76` (alertdialog) | 🟢 `overlay.ex:470` | 🟢 `overlay.ex:399` | 🟢 `overlay.ex:626` |
| `aria-modal="true"` | 🟢 `overlay.ex:39` | 🟢 inherited | 🟢 `overlay.ex:471` | 🟢 `overlay.ex:400` | 🟢 `overlay.ex:626` |
| `aria-labelledby` always linked | 🔴 only when slot present (`overlay.ex:40`) | 🟡 same | 🔴 `overlay.ex:472` | 🔴 `overlay.ex:401` | 🔴 uses `aria-label` only (`overlay.ex:626`) |
| `aria-describedby` body | 🟢 `overlay.ex:41-52` | 🟢 inherits | 🔴 not set | 🔴 not set | 🔴 not set |
| Focus trap | 🟡 JS-only (`overlay.js:139-162`) | 🟡 inherits | 🟡 same | 🟡 same | 🔴 NO trap (uses different hook) |
| Escape closes | 🟢 `overlay.js:132-137` | 🟢 inherits | 🟢 same | 🟢 same | 🟢 `command_palette.js:83` |
| Focus restore on close | 🟢 `overlay.js:101-112` | 🟢 inherits | 🟢 same | 🟢 same | 🔴 not implemented |
| Initial focus to dialog | 🟢 RAF + focus (`overlay.js:95-98`) | 🟢 inherits | 🟢 same | 🟡 missing `phx-mounted` (`overlay.ex:383-395`) | 🟢 `command_palette.js:50-52` |
| Outside content `inert` | 🔴 not done (only the dialog itself toggles inert) | 🔴 same | 🔴 same | 🔴 same | 🔴 same |
| Body scroll lock | 🟢 `body:has(...)` (`modal.css:78`, `sheet.css:147`, `drawer.css:100`) | 🟢 inherits | 🟢 same | 🟢 same | 🔴 missing in `command-palette.css` |
| Public open helper | 🔴 private | 🔴 private | 🟡 only on Overlay module | 🟢 `components.ex:68` | 🟡 only on Overlay module |
| Required title enforcement | 🔴 optional | 🟢 attr `default: "Confirm"` | 🔴 optional | 🔴 optional | 🔴 attr `aria-label` only |

## Problems by severity

### 🔴 Critical

#### 1. Outside content is never made `inert` while a dialog is open

- **Where:** `lib/exo_ui/components/overlay.ex:23-60` (modal), `:383-422` (drawer), `:454-494` (sheet); `assets/js/hooks/overlay.js:81-99`
- **What happens:** `inert={!@show}` is on the dialog ROOT; when open, `inert` is removed from the dialog. The page content behind the backdrop never becomes inert. Screen readers can still navigate the rest of the document; mouse clicks land on the backdrop but `Tab` only stays inside because of the JS handler at `overlay.js:139-162`. If JS fails or two overlays mount, the trap is gone.
- **Why critical:** The README ships these as accessible modal dialogs. The WAI-ARIA dialog pattern requires non-dialog content to be `inert` (or `aria-hidden="true"`) when modal. Without it, AT users can escape the dialog.
- **Reproduction:** Storybook `/components/modal`, run NVDA/VoiceOver — virtual cursor still reaches content under backdrop.
- **Suggested fix:** When opening, set `inert` on the dialog's parent siblings (or on `body > *:not(#dialog-id)`); restore on close. Consider portaling dialogs to `<body>` to make this trivial.

#### 2. `modal`/`confirm_modal` cannot be opened from outside; helpers are private

- **Where:** `lib/exo_ui/components/overlay.ex:89` (`defp show_modal`), `:98` (`defp hide_modal`); not re-exported in `lib/exo_ui/components.ex:53-74`
- **What happens:** The only way to make a modal visible is to set `show={true}` from server-side LiveView state. There is no `Phoenix.LiveView.JS` command a consumer can attach to a button. Compare to `drawer` (`:425`, exposed at `components.ex:68-74`) and `sheet` (`:497`, accessed from storybook at `sheet.story.exs:11`).
- **Why critical:** This is the most-used overlay component. The asymmetry is silently broken — users will copy the drawer pattern and get a `RuntimeError`/`UndefinedFunctionError` at `phx-click={ExoUI.Components.show_modal("x")}`.
- **Suggested fix:** Promote both functions to `def`, delegate from `Components` like drawer.

#### 3. Dialog `aria-labelledby` is conditional; no required-title enforcement

- **Where:** `overlay.ex:17` (modal `slot :title`), `:40` (`if @title != []`), `:380` drawer, `:450` sheet; `:626` command_palette uses only `aria-label={@label}`
- **What happens:** A dialog rendered without `<:title>...</:title>` has `role="dialog" aria-modal="true"` but no accessible name. WCAG requires every dialog to have an accessible name.
- **Suggested fix:** Make the title slot/attr `required: true`, or auto-generate a hidden `<h2>` from `@id` if title is omitted. Document the contract.

### 🟡 Medium

#### 4. `command_palette` global Cmd+K binding is unconditional

- **Where:** `assets/js/hooks/command_palette.js:74-80`
- **What happens:** Every mounted command palette adds a `document.addEventListener("keydown", ...)`. Two palettes on the same page → both open. Hosting app cannot opt out.
- **Suggested fix:** Make the keybinding opt-in via `keymap` attr (`null` = no binding); allow consumer-side Cmd+K via `phx-window-keydown`.

#### 5. `tooltip` produces double tab stops

- **Where:** `overlay.ex:312-318` — `tooltip-anchor` is `<span tabindex="0">` wrapping the `:inner_block`. Storybook `tooltip.story.exs:11-13` shows users always pass an `<.button>` inside.
- **What happens:** Tab stops on the span, then Tab stops on the inner button. Users must tab twice to leave the tooltip area.
- **Suggested fix:** Detect a focusable inside the slot (mirror `popover.js:_findControl`) and drop `tabindex="0"` from the wrapper when one is found.

#### 6. `hover_card` uses `role="tooltip"` for rich content + `aria-describedby` on trigger

- **Where:** `overlay.ex:541,549`
- **What happens:** Screen readers read the entire content of the card as the trigger's description. For long-form content this is read whenever the trigger is focused.
- **Suggested fix:** Remove `role="tooltip"`; expose the trigger as `aria-haspopup="dialog"` + `aria-expanded`; link by `aria-labelledby` (not `describedby`) when content has its own heading.

#### 7. `drawer` missing `phx-mounted` show

- **Where:** `overlay.ex:383-395` vs `modal` at `:30` and `sheet` at `:463`
- **What happens:** Initial render with `show={true}` sets `data-state="open"` but does not call `focus_first` — focus stays on whatever was focused at mount.
- **Suggested fix:** Add `phx-mounted={@show && show_drawer(@id)}`.

#### 8. `sheet` `class` attr accidentally builds a list

- **Where:** `overlay.ex:464`: `class={[@show && "open", @class]}`
- **What happens:** When `class` is a string like `"my-shell"`, the rendered list becomes `["false","my-shell"]` (or `["open", "my-shell"]`) and Phoenix joins. False is filtered, so it works in practice — but `@show` returning a boolean leaks into `data-state` AND class. The forwarding test at `interactive_forwarding_test.exs:118-127` covers the closed case (`show=false`), so the open case is untested. Output also redundantly indicates state via both `class="open"` and `data-state="open"`.
- **Suggested fix:** Drop the `open` class entirely; keep `data-state` as the single state source (CSS already supports both at `sheet.css:8-10`).

#### 9. `collapsible` hidden checkbox loses state on Phoenix patch

- **Where:** `overlay.ex:348-355`; `collapsible.js:8-23` toggles `checkbox.checked` via JS
- **What happens:** The hidden `<input type="checkbox">` is part of the LiveView-managed DOM. When Phoenix re-renders the surrounding template (e.g. on any other assign change), the checkbox is patched back to its server value (`checked={@open}`), discarding user toggles. There's no `phx-update="ignore"` on the wrapper.
- **Suggested fix:** Drive open/close via `data-state` + JS; remove the checkbox; or wrap the checkbox in `phx-update="ignore"`.

#### 10. `command_palette` has no body scroll lock

- **Where:** `assets/css/src/components/command-palette.css:1-127` — no `body:has(...)` rule like `modal.css:78`, `sheet.css:147`, `drawer.css:100`
- **What happens:** Background page scrolls while palette is open.
- **Suggested fix:** Add `body:has([data-exo="command-palette"][data-state="open"]) { overflow: hidden }`.

#### 11. `menubar` pointerover does not auto-open the first menu

- **Where:** `assets/js/hooks/menubar.js:52-58` — only re-opens when `this.openIndex < 0` is FALSE (the check inverts intent: `if (this.openIndex < 0) return;`)
- **What happens:** Hovering over a different trigger only switches sub-menus once one is already open. This is consistent with Radix, but the click test (`menubar.spec.js:6-26`) is the only path that opens; ergonomic but worth documenting.

### 🟢 Minor

#### 12. Backdrop colors are inconsistent

- `modal.css:17`, `drawer.css:15`, `sheet.css:16`, `command-palette.css:15` use three different syntaxes for ~50% black.
- **Fix:** Add `--exo-overlay-backdrop` token in `tokens.css`.

#### 13. `dropdown` deprecated CSS still ships

- `dropdown.css:1-80` styles `[data-exo="dropdown"]` (deprecated component). Bundle still includes it.
- **Fix:** Either delete the file or merge styles into `dropdown.css` for the menu surface only and inline a deprecation in the markup.

#### 14. No `prefers-reduced-motion`

- All overlay CSS: zero `@media (prefers-reduced-motion: reduce)` queries.
- **Fix:** Add reduced-motion override clipping animation duration to 0.

#### 15. `confirm_modal` close-on-cancel unconditional

- `overlay.ex:80-83` — `cancel`/`confirm` always include `hide_modal`. There's no way to keep the modal open when the consumer wants to validate before closing.

## Accessibility analysis

- **Roles & semantics:** Mostly correct — `dialog`/`alertdialog`/`menu`/`menuitem`/`separator`/`menubar` placed deliberately. Wrong: `hover_card` content is `role="tooltip"` (`overlay.ex:549`); collapsible content `role="region"` is fine but lacks `aria-label`; popover trigger forced to `role="button"` even when wrapper holds an inner button (`popover.js:65-68`).
- **Keyboard parity:**
  - `modal`/`drawer`/`sheet`: Tab/Shift+Tab loop ✓ (`overlay.js:139-162`), Escape ✓
  - `popover`: trigger Enter/Space ✓ (`popover.js:30-35`); no arrow keys to move focus into content (acceptable — popover is generic)
  - `dropdown_menu`: arrow keys, Home, End ✓ (`dropdown_menu.js:9-23`); NO typeahead, NO Escape close (depends on popover dismiss); NO `Tab` skip-out
  - `tooltip`: Escape close ✓ (`tooltip.js:69-71`); no arrow needed
  - `hover_card`: Escape close ✓ (`hover_card.js:39-46`); no keyboard open path other than focus
  - `context_menu`: arrow/Home/End/Escape ✓ (`context_menu.js:97-119`); Shift+F10 / ContextMenu key ✓ (`:34-40`)
  - `command_palette`: arrow/Home/End/Enter/Escape ✓; no typeahead
  - `menubar`: full WAI-ARIA pattern ✓
- **Focus management:** `overlay.js` handles trap+restore well. `command_palette` does NOT restore focus to invoker on close (`command_palette.js:55-67` clears state but never refocuses what opened it).
- **ARIA wiring:**
  - `aria-expanded` synced: popover ✓, hover_card ✓, context_menu ✓, menubar ✓, collapsible ✓, command_palette input ✓
  - `aria-haspopup`: popover ✓, hover_card ✗ (missing), context_menu ✓, menubar ✓
  - `aria-controls`: collapsible ✓, command_palette input ✓, menubar trigger ✓; popover trigger ✗
  - `aria-modal`: ✓ on all dialogs but not paired with outside-`inert`
  - `aria-labelledby`: conditional — see Critical 3
  - `aria-activedescendant`: command_palette ✓; not used elsewhere
- **Reduced motion:** none of the overlay CSS respects `prefers-reduced-motion`. `sheet` slide-in (`sheet.css:115-145`), `hover-card` keyframe (`hover-card.css:86-95`), `command-palette` scale-in (`command-palette.css:124-127`), `context-menu` scale (`context-menu.css:53-56`) all play.
- **Screen reader:** `command_palette` empty state uses `hidden` toggled by JS (`command_palette.js:71`) but has no `aria-live` — users won't be notified of "no results". Modal close button is a U+2715 character (`overlay.ex:49`) with `aria-label="close"` — accessible name correct but lowercase ("Close" by convention). `drawer-close` and `sheet-close` use `aria-label="close"` and `"Close"` inconsistently (`overlay.ex:411,486`).

## Composition & HTML correctness

- **Trigger composition:** Fixed for `popover` (`overlay.ex:122-132` → span wrapper) and inherited by `dropdown_menu` (which uses `popover` internally at `:173`). NOT fixed for `tooltip` (still wraps in `<span tabindex="0">` adding a tab stop), `hover_card` (`<div data-exo="hover-card-trigger">` at `:541` — div with `aria-describedby` but no `tabindex`/`role` — keyboard users can't reach it unless trigger contains a focusable child), `context_menu` (trigger is a `<div>` at `:573`; tabindex/role applied JS-side at `context_menu.js:13-14` so SSR HTML is non-interactive until hook mounts).
- **Slot contracts:** No component exposes `as_child` or `as` to suppress wrapper elements.
- **Form integration:** Not relevant for this surface.
- **Invalid HTML candidates:** None found. No `<button>` inside `<button>` (`popover_test.exs:131` and `dropdown_menu_test.exs:181` regression tests). No `<a href>` inside button.
- **Heading hierarchy:** Dialogs use `<h2>` (`overlay.ex:45,405,476`); good default but no override.

## Browser & visual coverage

| Component | Browser spec | Coverage |
| --- | --- | --- |
| modal | `overlay.spec.js:6-20` | Escape close, state attrs |
| confirm_modal | NONE | Untested |
| popover | `popover.spec.js:6-44` | open, close, aria, close button |
| dropdown_menu | `dropdown_menu.spec.js:6-22` | nested-button regression only |
| dropdown (deprecated) | NONE | — |
| tooltip | `tooltip.spec.js:11-50` | hover open, focus open, Escape |
| collapsible | NONE | Untested |
| drawer | `overlay.spec.js:42-60` | Escape + focus restore |
| sheet | `overlay.spec.js:22-40` | Escape + focus restore |
| hover_card | `hover_card.spec.js:6-25` | hover open/close |
| context_menu | `context_menu.spec.js:6-26` | right-click open, outside close |
| command_palette | `command_palette.spec.js:6-92` | Cmd+K, backdrop, filter+Enter, empty |
| menubar | `menubar.spec.js:6-66` | pointer + keyboard |

**Untested paths:**
- Dialog focus trap loop (Tab from last → first; Shift+Tab from first → last) is NOT tested.
- Modal opening via JS command (because `show_modal` is private).
- `confirm_modal` rendering and click flow.
- `collapsible` toggle.
- `dropdown_menu` arrow-key navigation in browser.
- Disabled item handling in `dropdown_menu`/`context_menu`/`command_palette` browser path.
- Multiple overlays open simultaneously (focus-trap conflict).
- Reduced motion.

**Visual regression:** none in this audit scope. `bun run capture:components` produces snapshots but no diffing tooling is referenced in the surface.

## CSS surface

- **Tokens used:** `--exo-radius`, `--exo-shadow-md`/`-lg`, `--exo-card`, `--exo-card-foreground`, `--exo-background`, `--exo-foreground`, `--exo-muted`, `--exo-muted-foreground`, `--exo-border`, `--exo-accent`, `--exo-danger`, `--exo-tooltip-bg`, `--exo-tooltip-fg`, `--exo-text-*`, `--exo-space-*`, `--exo-duration`, `--exo-easing`, `--exo-font`. Reasonable coverage.
- **Dark mode parity:** Tokens are the only contract; not separately verified per overlay file. The hardcoded backdrop colors (Critical 12) bypass tokens and don't change in dark mode.
- **Override surface:** Most rules use `:where()` for zero specificity (e.g. `popover.css:30`, `dropdown.css:9`). Exception: `popover.css:18,42-49` and `tooltip.css:13,76-86` use real specificity intentionally to override UA `[popover]` — comment at `popover.css:7-17` documents why. Good discipline.
- **Dead CSS:** `dropdown.css` styles a deprecated component. `dropdown.css:80-` and `dropdown.css:77-80` (`dropdown-item-chevron`) duplicate names with the new dropdown_menu surface — both ship.
- **Stacking:** z-indexes hardcoded — `modal:50`, `sheet:50`, `drawer:100`, `command-palette:50`, `tooltip:60`, `hover-card:50`, `menubar-content:50`, `context-menu:50`. Drawer can sit above command palette. No layering token.

## JS hook quality

| Hook | Lifecycle | Listener cleanup | Concerns |
| --- | --- | --- | --- |
| `ExoOverlay` (`overlay.js`) | mounted/updated/destroyed all call `_bind` then `_unbind` | ✓ MutationObserver disconnect, capture-phase listeners removed | Captures invoker via document-level `pointerdown`/`click` (`:36-37`) — fires on ALL clicks, even unrelated overlays; cheap but noisy |
| `ExoPopover` | symmetric | ✓ | `_findControl` mutates inner element role/tabindex (`:65-68`); on `updated()` re-runs without checking idempotency |
| `ExoDropdownMenu` | symmetric | ✓ | No Escape handler — depends on popover dismiss |
| `ExoTooltip` | symmetric | ✓ | Module-level `lastHideTime` (`tooltip.js:1`) is global — multiple tooltips share skip-delay (acceptable) |
| `ExoHoverCard` | symmetric | ✓ | Pointer + focus listeners on `el`, `trigger`, AND `content` — cleaned up |
| `ExoContextMenu` | symmetric | ✓ | Document-level capture listeners reattached every `_bind()` (`:68-78`) — re-bind is symmetric but expensive |
| `ExoCommandPalette` | symmetric | ✓ | Global document keydown for Cmd+K (`:80`) — collides if multiple instances |
| `ExoMenubar` | symmetric | ✓ | Document-level `pointerdown` (`:75`) — cleaned up |
| `ExoCollapsible` | mounted/updated/destroyed | ✓ | Only one click listener; minimal |

- **`phx-update="ignore"`:** NOT used anywhere in overlay components. Means a server re-render of the surrounding template can reset hidden checkbox state (`collapsible`) and overwrite menu `data-open` attributes set by hooks. The hooks call `_bind()` on `updated()` to recover, but state set by JS is lost.
- **Server↔client contract:** The hooks are mostly self-contained — no `pushEventTo`. Open/close is purely DOM-side, except modal/drawer/sheet which read `data-state` set by `Phoenix.LiveView.JS` (`overlay.js:64`).

## Storybook quality

- **Pages exist:** all 13 components.
- **Modal story uses `:component`** (`storybook/stories/components/modal.story.exs:3`) — the only one. Cannot demo a closed→open trigger because there is no public `show_modal`.
- **Confirm modal forces `show` true** (`confirm_modal.story.exs:11-17`) — same workaround.
- **States covered:**
  - `tooltip.story.exs` — 9 variations (top/bottom/left/right/no-arrow/rich/fast/align-start/align-end) ✓
  - `popover.story.exs` — 4 (default/top/right/with close button)
  - `dropdown_menu.story.exs` + `dropdown.story.exs` — 3 each (action/file/links)
  - `command_palette.story.exs` — 1 (with disabled item)
  - `menubar.story.exs` — 1 (File/Edit/View)
  - `sheet.story.exs` — 2 (right/left)
  - `drawer.story.exs` — 2 (right/left)
  - `hover_card.story.exs` — 1
  - `context_menu.story.exs` — 1
  - `collapsible.story.exs` — 2 (open/closed)
  - `confirm_modal.story.exs` — 1
- **Missing states:** disabled item rendering (dropdown_menu has it inline but no dedicated variant), error state, loading, mobile width snapshot, dark mode toggle within a story, RTL.
- **Attribute introspection:** `modal.story.exs:4` uses `function: &ExoUI.Components.modal/1` — the delegated reference. Causes the documented "cannot load attributes" warning. None of the `:page` stories are affected.

## Test coverage

- **Modal:** 4 ExUnit + 1 browser. Missing: focus trap, alertdialog escape, custom on_cancel.
- **Popover:** 12 ExUnit + 2 browser. Strong coverage including the regression test for nested-button.
- **Dropdown_menu:** 16 ExUnit + 1 browser. Good attribute coverage; browser only checks rendering composition.
- **Dropdown (deprecated):** 1 ExUnit. Adequate for deprecated.
- **Tooltip:** 16 ExUnit + 2 browser. Solid.
- **Hover_card:** 1 ExUnit + 1 browser. Threadbare.
- **Context_menu:** 2 ExUnit + 1 browser. Threadbare.
- **Command_palette:** 3 ExUnit + 4 browser. Good browser coverage.
- **Menubar:** 1 ExUnit + 2 browser. Good browser coverage but no test of disabled menu items, no test of multiple menus closing each other, no test of submenu (not implemented).
- **Sheet:** 4 ExUnit + 1 browser.
- **Drawer:** 13 ExUnit + 1 browser.
- **Collapsible:** 10 ExUnit + 0 browser.
- **Forwarding:** 13 specs in `interactive_forwarding_test.exs`.

**Flakiness signals:** `expect.poll` used pervasively in browser specs (`helpers/storybook.js:9-12,18-22,24-28,31-34`). No `Process.sleep`. No `setTimeout` in test code. Reasonable.

## Tech debt

- `lib/exo_ui/components/overlay.ex:269-293` — `dropdown/1` deprecated component still in module, still exported. Comment line `:268` says "Deprecated" but `@deprecated` annotation is only on the delegate at `components.ex:58`. Module-level deprecation marker missing.
- `assets/css/src/components/dropdown.css` — full file dedicated to deprecated dropdown styling. Ships in the bundle.
- `command_palette.js:142` — sets `dataset.close !== "false"` semantic but server attaches `data-close={item[:close] == false && "false"}` (`overlay.ex:655`) which is brittle (uses double-negative).
- No TODO/FIXME comments in any of the read files. Clean.
- `sheet.css:120` re-overrides the `data-side="left"` content selector with `:where(...)` AFTER it was already declared at `:37-43` (different rule but same selector specificity) — works due to CSS source order but is confusing.

## Configuration & build

- Public API exposure inconsistencies are the main issue (Critical 2):
  - `show_drawer/1` ✓ delegated (`components.ex:68`)
  - `hide_drawer/1` ✓ delegated (`components.ex:70-74`)
  - `show_sheet/1` / `hide_sheet/1` — only on `ExoUI.Components.Overlay`; works in storybook but not on the documented public API surface
  - `show_command_palette/1` / `hide_command_palette/1` — same
  - `show_modal/1` / `hide_modal/1` — `defp` (private, can't be reached at all)
- Build artifacts: every overlay CSS file is consumed by the bundle (verified via `priv/static/exo.css` line count). Tree-shaking is not available.

## Documentation

- Module `@moduledoc` for `Overlay` is one line (`overlay.ex:2-4`) — does not describe the dialog contract.
- Per-component `@doc` strings exist (`overlay.ex:10,63,107,149,295,337,373,442,519,558,594,704`) but most are one-line. Critical contracts (focus trap requires `ExoOverlay` hook, modal can only open from server state) are undocumented.
- README references Popover API as required (`README.md:214,224`) and lists `popover`, `dropdown_menu`, `command_palette`, JS-enhanced `tooltip` — `select`/`combobox` are also listed there but out of scope for this audit.

## Comparison vs shadcn/Radix

**Where ExoUI matches:**
- Trigger composition pattern via wrapping span + JS finder (mirrors Radix `Trigger asChild`)
- Native Popover API + CSS anchor positioning (more modern than Radix v1's portal+Popper.js)
- Menubar keyboard pattern is at parity with Radix Menubar
- Command palette Cmd+K + filter is at parity with shadcn/cmdk
- Token-based theming with `:where()` overrides

**Where ExoUI lags:**
1. **No `as_child` escape hatch.** Radix `Trigger`/`Item` accept `asChild` and merge into the user element. ExoUI uses a wrapper span, which works for popover/dropdown but adds a tab stop in tooltip and produces invalid HTML when the user nests another span with role.
2. **Modal cannot be opened from JS commands.** Radix and shadcn use a controlled `Dialog.Trigger` that opens client-side. ExoUI requires a server roundtrip.
3. **No outside-`inert` enforcement** — Radix v1 added this in 2023. ExoUI relies on JS Tab handler only.
4. **No reduced-motion CSS.** Radix/shadcn presets respect `prefers-reduced-motion`.
5. **No submenu support in `dropdown_menu` or `context_menu`.** Radix has full submenu support. ExoUI dropdown has a `sub_trigger` entry type (`overlay.ex:192-218`) that wires `popovertarget` to a separate popover but no documented pattern for chained sub-menus, and `context_menu` has no submenu at all.
6. **No focus restoration for `command_palette`.** shadcn/cmdk restores focus to invoker on close.
7. **No typeahead in `dropdown_menu`/`menubar`.** Both Radix and shadcn support typing characters to jump to matching items.

## Recommendations (priority-ordered)

1. **[Critical]** Promote `show_modal/1` and `hide_modal/1` to `def`, delegate from `ExoUI.Components`, document the contract. Add `show_sheet`/`hide_sheet`/`show_command_palette`/`hide_command_palette` delegations too. Effort: S.
2. **[Critical]** When a modal/drawer/sheet opens, set `inert` on the rest of the page (e.g. on body's other top-level children), restore on close. The shared `ExoOverlay` hook already runs at the right time — extend `_activate`/`_deactivate` (`overlay.js:81-112`). Effort: M.
3. **[Critical]** Make dialog `aria-labelledby` always present. Either require the `:title` slot/`title` attr, or auto-render a hidden `<h2 id="...-title">` from a fallback. Effort: S.
4. **[High]** Add `phx-mounted={@show && show_drawer(@id)}` to `drawer/1` (`overlay.ex:383`). Effort: trivial.
5. **[High]** Drop the `tooltip-anchor` `tabindex="0"` when an inner focusable is found (mirror `popover.js:_findControl`). Effort: S.
6. **[High]** Replace `hover_card` content `role="tooltip"` with proper dialog-trigger semantics; remove `aria-describedby` on trigger or only point it at a heading. Effort: S.
7. **[High]** Add `body:has([data-exo="command-palette"][data-state="open"]) { overflow: hidden }`. Effort: trivial.
8. **[Medium]** Make Cmd+K opt-in (`bind_global_keys={true|false}` attr); document multi-instance behavior. Effort: S.
9. **[Medium]** Drop the deprecated `dropdown` and its CSS or move into the `dropdown_menu` surface. Add module-level `@deprecated` to the function. Effort: S.
10. **[Medium]** Add `--exo-overlay-backdrop` token; replace hardcoded backdrop colors. Effort: trivial.
11. **[Medium]** Wrap every overlay animation rule in `@media (prefers-reduced-motion: reduce)`. Effort: S.
12. **[Medium]** Restore focus on `command_palette` close (mirror `overlay.js` `_previousFocus` pattern). Effort: S.
13. **[Quick win]** Standardize close button `aria-label` to `"Close"` across modal/drawer/sheet (`overlay.ex:48,411,486`). Effort: trivial.
14. **[Quick win]** Replace `<:title>` optional contracts with required attrs for `confirm_modal` (already does) and document for the rest. Effort: trivial.

## Open questions for the library owner

- Is `dropdown` deprecation a soft-deprecation (warning only) or scheduled for removal? The `@doc deprecated` is set but the module/CSS still ships.
- Is `command_palette` intended to be a singleton page-wide widget, or composable like `popover`? Current global Cmd+K implies the former, but the API allows multiple instances.
- Are submenu chains for `dropdown_menu`/`context_menu` planned? `sub_trigger` exists for dropdown but not for context_menu.
- Should ExoUI portal dialogs to `document.body`? Without portaling, outside-`inert` is awkward when the dialog is rendered inside other layout containers (e.g. inside a sidebar).
- Is `confirm_modal` expected to be opened from outside or only ever rendered with `show={true}` and toggled via assign?
