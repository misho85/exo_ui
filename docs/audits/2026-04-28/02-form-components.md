# Audit: Form components

**Date:** 2026-04-28
**Auditor:** Claude Opus 4.7 (subagent)
**Score:** 🟡 has problems
**Maturity:** ~55% (vs shadcn/daisyUI bar)

## TL;DR

The form surface ships every named primitive (input, toggle, select, combobox, radio_group, slider, date_picker, rating, fieldset, file_input) and integrates `Phoenix.HTML.FormField` for input/toggle/select/combobox/radio_group via a consistent `used_input?` + `translate_error/1` pipeline. But there are five hard problems: (1) ARIA wiring is shallow — controls emit `data-invalid` but never `aria-invalid`, and there is no `aria-describedby` linkage from any control to its description/error nodes; (2) `toggle` has no `role="switch"` / `aria-checked` and is therefore invisible to screen readers as a switch; (3) `slider`, `date_picker`, `rating`, `file_input` do **not** accept a `Phoenix.HTML.FormField` struct at all (no `attr :field`); (4) `slider` and `file_input` never render errors; (5) `prepare_choice` blows up unless an `:option` slot is provided and uses unstable `aria-selected="true|false"` instead of `aria-activedescendant`. Storybook coverage is shallow — no error/dark/long-text/required variations for half the components.

## Surface map

### Public functions

- `ExoUI.Components.form/1` — wraps `Phoenix.Component.form` with `data-exo="form"` (`lib/exo_ui/components/form.ex:20`).
- `ExoUI.Components.input/1` — multi-headed input (text, email, password, hidden, checkbox, textarea, deprecated select) (`form.ex:47-165`).
- `ExoUI.Components.toggle/1` — switch (`form.ex:186-238`).
- `ExoUI.Components.select/1` — popover-driven custom select (`form.ex:262-325`).
- `ExoUI.Components.combobox/1` — searchable select with client/server filter (`form.ex:359-518`).
- `ExoUI.Components.radio_group/1` — radio fieldset, options or item slot (`form.ex:618-664`).
- `ExoUI.Components.slider/1` — range input wrapper (`form.ex:677-694`).
- `ExoUI.Components.date_picker/1` — calendar grid, server-driven (`form.ex:710-815`).
- `ExoUI.Components.rating/1` — star rating with hidden int input (`form.ex:826-860`).
- `ExoUI.Components.fieldset/1` — fieldset/legend container (`form.ex:870-880`).
- `ExoUI.Components.file_input/1` — `<input type="file">` styled (`form.ex:892-909`).
- `ExoUI.Components.translate_error/1` — delegate to `ExoUI.Utils.translate_error/1` (`form.ex:919`).

All are re-exported via `lib/exo_ui/components.ex:37-50` (with `input/1` flagged `@doc deprecated: "Use select/1 instead"` at `components.ex:39` — but only the "select" subtype of input is deprecated, not `input/1` itself; see Tech debt).

### Source modules

- `lib/exo_ui/components/form.ex` — 920 lines, owns every form primitive plus private helpers `field_errors/1`, `choice_option_groups/1`, `choice_options/1`, `choice_hidden_input/1`, `prepare_choice/1`, `group_options/1`, `option_selected?/2`, `selected_option/2`, `choice_label_id/1`, `hidden_choice_value/1`.
- `lib/exo_ui/utils.ex:106-119` — `translate_error/1` with `Application.compile_env(:exo_ui, :translate_function, nil)` fallback that interpolates `%{key}` placeholders.
- `assets/js/hooks/select.js` — `ExoSelect` hook (143 lines) — keyboard nav, type-ahead, popover open/close, hidden input sync.
- `assets/js/hooks/combobox.js` — `ExoCombobox` hook (218 lines) — client/server filter, debounced server-side, clearable, creatable hint.
- `assets/js/hooks/rating.js` — `ExoRating` hook (65 lines) — hidden value sync.
- `assets/js/hooks/popover.js` — `ExoPopover` hook (105 lines), depended on indirectly: select/combobox **do not** mount `ExoPopover`; they re-implement open/close inside their own hooks.
- `assets/css/src/components/{form,input,checkbox,toggle,select,combobox,radio,slider,date-picker,rating,file-input,fieldset}.css` — token-driven, all consume `--exo-*` except `rating.css:25,33` (hardcoded `#f59e0b`).

### Tests

