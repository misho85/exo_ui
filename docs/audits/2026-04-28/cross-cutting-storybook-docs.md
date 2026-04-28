# Cross-Cutting Storybook & Docs Audit

Date: 2026-04-28
Scope: Storybook stories, root README, CHANGELOG, release-checklist, capture script, module @moduledocs.
Method: Static read of `storybook/`, `lib/exo_ui/`, root docs, and the seven per-category audits in this folder. Storybook server and `mix test` were not exercised (Hex/OTP 28 toolchain blocker).

---

## TL;DR

ExoUI ships 82 component story files plus 1 layout story (83 total) and a single `welcome.story.exs` page. Of these, only **11 stories** are written in PhoenixStorybook `:component` mode where attribute introspection, the variation matrix, and the playground actually function — and **all 11** point `function/0` at the `defdelegate` shim in `ExoUI.Components` rather than the source module. PhoenixStorybook resolves `@doc`/`attr` metadata via reflection on the captured function reference; a `defdelegate` reference loses that metadata, so the playground for button, badge, separator, skeleton, alert, progress, modal, toggle, slider, input, and tabs renders with empty attribute panels.

The remaining 71 component stories are `:page` mode — handcrafted HEEx blocks with no attribute matrix. State coverage (default / disabled / error / loading / dark / mobile / long-text / empty) is ad hoc: dark mode and mobile viewports are absent everywhere, RTL is never demonstrated, and Phoenix `to_form/2` + `FormField` integration appears in exactly one story (`form.story.exs:11`). The capture script hardcodes `/components/` and skips the `/layouts/` route, so layout stories are silently excluded from the visual regression bundle.

CHANGELOG and README disagree on browser-test coverage (README:273 lists 5 hooks, CHANGELOG:11–12 lists 7), and `lib/exo_ui/components.ex:39` deprecates `input/1` wholesale when only the `type="select"` subtype was migrated.

---

## 1. Story coverage matrix

Counts cross-referenced against the seven per-category audits in this folder.

| Category | Public fns | Stories present | Missing stories | Mode breakdown |
|---|---|---|---|---|
| Core (`Components.Core`) | 17 | 17 | 0 | 4 `:component`, 13 `:page` |
| Form (`Components.Form`) | 11 | 11 | 0 | 3 `:component`, 8 `:page` |
| Overlay (`Components.Overlay`) | 13 | 13 | 0 | 1 `:component` (modal), 12 `:page` |
| Data display + nav (`DataDisplay`) | 15 | 15 | 0 | 1 `:component` (tabs), 14 `:page` |
| Feedback (`Components.Feedback`) | 6 | 6 | 0 | 2 `:component` (alert, progress), 4 `:page` |
| Charts (`Charts.*`) | 18 | 19 (incl. umbrella) | 0 | 0 `:component`, 19 `:page` |
| Layouts (`Layouts`) | 2 | 1 (`sidebar_layout`) | `sidebar_item/1` standalone | 0 `:component`, 1 `:page` |

Totals: 82 component stories + 1 layout story = 83 (`storybook/stories/components/`, `storybook/stories/layouts/sidebar_layout.story.exs`). 11 `:component`, 72 `:page`.

**Gap:** `sidebar_item/1` has no dedicated story; the only example is embedded inside `sidebar_layout.story.exs` (per audit `07-layouts-and-app-shell.md`).

---

## 2. Delegated function references (broken introspection)

PhoenixStorybook's `:component` mode reflects `attr`/`slot`/`@doc` from the captured `&Mod.fn/arity` reference. When that reference is a `defdelegate` shim, the reflected module is the shim host (`ExoUI.Components`), and metadata is empty — the playground panel renders without controls and the variation table loses attribute hints.

All 11 `:component` stories take this shortcut:

