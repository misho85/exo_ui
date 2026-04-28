# Audit: Data display & navigation

**Date:** 2026-04-28
**Auditor:** Claude Opus 4.7 (subagent)
**Score:** 🔴 critical
**Maturity:** ~35% vs shadcn/daisyUI

## TL;DR

The whole category is one large module (`lib/exo_ui/components/data_display.ex:1-560`) that ships fifteen mostly-shallow visual primitives. **Tabs is not an ARIA tabs widget** — it has `role="tablist"` but no `tabpanel`, no `aria-controls`, no roving tabindex, no arrow keys (`lib/exo_ui/components/data_display.ex:250-279`). **Hero and chat_bubble have zero CSS** — neither imported in `assets/css/exo.css:1-53` nor present in `priv/static/exo.css` (0 bytes). **Pagination renders disabled buttons as `<span>`** (`data_display.ex:320-322`, `:348-350`) — focus order break, no real button semantics. Carousel has no slide-index sync, no autoplay, no reduced-motion (`assets/js/hooks/carousel.js:1-53`). Accordion uses a hidden checkbox PLUS a real `<button>` for the same toggle, doubling state ownership (`data_display.ex:483-502`). There are zero Playwright tests for any of these components.

## Surface map

### Public functions (all delegated through `lib/exo_ui/components.ex:85-99`)

- `ExoUI.Components.table/1` — table with col/action slots, optional LiveStream
- `ExoUI.Components.list/1` — `<ul>` with title/content per item
- `ExoUI.Components.content_card/1` — title + action + body
- `ExoUI.Components.stat_card/1` — title/value/icon/trend/subtitle (all attrs)
- `ExoUI.Components.metric_card/1` — title/value/subtitle + trailing slot
- `ExoUI.Components.wizard_sidebar/1` — vertical step list
- `ExoUI.Components.breadcrumb/1` — nav trail
- `ExoUI.Components.tabs/1` — tab bar
- `ExoUI.Components.pagination/1` — paged navigation
- `ExoUI.Components.steps/1` — multi-step indicator
- `ExoUI.Components.timeline/1` — chronological events
- `ExoUI.Components.carousel/1` — slide track + prev/next
- `ExoUI.Components.accordion/1` — collapsible items
- `ExoUI.Components.hero/1` — banner section
- `ExoUI.Components.chat_bubble/1` — message bubble

### Source modules

- `lib/exo_ui/components/data_display.ex` — single 560-line file owning 15 components
- `assets/js/hooks/accordion.js` — keyboard nav, single-mode enforcement, ARIA sync
- `assets/js/hooks/carousel.js` — prev/next + arrow-key scroll
- `assets/js/hooks/sidebar.js` — used by `ExoUI.Layouts.sidebar_layout/1` (not by `wizard_sidebar`; see `lib/exo_ui/layouts.ex:27`)

### CSS (`assets/css/src/components/`)

- `table.css`, `list.css`, `card.css`, `breadcrumb.css`, `tabs.css`, `pagination.css`, `steps.css`, `timeline.css`, `carousel.css`, `accordion.css`, `wizard.css`
- **MISSING:** no `hero.css`, no `chat-bubble.css`. Built artifact `priv/static/exo.css` is **0 bytes** (build output not regenerated since edits — see `assets/css/exo.css:1-53` import list).

### Tests

- `test/exo_ui/components/table_test.exs` — 2 tests, basic render + actions
- `test/exo_ui/components/breadcrumb_test.exs` — 9 tests, slots/links/current
- `test/exo_ui/components/pagination_test.exs` — 3 tests, render/hide/ellipsis
- `test/exo_ui/components/tabs_test.exs` — 2 tests, render + click
- `test/exo_ui/components/accordion_test.exs` — 16 tests, attrs + ARIA
- `test/exo_ui/components/carousel_test.exs` — 3 tests, render/loop/buttons
- `test/exo_ui/components/steps_test.exs` — 2 tests
- `test/exo_ui/components/timeline_test.exs` — 2 tests
- `test/exo_ui/components/wizard_test.exs` — 1 test
- `test/exo_ui/components/hero_test.exs` — 9 tests (uses `ExoUI.ComponentCase`)
- `test/exo_ui/components/chat_bubble_test.exs` — 13 tests
- **No tests** for `list`, `content_card`, `stat_card`, `metric_card`
- **Zero browser tests** — `ls test/browser/` shows none of these components covered

### Storybook

- All 15 stories present under `storybook/stories/components/`. **All use `:page` story style with direct module references** (`ExoUI.Components.table`, etc.). Only `tabs.story.exs:4` uses `function: &ExoUI.Components.tabs/1` (delegated — likely breaks attribute introspection per the audit anti-pattern list).
- Stories cover happy-path variants only. **No empty/loading/error/long-content/dark-mode/mobile-width pages** for any of the 15 components.

## What works (with proofs)