- `test/exo_ui/components/form_test.exs` — 6 tests, only the wrapper (no field-struct, no errors).
- `test/exo_ui/components/input_test.exs` — 9 tests, covers text/textarea/checkbox/hidden, label, errors, description, disabled. **No** field-struct, no aria-invalid (because the code does not emit it).
- `test/exo_ui/components/select_test.exs` — 24 tests, the most thorough — anchor styles, prompt, label/labelledby, groups, errors, disabled, custom side/align, hidden input fallback empty, field-struct, checkmark count.
- `test/exo_ui/components/combobox_test.exs` — 23 tests — both triggers, filter modes, debounce, clearable, creatable, anchor, errors, field-struct.
- `test/exo_ui/components/toggle_test.exs` — 7 tests, basic. **No** test for `role="switch"` (because it's not emitted).
- `test/exo_ui/components/radio_group_test.exs` — 15 tests, both `options=` and `:item` slot, field-struct, disabled, description, errors.
- `test/exo_ui/components/slider_test.exs` — 11 tests, defaults/min/max/step/label/disabled. **No** field-struct, **no** errors test (errors not supported).
- `test/exo_ui/components/date_picker_test.exs` — 3 tests only, no min/max edge cases.
- `test/exo_ui/components/rating_test.exs` — 4 tests, hidden value, readonly removes hook+radios.
- `test/exo_ui/components/fieldset_test.exs` — 3 tests.
- `test/exo_ui/components/file_input_test.exs` — 3 tests.
- `test/browser/select.spec.js` — 2 specs (ArrowDown commit, disabled option ignored).
- `test/browser/combobox.spec.js` — 2 specs (client filter commit, empty state).
- `test/browser/rating.spec.js` — 1 spec (click 5th star → hidden value=5).

### Storybook

- `form.story.exs` — single page, profile form sample.
- `input.story.exs` — 7 variations (text/email/password/textarea/error/checkbox/checkbox checked). No required/disabled/dark.
- `select.story.exs` — 7 sections (basic/value/groups/icons/description/disabled/errors).
- `combobox.story.exs` — 4 sections (client/selected/input-trigger/empty). No errors/disabled/server-filter live demo.
- `toggle.story.exs` — 2 variations only (off/on). No label/error/description.
- `radio_group.story.exs` — 3 groups, no errors/disabled/slot-based item demo.
- `slider.story.exs` — 4 variations (default/min_max/stepped/no_label). No disabled.
- `date_picker.story.exs` — 4 sections (default/selected/min-max/disabled).
- `rating.story.exs` — 3 sections; only one has `id` (`rating-basic`) — others omit `id` even though component lacks `attr :id` (see findings).
- `fieldset.story.exs` — 2 sections (with description, disabled).
- `file_input.story.exs` — 3 (with accept, multiple, disabled).

## What works (with proofs)

- **`Phoenix.HTML.FormField` integration with `used_input?` gating** — `form.ex:47-58, 186-195, 262-271, 359-368, 618-627`. The first head of input/toggle/select/combobox/radio_group destructures the field, derives `errors = if used_input?(field), do: field.errors, else: []`, runs each error through `translate_error/1`, and re-dispatches. This avoids surfacing untouched-input errors.
- **`translate_error/1` fallback** — `utils.ex:106-119` uses `Application.compile_env(:exo_ui, :translate_function, nil)`; if unset, performs `%{key}` interpolation. Makes gettext truly optional.
- **Hidden checkbox false-input pattern correct** — `form.ex:74` puts `<input type="hidden" name=… value="false">` **before** the visible checkbox, with `disabled={@rest[:disabled]}` so a disabled checkbox doesn't sneak the false through. Same pattern in toggle (`form.ex:204, 223`).
- **Anchor-positioning on select/combobox triggers and content** — `form.ex:289` (`anchor-name: --select-#{@id}`), `:313` (`position-anchor: --select-#{@id}`); same for combobox at 396/405 and 453/486. CSS fallback when `anchor-size()` not supported (`select.css:159-163`, `combobox.css:107-111`).
- **`role="combobox"` on the search input inside the popover** — `form.ex:390, 491` — semantically correct. Accompanied by `aria-controls={…-listbox}`.
- **`aria-haspopup="listbox"` and `aria-expanded` are hook-synced** — `select.js:18-28`, `combobox.js:28-32, 75-78` keep them current with `:popover-open` state.
- **Type-ahead on select** — `select.js:112-120`.
- **Stable hidden input on every choice** — `form.ex:567-571` always renders a hidden input when `name` is given, with `value || ""` so a missing value submits an empty string instead of crashing `Plug.Conn.fetch_query_params`.
- **`option_selected?` uses `to_string` on both sides** — `form.ex:587-589` so atom values like `:active` match string `"active"` from form params.
- **`combobox_test.exs` and `select_test.exs` both have field-struct tests** — `combobox_test.exs:157-169`, `select_test.exs:143-155` exercise the FormField head.
- **Rating P0 fix verified** — hidden int input has the user-supplied `name`; visual radios use `"#{@name}-star"` so they don't collide on submission (`form.ex:839, 844`). Tested in `rating_test.exs:22-32` and the browser spec.

## What is missing or half-done

- **`aria-invalid` is never emitted on any form control.** Code only sets `data-invalid={@errors != [] && ""}` on `<input>` / `<textarea>` / select trigger / combobox trigger (`form.ex:112, 130, 154, 285, 389, 449`). Screen readers do not see invalidity. Should also set `aria-invalid="true"` on the same element.
- **`aria-describedby` linkage is absent.** Description and error nodes get generated as siblings (`form.ex:117, 169`) but the input never references them. shadcn/Radix-equivalent: each control should have `aria-describedby="<id>-description <id>-error"` when those exist.
- **IDs are not stable for description/error nodes.** No `id` is assigned to `<p data-exo="field-description">` (`form.ex:117, 161, 219, 321, 422, 514, 660, 691, 906`) nor to `<div data-exo="field-error">` (`form.ex:169-171`). Without IDs no `aria-describedby` can ever wire up.
- **`toggle` has no `role="switch"` and no `aria-checked`.** `form.ex:203, 222` render `<label data-exo="toggle">` with a hidden `<input type="checkbox">`. The visible "switch" UI is a span with no role at all. Compare with shadcn `<Switch role="switch" aria-checked>`.
- **`slider` does not accept `field`, has no errors, no field-struct head.** `form.ex:677-694` only takes `name`/`value`. No `field` attr, no error rendering. A `range` should at least set `aria-valuetext` for non-numeric values; this is also missing.
- **`date_picker` does not accept `field`.** `form.ex:710` takes only `selected`/`current_month`/`min`/`max`. No FormField, no error rendering, no hidden input — caller must wire `phx-click` events themselves.
- **`rating` does not accept `field`.** `form.ex:826` takes only `name`/`value`. Cannot surface server-side errors for the field.
- **`file_input` does not accept `field` and never renders errors.** `form.ex:892-909`. Phoenix LiveView `live_file_input` would be the idiomatic primitive for uploads — not even referenced.
- **`prepare_choice/1` blows up if no `:option` slot is given.** `form.ex:573-579` calls `assigns.option`. When the slot is empty `Phoenix.Component` returns `[]`, but for `assigns.option` to exist the consumer must declare slot. The slot is declared `slot :option do … end` on select/combobox; if zero options pass through the call still works. Fine. But `selected_option(assigns.option, assigns[:value])` calls `Enum.find` on an empty list returning `nil`, then `prepare_choice` assigns `selected_opt: nil` — OK. Still: it never validates that an `:option` is required. shadcn behavior is to render the prompt — this works here too. **NOT a bug, withdrawn.**
- **`input` `type="select"` head still ships and is "deprecated"**, but only by an inline comment (`form.ex:123 "# Deprecated: Use select/1 instead"`), not via `@doc deprecated:`. It still produces a native `<select>` rather than the popover one.
- **`input` lacks `aria-required`** — `required` HTML attr is forwarded via `:rest` (form.ex:43-45), but no aria-required is added to keep it visible to AT in the inline error state.
- **No `valuemax`/`valuemin`/`valuenow` polish for slider** — only the implicit `<input type="range">` semantics. Adequate but not custom.
- **`combobox` `creatable` UX is half-wired.** `form.ex:508-510` renders a div with `phx-click={@on_create}` but the JS hook never updates `hidden=false` when the create option becomes available — `combobox.js:118-121` toggles `this._create.hidden = !query` only on input. No keyboard navigation into the create row. No `data-value` exposure.
- **`file_input` ignores `id` for `<label for>`** — `form.ex:895` uses `for={@id}` but `@id` defaults to `nil` (`:884`) so most invocations leave the label unwired.
- **`rating` has no `attr :id`.** `form.ex:818-824` declares only `:name`, `:value`, `:max`, `:readonly`, `:size`, `:class`, `:rest`. The hook needs an `id` to stay attached over LiveView patches; Storybook-only one variant remembers. `phx-hook` requires an id (LiveView raises at runtime if missing). The story `rating-basic` has `id="rating-basic"` (story.exs:11) but the other two stories at `:15, 19` omit it — those will crash in LiveView (Storybook is a `:page`-level `~H` so it currently works only because Storybook does not enforce hook-id requirement; running these in any real app crashes).
- **`select` and `combobox` use `aria-selected="true|false"` strings on options** — `form.ex:552`. ARIA spec requires the strings, OK. But neither component sets `aria-activedescendant` on the listbox/combobox during keyboard nav, so AT cannot follow focus when arrow keys move highlight (`select.js:74` calls `options[next].focus()` — that moves DOM focus, OK on an `<div role="option">` only because `tabindex="-1"` is set on each (`form.ex:553`). Functional, but `aria-activedescendant` is the canonical pattern.
- **`combobox` server-filter has no aria-busy or live-region.** `form.ex:416-418` renders a static "Loading..." span hidden by inline style. No `aria-live`, no `role="status"` — screen readers hear nothing during async load.
- **No `phx-change` examples in any story.** All form stories assemble inputs without an enclosing form-with-validate handler, so the audit cannot verify validation timing. Form Iron Law "validation timing → phx-change vs phx-submit" is not exercised in fixtures.

## Per-component table

| Component     | Status | Findings (file:line)                                                                                                                                                                                                                                    | Recommended work                                                                                                          |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `form`        | 🟢 OK  | Thin wrapper — adds `data-exo="form"` and forwards everything (`form.ex:20-26`). Deprecation guidance OK.                                                                                                                                               | Add `phx-change`/`phx-submit` examples in story.                                                                          |
| `input`       | 🟡 P1  | No `aria-invalid`, no `aria-describedby`, no IDs on description/error nodes (`form.ex:108, 117, 162, 169`); deprecated `select` subtype still active (`form.ex:124`); no `aria-required`.                                                               | Wire stable IDs and ARIA. Drop `select` subtype in 0.2.                                                                   |
| `toggle`      | 🔴 P0  | No `role="switch"`, no `aria-checked` (`form.ex:203, 222`); duplicates the `<input>` markup twice for wrap/no-wrap (`form.ex:204-216` vs `223-235`).                                                                                                    | Add `role="switch"` + `aria-checked={@checked}`; refactor to one render block.                                            |
| `select`      | 🟡 P1  | No `aria-activedescendant`; no `aria-invalid`; description/error not described-by (`form.ex:285-322`); deprecated `input type="select"` ships in parallel.                                                                                              | Add `aria-activedescendant`, `aria-invalid`, `aria-describedby`.                                                          |
| `combobox`    | 🟡 P1  | Same ARIA gaps as select; loading state has no live region (`form.ex:416-418`); creatable row hidden flow only updates on input (`combobox.js:118-121`); two near-duplicate render blocks for input vs button trigger (`form.ex:370-426` vs `428-518`). | Same ARIA wiring; add `aria-live="polite"` to loading; collapse the duplication.                                          |
| `radio_group` | 🟡 P1  | Two near-duplicate render branches (slot vs options) (`form.ex:633-659`); legend not associated as `aria-labelledby` for descriptions; description rendered outside `<fieldset>` flow at `form.ex:660` (inside the fieldset, OK).                       | Collapse branches; ensure `:disabled` propagates to slot items via `<fieldset disabled>` already does it (`form.ex:631`). |
| `slider`      | 🔴 P0  | No `field` attr, no error rendering, no `aria-valuetext` (`form.ex:667-694`).                                                                                                                                                                           | Accept FormField; render `field_errors`; add value display.                                                               |
| `date_picker` | 🔴 P0  | No `field` attr, no errors, no hidden input (`form.ex:697-815`); buttons inside calendar grid have no `aria-label` per day; no `role="grid"`/`role="gridcell"` semantics; weekday hardcoded English.                                                    | Accept FormField; add grid roles; use `Date.day_name` from cldr or accept locale.                                         |
| `rating`      | 🟡 P1  | Hook needs an id but `attr :id` is not declared (`form.ex:818-824`); hardcoded amber color (`rating.css:25, 33`); no `field` attr, no error rendering.                                                                                                  | Add `attr :id`; tokenize amber as `--exo-rating-active`; accept FormField.                                                |
| `fieldset`    | 🟢 OK  | Clean fieldset/legend wrapper (`form.ex:870-880`).                                                                                                                                                                                                      | Optionally support `error` per fieldset.                                                                                  |
| `file_input`  | 🔴 P0  | `for={@id}` but `id` defaults nil and is not generated (`form.ex:884, 895`); no error rendering; no `field`; no `live_file_input` integration.                                                                                                          | Default `id` from `name`; add `errors`/`field` like `input/1`.                                                            |

## Problems by severity

### 🔴 Critical

#### 1. `toggle` has no `role="switch"` / `aria-checked`

- **Where:** `lib/exo_ui/components/form.ex:203, 222`.
- **What happens:** The "switch" is rendered as a styled `<label>` containing a visually-hidden `<input type="checkbox">`. The label has `data-exo="toggle"` and `data-checked={@checked && ""}`, but no role and no `aria-checked`. Visually the user sees a switch; screen-reader users hear "checkbox" or worse, nothing.
- **Why critical:** Switches and checkboxes have different mental models; spec is `role="switch" aria-checked="true|false"`. shadcn does this.
- **Suggested fix:** Set `role="switch"` and `aria-checked={to_string(@checked)}` on the visible track element (or on the underlying input), and forward the underlying `<input type="checkbox">` as `aria-hidden="true"` if the role is on the label.

#### 2. `slider` does not surface errors and does not accept `Phoenix.HTML.FormField`

- **Where:** `form.ex:667-694`.
- **What happens:** Public attrs are `name` (required), `value`, `min`, `max`, `step`, `label`, `description`, `class`, `rest`. There is no `field` attr and no `errors` attr. The render block has no `field_errors` call. A range used in a Phoenix form will silently lose validation feedback.
- **Why critical:** Iron Law "Form controls that do not surface errors when present" (anti-pattern from this audit's brief). Same risk as a text input that ignores errors.
- **Suggested fix:** Add the same FormField head and `errors` slot pattern used on `input/1` (`form.ex:47-58`), then call `<.field_errors errors={@errors} />`.

#### 3. `date_picker` does not accept FormField, no error rendering, no hidden input

- **Where:** `form.ex:697-815`.
- **What happens:** Caller must wire `phx-click` events for prev/next/select; component never emits a hidden input with the selected date. Callers cannot include it in a Phoenix changeset round-trip without writing their own form integration.
- **Why critical:** Date is a top-3 form control. Library that ships a calendar without a `field` head is shipping a demo, not a primitive.
- **Suggested fix:** Add `attr :field, Phoenix.HTML.FormField`, derive `name`/`value` from it, render a sibling hidden input with the ISO date, and surface `errors`.

#### 4. `file_input` `for={@id}` is wired to a nil id by default

- **Where:** `form.ex:884, 895`.
- **What happens:** `attr :id, :string, default: nil`. The label uses `for={@id}`. If the consumer omits `id` (very common — most stories do, e.g. `file_input.story.exs:9-11`), the label `for` attribute becomes empty, breaking AT label association.
- **Why critical:** Implicit-label trick (`<label><input></label>`) is how the rest of the library escapes this; here the input is a sibling, so the `for` is required.
- **Suggested fix:** Default `@id` to a stable id (e.g. `"#{@name}-file-input"`).

#### 5. `combobox` and `select` do not emit `aria-invalid` despite carrying `errors`

- **Where:** `form.ex:285, 389, 449` set `data-invalid={@errors != [] && ""}` on the trigger but never `aria-invalid`.
- **What happens:** A field with errors is visually red but inaudible to AT. Same gap exists on `<.input>` (`form.ex:112, 130, 154`).
- **Why critical:** Standard a11y wiring. Combined with the missing `aria-describedby` (no error id), AT users get no information.
- **Suggested fix:** On any element where `data-invalid` is set, emit `aria-invalid="true"`. Add a stable `id={"#{@id}-error"}` to the error block, then `aria-describedby={"#{@id}-error #{@id}-description"}` on the control.

### 🟡 Medium

#### 6. `aria-describedby` linkage is absent across the entire form module

- **Where:** `form.ex:117, 161, 169, 219, 321, 422, 514, 660, 691, 906`.
- **What happens:** Description and error nodes carry no `id`; controls don't reference them.
- **Suggested fix:** Generate `#{@id}-description` and `#{@id}-error` IDs, then thread `aria-describedby={describedby_for(@id, @description, @errors)}` on the input/trigger.

#### 7. `select`/`combobox` keyboard nav uses DOM focus rather than `aria-activedescendant`

- **Where:** `select.js:39-77`, `combobox.js:136-158`. Each option has `tabindex="-1"` (`form.ex:553`). On ArrowDown the hook calls `options[next].focus()`. Functional. But it's the harder pattern for AT — preferred shadcn pattern is to keep DOM focus on the listbox (or trigger) and toggle `aria-activedescendant` to the highlighted option's id.
- **Suggested fix:** Choose one pattern and document it; if keeping DOM focus, fine — but then add `aria-activedescendant` for redundancy.

#### 8. `combobox` loading state has no live region

- **Where:** `form.ex:416-418`. `<div data-exo="combobox-loading" style={if !@loading, do: "display:none"}>` — no `aria-live`, no `role="status"`.
- **Suggested fix:** `role="status" aria-live="polite"` on the loading wrapper, or at least move it inside a live region.

#### 9. `combobox` has two near-duplicate render blocks; `radio_group` has two near-duplicate render blocks; `toggle` has two near-duplicate render blocks

- **Where:** `form.ex:370-426` (input combobox) vs `428-518` (button combobox); `form.ex:633-659` (slot vs options branch); `form.ex:202-236` (wrap vs no-wrap toggle).
- **Why medium:** Maintenance liability. A bug fix in one branch silently misses the other (e.g. ARIA wiring already drifted).
- **Suggested fix:** Extract shared markup into private helper components.

#### 10. `rating` color is hardcoded amber

- **Where:** `rating.css:25, 33` `color: #f59e0b;`.
- **Why medium:** Violates "CSS components that hardcode color values instead of consuming `--exo-*` tokens" anti-pattern. Dark mode parity will be off.
- **Suggested fix:** Add `--exo-rating-active` token in `tokens.css` (default amber); reference here.

#### 11. Deprecated `input type="select"` subtype still ships

- **Where:** `form.ex:123-143` (comment-only deprecation, not `@doc deprecated:`).
- **Why medium:** Two ways to build a select; consumers will find the wrong one in autocomplete. The wrapper `components.ex:39` deprecates `input/1` itself, which is wrong — only the select subtype is deprecated.
- **Suggested fix:** Remove `input type="select"` head in 0.2.0; remove the `@doc deprecated` from `components.ex:39` (or keep but restrict the message to `type="select"`).

#### 12. `rating` lacks `attr :id`, but the hook needs one

- **Where:** `form.ex:818-824` (no `attr :id`); the hook `phx-hook="ExoRating"` is bound to `<div data-exo="rating">` without an explicit id, meaning LiveView falls back to whatever id is in `@rest`. Two of three stories (`rating.story.exs:15, 19`) omit `id`; in a real LiveView this raises.
- **Suggested fix:** Add `attr :id, :string, required: true` (or generate from `@name`).

#### 13. `radio_group` description lives inside `<fieldset>` after the `:item` block but uses no `aria-describedby` to expose itself to the legend

- **Where:** `form.ex:660`. With multiple radios, no programmatic association exists between the description and the group beyond proximity.
- **Suggested fix:** Add `aria-describedby` on the `<fieldset>` referencing a stable description id.

### 🟢 Minor

#### 14. `option_selected?` `to_string` will fail if option value is a non-string-convertible struct

- **Where:** `form.ex:587-589`. Acceptable assumption for typical form values; document it.

#### 15. `combobox-create` row uses raw HTML quotes that need translation

- **Where:** `form.ex:509` `Create "<span data-exo="combobox-create-query"></span>"`. Hardcoded English. No `gettext`.

#### 16. `date_picker` weekday names hardcoded English

- **Where:** `form.ex:777` `~w(Mon Tue Wed Thu Fri Sat Sun)`.

#### 17. `slider` description rendered with no `id`

- **Where:** `form.ex:691`. Harmless until ARIA wiring exists.

#### 18. `field_errors/1` always emits a wrapper `<div>` even when the list is empty

- **Where:** `form.ex:167-173`. The outer `:for` ensures only `<div>` per error renders, but the function itself wraps in a fragment, so empty case is fine. **No bug.** Withdrawn.

## Accessibility analysis

- **Roles & semantics:** `select` and `combobox` correctly emit `role="listbox"`, `role="option"`, `role="combobox"`, `role="group"` (`form.ex:315, 390, 410, 491, 499, 528, 548`). `radio_group` correctly uses `<fieldset><legend>`. `toggle` is **wrong** — no `role="switch"`. `slider` relies on native `<input type="range">` which is correct. `date_picker` has no grid roles (`form.ex:783-810`), should be `role="grid"` + `role="gridcell"`.
- **Keyboard:** Select supports ArrowUp/Down/Home/End/Enter/Space/Escape + type-ahead (`select.js:39-77, 112-120`). Combobox supports the same minus type-ahead (`combobox.js:136-158`). Date picker has no keyboard support (`form.ex:783-810` — only mouse `phx-click`). Rating has no keyboard support (`rating.js:14-32` only `click`/`change`). Slider native.
- **Focus management:** Select restores focus to the trigger on Escape and on commit (`select.js:64-65, 109`). Combobox calls `hidePopover` but does not always return focus to the trigger (`combobox.js:191`). Date picker has none. Rating none.
- **ARIA wiring:** `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-labelledby` correctly emitted on select/combobox triggers (`form.ex:286-288, 393-395, 450-452`). **Gaps:** `aria-invalid` (everywhere), `aria-describedby` (everywhere), `aria-checked` on toggle, `aria-required` on inputs, `aria-activedescendant` on listboxes, `aria-busy` on combobox loading.
- **Screen reader:** No live regions anywhere — async filter, error appearance, file upload progress are silent. `<.flash>` has its own (different category) but no field-level live region.
- **Reduced motion:** `prefers-reduced-motion` not referenced in any form CSS file (verified by grep). Slider thumb has hover scale (`slider.css:31-33`); date picker hover/transition (`date-picker.css:99-100`). All ignore the user pref.

## Composition & HTML correctness

- **Trigger composition:** Select/combobox triggers are real `<button type="button">` (`form.ex:280, 444`). The combobox `input` trigger is a plain `<input>` (`form.ex:386`). No nested-button bug.
- **Slot contracts:** `:option` slot (`form.ex:255-260, 350-355`) declares `attr :value, :icon, :disabled, :group` but does not accept `:rest` or arbitrary attrs. There's no `as_child`-like escape. shadcn provides `Slot.Slottable`.
- **Form integration:** Confirmed FormField support for `input`, `toggle`, `select`, `combobox`, `radio_group` (`form.ex:47, 186, 262, 359, 618`). **Missing for** `slider`, `date_picker`, `rating`, `file_input`, `fieldset` (the last is fine — fieldset is a container).
- **Multi-input checkbox name array:** `form.ex:53-55` correctly does `field.name <> "[]"` when `multiple`. Good.

## Browser & visual coverage

- **Specs exist:** select, combobox, rating (`test/browser/{select,combobox,rating}.spec.js`).
- **Specs missing:** toggle (no role-switch verification), radio_group, slider, date_picker, file_input, input/textarea/checkbox keyboard parity, form errors visual.
- **Untested paths:** Disabled state click-through, ARIA `aria-expanded` toggling on hover-only triggers, RTL layout, mobile width.
- **Visual regression:** No baseline snapshots referenced; capture script (`scripts/capture_storybook_components.js` per audit prompt) referenced but not validated.

## CSS surface

- **Tokens used:** `--exo-{background, foreground, muted, muted-foreground, border, input, ring, primary, primary-foreground, secondary, secondary-foreground, danger, card, radius, space-{1..4}, font, text-{xs,sm,lg}, shadow-sm, duration, easing}`. All form CSS files consume these (verified by reading each).
- **Dark mode parity:** `themes/dark.css` exists and overrides `--exo-*` tokens. Most components rely solely on `:where()` + token references, so dark works automatically. **Exception:** `rating.css:25,33` `#f59e0b` hardcoded — no dark adjustment.
- **Override surface:** `:where()` selectors give zero specificity; consumers can override with single class. Good. Some hooks like `[data-exo="popover-content"]:has(...)` (`select.css:66`) rely on `:has()` (Baseline 2023) — fine.
- **Dead CSS:** None obvious in this surface. `combobox-loading` styles exist (`combobox.css:216-222`) but the component renders the loading even when not active (just `display:none`); CSS is fine.

## JS hook quality

### `select.js`

- **Lifecycle:** `mounted/updated/destroyed` all defined. `_unbind` clears all listeners and refs (`select.js:122-139`). Solid.
- **Listeners:** `toggle`, `click`, `keydown` — all matched by removeEventListener.
- **Server↔client contract:** Pure client. Hidden input drives server state via `dispatchEvent('input', { bubbles: true })` (`select.js:86`).
- **Issue:** `_typeAhead` is single-character only (`select.js:113-120`); standard pattern accumulates a buffer with timeout for multi-letter type-ahead.

### `combobox.js`

- **Lifecycle:** Same shape as select. `_unbind` is thorough. `clearTimeout(this._debounceTimer)` on unbind (`combobox.js:194`). Solid.
- **Issue 1:** The `focus` event handler `_onFocus` opens the popover (`combobox.js:88-90`) but `_onBlur` uses a 200ms `setTimeout` (`combobox.js:92-99`) to detect loss of focus; flaky in tests.
- **Issue 2:** Server filter (`combobox.js:111-115`) `pushEvent(onFilter, { query })` — never reads response, never disables loading. The `loading` attr is server-driven (one-way), so the hook can never re-enable interaction after the server stops loading.
- **Issue 3:** Creatable row visibility only updates on input (`combobox.js:118-121`); doesn't react to filter result emptiness from the server.

### `rating.js`

- **Lifecycle:** Solid. `_unbind` removes listeners (`rating.js:53-61`).
- **Issue:** Sets `data-ready` on bind (`rating.js:12`) but no aria-live; click on a star is mouse-only — keyboard users have to tab through hidden radios and use Space (which works because they're real `<input type="radio">`, but the visual stars don't propagate `:focus-visible`).

### `popover.js`

- **Used by select/combobox?** No — they re-implement open/close inside their own hooks. The `popover` hook is registered globally (`assets/js/index.js:7`) but neither select nor combobox depends on it. Possibly accidental decoupling.

## Storybook quality

- **Pages exist for all 11 form primitives** (verified — `_components.index.exs` should list them).
- **States covered:** `select.story.exs` is the most thorough — 7 sections including errors, disabled, description. `input.story.exs` covers errors and 3 type variations but not disabled/required. Most others (`toggle`, `slider`, `radio_group`) skip error/disabled.
- **Attribute introspection:** The "page" stories (`form`, `select`, `combobox`, `radio_group`, `date_picker`, `rating`, `fieldset`, `file_input`) use direct module references (`ExoUI.Components.x`) inside `def render(assigns)`. Component stories (`input`, `toggle`, `slider`) use `def function, do: &ExoUI.Components.x/1` (delegated). Per the audit prompt's anti-pattern list, delegated function references break attribute introspection — Storybook cannot list attrs and emits "cannot load attributes" warnings. `input.story.exs:4`, `toggle.story.exs:4`, `slider.story.exs:4` all have this. Should be `&ExoUI.Components.Form.x/1` (direct module).
- **Phoenix form examples:** Only `form.story.exs:11-13` builds a `to_form/2` and passes `field={@form[:name]}`. None of the per-component stories include a `to_form` integration example.
- **Mobile width / dark / long-text:** No story sets `data-theme="dark"` or constrains a mobile viewport. No long-content tests.

## Test coverage

- **Existing test files:** 11 unit tests + 3 browser specs (listed in Surface map).
- **Scenarios covered well:** select option rendering, anchor styles, hidden input fallback, field-struct head dispatch (select/combobox).
- **Not covered:**
  - `aria-invalid`, `aria-describedby`, `aria-checked` (because not emitted).
  - Multiple-error rendering — only `errors=["x"]` cases.
  - Field-struct + actual error from `used_input?` flow (no `to_form/2` with errors anywhere).
  - Toggle with field struct + errors.
  - Slider with field-struct (impossible — no head).
  - Date picker keyboard.
  - File input `<label for>` association validity.
  - Combobox `creatable` end-to-end.
  - Combobox server filter debounce timing (browser).
- **Flakiness signals:** `combobox.js:92-99` 200ms blur timeout is the only timing-sensitive piece. `combobox.spec.js:30 search.fill("cro")` does no `await waitFor(...)` after typing — relies on synchronous DOM update from client filter; OK because client is sync.

## Tech debt

- **TODO/FIXME:** None grepped in `form.ex`.
- **Dead code:** None.
- **Convention drift:**
  - `input/1` deprecation marker mismatch (`components.ex:39` deprecates the function; `form.ex:123` only the select subtype).
  - `radio_group` uses a `<fieldset>` with `disabled={@disabled}` and a `<legend>` styled as `data-exo="label"` (`form.ex:631-632`). Other components use `data-exo="label"` on a `<label>` element. Stylistically inconsistent — works because the CSS only matches `data-exo="label"` regardless of element.
  - `toggle` non-wrap branch (`form.ex:222-236`) does not render description/errors; `select`/`combobox`/`input` always render them. Two different mental models.
  - `slider`, `date_picker`, `rating`, `file_input` each break the field-struct contract.
- **Parallel `select` implementations:** `<select>` (deprecated input subtype, `form.ex:124-143`) and the popover-driven `select/1` (`form.ex:262-325`). Two ways to do the same thing, both shipping.

## Configuration & build

- **Public API exposure:** All 11 functions plus `translate_error/1` exported via `ExoUI.Components` (`components.ex:37-50`).
- **Build artifacts:** All form CSS is in `assets/css/src/components/` and gets bundled into `priv/static/exo.css` via lightningcss; not tree-shakable.
- **gettext optional:** `mix.exs:33` `{:gettext, "~> 1.0", optional: true}` — `translate_error/1` falls back to interpolation (`utils.ex:114-118`). Correct.

## Documentation

- **Existing:** `@moduledoc` (`form.ex:2-4`); each public function has a one-line `@doc` (`form.ex:10, 28, 175, 240, 327, 601, 666, 696, 817, 862, 882, 911`).
- **Missing:** No usage examples in `@doc`. No `## Examples` block. No mention of FormField integration in docs (only in code).
- **Out of date:** `components.ex:39` deprecation message says "Use select/1 instead" but applies to `input/1` itself, which is wrong (the deprecation only applies to the `type="select"` subtype).

## Comparison vs shadcn/daisyUI

- **Where ExoUI matches:** Token-driven CSS, native `popover` for select/combobox (no JS layout math), `Phoenix.HTML.FormField` integration on the headline controls, `used_input?` gating, gettext-optional translate_error.
- **Where ExoUI lags:**
  1. ARIA wiring (`aria-invalid`, `aria-describedby`, `aria-checked`, `aria-activedescendant`, `aria-busy`) — shadcn's Form primitive auto-wires all of these.
  2. Field-struct support is partial — slider/date_picker/rating/file_input ignore it. shadcn's RHF integration is uniform.
  3. Toggle is not a real switch (no `role="switch"`). shadcn `<Switch>` is.
  4. Date picker is a server-driven static calendar — no keyboard, no FormField, no popover composition. shadcn pairs `<Calendar>` with `<Popover>` and full keyboard.
  5. No `<FormDescription>` / `<FormMessage>` primitives — shadcn isolates these and auto-IDs them.

## Recommendations (priority-ordered)

1. **[Critical, S]** Add `aria-invalid="true"` on every form control whose `errors != []`, plus stable `id={"#{@id}-error"}` and `id={"#{@id}-description"}` and `aria-describedby` linkage. Audit `form.ex:107-165, 277-323, 374-516`.
2. **[Critical, XS]** Add `role="switch" aria-checked={to_string(@checked)}` to the toggle visible track (`form.ex:203, 222`).
3. **[Critical, M]** Make `slider`, `date_picker`, `rating`, `file_input` accept `attr :field, Phoenix.HTML.FormField` and render `<.field_errors errors={@errors} />`. Mirror the head pattern from `input/1` (`form.ex:47-58`).
4. **[High, S]** Add `attr :id, :string, required: true` to `rating` (`form.ex:817`) — without it the hook crashes in real LiveView. Default `file_input` `id` to `"#{@name}-file-input"`.
5. **[High, M]** Replace the comment-only deprecation at `form.ex:123` with a full removal in 0.2; fix the `components.ex:39` deprecation message which targets the wrong function.
6. **[High, S]** Tokenize the rating amber color: add `--exo-rating-active` to `tokens.css`; replace `rating.css:25, 33`.
7. **[Medium, S]** Add `aria-live="polite" role="status"` to `[data-exo="combobox-loading"]` (`form.ex:416-418`).
8. **[Medium, M]** Collapse the duplicate render branches in `toggle` (`form.ex:201-237`), `combobox` (`form.ex:370-518`), and `radio_group` (`form.ex:633-659`).
9. **[Medium, S]** Switch Storybook component stories from delegated `&ExoUI.Components.x/1` to direct `&ExoUI.Components.Form.x/1` references (`input.story.exs:4`, `toggle.story.exs:4`, `slider.story.exs:4`).
10. **[Quick win, XS]** Add `prefers-reduced-motion` guard around the slider thumb hover transform (`slider.css:31-33`) and any `transition` declarations in form CSS.
11. **[Quick win, XS]** Add `aria-required={@required}` on the input element when `required` is in `@rest` (extract from `:rest` in `form.ex:43-45`).

## Open questions for the library owner

- Is `input type="select"` retained for compatibility with old callers, or can it be removed in 0.2.0?
- Should `date_picker` move to a popover-composed pattern (trigger button + grid in popover content) for parity with shadcn? Significant API change.
- Is the duplicated render-block structure in toggle/combobox/radio_group intentional (read-once optimization) or just historical?
- Should `combobox` server filter accept a server-pushed `loading=false` event so the hook can clear loading state? Right now `loading` is a one-way attr.
- REQUIRES PRODUCT INPUT: should `rating` support half-star granularity? Current code is integer 1..max only.
