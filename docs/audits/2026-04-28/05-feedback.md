# Audit: Feedback

**Date:** 2026-04-28
**Auditor:** Claude Opus 4.7 (subagent)
**Score:** 🔴 critical
**Maturity:** ~30% (vs shadcn/daisyUI baseline)

## TL;DR

Six functions, one ~225-line module, no JS hooks, partial CSS. The whole module
behaves like a static HEEx render only — no auto-dismiss, no pause-on-hover,
no live-region wiring, no clamping of negative values, and the `flash`
component still binds `phx-click` to the entire flash container so any click
on the message dismisses it. `radial_progress` ships zero CSS (no
`radial-progress.css`) so the `data-size="sm|md|lg"` and track/fill data
attributes are decorative and unstyled. Every kind of flash/alert/toast is
hard-coded `role="alert"` regardless of severity, which is wrong for
info/success/warning and degrades AT behavior.

## Surface map

### Public functions

- `ExoUI.Components.flash/1` — single dismissible flash (info/error only)
- `ExoUI.Components.flash_group/1` — info+error+disconnect+reconnect bundle
- `ExoUI.Components.toast_container/1` — stream-only toast list, no manager
- `ExoUI.Components.alert/1` — inline alert (info/success/warning/error)
- `ExoUI.Components.progress/1` — linear progress bar
- `ExoUI.Components.radial_progress/1` — circular SVG progress

### Source modules

- `lib/exo_ui/components/feedback.ex:1-224` — entire surface, no helpers
- `lib/exo_ui/components.ex:77-82` — `defdelegate` for all 6 functions
- `assets/css/src/components/flash.css:1-133` — flash + toast in one file
- `assets/css/src/components/alert.css:1-44` — alert kinds
- `assets/css/src/components/progress.css:1-33` — linear bar only
- `assets/js/index.js:1-37` — no feedback hook registered (none exist)

### Tests

- `test/exo_ui/components/flash_test.exs:1-30` — 3 trivial tests, only assert
  `data-exo` strings exist; no a11y, no group dismiss, no kind=`error`
- `test/exo_ui/components/progress_test.exs:1-88` — 12 tests, covers
  upper-bound clamp + `max=0`, but NOT negative `value`
- `test/exo_ui/components/radial_progress_test.exs:1-135` — 15 tests, NO
  negative-value test, NO `max=0` test
- `test/exo_ui/components/alert_test.exs` — DOES NOT EXIST
- `test/exo_ui/components/toast_container_test.exs` — DOES NOT EXIST
- `test/browser/` — NO Playwright spec for any feedback component
  (`ls test/browser/` confirms: combobox, command_palette, context_menu,
  dropdown_menu, hover_card, menubar, overlay, popover, rating, select,
  tooltip — feedback absent)

### Storybook

- `flash.story.exs` — `:page` story, only info+error kinds, no dismiss demo
- `flash_group.story.exs` — `:page`, single flash payload
- `alert.story.exs` — `:component` with `function: &ExoUI.Components.alert/1`
  (DELEGATED reference — breaks attribute introspection per audit prompt)
- `toast_container.story.exs` — `:page`, two toasts hardcoded, no auto-dismiss
- `progress.story.exs` — `:component` with delegated function reference
  (`&ExoUI.Components.progress/1`)
- `radial_progress.story.exs` — `:page`, sizes section is meaningless (no CSS)

## What works (with proofs)

- `progress/1` upper-bound clamp: `min(100, round(value / max * 100))` at
  `lib/exo_ui/components/feedback.ex:137`. Test
  `progress_test.exs:71-75` confirms `value=150 max=100` renders width 100%.
- `progress/1` zero-`max` guard: `if assigns.max == 0, do: 0` at
  `feedback.ex:137`. Test `progress_test.exs:77-81`.
- `progress/1` ARIA: `role="progressbar"`, `aria-valuemin`, `aria-valuemax`,
  `aria-valuenow` all wired (`feedback.ex:148-151`). `aria-valuenow` is the
  raw value, not the clamped percentage — correct per WAI-ARIA APG.
- `flash/1` and `toast_container/1` emit a dedicated `<button
data-exo="…-close">` with `aria-label` (`feedback.ex:39`,
  `feedback.ex:97-103`).