- **Table stream support is correct.** `data_display.ex:24-44` detects `Phoenix.LiveView.LiveStream` via `is_struct` and conditionally emits `phx-update="stream"`, defaulting `row_id` to `fn {id, _item} -> id end`. This is the right contract.
- **Breadcrumb uses `<nav aria-label="Breadcrumb">` + `<ol>`** (`data_display.ex:218-219`) and emits `aria-current="page"` on the unlinked terminal item (`:227`). That matches WAI-ARIA APG.
- **Pagination range computation is sane** (`data_display.ex:291-306`) — handles ≤7, head, tail, middle with ellipsis sentinels.
- **Accordion content uses `role="region"` + `aria-labelledby`** with stable IDs `"#{@id}-content-#{idx}"` and `"#{@id}-trigger-#{idx}"` (`data_display.ex:496-507`). Hook syncs `aria-expanded` on `mounted`/`updated` (`accordion.js:99,103`).
- **Pagination hides itself when `total_pages <= 1`** (`data_display.ex:311`).
- **Carousel exposes `role="region"` + `aria-roledescription="carousel"` + per-slide `aria-roledescription="slide"`** (`data_display.ex:426-438`).
- **JS hooks clean up listeners in `destroyed()`** — accordion (`accordion.js:106-109`), carousel (`carousel.js:46-50`).

## What is missing or half-done

- **`tabs/1` is a visual nav strip, not an ARIA tabs widget.** It emits `role="tablist"` and `role="tab"` (`data_display.ex:252,261,271`) but renders **no `tabpanel`**, **no `aria-controls`**, **no `aria-orientation`**, and the JS index has **no Tabs hook** (`assets/js/index.js:18-35`). No keyboard arrows, no roving tabindex, no Home/End. This is incorrect ARIA: a tablist without controlled panels misleads screen readers.
- **Pagination "disabled" prev/next are `<span>` elements** (`data_display.ex:320-322,348-350`) with `aria-disabled="true"` and `data-disabled` — they are NOT focusable, drop out of tab order, and break keyboard parity (a real `<button disabled>` would stay in source order). The CSS `pointer-events: none` (`pagination.css:36-38`) hides the regression visually but it is still wrong semantically.
- **Hero and chat_bubble have no CSS.** Stories render unstyled HTML. Confirmed: no entry in `assets/css/exo.css` (`:1-53`) and the built `priv/static/exo.css` is empty (0 bytes — build not run after recent edits, but even with build, no source file would be picked up).
- **`list/1` claims to be a description list** but emits `<ul><li><div class=title>...<div class=content>...</li></ul>` (`data_display.ex:79-87`). Storybook calls it "Definition-style" (`storybook/stories/components/list.story.exs:4`). For description-list semantics it should emit `<dl><dt>title</dt><dd>content</dd></dl>`. Current markup loses the title→content programmatic association.
- **Carousel has no state sync, no autoplay, no reduced-motion.** Hook only scrolls (`carousel.js:21-35`). Prev/next buttons are always enabled — at the start there is no `aria-disabled` on prev, at the end no `aria-disabled` on next; they remain reachable but no-op. No `prefers-reduced-motion: reduce` guard despite using `behavior: "smooth"`.
- **Carousel `aria-label="Carousel"` is hardcoded** (`data_display.ex:428`) — no way for the consumer to override per-instance, hostile to multiple carousels on one page.
- **Steps has `<span :if={step[:status] == "complete"}>&#10003;</span>` and an empty `<span></span>` otherwise** (`data_display.ex:374-376`). The empty span renders nothing — the indicator number must be coming from CSS counter. `steps.css:7,20` confirms `counter-reset/counter-increment` but **the number is never displayed** (no `content: counter(step)` rule found in `steps.css:1-85`). Indicator in `current` and `upcoming` states is empty.
- **Wizard sidebar doesn't render `aria-current="step"`** — it puts `data-status="current"` (`data_display.ex:177`) but no ARIA. Screen readers cannot identify the current step. Also splits each item into either a `<button>` or a `<div data-exo="wizard-btn">` based on status (`:178-198`) — visually similar but the future-state `<div>` is unfocusable, reachable only by reading order; semantically the right choice would be `<button disabled>`.
- **Accordion duplicates state ownership.** A hidden checkbox (`data_display.ex:483-491`) AND a real button (`:492-502`) both represent open state. The checkbox is the source for CSS (`accordion.css:15`), the button drives keyboard. The hook synthesizes the relationship in `accordion.js:60-96`. If consumers nest the accordion inside `<form>`, the checkbox is submitted as form data (`name` is missing so it has no key, but it remains in the DOM as a submitted control). Replacement should be a single `<button aria-expanded>` driving CSS via `aria-expanded` attribute selector.
- **Breadcrumb terminal-page detection is wrong** (`data_display.ex:227`). The condition `!item[:href] && !item[:navigate] && !item[:patch]` will mark **any** unlinked item as `aria-current="page"`, not only the last. Also: the `<.link>` calls cascade with `:if`/`!` flags (`:222-226`) — when an item has both `href` and `navigate`, only `navigate` wins. But there is no compile-time validation that exactly one of href/navigate/patch is set.
- **Pagination has no `<a rel="prev">`/`<a rel="next">`** — purely visual.
- **`timeline` renders `<div :if={event.inner_block} data-exo="timeline-content">`** (`data_display.ex:402`) — `event.inner_block` is not a documented slot attribute and accessing it directly bypasses the standard `render_slot` empty-check pattern. This is fragile against Phoenix LiveView slot internals.
- **`row_click` callback is bound on every `<td>`** (`data_display.ex:54`), not on `<tr>`. Clicking a column with custom interactive content (button, link inside `<:col>`) double-fires. Should be on `<tr>` with one `phx-click`, or use a `<button>` row wrapper for the row-as-button pattern.
- **Hero is layout, not a primitive.** `data_display.ex:526-537` is a thin div wrapper with `<h1>`, `<p>`, and an actions div. Headless libraries do not ship "hero" as a component — it belongs in app templates.

