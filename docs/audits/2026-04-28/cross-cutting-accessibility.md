# Cross-cutting accessibility

**Date:** 2026-04-28
**Auditor:** Claude Opus 4.7 (cross-cutting subagent)
**Score:** 🔴 critical
**Categories audited:** 7

## TL;DR

Library-wide, accessibility is the worst dimension of ExoUI. The form module emits zero `aria-invalid`, zero `aria-describedby`, zero `aria-required`, and zero stable description/error IDs across every control (`form.ex:107-516`). Dialogs (`modal`, `sheet`, `drawer`, `command_palette`) all set `aria-modal="true"` but never make outside content `inert`, never enforce a title, and `command_palette` has no focus trap or focus restore. Zero `@media (prefers-reduced-motion: reduce)` rules exist anywhere in `assets/css/src/` despite ~40 transitions/animations. Every chart SVG (18 functions) has zero `role="img"`/`aria-label`. `tabs/1` claims `role="tablist"` but ships no tabpanels and no roving tabindex. Pagination disabled controls render as non-focusable `<span>`. The sidebar shell uses a `<label role="button">` checkbox-hack with no `aria-expanded` and no mobile focus trap.

## Severity tally

| Category | 🔴 | 🟡 | 🟢 |
| --- | --- | --- | --- |
| Core | 4 | 3 | 2 |
| Form | 5 | 6 | 2 |
| Overlay | 3 | 7 | 3 |
| Data display | 5 | 5 | 1 |
| Feedback | 5 | 3 | 1 |
| Charts | 3 | 4 | 1 |
| Layouts | 4 | 4 | 1 |
| **Total** | **29** | **32** | **11** |

## Recurring patterns

### 1. Form controls have no ARIA invalid/described-by linkage

- **Evidence:** Every input, textarea, checkbox, select trigger, combobox trigger emits only `data-invalid={@errors != [] && ""}` (`form.ex:112, 130, 154, 285, 389, 449`); no `aria-invalid` is ever set. Description/error nodes carry no `id` (`form.ex:117, 161, 169, 219, 321, 422, 514, 660, 691, 906`); no `aria-describedby` links them. No `aria-required`. Toggle has no `role="switch"` / `aria-checked` (`form.ex:203, 222`). Slider, date_picker, rating, file_input do not even accept a `Phoenix.HTML.FormField` and never render errors at all.
- **Why it matters:** Screen readers see invalid fields as visually red but not invalid. Description and error text are orphan strings — they may or may not be encountered, but they're not announced as related to the control. WCAG 1.3.1 (Info and Relationships), 3.3.1 (Error Identification), 4.1.2 (Name, Role, Value).
- **Fix recipe:** Introduce a single `field/1` helper that owns: stable `#{@id}-description` and `#{@id}-error` IDs, `aria-invalid={@errors != []}`, `aria-describedby={describedby_for(@id, @description, @errors)}`, `aria-required={@required}`. Refactor `input/1`, `select/1`, `combobox/1`, `radio_group/1`, `slider/1`, `date_picker/1`, `rating/1`, `file_input/1`, `toggle/1` to compose it.

### 2. Dialogs claim modality without enforcing it

- **Evidence:** `aria-modal="true"` set on modal/drawer/sheet/command_palette (`overlay.ex:39, 400, 471, 626`) but `inert` only flips on the dialog ROOT (`overlay.ex:28, 391, 461`), never on outside content. Title slot is optional — `aria-labelledby` rendered conditionally (`overlay.ex:40, 401, 472`); `command_palette` uses `aria-label` only. Focus trap is JS Tab-handler only (`overlay.js:139-162`). `command_palette` has NO focus trap and NO focus restore (`command_palette.js:55-67`).
- **Why it matters:** Screen-reader virtual cursor reaches background content while a "modal" is open; dialogs without accessible names violate APG; `command_palette` keyboard users can Tab into invisible page content.
- **Fix recipe:** Extend `_activate`/`_deactivate` in `overlay.js:81-112` to set `inert` on `<body>`'s other top-level children. Make title required (or auto-render a hidden `<h2>`). Mount `ExoOverlay` on `command_palette` too — single contract.

