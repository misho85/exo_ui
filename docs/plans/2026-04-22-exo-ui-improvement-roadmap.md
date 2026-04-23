# ExoUI Improvement Roadmap

> **For future work:** use this document as the execution plan for the next stabilization and productization pass. Steps use checkbox (`- [ ]`) syntax so progress can be tracked directly in the file.

**Goal:** move ExoUI from a strong internal component library to a more reliable, easier-to-maintain, and better-documented shared package.

**Working directory:** `/Users/miso/Developer/exo_ui`

**Baseline status on April 22, 2026:**

- `mix test` passes (`405 tests, 0 failures`)
- `mix compile --warnings-as-errors` passes
- `bun run build:all` passes
- Main risks are not compilation failures, but API/behavior gaps, incomplete interaction coverage, and documentation/release drift

**Status update on April 23, 2026:**

- Browser interaction coverage now exists for `popover`, `select`, `combobox`, `tooltip`, `command_palette`, `hover_card`, and `context_menu`
- `bun run test:browser` passes (`12 tests, 0 failures`)
- `class/rest` forwarding is now covered by a dedicated regression suite across the interactive component surface
- `mix exo.install` has been hardened and regression-tested against standard Phoenix-style project shapes
- `form.ex` has started to shrink: `select/1` and `combobox/1` now share extracted choice helpers instead of duplicating grouping/selection rendering
- `ExoUI.Charts` now delegates through smaller implementation modules for primitives, cartesian charts, and radial charts while keeping the same public API
- Hook cleanup guarantees are now normalized where they mattered most in the floating/hover surface
- The stabilization and productization roadmap is functionally complete

---

## What This Plan Optimizes For

1. **API honesty** — public props and slots must match real behavior
2. **Interaction confidence** — browser hooks need coverage, not only static HTML tests
3. **Documentation accuracy** — README, plans, Storybook, and release notes must describe the current system
4. **Maintainability** — the largest modules should be easier to reason about and evolve
5. **Predictable releases** — versioning, changelog, and build output should send one clear signal

---

## Current Findings To Address

### P0: Public API mismatches

- `select/1` exposes `multiple`, but the current implementation still behaves like single-select
- `combobox/1` exposes `multiple`, but the current markup + hook still behave like single-select
- `combobox/1` exposes `group` on options, but groups are not rendered
- `select/1` and `combobox/1` expose `class` / `rest`, but those extension points are inconsistently forwarded
- `command_palette/1` is rendered as a dialog shell, but it does not yet provide real searchable command behavior

### P1: Coverage gaps

- Tests are strong for server-rendered HTML structure
- Tests are weak for browser-only behavior in JS hooks
- There is no browser-level regression suite for popover/select/combobox/tooltip flows

### P1: Documentation and release drift

- `README.md` is too thin for a shared library
- `CHANGELOG.md` says `0.1.0 — Unreleased` while package versions already say `0.1.0`
- Some design/plan docs no longer fully match the codebase
- CSS watch flow rebuilds only the main CSS bundle, not the tokens bundle

### P2: Maintainability hotspots

- `lib/exo_ui/charts.ex` is large enough to justify decomposition
- `lib/exo_ui/components/form.ex` has become the main concentration point for interactive complexity
- Some hooks are intentionally minimal, but the system now needs stronger contracts around them

---

## Recommended Execution Order

### Phase 1: API Hardening (P0)

**Outcome:** remove all misleading API surface from the next release.

- [x] Decide the contract for `multiple` on `select/1`
  - Option A: implement real multi-select behavior
  - Option B: remove/deprecate `multiple` until fully supported
- [x] Decide the contract for `multiple` on `combobox/1`
  - Option A: implement real multi-select behavior
  - Option B: remove/deprecate `multiple` until fully supported
- [x] Either implement grouped `combobox` rendering or remove the `group` option attr
- [x] Audit `class` and `rest` forwarding across interactive components
- [x] Decide whether `command_palette/1` remains a visual primitive or becomes a real searchable command surface
- [x] Update Storybook stories so they only demonstrate supported behavior
- [x] Add regression tests for every resolved API decision

**Primary files:**

- `lib/exo_ui/components/form.ex`
- `lib/exo_ui/components/overlay.ex`
- `assets/js/hooks/select.js`
- `assets/js/hooks/combobox.js`
- `test/exo_ui/components/select_test.exs`
- `test/exo_ui/components/combobox_test.exs`
- `test/exo_ui/components/command_palette_test.exs`
- `storybook/stories/components/select.story.exs`
- `storybook/stories/components/combobox.story.exs`

**Acceptance criteria:**

- No public prop or slot is advertised unless it works end-to-end
- Storybook examples match real supported behavior
- Tests clearly encode the new contract

---

### Phase 2: Interaction Test Layer (P0/P1)

**Outcome:** interactive regressions become visible before release.

- [x] Add a lightweight browser-level test setup for JS hooks
- [x] Cover the core interaction flows:
  - popover open/close
  - select keyboard navigation and value submission
  - combobox filtering and option selection
  - tooltip hover/focus behavior
  - command palette open/close behavior