| Story | Line | Current `function/0` | Should reference |
|---|---|---|---|
| `storybook/stories/components/button.story.exs` | 4 | `&ExoUI.Components.button/1` | `&ExoUI.Components.Core.button/1` |
| `storybook/stories/components/badge.story.exs` | 4 | `&ExoUI.Components.badge/1` | `&ExoUI.Components.Core.badge/1` |
| `storybook/stories/components/separator.story.exs` | 4 | `&ExoUI.Components.separator/1` | `&ExoUI.Components.Core.separator/1` |
| `storybook/stories/components/skeleton.story.exs` | 4 | `&ExoUI.Components.skeleton/1` | `&ExoUI.Components.Core.skeleton/1` |
| `storybook/stories/components/input.story.exs` | 4 | `&ExoUI.Components.input/1` | `&ExoUI.Components.Form.input/1` |
| `storybook/stories/components/toggle.story.exs` | 4 | `&ExoUI.Components.toggle/1` | `&ExoUI.Components.Form.toggle/1` |
| `storybook/stories/components/slider.story.exs` | 4 | `&ExoUI.Components.slider/1` | `&ExoUI.Components.Form.slider/1` |
| `storybook/stories/components/modal.story.exs` | 4 | `&ExoUI.Components.modal/1` | `&ExoUI.Components.Overlay.modal/1` |
| `storybook/stories/components/tabs.story.exs` | 4 | `&ExoUI.Components.tabs/1` | `&ExoUI.Components.DataDisplay.tabs/1` |
| `storybook/stories/components/alert.story.exs` | 4 | `&ExoUI.Components.alert/1` | `&ExoUI.Components.Feedback.alert/1` |
| `storybook/stories/components/progress.story.exs` | 4 | `&ExoUI.Components.progress/1` | `&ExoUI.Components.Feedback.progress/1` |

Verified via `grep -rn "function: &ExoUI.Components\." storybook/stories/components/` — no other component stories use the `function:` field, so the issue is contained to these 11 files.

---

## 3. State coverage gaps (per-component story states)

Sampled 19 stories across the seven categories. The audits flag the same pattern uniformly:

| State | Coverage |
|---|---|
| Default | 🟢 every story |
| Disabled | 🟡 partial — button, input, toggle, slider show it; modal, popover, tabs, dropdown_menu do not |
| Error | 🟡 input only; form-level errors in `form.story.exs` only |
| Loading | 🟡 button has spinner variation; charts/tables have no skeleton state |
| Dark | 🔴 no story toggles `data-theme="dark"` or wraps in a dark container |
| Mobile | 🔴 no viewport variation in any story; `_root.index.exs` does not advertise mobile breakpoints |
| Long text / overflow | 🔴 no truncation/wrap demos for badge, button, alert title, table cell, breadcrumb |
| Empty | 🟡 `empty_state` exists as its own component; `table.story.exs` has no empty-rows variation |
| RTL | 🔴 not demonstrated anywhere |
| Reduced motion | 🔴 no story sets `prefers-reduced-motion`; spinner/animations not toggled |

`storybook/stories/_root.index.exs` (root index, 1 file) does not register theme switcher controls or viewport presets, so dark/mobile coverage cannot be added per-variation without extending the story API.

---

## 4. Phoenix form integration in stories

Only `storybook/stories/components/form.story.exs:11` constructs a `Phoenix.Component.to_form/2` map. Per-component stories that take `attr :field, Phoenix.HTML.FormField` (input, select, combobox, textarea, checkbox, radio, toggle, slider, date_picker) all stub the field manually with `name=`/`value=` attributes:

| Story | Uses `to_form` | Uses `FormField` directly | Demonstrates `errors` slot |
|---|---|---|---|
| `form.story.exs` | yes (line 11) | implicit via form | yes |
| `input.story.exs` | no | no | partial (variation w/ error string) |
| `select.story.exs` | no | no | no |
| `combobox.story.exs` | no | no | no |
| `textarea.story.exs` | no | no | no |
| `checkbox.story.exs` | no | no | no |
| `radio.story.exs` | no | no | no |
| `toggle.story.exs` | no | no | no |
| `slider.story.exs` | no | no | no |
| `date_picker.story.exs` | no | no | no |

Consequence: a consumer copying any per-component story snippet into a real `<.form for={@form}>` block will need to rewrite the example. Per audit `02-form-components.md` this is the single biggest "docs vs reality" gap.

---

## 5. Interactive demo gaps

Stories that depend on JS hooks but render only as static HTML (per per-category audits cross-checked against `assets/js/hooks/`):