## Per-component table

| Component | Status | Findings (file:line) | Recommended work |
| --- | --- | --- | --- |
| `table` | 🟡 P1 | `row_click` on every `<td>` (`data_display.ex:54`); no sortable headers; no empty/loading/error slots; no responsive collapse pattern | Move click to `<tr>`; add `:empty` and `:loading` slots; document mobile pattern |
| `list` | 🟡 P1 | Pretends to be DL but emits `<ul>` (`data_display.ex:79-87`); no test file | Switch to `<dl>/<dt>/<dd>` or rename to `definition_list`; add tests |
| `content_card` | 🟡 P1 | No Header/Footer/Description slot decomposition unlike shadcn `Card.Header`/`.Title`/`.Description`/`.Content`/`.Footer`; just `title+action+body` (`data_display.ex:96-106`) | Add `<:header>/<:footer>/<:description>` slots; deprecate flat `title` attr |
| `stat_card` | 🟡 P2 | All-attribute API (no slot for value), forces stringy values (`:108-136`); icon is plain string, no Lucide integration | Allow value as slot; accept icon component |
| `metric_card` | 🟡 P2 | Near-duplicate of `stat_card` minus icon and trend (`data_display.ex:138-159`); unclear when to pick which | Merge into one `kpi_card` with optional `:trend` and `:trailing` slots |
| `wizard_sidebar` | 🔴 P0 | No `aria-current="step"` (`:171-203`); future steps are `<div>` not focusable; status atom keys leak from server | Add `aria-current`; disabled `<button>` for future; document `:current/:completed/:pending` enum |
| `breadcrumb` | 🟡 P1 | Any unlinked item gets `aria-current="page"`, not just last (`:227`); no `<:separator>` slot for custom separator | Compute `idx == last` and only mark last; expose separator slot |
| `tabs` | 🔴 P0 | Not a real ARIA tabs widget (`:250-279`); no panels, no `aria-controls`, no roving tabindex, no arrow keys, no JS hook | Add `<:panel>` slot, controlled-active state, `ExoTabs` hook with arrow-key roving |
| `pagination` | 🔴 P0 | Disabled prev/next are `<span>` not `<button disabled>` (`:320-322,348-350`); no SR announcement of "Page X of Y"; uses only `patch_fn` (no `navigate`/`href` form) | Render disabled `<button>` (or `<a aria-disabled>`); add live-region count; allow `navigate`/`click` events |
| `steps` | 🟡 P1 | Indicator number never displayed in `current`/`upcoming` (CSS counter exists but no `content: counter(step)` in `steps.css`); `:374-376` empty span | Render number for non-complete states; add ARIA list semantics |
| `timeline` | 🟡 P2 | Direct `event.inner_block` access (`:402`) bypasses slot API; no `<ol>` semantics for ordered events | Use `if Phoenix.Component.assigns_to_attributes`; switch to `<ol>` |
| `carousel` | 🔴 P0 | Buttons never disabled at start/end (`carousel.js:1-53`); no slide-index, no autoplay/pause, no `prefers-reduced-motion`; hardcoded label (`data_display.ex:428`) | Sync `aria-disabled` on prev/next; expose `aria_label` attr; honor reduced-motion; add live-region for slide announce |
| `accordion` | 🟡 P1 | Hidden checkbox + button duplicate state (`:483-502`); checkbox is in DOM if accordion is inside `<form>` | Drop checkbox; drive CSS via `[aria-expanded="true"]` and `data-state` |
| `hero` | 🔴 P0 | No CSS — not in `assets/css/exo.css:1-53`, not in `priv/static/exo.css` (0 bytes); not a primitive — belongs in app templates | Either add CSS + dark-mode tokens, or remove from public API |
| `chat_bubble` | 🟡 P1 | No CSS (same as hero); `side="end"` requires bidi but no `dir` handling | Add `chat-bubble.css` with `data-side` styling and RTL support |