- `toast_container/1` uses `phx-update="stream"` correctly
  (`feedback.ex:85`). `id="toast-container"` is fixed, which works with
  Phoenix.LiveView.stream.
- `flash_group/1` matches the Phoenix gen.html scaffold shape
  (info+error+disconnect+reconnect, `feedback.ex:50-77`).
- `radial_progress/1` SVG geometry is correct (`r=40`, circumference
  `2π·40 ≈ 251.33`, `stroke-dasharray=circumference`,
  `stroke-dashoffset=circumference - pct/100·circumference`,
  `transform="rotate(-90 50 50)"`, `feedback.ex:170-213`).
- `alert/1` exposes an `:action` slot and surfaces it under
  `data-exo="alert-action"` (`feedback.ex:114, 124`). This is the only slot
  contract honored across the module.
- `alert.css` uses `color-mix(in oklch, var(--exo-X) 10%, transparent)` for
  tinted backgrounds — token-correct, dark-mode parity should follow without
  extra rules (`alert.css:13-35`).
- `tokens.css:14-22` exposes `--exo-info`, `--exo-success`, `--exo-warning`,
  `--exo-danger` plus `*-foreground` pairs — sufficient for all four alert
  kinds.

## What is missing or half-done

- No `radial-progress.css` file at all
  (`ls assets/css/src/components/ | grep radial` returns nothing). Built
  output `priv/static/exo.css` contains zero `radial-progress` rules
  (`grep -o radial[a-z-]* priv/static/exo.css` is empty). All
  `data-exo="radial-progress*"` attributes and `data-size` are dead hooks.
  No track color tweak, no fill color, no size scaling, no
  `prefers-reduced-motion` for the dashoffset transition.
- No `toast.css` — toast styles cohabit `flash.css:73-133`. There is no
  `aria-live` region, no `role="region"`, no `aria-label`, no auto-dismiss
  timer, no pause-on-hover, no focus-on-action contract.
- `flash/1` `phx-click` is on the WHOLE flash element
  (`feedback.ex:29-32`) — clicking the title or message body dismisses it.
  The dedicated `<button data-exo="flash-close">` at `feedback.ex:39` has NO
  `phx-click` of its own, so it relies on event bubbling from the parent
  container. This is exactly the bug called out in the previous audit; it
  was NOT fixed.
- `flash/1` is hard-coded to `role="alert"` (`feedback.ex:28`) for both
  `:info` and `:error` kinds. WAI-ARIA: `role="alert"` is implicit
  `aria-live="assertive"` and should be reserved for errors. Info should
  use `role="status"` (`aria-live="polite"`).
- `flash/1` accepts only `kind: :info | :error` (`feedback.ex:12`) but
  `flash.css:38-46` defines `data-kind="success"` and `data-kind="warning"`
  styles. The CSS is unreachable from the component.
- `toast_container/1` is hard-coded `role="alert"` per toast
  (`feedback.ex:91`). No region wrapper, no `aria-live`, no `aria-atomic`,
  no `aria-relevant`. Stacked toasts will all blast as `assertive`.
- `toast_container/1` has no `:action` slot, no auto-dismiss
  (`setTimeout`/JS hook), no pause-on-hover/focus, no close on Escape, no
  swipe-to-dismiss. This is a bare HEEx renderer marketed as a "toast
  container".
- `alert/1` is hard-coded `role="alert"` (`feedback.ex:119`). For
  info/success/warning this should be `role="status"`. Action slot exists
  but no icon variant is documented or implemented.
- `progress/1` and `radial_progress/1` do NOT clamp negative values.
  `min(100, round(value/max*100))` (`feedback.ex:137`, `feedback.ex:169`)
  bounds upward only. Negative `value` produces a negative percentage,
  inline `style="width: -25%"`, and `stroke-dashoffset > circumference` —
  visually broken and emits negative `aria-valuenow`.
- `progress/1` has no indeterminate mode (no `aria-valuenow` omission, no
  CSS keyframe). `radial_progress/1` likewise.
- No icon variants on `flash/1`, `toast_container/1`, or `alert/1`. No icon
  slot, no kind-driven default icon, no `aria-hidden="true"` on a leading
  glyph.