| Component | Hook | Story interactivity |
|---|---|---|
| `command_palette.story.exs` | `ExoCommandPalette` | static; requires Cmd+K, no on-page trigger button |
| `context_menu.story.exs` | `ExoContextMenu` | 1 variant; no nested-menu demo |
| `menubar.story.exs` | `ExoMenubar` | 1 variant; no keyboard-nav demo |
| `popover.story.exs` | `ExoPopover` | 4 variations but no controlled state demo |
| `hover_card.story.exs` | `ExoHoverCard` | static; delay/anchor unconfigurable |
| `dropdown_menu.story.exs` | `ExoOverlay` | 3 sections; no submenu/separator combo |
| `theme_toggle.story.exs` | `ExoThemeToggle` | persistence behaviour not demoed |
| `sidebar_layout.story.exs` | `ExoSidebar` | collapsed-state not demoed |
| `carousel.story.exs` | (CSS scroll-snap) | autoplay not demoed |
| `accordion.story.exs` | none | doc claims "native HTML details/summary" but uses checkbox+button (per audit `04`) |

`scripts/capture_storybook_components.js` works around several of these via per-component switch cases (lines 200–340) but those interactions only run inside the capture script, not for live Storybook viewers.

---

## 6. CHANGELOG drift

`CHANGELOG.md` (single 0.1.0 entry dated 2026-04-24) lists browser-test coverage at lines 11–12 as: popover, select, combobox, tooltip, command_palette, hover_card, context_menu (7 hooks). `test/browser/` actually contains specs for popover, select, combobox, tooltip, command_palette, hover_card, context_menu plus the new menubar.spec.js (verified earlier in this session via `git status` — `test/browser/context_menu.spec.js`, `hover_card.spec.js` are tracked-and-modified; `menubar.spec.js` and `overlay.spec.js` may be untracked). The CHANGELOG omits menubar regardless.

Other drift:

- CHANGELOG does not mention the deprecation of `dropdown/1` (replaced by `dropdown_menu/1`, see `lib/exo_ui/components.ex:58`).
- CHANGELOG does not mention `defdelegate` re-export from `ExoUI.Components` (the new public surface in `lib/exo_ui/components.ex`).
- No "Unreleased" section; any post-0.1.0 work in flight (overlay hook, menubar hook, charts story additions per `git status`) is undocumented.
- `docs/release-checklist.md:1–47` references CHANGELOG sync but does not gate on browser-spec parity.

---

## 7. README drift

`README.md` is 307 lines. Specific drifts:

| Line | Issue |
|---|---|
| `README.md:200–201` | Theme-toggle persistence claim ("persists via `localStorage`") matches `theme_toggle.story.exs` only by implication; story has no JS demo. |
| `README.md:273` | "Current browser coverage includes popover, select, combobox, tooltip, and command_palette" — 5 hooks. CHANGELOG lists 7. Actual `test/browser/*.spec.js` is closer to 7–8. |
| `README.md:105–107` | Documents `core_components: false` integration path; no story or recipe demonstrates it. |
| Throughout | Code snippets reference `ExoUI.Components.button/1` etc. directly without mentioning the sub-module organisation introduced in 0.1.0 (Core/Form/Overlay/DataDisplay/Feedback). |
| Throughout | No mention of CSS anchor-positioning fallback strategy or Native Popover API browser support floor — relevant for popover/hover_card/menubar. |

`docs/release-checklist.md` does not list "README-CHANGELOG cross-check" or "browser spec count parity" as gates.

---

## 8. Module documentation quality

Every public module has a one-paragraph `@moduledoc`; none link to the corresponding Storybook page. Per-function `@doc` is a single sentence in nearly every case (sample below).