## Problems by severity

### 🔴 Critical

#### 1. Tabs is not a real ARIA tabs widget

- **Where:** `lib/exo_ui/components/data_display.ex:250-279`
- **What happens:** Component emits `<div role="tablist">` containing `role="tab"` items (`<.link>` for patch/navigate, `<button>` for click variant). There is no associated `<tabpanel>`, no `aria-controls`, no `aria-orientation`, no JS hook (none registered in `assets/js/index.js:18-35`).
- **Why critical:** WAI-ARIA tabs pattern requires panels, roving tabindex, and arrow-key navigation. As shipped, screen readers announce a tablist that controls nothing; keyboard users cannot use Left/Right/Home/End. Calling it `tabs` is misleading — it's a styled link bar.
- **Reproduction:** `storybook/stories/components/tabs.story.exs` — open in NVDA/JAWS, observe "tablist" announcement with no panel binding.
- **Suggested fix:** Add a `<:panel id={tab.id}>` slot; render panels with `role="tabpanel"` and `aria-labelledby`; emit `aria-controls` on each tab; create `ExoTabs` hook for roving tabindex (Left/Right/Home/End) and `aria-orientation`.

#### 2. Pagination "disabled" buttons render as `<span>`

- **Where:** `data_display.ex:320-322` and `:348-350`
  ```
  <span :if={@page <= 1} data-exo="pagination-btn" data-disabled aria-disabled="true">
    ‹
  </span>
  ```
- **Why critical:** A `<span>` is not focusable, breaks tab order between page-number links, hides keyboard users from the affordance. Real disabled `<button>` (or `<a aria-disabled="true" tabindex="0">`) keeps source-order parity. ARIA APG explicitly recommends keeping a focusable disabled control.
- **Suggested fix:** Render `<button type="button" disabled>` for both states (links and disabled), or use a single `<a role="button">` with `aria-disabled` and `tabindex="0"` and intercept click. Consistency between active and disabled control matters more than the current `<a>`/`<span>` hybrid.

#### 3. Carousel prev/next never disabled, no reduced-motion

- **Where:** `assets/js/hooks/carousel.js:1-53`, `data_display.ex:444-445`
- **What happens:** Hook scrolls with `behavior: "smooth"` unconditionally (`carousel.js:24,26,30,32`). Buttons have static markup — no `aria-disabled`, no `data-disabled` ever applied based on scroll position. With `loop=false`, clicking past end is a no-op but the button still appears active.
- **Why critical:** WCAG 2.3.3 (Animation from Interactions) and 2.2.2 (Pause, Stop, Hide). No `@media (prefers-reduced-motion)` anywhere in CSS (`grep` shows zero hits in `assets/css/`). Carousel is the canonical motion-sensitive component; failure here is a clear a11y violation for vestibular-disorder users.
- **Suggested fix:** Track scroll position in hook; toggle `aria-disabled` and `data-disabled` on prev/next at boundaries. Wrap the smooth scroll in `if (!matchMedia('(prefers-reduced-motion: reduce)').matches)` else use `behavior: "auto"`. Add an `aria-live="polite"` slide-counter region.

#### 4. Hero and chat_bubble ship with zero CSS

- **Where:** `assets/css/exo.css:1-53` does not import `hero.css` or `chat-bubble.css`; neither file exists in `assets/css/src/components/`. `priv/static/exo.css` is currently 0 bytes.
- **Why critical:** The library's contract per `lib/exo_ui/components.ex:5-7` is "headless components emitting `data-exo` attributes, styling handled by the theme CSS file". A component shipped without theme CSS is not actually shipped. Storybook stories render unstyled flat HTML.
- **Suggested fix:** Either author `assets/css/src/components/hero.css` and `chat-bubble.css` and add to `assets/css/exo.css`, or remove `hero/1` (it is not a primitive) and document `chat_bubble` as theme-required.

#### 5. Wizard sidebar has no `aria-current`

- **Where:** `data_display.ex:171-203`
- **What happens:** Each step gets `data-status` (`completed/current/pending`) but no `aria-current="step"` on the current button. Future-state items render as `<div>` (`:191-198`) instead of `<button disabled>`, losing button semantics entirely.
- **Why critical:** Screen readers receive no signal about the current step. Sequential keyboard navigation skips future steps because `<div>` is not focusable, but disabled buttons would land in tab order and announce "step three of four, disabled".
- **Suggested fix:** Add `aria-current={step.status == :current && "step"}`; replace future-state `<div>` with `<button type="button" disabled>`; declare the status enum in `@doc` so atom typo doesn't silently fall through.

### 🟡 Medium

#### 6. Accordion has dual state owners (checkbox + button)