- `id` discipline: `flash/1` defaults to `"flash-#{kind}"`
  (`feedback.ex:18`), but `flash_group/1` calls `<.flash kind={:info}>`
  TWICE if the user adds another flash group on the same page → duplicate
  DOM ids. `toast_container/1` is hard-coded `id="toast-container"` so two
  containers on one page collide (`feedback.ex:85`).

## Per-component table

| Component         | Status | Findings (file:line)                                                                                                                                                                                                            | Recommended work                                                                          |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `flash`           | 🔴 P0  | whole-flash dismiss `feedback.ex:29-32`; `role="alert"` hard-coded `feedback.ex:28`; only info/error despite CSS `flash.css:38-46`; default id collides on multiple groups `feedback.ex:18`                                     | move `phx-click` to button; switch role to `status` for info; widen kind enum; require id |
| `flash_group`     | 🟡 P1  | hard-coded `disconnect`/`reconnect` strings English-only `feedback.ex:47-48`; no Gettext hook; no `role="region"` `feedback.ex:52`                                                                                              | wrap in `aria-live` region; expose translation hooks                                      |
| `toast_container` | 🔴 P0  | no `aria-live`, no `role="region"`, no auto-dismiss, no pause-on-hover, no action slot, fixed id `feedback.ex:83-107`; per-toast `role="alert"` for all kinds `feedback.ex:91`                                                  | add region wrapper + JS hook for dismiss/pause                                            |
| `alert`           | 🔴 P0  | every kind `role="alert"` `feedback.ex:119`; no icon variant; no `aria-labelledby` linking title; no `dismissible` flag                                                                                                         | branch on kind for role; add icon slot; optional close button                             |
| `progress`        | 🟡 P1  | no negative-value clamp `feedback.ex:137`; no indeterminate mode; no label `aria-labelledby` link to bar `feedback.ex:142-152`                                                                                                  | `pct = max(0, min(100, ...))`; add `indeterminate` attr; wire `aria-labelledby`           |
| `radial_progress` | 🔴 P0  | NO CSS file at all (built CSS contains zero `radial-progress` rules); negative-value clamp missing `feedback.ex:169`; size attr is decorative; `<svg>` lacks `aria-hidden` despite outer `role="progressbar"` `feedback.ex:190` | ship `radial-progress.css`; clamp value; mark SVG `aria-hidden="true"`                    |

Status legend: P0 (incorrect/misleading public API), P1 (works but below
shadcn/daisyUI bar), P2 (polish), OK (acceptable).

## Problems by severity

### 🔴 Critical

#### 1. Whole-flash click dismisses the flash

- **Where:** `lib/exo_ui/components/feedback.ex:29-32`
- **What happens:**

  ```elixir
  phx-click={
    Phoenix.LiveView.JS.push("lv:clear-flash", value: %{key: @kind})
    |> Phoenix.LiveView.JS.hide(to: "##{@id}")
  }
  ```

  is attached to the outer `<div data-exo="flash">` (`feedback.ex:21-34`).
  The `<button data-exo="flash-close">` at `feedback.ex:39` carries only an
  `aria-label` — its dismiss happens by bubbling. Selecting text or
  clicking a link inside the message dismisses the flash.

- **Why critical:** identical to the bug flagged in the previous audit;
  drops focus management, breaks click-to-select, and prevents adding
  inline links/actions in the future.
- **Reproduction:** Storybook page `flash.story.exs:9-15` — click anywhere
  on the rendered flash body.
- **Suggested fix:** move `phx-click` to the close button. Drop
  `cursor: pointer` from `flash.css:24`. Optional: add Escape-key dismiss
  via JS hook.

#### 2. `radial_progress/1` has no CSS

- **Where:** `lib/exo_ui/components/feedback.ex:179-222` and
  `assets/css/exo.css:1-52` (no `@import` for radial-progress).
- **What happens:** the component emits `data-exo="radial-progress"`,
  `data-size="sm|md|lg"`, `data-exo="radial-progress-track"`,
  `data-exo="radial-progress-fill"`, `data-exo="radial-progress-label"`
  but `priv/static/exo.css` contains zero matching selectors. Sizes are
  identical because no `width`/`height` rules exist.