| Module | Path | Moduledoc length | Per-fn `@doc` style |
|---|---|---|---|
| `ExoUI.Components` | `lib/exo_ui/components.ex:2-15` | 13 lines, lists submodules | mostly absent (delegates) |
| `ExoUI.Components.Core` | `lib/exo_ui/components/core.ex:2-4` | 1 line | one-sentence (e.g. line 8) |
| `ExoUI.Components.Form` | `lib/exo_ui/components/form.ex:2-4` | 1 line | one-sentence |
| `ExoUI.Components.Overlay` | `lib/exo_ui/components/overlay.ex:2-4` | 1 line | one-sentence |
| `ExoUI.Components.DataDisplay` | `lib/exo_ui/components/data_display.ex:2-4` | 1 line | one-sentence |
| `ExoUI.Components.Feedback` | `lib/exo_ui/components/feedback.ex:2-4` | 1 line | one-sentence |
| `ExoUI.Charts` | `lib/exo_ui/charts.ex:2-?` | ~10 lines (shadcn parity notes) | one-sentence |
| `ExoUI.Layouts` | `lib/exo_ui/layouts.ex:2-6` | 3 lines | one-sentence (line 10) |
| `ExoUI.Lucide` | `lib/exo_ui/lucide.ex` | not verified in this pass | — |
| `ExoUI.Utils` | `lib/exo_ui/utils.ex` | not verified in this pass | — |

No module includes `@moduledoc` examples (the `iex>` doctest blocks Phoenix component libs frequently use to seed both ExDoc and tests). `ExoUI.Charts` is the only module that documents design intent (shadcn parity notes), but does not link out to the Recharts source it copies.

---

## 9. Deprecation surface

| Location | Marker | Target | Issue |
|---|---|---|---|
| `lib/exo_ui/components.ex:39` | `@doc deprecated: "Use select/1 instead"` | `input/1` | **Wrong scope.** Per audit `02-form-components.md`, only `input(type="select")` was migrated to a dedicated `select/1`. Marking the entire `input/1` deprecated is incorrect and will trigger compiler warnings on every form usage. |
| `lib/exo_ui/components.ex:58` | `@doc deprecated: "Use dropdown_menu/1 instead"` | `dropdown/1` | Correct, but no migration recipe in README/CHANGELOG. |

No story explicitly marks deprecated components (PhoenixStorybook supports `:meta` tags); both `input.story.exs` and the (likely-existing) `dropdown.story.exs` therefore look first-class.

---

## 10. Capture script integrity

`scripts/capture_storybook_components.js`, 439 lines:

- Line 22 (`STORIES_DIR = path.join(ROOT, "storybook", "stories", "components")`) hardcodes the `components/` subdirectory; `storybook/stories/layouts/sidebar_layout.story.exs` is silently skipped from the screenshot bundle.
- Line ~80 (URL builder) navigates to `${BASE_URL}/components/${name}`, also hardcoded; cannot reach `/layouts/sidebar_layout` even if the file list were extended.
- Per-component `switch` cases (lines ~200–340) cover accordion, carousel, combobox, command_palette, context_menu, modal, popover, sheet, drawer, dropdown_menu, hover_card, menubar, sidebar_layout (likely missing), but no fallback for components added later. Adding a new interactive component requires editing the switch.
- Output path `output/playwright/exo-ui-components/<timestamp>/` is in `.gitignore` (per `git status` showing `output/` as untracked) — fine, but no manifest is written, so consumers cannot diff runs.
- No screenshot for dark theme; no second pass at mobile viewport. Aligns with the systemic state-coverage gap above.
- Does not record the Storybook git SHA in the output dir, so screenshots cannot be tied back to a commit.

---

## 11. Top 10 critical Storybook/docs issues