### 3. Reduced motion is never honored

- **Evidence:** `grep -rn "prefers-reduced-motion" assets/css/src/` returns ZERO results. Confirmed transitions/animations: `accordion.css:12, 79, 119`, `wizard.css:26`, `command-palette.css:16, 30`, `drawer.css:17, 33, 84`, `tooltip.css:51, 58`, `combobox.css:21, 40, 78, 135, 231`, `hover-card.css:24`, `charts.css:59`, `sheet.css:17, 26, 121, 130, 139`, `slider.css:28`, `popover.css:68`, `radio.css:45`, `progress.css:32`, `tabs.css:22`, `date-picker.css:42, 99`, `input.css:23`, `select.css:19, 52, 97`, `pagination.css:22`, `collapsible.css:4`, `theme-toggle.css:19`, `spinner.css:7`, `checkbox.css:28, 38`, `skeleton.css:16, 26, 34`, `context-menu.css:15`, `rating.css:21`, `table.css:28`, `button.css:14`, `toggle.css:20`, `sidebar.css:226-229`, `carousel.js:24, 26, 30, 32` (smooth scroll). Plus `accordion.js`, `command_palette.js`, `sheet.css` keyframes.
- **Why it matters:** WCAG 2.3.3 (Animation from Interactions). Vestibular-disorder users exposed to ~40 animated surfaces.
- **Fix recipe:** One global rule in `tokens.css` or a new `motion.css`: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }`. Plus client-side guard in `carousel.js` for `behavior: "smooth"`.

### 4. Charts ship zero accessibility metadata

- **Evidence:** `grep "role=\|aria-label" lib/exo_ui/charts/*.ex` returns ZERO. 18 chart functions across 1645 LOC have no `role="img"`, no `aria-label`, no `<title>`/`<desc>` on the SVG root, no `attr :rest, :global` so consumers cannot add ARIA from outside. `progress_bar/1` (chart) lacks `role="progressbar"` despite name (`primitives.ex:128-144`). `trend_badge` flat case renders `&mdash;` only (`primitives.ex:52`) — read as "em dash".
- **Why it matters:** WCAG 1.1.1 (non-text content). Charts are functionally invisible to AT.
- **Fix recipe:** Add `attr :title, :string, required: true`, `attr :description, :string`, `attr :rest, :global` to every chart; render `role="img"` plus internal `<title>`/`<desc>`.

### 5. Misuse of `role="alert"` for non-urgent surfaces

- **Evidence:** `feedback.ex:28` (flash), `:91` (toast), `:119` (alert) hardcode `role="alert"` regardless of `:info`/`:success`/`:warning`. `overlay.ex:326, 549` apply `role="tooltip"` to `tooltip` AND to `hover_card` rich content (wrong: hover card is rich content, not a tooltip).
- **Why it matters:** `role="alert"` is implicit `aria-live="assertive"` — every successful save interrupts the screen reader. Hover-card content read as the trigger's tooltip description destroys long-form readability.
- **Fix recipe:** Branch role on kind: `:error` → `alert`, others → `status`. Drop `role="tooltip"` from hover_card; use `aria-haspopup="dialog"` + `aria-expanded` on its trigger.

### 6. Decorative SVGs leak into AT name computation

- **Evidence:** `lucide.ex:3324-3338` icon template emits no `aria-hidden`. Spinner SVG (`core.ex:212`), radial-progress SVG (`feedback.ex:190`), all chart SVGs missing. Carousel arrows are raw glyphs (`data_display.ex:444-445`). Sidebar hamburger is `☰` (`layouts.ex:49`). Flash/toast close buttons are `✕` characters (`feedback.ex:39, 102`).
- **Why it matters:** AT readers announce "image" or stray glyph tokens for decorative content.
- **Fix recipe:** Default `aria-hidden="true"` in the `Lucide` template; use `<.icon name="x" aria-hidden="true">` everywhere a glyph appears.

### 7. Tabindex misuse — disabled controls dropped from tab order; redundant tab stops

- **Evidence:** Pagination prev/next disabled rendered as `<span aria-disabled>` with no tabindex (`data_display.ex:320-322, 348-350`) — drops out of tab order vs the in-flow page-number links. `swap` checkbox is `tabindex="-1" aria-hidden="true"` (`core.ex:359-360`) — keyboard-inaccessible. `tooltip-anchor` is `tabindex="0"` wrapping a focusable button (`overlay.ex:313`) — double tab stop. Wizard sidebar future steps are `<div>` not focusable (`data_display.ex:191-198`).
- **Why it matters:** WCAG 2.4.3 (Focus Order). Inconsistency between active and disabled states confuses keyboard users.
- **Fix recipe:** Disabled controls remain `<button disabled>` (still focusable per APG). `swap` uses `<input role="switch">` with CSS visual-hide (no `tabindex="-1"`). `tooltip-anchor` uses the `popover.js:_findControl` pattern: drop wrapper tabindex when inner focusable found.

### 8. Live regions absent from async/dismiss surfaces

- **Evidence:** `grep "aria-live"` returns ZERO across `lib/exo_ui/` and `assets/js/hooks/`. Combobox loading hidden via inline `style="display:none"` (`form.ex:416-418`) — no `role="status"`. Command palette empty state hidden via JS (`command_palette.js:71`) — no announcement. Toast container has no live region (`feedback.ex:85`). Pagination has no "Page X of Y" announcement. Carousel has no slide-counter live region.
- **Why it matters:** Async content changes are silent for AT users.
- **Fix recipe:** Wrap toast container in `<ol role="region" aria-live="polite" aria-label="Notifications">`. Combobox loading: `role="status" aria-live="polite"`. Pagination: hidden `<span aria-live="polite">Page {@page} of {@total_pages}</span>`. Carousel: same pattern with slide index.

## WCAG 2.2 mapping

- **2.1.1 Keyboard:** `tabs/1` no arrow keys (`data_display.ex:250-279`); `swap` keyboard-inaccessible (`core.ex:354-364`); date_picker click-only (`form.ex:783-810`); rating mouse-only highlight; sidebar hamburger does not toggle on Enter (`layouts.ex:42-50`); chart bars/slices not focusable (zero `tabindex` in `charts/`).
- **2.4.1 Bypass Blocks:** No skip link in `sidebar_layout` (`layouts.ex:1-123`); `<main>` has no `id`.
- **2.4.3 Focus Order:** Tooltip double-tab-stop (`overlay.ex:313`); pagination disabled `<span>` breaks order; mobile drawer leaks Tab into background (`sidebar.js`, `overlay.ex:380-422`); command_palette no focus restore (`command_palette.js:55-67`).
- **2.4.7 Focus Visible:** Mostly covered via `:focus-visible` in 17 files (`button.css:66`, `radio.css:55`, `checkbox.css:52`, `accordion.css:59`, `slider.css:45`, etc.). Gaps: chart bars/slices/segments (zero focus styles); rating stars (`rating.css` has no `:focus-visible`); pagination links, breadcrumb links (`pagination.css`, `breadcrumb.css` rely on browser default); table rows (clickable rows have no focus state); carousel buttons (`carousel.css` has none).
- **3.3.1 Error Identification:** No `aria-invalid`, no `aria-describedby` linking errors to controls — all 9 form controls.
- **3.3.2 Labels or Instructions:** `file_input` `<label for={@id}>` wired to nil id by default (`form.ex:884, 895`); progress label has no `aria-labelledby` to bar (`feedback.ex:142-152`); rating no `id` so hook crashes.
- **4.1.2 Name, Role, Value:** Toggle has no switch role (`form.ex:203, 222`); sidebar `<label role="button">` lies (`layouts.ex:46`); hover_card uses `role="tooltip"` for rich content (`overlay.ex:549`); tabs `role="tablist"` without panels (`data_display.ex:252`); theme_toggle no `aria-pressed` (`core.ex:91-95`).

## Dialog contract scorecard

| Component | role | aria-modal | trap | esc | title req | a11y desc | focus restore | inert outside |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| modal | 🟢 dialog | 🟢 | 🟡 JS-only | 🟢 | 🔴 optional | 🟢 body desc | 🟢 invoker | 🔴 dialog only |
| confirm_modal | 🟢 alertdialog | 🟢 | 🟡 inherits | 🟢 | 🟢 default "Confirm" | 🟢 inherits | 🟢 inherits | 🔴 |
| sheet | 🟢 dialog | 🟢 | 🟡 JS-only | 🟢 | 🔴 optional | 🔴 not set | 🟢 invoker | 🔴 |
| drawer | 🟢 dialog | 🟢 | 🟡 JS-only | 🟢 | 🔴 optional | 🔴 not set | 🟡 missing phx-mounted | 🔴 |
| command_palette | 🟢 dialog | 🟢 | 🔴 NO trap | 🟢 | 🔴 aria-label only | 🔴 not set | 🔴 NOT implemented | 🔴 |

## Form field a11y scorecard

| Field | aria-invalid | aria-describedby | error ID stable | label assoc | required | disabled |
| --- | --- | --- | --- | --- | --- | --- |
| input | 🔴 (data-invalid only) | 🔴 | 🔴 | 🟢 implicit/`for` | 🔴 no aria-required | 🟢 |
| textarea | 🔴 | 🔴 | 🔴 | 🟢 | 🔴 | 🟢 |
| checkbox | 🔴 | 🔴 | 🔴 | 🟢 implicit | 🔴 | 🟢 |
| toggle | 🔴 (no role=switch) | 🔴 | 🔴 | 🟢 implicit | 🔴 | 🟢 |
| select | 🔴 | 🔴 | 🔴 | 🟢 labelledby | 🔴 | 🟢 |
| combobox | 🔴 | 🔴 | 🔴 | 🟢 labelledby | 🔴 | 🟢 |
| radio_group | 🔴 | 🔴 | 🔴 | 🟢 fieldset/legend | 🔴 | 🟢 |
| slider | 🔴 no errors at all | 🔴 | 🔴 | 🟡 native | 🔴 | 🟡 |
| date_picker | 🔴 no errors at all | 🔴 | 🔴 | 🔴 | 🔴 | 🟡 |
| rating | 🔴 no errors at all | 🔴 | 🔴 | 🔴 no id | 🔴 | 🔴 readonly only |
| file_input | 🔴 no errors at all | 🔴 | 🔴 | 🔴 for=nil | 🔴 | 🟢 |

## Menu keyboard contract scorecard

| Component | roving tabindex | aria-activedescendant | arrows | Home/End | typeahead | Escape |
| --- | --- | --- | --- | --- | --- | --- |
| dropdown_menu | 🟢 (`dropdown_menu.js:9-23`) | 🔴 | 🟢 | 🟢 | 🔴 | 🟡 popover dismiss |
| context_menu | 🟢 (JS-side, `context_menu.js:13`) | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 |
| menubar | 🟢 (`menubar.js:15`) | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 |
| select | 🟢 | 🔴 (DOM focus instead) | 🟢 | 🟢 | 🟢 (single-char, `select.js:112-120`) | 🟢 |
| combobox | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 | 🟢 |
| command_palette | 🔴 (none, options listbox) | 🟢 (`command_palette.js:220`) | 🟢 | 🟢 | 🔴 | 🟢 |
| accordion | n/a | n/a | 🟢 (`accordion.js:36-51`) | 🟢 | 🔴 | 🔴 |
| tabs | 🔴 NO HOOK | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |

## Reduced motion

`grep "prefers-reduced-motion" assets/css/src/` → 0 hits. Animations/transitions ignoring user pref:

- Modal/sheet/drawer/command_palette/context_menu/hover_card open animations
- Accordion height (`accordion.css:12, 79, 119`)
- Collapsible (`collapsible.css:4`)
- Sidebar width (`sidebar.css:226-229`)
- Carousel smooth scroll (`carousel.js:24, 26, 30, 32`)
- Skeleton pulse (`skeleton.css:16, 26, 34`)
- Spinner spin (`spinner.css:7`)
- Progress fill (`progress.css:32`, `charts.css:59`)
- All button/input/checkbox/radio/toggle/select/combobox/slider/rating/tabs/pagination/table hover transitions

**Fix:** add a single global guard rule (see Pattern #3).

## Focus visible

**Has explicit `:focus-visible`:** button (`button.css:66`), accordion (`accordion.css:59`), checkbox (`checkbox.css:52`), radio (`radio.css:55`), slider (`slider.css:45`), tooltip trigger via `:has()`. **Has `:focus` only (regression vs `:focus-visible` — fires on mouse click):** combobox triggers/options, input, select triggers/options, dropdown items, menubar items.

**Has NO focus styles:** rating stars (`rating.css`), pagination links/buttons (`pagination.css` only transition), breadcrumb links, theme_toggle buttons, carousel prev/next, table rows (`row_click`), wizard sidebar items, sidebar items, every chart element, swap, every navbar/footer/bottom_nav (no CSS at all), hero, chat_bubble.

## Top 10 critical accessibility issues

1. **[Form]** No `aria-invalid`/`aria-describedby` linkage on any form control — `form.ex:107-516` — WCAG 1.3.1, 3.3.1, 4.1.2.
2. **[Overlay]** Outside content not `inert` while modal/sheet/drawer/command_palette open — `overlay.ex:23-60, 383-422, 454-494` + `overlay.js:81-112` — WCAG 2.4.3.
3. **[Charts]** Zero `role="img"`/`aria-label` on 18 chart SVGs; no `attr :rest, :global` so consumers cannot add ARIA — `lib/exo_ui/charts/*.ex` — WCAG 1.1.1.
4. **[Data display]** `tabs/1` claims `role="tablist"` without `tabpanel`/`aria-controls`/arrow keys — `data_display.ex:250-279` — WCAG 4.1.2, 2.1.1.
5. **[Data display]** Pagination disabled prev/next render as non-focusable `<span>` — `data_display.ex:320-322, 348-350` — WCAG 2.4.3.
6. **[Form]** `toggle/1` has no `role="switch"` / `aria-checked` — `form.ex:203, 222` — WCAG 4.1.2.
7. **[Layouts]** Sidebar `<label role="button">` hamburger has no `aria-expanded`, no Enter activation, no mobile focus trap — `layouts.ex:42-50, 73-79` + `sidebar.js:1-50` — WCAG 4.1.2, 2.1.1, 2.4.3.
8. **[Layouts]** No skip link, no `id="main"` — `layouts.ex:64` — WCAG 2.4.1.
9. **[Feedback]** Hardcoded `role="alert"` on info/success/warning flash/toast/alert — `feedback.ex:28, 91, 119` — WCAG 4.1.3.
10. **[Cross-cutting]** Zero `prefers-reduced-motion` guards across ~40 animated surfaces — every CSS file in `assets/css/src/components/` and `layouts/` — WCAG 2.3.3.

## Quick wins

- **[XS]** Default `aria-hidden="true"` in `lucide.ex:3324-3338` SVG template — fixes every Lucide icon library-wide.
- **[XS]** Add `aria-hidden="true"` to spinner SVG (`core.ex:212`), radial-progress SVG (`feedback.ex:190`), every chart SVG.
- **[XS]** Add a single global `@media (prefers-reduced-motion: reduce)` rule in `tokens.css` or new `motion.css` zeroing animation/transition durations.
- **[XS]** Add `aria-pressed` to theme_toggle buttons (`core.ex:92-94`) and mirror in `theme_toggle.js:30-32`.
- **[XS]** Branch `role` on `@kind` for flash/toast/alert (`feedback.ex:28, 91, 119`).
- **[S]** Add `attr :rest, :global` to every chart function so consumers can pass `role="img" aria-label="..."` from outside.
- **[S]** Replace pagination disabled `<span>` with `<button disabled>` (`data_display.ex:320-322, 348-350`).
- **[S]** Add `aria-current={step.status == :current && "step"}` to wizard_sidebar items (`data_display.ex:171-203`).
- **[S]** Add skip link + `id="main"` to `sidebar_layout` (`layouts.ex:64`).
- **[S]** Switch `tooltip-anchor` to drop `tabindex="0"` when an inner focusable is detected (mirror `popover.js:_findControl`).
- **[S]** Wrap `combobox-loading` in `role="status" aria-live="polite"` (`form.ex:416-418`).

## Strategic recommendations

1. **Ship a `field/1` private helper** in `form.ex` that owns: stable description/error IDs, `aria-invalid`, `aria-describedby`, `aria-required`. Refactor all 9 controls onto it. This single change closes 5 of the top 10 critical issues for the form surface.
2. **Promote `ExoOverlay` to a unified dialog contract.** Today modal/sheet/drawer share it but command_palette does not. Extend `_activate`/`_deactivate` (`overlay.js:81-112`) to: (a) set `inert` on `body > *:not(#dialog-id)`; (b) call `_panel.focus()` if title attr present, else fallback to first focusable; (c) restore on `_deactivate`. Mount on command_palette. Make `:title` slot/attr `required: true` library-wide.
3. **Add a global motion guard** in `assets/css/src/tokens.css` or a new `motion.css` imported first: one `@media (prefers-reduced-motion: reduce)` rule. Costs nothing, fixes ~40 surfaces.
4. **Adopt an axe test harness in Storybook.** With Phoenix Storybook running and Playwright already wired (`test/browser/`), add an axe-core scan per story; fail CI on serious/critical violations. This prevents regressions from accumulating again.
5. **Extract a shared `chart_root/1` in `lib/exo_ui/charts/shared.ex`** that injects `role="img"`, `aria-labelledby`, `<title>`/`<desc>` from `:title`/`:description` attrs and accepts `:rest` global. Wire all 18 chart functions to it.
6. **Replace the sidebar checkbox-hack with a real button** driven by `ExoSidebar`. Reuse the `ExoOverlay` focus-trap primitive for the mobile drawer. This single refactor closes 4 layout-category critical issues.
7. **Codify a "no `role="alert"` for non-error" rule** with a small helper `feedback_role(:kind)` that returns `"alert"` for `:error` and `"status"` otherwise. Apply across flash/toast/alert.
8. **Document the dialog/menu/form contracts** in module @moduledoc with required ARIA attributes; teach via examples, not just types.

## Open questions for the library owner

- Is Tailwind a documented peer dep? `class="size-4"` on icons (`core.ex:78`) targets a non-shipped utility; affects every icon's accessibility-relevant size.
- Do `swap`, `tabs`, `wizard_sidebar` move to "real ARIA widget" status, or get renamed (`tab_nav`, etc.) and stripped of misleading roles?
- Should `command_palette` mount `ExoOverlay` directly, or stay as its own hook? The split is the root cause of its missing focus restore + missing trap.
- Should ExoUI portal dialogs to `<body>` so outside-`inert` becomes trivial?
- Is gettext required for all `aria-label` defaults (`"Loading"`, `"Close"`, `"Carousel"`, `"Toggle sidebar"`), or are English literals acceptable for v0.1?
- Are charts considered informative (full SR support required) or decorative (`aria-hidden="true"` acceptable)?