- **Why critical:** ships visibly broken — `size` attr is a lie; no
  reduced-motion support; track color stuck at `currentColor` opacity 0.2
  (inline). Component documented to support `sm|md|lg`
  (`feedback.ex:162`) but they render identical.
- **Reproduction:** `radial_progress.story.exs:21-27` "Sizes" section
  renders three identical SVGs.
- **Suggested fix:** create `assets/css/src/components/radial-progress.css`
  with size-driven `width`/`height`/`font-size` and a transition on
  `stroke-dashoffset` honoring `prefers-reduced-motion`. Add the import to
  `assets/css/exo.css`.

#### 3. Negative `value` not clamped (linear + radial)

- **Where:** `lib/exo_ui/components/feedback.ex:137` and `:169`
- **What happens:**

  ```elixir
  pct = if assigns.max == 0, do: 0, else: min(100, round(assigns.value / assigns.max * 100))
  ```

  No `max(0, ...)`. With `value=-25 max=100` → `pct = -25` →
  `style="width: -25%"` on the bar; on radial, `stroke-dashoffset` becomes
  `circumference + 0.25*circumference` which under-rotates. `aria-valuenow`
  is the raw negative integer.

- **Why critical:** AT readers will read "negative twenty five percent";
  CSS layout breaks differently per browser.
- **Reproduction:** `<.progress value={-10} />` and
  `<.radial_progress value={-10} />`. No test guards against this
  (`progress_test.exs:1-88`, `radial_progress_test.exs:1-135`).
- **Suggested fix:** `pct = max(0, min(100, ...))` and clamp
  `aria-valuenow` to `max(0, min(@max, @value))`.

#### 4. Hard-coded `role="alert"` for non-urgent kinds

- **Where:** `feedback.ex:28` (flash), `feedback.ex:91` (toast),
  `feedback.ex:119` (alert)
- **What happens:** all three components emit `role="alert"` regardless of
  `@kind`. WAI-ARIA: `role="alert"` implies `aria-live="assertive"` and is
  reserved for time-sensitive errors. Info/success/warning should use
  `role="status"` (implicit `aria-live="polite"`).
- **Why critical:** every successful save announces with assertive
  interruption; on a typical CRUD app this is a constant audio nag for
  screen-reader users.
- **Reproduction:** static review of HEEx output via `flash_test.exs` —
  the test asserts `data-kind="info"` but does not assert the role.
- **Suggested fix:** map `:error` → `role="alert"`, everything else →
  `role="status"`. Add `aria-atomic="true"` for full re-announce.

#### 5. `toast_container/1` is not a toast manager

- **Where:** `feedback.ex:79-107`
- **What happens:** zero auto-dismiss, zero pause-on-hover, zero focus
  containment, no action slot, no close-on-Escape, no live region. The
  function is a `phx-update="stream"` HEEx loop that wraps the toast list
  in a div. It is documented as "stream-based toast notification
  container" (`feedback.ex:79`) but provides only the iteration.
- **Why critical:** consumers will believe ExoUI ships toasts à la
  shadcn/sonner. They do not. Every consumer must build the timer logic.
- **Reproduction:** `toast_container.story.exs:7-19` renders two toasts
  that never disappear and have no way to dismiss except clicking the X.
- **Suggested fix:** add an `ExoToast` JS hook (mounted: start
  `setTimeout` per item, mouseenter/focusin pause, mouseleave/focusout
  resume, Escape dismisses focused). Add `role="region"
aria-label="Notifications"` on the container, `role="status"` (or
  `alert` for kind error) on items, expose `:action` slot, expose a
  `duration` attr (default `5000`).

### 🟡 Medium

#### 6. `flash/1` kind enum narrower than CSS

`feedback.ex:12` declares `values: [:info, :error]` but `flash.css:38-46`
defines `data-kind="success"` and `data-kind="warning"` rules — unreachable.
Widen enum to `[:info, :error, :success, :warning]` or delete the CSS.

#### 7. Default id collisions

`feedback.ex:18` auto-generates `"flash-#{kind}"`; `feedback.ex:85`
hard-codes `id="toast-container"`. Two flash groups or two toast containers
collide. Make `id` required.

#### 8. `flash_group/1` text non-translatable

`feedback.ex:47-48`: `disconnect_msg` and `reconnect_msg` defaults are
English literals with no Gettext hook.