- [x] Keep the existing ExUnit/Floki tests for HTML shape; do not replace them
- [x] Add at least one failure-focused test per complex hook
- [x] Make browser tests runnable in CI and locally with one command

**Recommended approach:**

- Prefer Playwright for behavior validation
- Keep the scope narrow: only cover flows that the current static tests cannot catch

**Primary files:**

- new test harness directory for browser tests
- `assets/js/hooks/*.js`
- Storybook or a minimal harness page used for interaction verification

**Acceptance criteria:**

- A broken `multiple`, keyboard, or open/close interaction can fail CI
- Hook behavior is validated in a real browser context

---

### Phase 3: Documentation and Release Hygiene (P1)

**Outcome:** the repo explains the current product clearly and consistently.

- [x] Expand `README.md` with:
  - installation
  - `use ExoUI` usage
  - CSS import options
  - JS hooks integration
  - theme/token override guidance
  - browser support expectations
  - Storybook/dev workflow
- [x] Align `CHANGELOG.md` with the real release state
- [x] Add a support matrix for:
  - Popover API
  - CSS anchor positioning
  - `:has()`
  - expected fallback behavior
- [x] Audit `docs/specs` and `docs/plans` for stale references
- [x] Fix the CSS watch workflow so tokens are not forgotten during development
- [x] Document a release checklist

**Primary files:**

- `README.md`
- `CHANGELOG.md`
- `package.json`
- relevant files under `docs/specs`
- relevant files under `docs/plans`

**Acceptance criteria:**

- A new consumer can install and use ExoUI from README alone
- Version and changelog state are unambiguous
- Local dev scripts rebuild all user-facing CSS artifacts

---

### Phase 4: Internal Refactor for Maintainability (P2)

**Outcome:** the codebase becomes easier to evolve without behavior drift.

- [x] Split `lib/exo_ui/charts.ex` into smaller modules by chart family
  - shared helpers
  - sparkline/progress primitives
  - cartesian charts
  - radial/pie/donut charts
- [x] Review `lib/exo_ui/components/form.ex` for extraction opportunities
  - shared option rendering
  - selected-value helpers
  - hidden input helpers
  - ARIA/ID helpers
- [x] Normalize hook structure where useful
  - mount/update/destroy lifecycle symmetry
  - cleanup guarantees
  - naming consistency
- [x] Add module-level comments only where they reduce real cognitive load

**Primary files:**

- `lib/exo_ui/charts.ex`
- `lib/exo_ui/charts/helpers.ex`
- `lib/exo_ui/components/form.ex`
- `assets/js/hooks/*.js`

**Acceptance criteria:**

- Large modules shrink without changing public behavior
- Shared logic is easier to test in isolation
- New component work no longer needs to copy-paste the same patterns

---

### Phase 5: Productization Pass (P2)

**Outcome:** ExoUI is easier to ship and safer to adopt across projects.

- [x] Define the support policy for modern browser features
- [x] Decide what “officially supported” means for older Safari/iOS behavior
- [x] Review `mix exo.install` against current Phoenix project shapes
- [x] Decide whether installation should stay regex-driven or move toward clearer manual/documented integration
- [x] Add a release checklist covering:
  - compile
  - unit tests
  - browser tests
  - CSS build
  - Storybook sanity pass
  - docs/changelog updates

**Primary files:**

- `lib/mix/tasks/exo.install.ex`
- `README.md`
- release docs/checklist file

**Acceptance criteria:**

- Consumers understand the browser baseline
- Installation guidance is predictable
- Releasing a new version does not depend on tribal knowledge

---

## Immediate Next Steps

If the goal is to reduce risk quickly, do these first:

- [x] **Step 1:** resolve the `multiple` contract in `select/1` and `combobox/1`
- [x] **Step 2:** add browser-level tests for select and combobox interactions
- [x] **Step 3:** align Storybook and README with the supported API only

This is the highest-value sequence because it removes the biggest gap between what the library says and what it actually does.

---

## Suggested Branch Strategy

- `feat/api-hardening-select-combobox`
- `feat/browser-interaction-tests`
- `feat/docs-release-hygiene`
- `refactor/charts-module-split`

Keep Phase 1 and Phase 2 separate if possible. They will be easier to review and safer to revert.

---

## Verification Checklist Per Phase

Run these after each meaningful milestone:

- [x] `mix test`
- [x] `mix compile --warnings-as-errors`
- [x] `bun run build:all`
- [x] relevant Storybook manual sanity check
- [x] browser interaction tests once added

---

## Definition Of Done For The Next Release

The next release should not go out until all of the following are true:

- [x] No misleading public props or slots remain
- [x] Core interactive hooks are covered by browser-level tests
- [x] README and changelog match the shipped behavior
- [x] Storybook shows only supported patterns
- [x] The release process is documented and repeatable

---

## Notes For Future Decisions

- When a feature is only partially implemented, prefer **removing or deprecating the API** over keeping a misleading prop
- Keep the current architectural split: Elixir markup, CSS theme, minimal JS hooks
- Do not expand hook complexity without adding matching interaction tests
- Favor small, reviewable phases over a single large stabilization branch