- **Where:** `data_display.ex:483-502`, `accordion.js:60-96`
- **What happens:** Each item has both `<input type="checkbox" data-exo="accordion-state">` and `<button data-exo="accordion-trigger">`. CSS reads `:has([data-exo="accordion-state"]:checked)` (`accordion.css:15`); the JS hook reconciles the two on click. If the accordion is rendered inside a form, the unnamed checkbox is still part of form submission state in some edge cases.
- **Suggested fix:** Drop the checkbox; switch CSS to `[data-exo="accordion-trigger"][aria-expanded="true"] + [data-exo="accordion-content"]` or use `data-state` attribute. Update the hook to set `data-state="open"|"closed"` on the item and let CSS do the rest.

#### 7. Breadcrumb marks every unlinked item as current

- **Where:** `data_display.ex:227`
- **What happens:** Condition `!item[:href] && !item[:navigate] && !item[:patch]` triggers `aria-current="page"` for ANY unlinked item. If a middle item is accidentally rendered without a link, two nodes claim `aria-current`.
- **Suggested fix:** Compute `last_idx = length(@item) - 1` and gate `aria-current` on `idx == last_idx`. Or add a `<:separator>` slot and require a single explicit `current?` flag on the last item.

#### 8. Steps indicator number missing in current/upcoming