#### 9. `progress/1` label not wired to bar

`feedback.ex:142-152` — `<span data-exo="label">` has no id, progressbar
`<div>` has no `aria-labelledby`. Screen reader announces bar without
context.

#### 10. `radial_progress/1` SVG lacks `aria-hidden`

`feedback.ex:190` `<svg>` and `feedback.ex:215, 218` label `<span>` should
be `aria-hidden="true"` (outer wrapper already carries `role="progressbar"`
plus `aria-valuenow`).

#### 11. No focus management on dismiss

`feedback.ex:29-32`, `:99` — `JS.hide` runs without `JS.focus` restore.
Keyboard users lose focus context.

### 🟢 Minor

#### 12. Hardcoded close glyph

`feedback.ex:39, 102` — replace literal U+2715 with `<.icon name="x"
aria-hidden="true"/>` to match the rest of the library.

#### 13. Inline `style="width: ...%"`

`feedback.ex:153` — switch to `style="--exo-progress: ...%"` and reference
the var in CSS to play well with CSP `style-src`.

#### 14. Storybook delegated function references

`alert.story.exs:4` and `progress.story.exs:4` use
`&ExoUI.Components.alert/1` — delegated references break attribute
introspection. Point at `&ExoUI.Components.Feedback.alert/1`.

## Accessibility analysis

- **Roles & semantics:** all four (flash, toast, alert) hard-coded
  `role="alert"` regardless of kind (`feedback.ex:28, 91, 119`). Wrong
  for info/success/warning. `progress/1` and `radial_progress/1` have
  `role="progressbar"` correctly (`feedback.ex:148, 183`).
- **Keyboard:** flash/toast close buttons are real `<button>` elements →
  Tab/Enter parity works by default. NO Escape-to-dismiss anywhere. Tab
  order through a stack of toasts is undefined (no roving tabindex).
- **Focus management:** none. Dismissing a flash/toast hides via JS.hide
  with no focus restoration.
- **ARIA wiring:** missing `aria-labelledby` on progress (`feedback.ex:148`
  — bar is anonymous to AT despite a visible label). Missing
  `aria-live`/`aria-atomic` on toast container (`feedback.ex:85`). Missing
  `aria-hidden` on decorative SVG inside radial progress
  (`feedback.ex:190`). `aria-valuenow` on progress is the raw value, not
  clamped — also acceptable per APG, but with no negative-value clamp it
  may go negative.
- **Screen reader:** flash close button has `aria-label={@close_label}`
  default `"close"` (`feedback.ex:13, 39`). Toast same. Both labels are
  English-only — no translate hook.
- **Reduced motion:** `progress.css:32` has a 300ms `width` transition
  with no `@media (prefers-reduced-motion: reduce)` guard. Radial-progress
  has zero CSS so the issue is moot but will reappear once CSS lands.

## Composition & HTML correctness

- **Trigger composition:** N/A — feedback components have no triggers.
- **Slot contracts:** `flash/1` accepts `inner_block` for fallback
  message body. `alert/1` accepts `inner_block` (required) +
  `:action` slot — only component with action escape hatch. `toast_container/1`
  has NO action slot — toasts are message-only. `progress/1` has no
  description slot. `radial_progress/1` has `inner_block` for label
  override (`feedback.ex:218-220`) which works.
- **HTML correctness:** flash/toast use `<p>` for both title and message
  (`feedback.ex:36-37, 94-95`). `<p>` inside the message body forces a
  block break — fine. `alert/1` uses `<p>` for title and `<div>` for
  message wrapper (`feedback.ex:121-122`) — `<div>` here is fine because
  inner_block may be block-level.
- **Form integration:** N/A — no form-bound controls in this category.
- **`id` discipline:** `flash/1` auto-generates `"flash-#{kind}"`
  (`feedback.ex:18`); collides if rendered twice. `toast_container/1`
  hard-codes `id="toast-container"` (`feedback.ex:85`); collides on
  multiple containers. `flash_group/1` defaults to `"flash-group"`
  (`feedback.ex:46`).

## Browser & visual coverage

- **Playwright spec coverage:** ZERO. `ls test/browser/` shows no
  `flash.spec.js`, no `toast.spec.js`, no `alert.spec.js`, no
  `progress.spec.js`, no `radial_progress.spec.js`. Every feedback
  component is unverified end-to-end.