1. All 11 `:component` stories use `&ExoUI.Components.<fn>/1` (a `defdelegate`), wiping attribute introspection in the playground (`button.story.exs:4`, `badge.story.exs:4`, `separator.story.exs:4`, `skeleton.story.exs:4`, `input.story.exs:4`, `toggle.story.exs:4`, `slider.story.exs:4`, `modal.story.exs:4`, `tabs.story.exs:4`, `alert.story.exs:4`, `progress.story.exs:4`).
2. 72 of 83 stories use `:page` mode, so the variation matrix and attribute panel are unavailable for the majority of the library — including every chart, every overlay except modal, and every data-display except tabs.
3. `lib/exo_ui/components.ex:39` deprecates `input/1` outright when only the `type="select"` subtype was migrated; this will cause compiler warnings for every `<.input>` consumer.
4. `README.md:273` says browser coverage is 5 hooks; `CHANGELOG.md:11-12` says 7; the actual `test/browser/` count is higher again. Single source of truth is missing.
5. Phoenix `to_form/2` + `FormField` integration appears in exactly one story (`form.story.exs:11`); the 9 form components that take `attr :field` show no realistic usage.
6. No story exercises dark theme, mobile viewport, RTL, or `prefers-reduced-motion` — the four states most likely to break in production.
7. `scripts/capture_storybook_components.js:22` hardcodes `/components/`, excluding the entire `storybook/stories/layouts/` tree from visual regression.
8. `accordion.story.exs` documentation claims "native HTML details/summary" but the implementation uses checkbox+button (per audit `04-data-display-and-navigation.md`); story misleads consumers about progressive enhancement guarantees.
9. `modal.story.exs` is forced to `show: true` because `show_modal/1` is private; the story cannot demonstrate the component's primary lifecycle (open/close).
10. Per-hook documentation is missing: `assets/js/hooks/{command_palette,context_menu,hover_card,popover,menubar,overlay,rating}.js` have no README block, no story explanation, and no public API table — every consumer reads source.

---

## 12. Quick wins (≤1h each)

- Replace the 11 `function/0` references in `:component` stories with the direct sub-module ref (file:line list in §2). Restores attribute introspection without changing public API.
- Move the `@doc deprecated` on `lib/exo_ui/components.ex:39` from `input/1` to a docstring note, and instead mark only the `type="select"` variation deprecated in the `@doc` body (or remove the marker until a real follow-up exists).
- Update `README.md:273` to reference a generated list (`scripts/list_browser_specs.sh` or similar) so CHANGELOG and README cannot drift again.
- Add a `## Unreleased` section to `CHANGELOG.md` and document the `defdelegate` re-export, the menubar hook, and any pending overlay work.
- Extend `STORIES_DIR` and the URL builder in `scripts/capture_storybook_components.js` to walk `components/` and `layouts/` (two-line change at lines 22 and ~80).
- Promote the misleading sentence in `accordion.story.exs` (the "native HTML details/summary" claim) to either a TODO or a corrected description matching the checkbox+button reality.

## 13. Strategic recommendations

- **Convert the next batch of `:page` stories to `:component` mode, starting with overlay and data-display.** The categories with the lowest `:component` ratio (overlay 1/13, data-display 1/15, charts 0/19) are also the categories where attribute introspection would most benefit consumers.
- **Adopt a `Phoenix.Component.to_form/2` helper inside each form story.** A single `defp form(), do: to_form(%{...})` template at the top of each story makes the snippets directly copy-pasteable.
- **Standardise state-coverage variations.** Define a shared `variations_for(component)` macro that emits `:default`, `:disabled`, `:error`, `:loading`, `:dark`, `:mobile`, `:long_text` whenever applicable; force the matrix instead of letting each author pick.
- **Add a docs-CI gate.** A small mix task that diffs `test/browser/*.spec.js` against the README/CHANGELOG counts would prevent §6 and §7 drift.
- **Document each JS hook in its source header** (`assets/js/hooks/*.js`), then inline-reference the file from the corresponding `:page` story prose. This bridges the `@moduledoc` gap §8 calls out.
- **Tag deprecated components in PhoenixStorybook meta** so the playground renders a banner; today there is no visual cue.

## 14. Open questions

- Is `dropdown/1` still in the public surface, or only as a deprecated alias? `lib/exo_ui/components.ex:58` keeps it; should the corresponding story (if present) be moved into a "Deprecated" Storybook folder?
- Does the team want layouts captured by the visual-regression script, or are layouts intentionally excluded?
- Should `welcome.story.exs` and `_root.index.exs` document the dark-theme toggle path (CSS variables in `priv/static/exo.css`) for consumers, or is that out of Storybook's scope?
- Are the per-category audits (`01-core-components.md` … `07-layouts-and-app-shell.md`) considered authoritative inputs for the next release, or are they internal-only? CHANGELOG does not reference them.
- Is `sidebar_item/1` intended to be authored only as a child of `sidebar_layout/1`, or should it have a standalone story?