- **Where:** `data_display.ex:374-376` renders `<span></span>` for non-complete; `steps.css:1-85` defines `counter-reset/counter-increment` but no `content: counter(step)` rule on `[data-exo="step-indicator"]`.
- **Suggested fix:** Either render `{idx + 1}` for non-complete states in HEEx (mirroring `wizard_sidebar`'s `data_display.ex:187`), or add `content: counter(step)` in CSS for the indicator.

#### 9. Table `row_click` binds on every `<td>`

- **Where:** `data_display.ex:51-57`
- **What happens:** Each `<td>` carries `phx-click={@row_click.(row)}`. If a column embeds a `<button>` or `<.link>`, the click bubbles through both row-click and child interaction.
- **Suggested fix:** Bind `phx-click` once on `<tr>`. Use `data-clickable` to scope CSS. Document that interactive cell content must `event.stopPropagation`.

#### 10. List is `<ul>` despite "definition" intent

- **Where:** `data_display.ex:78-87`, `storybook/stories/components/list.story.exs:4`
- **What happens:** Component is documented as "description list of title/content pairs" but emits `<ul>` with two `<div>`s per item. No programmatic title→content association.
- **Suggested fix:** Switch to `<dl>/<dt>/<dd>`. If a key/value list and a generic ordered list are both needed, ship both as `definition_list` and `list`.

#### 11. Carousel `aria-label` is hardcoded

- **Where:** `data_display.ex:428`
- **Suggested fix:** Add `attr :aria_label, :string, default: "Carousel"`; pass through `{@aria_label}`.

### 🟢 Minor

#### 12. `event.inner_block` direct access in timeline

- **Where:** `data_display.ex:402` — should use empty-list check on slot, e.g. `:if={Map.get(event, :inner_block) != []}`.

#### 13. Storybook `tabs.story.exs` uses delegated function reference

- **Where:** `storybook/stories/components/tabs.story.exs:4` — `function: &ExoUI.Components.tabs/1` breaks PhoenixStorybook attribute introspection. All other stories use `:page` style with direct module references.

#### 14. No tests for `list`, `content_card`, `stat_card`, `metric_card`

- **Where:** `test/exo_ui/components/` has no files for these four. Storybook is the only safety net.

#### 15. Storybook hardcodes inline `style=""` everywhere

- **Where:** every story file in scope (e.g. `breadcrumb.story.exs:8`, `card.story.exs:8`). Drift hazard if tokens move.

## Accessibility analysis

- **Roles & semantics:**
  - Breadcrumb correct (`<nav aria-label="Breadcrumb"><ol><li>` at `data_display.ex:218-220`).
  - Carousel correct top-level (`role="region"`, `aria-roledescription="carousel"` at `:425-428`) but missing slide-count + index-of announcement.
  - Tabs is broken — `role="tablist"` without panels (`:252`).
  - Steps and timeline emit `<ol>` and `<div>` respectively. Timeline should be `<ol>` (events are ordered).
- **Keyboard:**
  - Accordion has Up/Down/Home/End (`accordion.js:36-51`). No PageUp/PageDown.
  - Carousel has Left/Right (`carousel.js:40-43`). No Home/End.
  - Tabs has nothing — no hook registered.
  - Pagination is link-only — Tab order works but no shortcut.
- **Focus management:** No focus restore on accordion when item collapses. Carousel does not move focus to the active slide. Tabs does not roving-tabindex.
- **ARIA wiring gaps:**
  - `wizard_sidebar` — no `aria-current="step"` (`:171-203`).
  - `tabs` — no `aria-controls` (`:250-279`).
  - `pagination` — `<span aria-disabled>` instead of disabled `<button>` (`:320-322,348-350`).
  - `breadcrumb` — `aria-current` placed on potentially multiple items (`:227`).
- **Screen reader:** Pagination has no live region for "page changed". Carousel has no slide-counter announcement.
- **Reduced motion:** Zero `@media (prefers-reduced-motion)` rules in `assets/css/`. Carousel uses `behavior: "smooth"` unconditionally (`carousel.js:24,26,30,32`); accordion uses `transition: grid-template-rows 250ms` (`accordion.css:13`).

## Composition & HTML correctness

- **Trigger composition:** Accordion trigger is a real `<button>` with `disabled` and `aria-disabled` (`data_display.ex:492-502`) — correct.
- **Slot contracts:** None of the slots accept a `rest`/global passthrough. Consumers cannot add `data-*` or `aria-*` to a `<:tab>`, `<:item>`, etc. shadcn ships `as_child` for exactly this; ExoUI has nothing.
- **Form integration:** N/A (this category is data-display, not form), but accordion checkbox (`:483-491`) is a hidden form control inside any wrapping `<form>`. Rendering an unnamed checkbox is harmless for submission but still a state surface other components do not have.
- **Anti-pattern checks:**
  - No `<button>` inside `<button>` found.
  - No `<a href>` inside `<button>` found.
  - No `IO.inspect`/`dbg`/`console.log` in this surface.

## Browser & visual coverage

- **Playwright spec coverage:** `ls test/browser/` shows specs for combobox, command_palette, context_menu, dropdown_menu, hover_card, menubar, overlay, popover, rating, select, tooltip. **None for table, tabs, accordion, carousel, pagination, breadcrumb, wizard_sidebar, steps, timeline, hero, chat_bubble, list, or any card.**
- **Untested interactive paths:** accordion keyboard, carousel keyboard, tabs (zero behavior), pagination keyboard, breadcrumb link semantics, table row click. Every motion-sensitive component is uncovered.
- **Visual regression:** No baseline. `scripts/capture_storybook_components.js` is referenced in the prompt but not inspected here.

## CSS surface

- **Tokens used:** `--exo-card`, `--exo-card-foreground`, `--exo-border`, `--exo-radius`, `--exo-shadow-sm`, `--exo-space-1..8`, `--exo-text-xs/sm`, `--exo-muted/-foreground`, `--exo-primary/-foreground`, `--exo-success`, `--exo-danger`, `--exo-foreground`, `--exo-background`, `--exo-accent` (in `carousel.css:46`), `--exo-ring` (`accordion.css:60`), `--exo-easing`, `--exo-duration`. **No hardcoded colors found** except `rgb(0 0 0 / 0.1)` in `carousel.css:38` — should be `oklch(0% 0 0 / 0.1)` for token consistency.
- **Dark mode parity:** `assets/css/src/themes/dark.css:1-30` overrides background/foreground/muted/card/border/input. **`--exo-accent` referenced in `carousel.css:46` does not exist in `tokens.css:1-44` or `dark.css`** — broken token reference, button hover background will fall back to nothing.
- **`:where()` discipline:** All component files use `:where(...)` for zero-specificity (e.g. `card.css:1`, `accordion.css:1`). Override surface is clean.
- **Dead/missing CSS:**
  - `steps.css` defines `counter-reset/-increment` but never uses `content: counter(step)` — counter is unread.
  - No `hero.css`, no `chat-bubble.css`.
  - `tabs.css:1-34` styles a tab strip but no `[data-exo="tabpanel"]` styles (consistent with the missing widget).
- **RTL:** No `[dir="rtl"]` rules anywhere. `chat_bubble` `data-side` cannot adapt.

## JS hook quality

### `accordion.js`

- **Lifecycle:** `mounted`, `updated`, `destroyed` all present (`:14, :102, :106`). `_syncAllAria` runs on both mount and update — correct.
- **Listeners:** `keydown` and `click` added with named refs (`this._onKeydown`, `this._onClick`); both removed in `destroyed` (`:107-108`). Clean.
- **Server↔client contract:** None — no `pushEvent` or server-driven open state. All client-side. Means LiveView re-renders that don't include the checkbox `checked` attribute will desync. Hook compensates with `_syncAllAria()` on `updated`, which reads `checkbox.checked`.
- **Edge cases:** Hook rotation logic (`_isSingle`/`_isCollapsible`) reads `dataset.type` and `hasAttribute("data-collapsible")` on every click — fine. Single-mode close-others loop uses `parentElement.querySelector` (`:84`) which assumes the trigger is a sibling of the checkbox; if HEEx structure changes, this breaks silently.

### `carousel.js`

- **Lifecycle:** `mounted` and `destroyed` only — no `updated`. If the slide list is re-rendered by LiveView, hook references are stale. Should re-query in `updated`.
- **Listeners:** `click` on prev/next, `keydown` on root. Removed in `destroyed`. Clean.
- **Server↔client contract:** None. No server event for slide changes.
- **No state sync, no autoplay, no reduced-motion** — see Critical #3.
- **Edge cases:** `getComputedStyle(this.track).gap` re-read every scroll (`:19`) — minor perf cost, fine.

### `sidebar.js` (out of scope but referenced by prompt)

- Used only by `lib/exo_ui/layouts.ex:27`, NOT by `wizard_sidebar`. The brief asked "is sidebar.js used by wizard_sidebar?" — answer: **no**.

## Storybook quality

- **Pages exist:** All 15 components have a story file. Confirmed via `ls storybook/stories/components/`.
- **States covered:** Only happy paths and a handful of variants per component:
  - Accordion: 7 sections (default/multiple/plus/joined/joined+plus/disabled/non-collapsible) — best of the lot.
  - Pagination: 4 page positions — good.
  - Wizard sidebar: 2 variations.
  - Breadcrumb: 3 trail variations.
  - **Missing across the board:** dark mode, mobile width, long content, empty state, loading state, error state, RTL.
- **Attribute introspection:** Only `tabs.story.exs:4` uses `function: &ExoUI.Components.tabs/1` (delegated). PhoenixStorybook cannot introspect attrs through `defdelegate`. All other stories are `:page` style — they bypass introspection entirely (no playground UI).
- **Phoenix form examples:** N/A.
- **Inline styles:** Heavy use (e.g. `breadcrumb.story.exs:8`, `card.story.exs:9`). Not maintainable.

## Test coverage

- **Existing test files (10):** see Surface map. ~50 tests total across the category.
- **Scenarios covered:** rendering, attribute presence, slot rendering, basic ARIA strings.
- **NOT covered:**
  - Accordion: open/close behavior in single mode (only render assertions); no test that toggling one closes others.
  - Carousel: no scroll interaction; no loop boundary.
  - Tabs: no panel association test (because there is no panel).
  - Pagination: no test for disabled prev/next markup (`<span>` with `aria-disabled`).
  - Wizard: 1 single test; no test for `aria-current` (because it doesn't exist).
  - Breadcrumb: no test that only the LAST unlinked item gets `aria-current` (would fail today with multiple unlinked items).
  - List, content_card, stat_card, metric_card: zero tests.
- **Flakiness signals:** None — tests are pure render assertions.

## Tech debt

- **TODO/FIXME:** None found in `data_display.ex` or related files.
- **Dead code:** `steps.css:6,19` counter setup never read.
- **Convention drift:**
  - Hero and chat_bubble are the only components with no CSS file (`assets/css/exo.css:1-53`).
  - `tabs.story.exs` is the only `:component` story; the rest are `:page`.
  - Hero tests use `ExoUI.ComponentCase` (`hero_test.exs:2`) and chat_bubble tests too (`chat_bubble_test.exs:2`); the others use raw `ExUnit.Case` + `Phoenix.LiveViewTest` (`table_test.exs:2-4`). Two test patterns for one category.
  - `wizard_sidebar` uses `:status` keys as atoms (`:completed/:current/:pending`) (`storybook/stories/components/wizard_sidebar.story.exs:11-15`); `steps` uses string statuses (`storybook/stories/components/steps.story.exs:11-15`). Inconsistent.

## Configuration & build

- **Public API exposure:** All 15 functions delegated through `lib/exo_ui/components.ex:85-99`.
- **Build artifacts:** Each component-with-CSS has an `@import` in `assets/css/exo.css:1-53`. **`hero.css` and `chat-bubble.css` not referenced — and don't exist.** Built file `priv/static/exo.css` currently 0 bytes (stale).
- **Tree-shakability:** None — `assets/css/exo.css` ships everything; consumer cannot import a single component's CSS.

## Documentation

- **Existing:** Module `@moduledoc` (`data_display.ex:2-4`) and per-function `@doc` strings (single-line per component, e.g. `:8`, `:70`, `:89`, `:108`, `:138`, `:161`, `:206`, `:236`, `:281`, `:355`, `:383`, `:411`, `:450`, `:518`, `:539`).
- **Missing:**
  - No usage examples in `@doc`.
  - No documentation of the `:steps` and `:wizard_sidebar` status enums (atom vs string).
  - No documentation of accordion `single` vs `multiple` semantics in HEEx (only in the JS hook header `accordion.js:1-13`).
  - No documentation for the `row_id` contract for non-stream rows.
- **Out of date:** Storybook `accordion.story.exs:4` claims "native HTML details/summary" — accordion does not use `<details>/<summary>`, it uses a hidden checkbox + button (`data_display.ex:483-502`).

## Comparison vs shadcn/daisyUI

- **Where ExoUI matches:** Breadcrumb structure, accordion keyboard navigation (Up/Down/Home/End is shadcn-class), carousel ARIA roles, table stream contract (more direct than shadcn).
- **Where ExoUI lags:**
  - **Tabs:** shadcn's `<Tabs.Root>/<Tabs.List>/<Tabs.Trigger>/<Tabs.Content>` is a real ARIA tabs widget with arrow keys and panels. ExoUI ships visual nav.
  - **Card composition:** shadcn ships `<Card.Header>/<Card.Title>/<Card.Description>/<Card.Content>/<Card.Footer>` — composable. ExoUI ships three flat variants (`content_card`, `stat_card`, `metric_card`) with attribute-only APIs.
  - **Pagination:** shadcn renders disabled prev/next as proper disabled buttons with consistent focus order; ExoUI uses `<span>`.
  - **Carousel:** shadcn (Embla) supports autoplay, plugin model, slide-index sync, reduced-motion. ExoUI is a scrollbar-based carousel without state.
  - **Accordion:** shadcn drives state via `data-state="open"`/`"closed"`. ExoUI uses a hidden checkbox — non-idiomatic and an extra DOM node.

## Recommendations (priority-ordered)

1. **[Critical/M]** Rebuild `tabs/1` as a real ARIA widget. Add `<:panel>` slot, controlled-active state, `ExoTabs` hook with arrow-key roving tabindex and `aria-orientation`. (`data_display.ex:236-279`)
2. **[Critical/S]** Fix pagination disabled controls — replace `<span aria-disabled>` with `<button type="button" disabled>` or `<a aria-disabled tabindex="0">` and wire keyboard interception. (`data_display.ex:320-322, 348-350`)
3. **[Critical/M]** Carousel reduced-motion + boundary disable. Add `prefers-reduced-motion` guard in `carousel.js`; sync `aria-disabled` on prev/next based on scroll position; add `aria-live` slide-counter region. (`carousel.js:1-53`, `data_display.ex:444-445`)
4. **[Critical/S]** Hero — decide: keep and add `hero.css` + dark-mode tokens, or remove from public API. Today it ships unstyled. (`assets/css/exo.css:1-53`, `data_display.ex:518-537`)
5. **[Critical/S]** Wizard sidebar — emit `aria-current="step"` on current; replace future-state `<div>` with disabled `<button>`. (`data_display.ex:171-203`)
6. **[High/S]** Breadcrumb — gate `aria-current="page"` on `idx == last_idx`, not on absence of link. (`data_display.ex:227`)
7. **[High/M]** Drop accordion's hidden checkbox; drive CSS via `[data-state="open"]` attribute on the item; have the hook flip the attribute. Removes form-data leak and second source of truth. (`data_display.ex:483-491`, `accordion.css:15`)
8. **[High/M]** Add `chat-bubble.css` (and import in `assets/css/exo.css`) with `[data-side="start"]`/`[data-side="end"]` styling and RTL support.
9. **[High/M]** Add Playwright specs for accordion, carousel, tabs (after fix), pagination keyboard. Currently zero browser coverage in this category.
10. **[High/S]** Table `row_click` — bind on `<tr>`, not on every `<td>`. Document that interactive cell content must `event.stopPropagation`. (`data_display.ex:51-54`)
11. **[Medium/S]** Switch `list/1` to `<dl>/<dt>/<dd>` or rename to `definition_list/1`. Add tests. (`data_display.ex:78-87`)
12. **[Medium/S]** Steps — render `{idx + 1}` in `current`/`upcoming` indicators. Or add `content: counter(step)` to `steps.css`. (`data_display.ex:374-376`, `steps.css:1-85`)
13. **[Medium/S]** Decompose `content_card` into header/title/description/content/footer slots, deprecate flat `title` attr. (`data_display.ex:96-106`)
14. **[Medium/S]** Add `aria_label` attr to carousel; replace hardcoded `"Carousel"`. (`data_display.ex:428`)
15. **[Quick win/XS]** Fix `--exo-accent` reference in `carousel.css:46` — token does not exist; use `--exo-muted` or add it to `tokens.css`.
16. **[Quick win/XS]** Fix `rgb(0 0 0 / 0.1)` in `carousel.css:38` — should be `oklch` to match the rest.
17. **[Quick win/XS]** Add tests for `list`, `content_card`, `stat_card`, `metric_card`.
18. **[Quick win/XS]** Convert `tabs.story.exs` from delegated `:component` to direct module reference (or `:page`) to fix attribute introspection. (`storybook/stories/components/tabs.story.exs:4`)
19. **[Quick win/XS]** Fix accordion storybook docstring — does not use `details/summary`. (`storybook/stories/components/accordion.story.exs:4`)
20. **[Quick win/XS]** Normalize wizard/steps status keys (atom vs string). Pick one.

## Open questions for the library owner

- Is `hero/1` intended as a public primitive, or did it slip in from an app template? If primitive, what's the design intent vs a free-form `<section>`?
- Are `content_card`, `stat_card`, and `metric_card` meant to remain three distinct components, or is the long-term plan a single `card` with composable slots (shadcn-style)?
- Should `tabs` evolve into a real ARIA tabs widget, or stay as a styled link strip and be renamed `tab_nav`?
- Is the wizard step status enum atom or string canonically? Storybook uses atoms; `steps/1` uses strings.
- Should this category's CSS components be importable individually, or is the all-in-one `priv/static/exo.css` final?
- Is browser test coverage for static-display components (table/list/cards) considered out of scope? (Currently zero specs.)