- **Untested paths:** keyboard dismissal, auto-dismiss, hover-pause,
  focus restore on close, multi-toast stacking, screen reader
  announcement, dark mode parity, reduced-motion, RTL.
- **Visual regression:** no baseline. Capture script
  `scripts/capture_storybook_components.js` referenced in audit prompt
  was not exercised here; needs a feedback story pass.

## CSS surface

- **Tokens used:**
  `--exo-card`, `--exo-card-foreground`, `--exo-border`,
  `--exo-danger`/`-foreground`, `--exo-success`/`-foreground`,
  `--exo-warning`/`-foreground`, `--exo-info`/`-foreground`,
  `--exo-muted-foreground`, `--exo-foreground`, `--exo-radius`,
  `--exo-space-{1,2,3,4}`, `--exo-text-xs`/`-sm`/`-base`, `--exo-shadow-lg`,
  `--exo-font`, `--exo-easing`. All present in `tokens.css:5-43`.
- **Dark mode parity:** none of the feedback CSS files redeclare values
  for `[data-theme="dark"]`. Token swap in `themes/dark.css` should
  cascade — verified token names (`--exo-card`, `--exo-danger`, etc.)
  exist in `tokens.css`. `color-mix(in oklch, var(--exo-info) 10%,
transparent)` (`alert.css:14`) will recompute correctly.
- **Override surface:** all selectors use `:where()` for zero specificity
  (`flash.css:14`, `alert.css:1`, `progress.css:1, 7, 13, 20, 28`).
  Consumers can override with a single class.
- **Dead CSS:**
  - `flash.css:38-46` `data-kind="success"` / `data-kind="warning"` rules
    are unreachable from the component's enum (`feedback.ex:12`).
  - `flash.css:24` `cursor: pointer` is the visual signal of the
    whole-flash dismiss bug — should be removed when bug is fixed.
- **Missing CSS:** `radial-progress.css` does not exist; no `toast.css`
  separate file (toast styles in `flash.css:73-133`).

## JS hook quality

- **Hooks for this surface:** NONE. `assets/js/index.js:1-37` registers
  16 hooks (`ExoAccordion`, `ExoCarousel`, `ExoCollapsible`,
  `ExoCommandPalette`, `ExoSidebar`, `ExoThemeToggle`, `ExoPopover`,
  `ExoDropdownMenu`, `ExoSelect`, `ExoCombobox`, `ExoTooltip`,
  `ExoHoverCard`, `ExoContextMenu`, `ExoRating`, `ExoMenubar`,
  `ExoOverlay`). No `ExoToast`, no `ExoFlash`, no `ExoProgress`. This is
  a deliberate gap — but every advertised "toast" feature in the docs
  requires a hook.
- **Server↔client contract:** `flash/1` pushes `lv:clear-flash`
  (`feedback.ex:30`) which is the standard Phoenix flash event — server
  consumes it via `Phoenix.LiveView` defaults. Toast close uses
  `JS.hide(to: "##{dom_id}")` (`feedback.ex:99`) — purely client; the
  server stream entry remains until LiveView removes it. Stale toast
  entries possible.

## Storybook quality

- **Pages exist:** all 6 components have stories.
- **States covered:**
  - `flash`: only info+error; no success/warning (consistent with code,
    not with CSS); no auto-dismiss demo.
  - `flash_group`: single payload, no disconnect demo (cannot be triggered
    in static page).
  - `alert`: 5 variations covering all four kinds + `no_title`. Best-covered
    of the bunch (`alert.story.exs:14-42`).
  - `toast_container`: 2 hardcoded toasts, no interaction demo.
  - `progress`: 4 variations covering low/mid/full/no_label
    (`progress.story.exs:14-33`); no negative-value, no `max=0`.
  - `radial_progress`: 4 sections (Values, Sizes, Without value, Custom max).
    "Sizes" section is misleading because no CSS makes them differ.
- **Attribute introspection:** `alert.story.exs:4` and
  `progress.story.exs:4` use delegated function references
  (`&ExoUI.Components.alert/1` and `&ExoUI.Components.progress/1`).
  Phoenix Storybook cannot introspect `attr` on a `defdelegate`. Should
  point to the Feedback module directly.
- **Phoenix form examples:** N/A — feedback components are not form
  controls.

## Test coverage

- **Existing test files:**
  - `flash_test.exs:1-30` — 3 tests, only verifies the `data-exo`
    strings are present and that `flash_group` renders client/server
    error scaffolding.
  - `progress_test.exs:1-88` — 12 tests covering value/max/label/clamp
    upper bound/`max=0`/class.
  - `radial_progress_test.exs:1-135` — 15 tests covering value/max/size/
    show_value/0%/100%/class/inner_block. NO negative-value, NO `max=0`.
- **Scenarios covered:** happy path; basic ARIA presence (progressbar
  role); upper-bound clamp on linear bar.
- **NOT covered:**
  - flash dismiss interaction (whole-element click)
  - flash kind=`error` body content
  - flash_group disconnect/reconnect message variants
  - any toast_container assertion (NO test file)
  - any alert assertion (NO test file)
  - negative-value behavior on either progress component
  - `radial_progress` with `max=0`
  - `aria-live`, `role="status"` vs `role="alert"` correctness
  - dark-mode CSS regression
- **Flakiness signals:** no `Process.sleep`, no `setTimeout`. Tests are
  pure render assertions — fine.

## Tech debt

- **TODO/FIXME:** none found in `feedback.ex`.
- **Dead code:**
  - `flash.css:38-46` (success/warning kinds unreachable from
    `feedback.ex:12`).
  - `flash.css:24` `cursor: pointer` — the visual cue of the
    whole-element dismiss bug.
  - `data-exo="radial-progress-track"`, `data-exo="radial-progress-fill"`,
    `data-size` (`feedback.ex:182, 192, 202`) — no CSS consumes them.
- **Convention drift:**
  - Other components (per audit context) use `ExoUI.Lucide` icons; here
    we ship raw "✕" glyphs (`feedback.ex:39, 102`).
  - Other interactive components use JS hooks; toast pretends to be one
    but ships none.
  - `toast_container/1` hard-codes `id="toast-container"` while every
    other component accepts `id` (`feedback.ex:85`).
  - `flash/1` lacks an `id` requirement — every other auto-id component
    in this module either defaults from kind (collides) or uses literal
    string (`feedback.ex:18`).

## Configuration & build

- **Public API exposure:** `ExoUI.Components.{flash, flash_group,
toast_container, alert, progress, radial_progress}` via `defdelegate`
  (`lib/exo_ui/components.ex:77-82`). `flash` and `flash_group` are
  documented (`README.md:106, 171-172`) as NOT imported by `use
ExoUI.Components` due to clash with Phoenix CoreComponents.
- **Build artifacts:**
  - `priv/static/exo.css` contains flash, toast, alert, progress.
  - `priv/static/exo.css` does NOT contain radial-progress (verified by
    grep returning empty).
  - `assets/css/exo.css:23-24, 38` imports alert, flash, progress; NO
    import for radial-progress (file does not exist).

## Documentation

- **Existing:** module @moduledoc one line (`feedback.ex:2-4`); per-function
  @doc one line each (`feedback.ex:8, 44, 79, 109, 129, 159`).
- **Missing:**
  - No example for `flash/1` showing how to attach a flash from
    LiveView.
  - No example for `toast_container/1` showing the stream contract.
  - No documentation that `flash/1` only supports `:info | :error` while
    CSS implies four kinds.
  - No documentation that `radial_progress/1` ships no styles.
  - No `aria-*` documentation on any component.
  - README does not list any feedback component besides `flash`/
    `flash_group`.
- **Out of date:** previous audit (referenced in prompt) called out
  whole-flash dismiss, missing toast manager, missing clamp — none have
  been fixed; module docstring still claims "Feedback components" without
  caveat.

## Comparison vs shadcn/daisyUI

- **Where ExoUI matches:**
  - `alert/1` kinds + action slot tracks shadcn `Alert` shape.
  - `progress/1` ARIA scaffolding + `aria-valuenow` matches shadcn.
  - `flash_group/1` Phoenix-specific scaffolding has no shadcn equivalent
    — it's a Phoenix idiom done correctly enough.
- **Where ExoUI lags:**
  1. No toast manager (shadcn has `sonner`/`use-toast`; daisyUI has
     `toast` + `alert` with auto-dismiss patterns). ExoUI ships HEEx
     iteration only.
  2. No icon variants on alert/flash (shadcn `Alert` ships an `<Icon />`
     slot and default kind icons).
  3. No indeterminate progress (shadcn `Progress`, daisyUI both support).
  4. No `radial_progress` size scaling (daisyUI `radial-progress` has
     `--size`, `--thickness` CSS vars; shadcn uses circular Tailwind).
  5. No live region wrapping toasts (shadcn `Toaster` wraps in `<ol
role="region" aria-label="Notifications">`).

## Recommendations (priority-ordered)

1. **[Critical]** Move `phx-click` from outer flash to the close button.
   Drop `cursor: pointer`. Add Escape handler. Effort: S.
2. **[Critical]** Add lower-bound clamp `pct = max(0, min(100, ...))` and
   clamp `aria-valuenow` to `0..@max` on both progress functions. Effort: S.
3. **[Critical]** Branch `role` on `@kind`: `:error` →
   `role="alert"`, others → `role="status"`. Apply to `flash/1`,
   `toast_container/1`, `alert/1`. Effort: S.
4. **[Critical]** Ship `assets/css/src/components/radial-progress.css`
   covering `data-size="sm|md|lg"` (40px/64px/96px), label color, fill
   transition with `prefers-reduced-motion` guard. Add import to
   `assets/css/exo.css`. Effort: S.
5. **[High]** Build an `ExoToast` JS hook: per-item `setTimeout`
   auto-dismiss (`duration` attr, default 5000), pause on
   mouseenter/focusin, resume on mouseleave/focusout, Escape dismisses
   focused toast. Wrap container in `<ol role="region"
aria-label={@label} aria-live="polite">`. Add `:action` slot.
   Effort: M.
6. **[High]** Widen `flash/1` `kind` enum to
   `[:info, :success, :warning, :error]`. Add Storybook variants for new
   kinds. Effort: S.
7. **[High]** Make `id` required on `flash/1`, `flash_group/1`,
   `toast_container/1`. Stop hard-coding `"toast-container"`. Effort: S.
8. **[High]** Add `alert_test.exs`, `toast_container_test.exs`, and
   Playwright specs `flash.spec.js`, `toast.spec.js`,
   `progress.spec.js` (keyboard close, dismiss timer, multi-toast
   stacking). Effort: M.
9. **[Medium]** Switch Storybook `function:` references to direct
   module functions (`&ExoUI.Components.Feedback.alert/1`,
   `&ExoUI.Components.Feedback.progress/1`). Effort: S.
10. **[Medium]** Add `aria-labelledby` on progress when label is set;
    add `aria-hidden="true"` on the radial SVG and label span; make
    `progress/1` accept `id`. Effort: S.
11. **[Quick win]** Replace "✕" with `<.icon name="x" aria-hidden="true"
/>` in flash and toast close buttons. Effort: S.
12. **[Quick win]** Delete dead `flash.css:38-46` if not widening the
    enum, or keep them once enum widens. Effort: XS.
13. **[Quick win]** Replace inline `style="width: ...%"` with
    `style="--exo-progress: ...%"` and use the var in CSS. Effort: XS.

## Open questions for the library owner

- Should `flash/1` and `toast_container/1` share a single underlying
  manager component (consistent JS hook), or should they remain separate
  (Phoenix flash semantics vs stream-driven toasts)?
- Indeterminate progress: are there real consumer use cases or is it
  punted to `spinner/1`?
- Negative `value` on progress: clamp silently or raise? Current behavior
  silently emits negative width; raising would catch bugs earlier in
  development but break runtime if a consumer's data goes briefly
  negative.
- `radial_progress` size scale: should `data-size` map to fixed pixels
  (`sm=40, md=64, lg=96`) or to `em` so the parent font-size scales it?
- Reference baseline file `docs/audits/2026-04-24-exo-ui-project-analysis.md`
  cited by the audit prompt does not exist in the repo
  (`ls docs/audits/` returns only `2026-04-28/` and
  `exo-ui-project-audit.md`). Confirm whether previous-audit findings
  here are truly carried over from a deleted document or were verbal.
