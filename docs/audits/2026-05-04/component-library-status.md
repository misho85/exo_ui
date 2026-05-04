# ExoUI component library status

**Date:** 2026-05-04
**Latest update:** 2026-05-05
**Scope:** public `ExoUI.Components.*` surface, Storybook routes, Playwright browser suite, generated screenshot/video capture.
**Baseline target:** functionality and documentation quality approaching shadcn/ui and daisyUI.

## Current status

ExoUI is no longer in the "many components have no story or no CSS" state captured in the April audits. The public component surface now has Storybook coverage and browser-level verification for the highest-risk interactive paths.

| Area | Current result |
| --- | --- |
| Public components | 61 public component delegates audited from `lib/exo_ui/components.ex` |
| Missing Storybook stories | 0 public components missing a story |
| Component-mode stories | 17 component stories, 1 live component story, 68 page-mode stories still to convert |
| Playwright component capture | 84 Storybook routes captured |
| Capture artifacts | 84 screenshots, 84 WebM videos, 84 MP4 videos |
| Latest capture | `output/playwright/exo-ui-components/2026-05-04T22-33-25-263Z/viewer.html` |
| Browser suite | 60 Playwright tests passing |
| ExUnit suite | 496 tests passing after combobox server-filter changes |
| Visual regression | 84 committed screenshot baselines with pixel-diff checking |

## What improved

- Core/action components now have real CSS coverage, keyboard behavior checks, and browser tests for button safety, theme toggle, swap, and toggle.
- Form controls now include much stronger ARIA wiring: `aria-invalid`, `aria-describedby`, stable description/error IDs, FormField support for previously weak controls, and browser tests for select, combobox, rating, grouped controls, and date picker semantics.
- Layout/navigation/data-display components have broader Storybook and browser coverage, including carousel controls, breadcrumbs, timeline, scroll area, accordion, and collapsible behavior.
- Accordion and collapsible now hide closed content from assistive tech and focus with `aria-hidden` plus `inert`, and their hooks keep those states synced after interaction.
- Modal, sheet, and drawer now share stronger overlay focus isolation: open overlays inert outside page siblings, lock page scroll, trap Tab/Shift+Tab inside the dialog, keep Escape and backdrop interaction scoped to the active/topmost overlay, and restore focus to the trigger after close.
- Select and combobox now assign stable option IDs and sync `aria-activedescendant`; combobox keyboard selection keeps focus on the search input while Enter commits the active option.
- Combobox empty/loading states now update a polite live region, expose `aria-busy` on the listbox while loading, and document the keyboard model in Storybook.
- Combobox server filtering can now target nested LiveComponents, and Storybook includes an async remote-search demo with loading, empty, result, and selection states.
- Combobox now has a copy-paste usage guide for client filtering, LiveView server filtering, LiveComponent-targeted filtering, and live-region status text.
- Storybook browser tests now wait for LiveView `phx-connected` with configurable browser/server timeouts, avoiding false negatives caused by clicking server-rendered markup before hooks mount or by slow cold Storybook starts.
- Rating no longer hardcodes amber in component CSS; it uses `--exo-rating-active`, and the browser test verifies keyboard selection and visible focus styling.
- Date picker now has roving keyboard grid navigation for Arrow keys, Home, End, PageUp, and PageDown, plus browser coverage against a fixed-date Storybook example.
- The capture workflow now produces a real manifest, writes a latest-run pointer, validates local screenshot/video files for every captured component route, and supports committed screenshot baselines with pixel-diff checking.
- Overlay, sidebar, command palette, menu, hover card, and carousel elevation/backdrop styles now use semantic `--exo-*` tokens instead of hardcoded black shadow or backdrop values, with browser coverage preventing those values from creeping back into component CSS.
- `Avatar`, `Kbd`, `Spinner`, `Indicator`, `EmptyState`, and `Swap` are now component-mode PhoenixStorybook stories with introspectable attrs/slots, playground support, source examples, and refreshed Playwright visual baselines.

## Comparison vs shadcn/daisyUI

| Capability | ExoUI now | Gap vs shadcn/daisyUI |
| --- | --- | --- |
| Component stories | Broad Storybook route coverage exists | Many stories are still page-style examples rather than introspectable component stories/playgrounds |
| Theming | Token-driven CSS with light/dark support, reduced-motion guard, semantic elevation/backdrop tokens, and browser checks against hardcoded component backdrops | Needs docs for token customization patterns and more component-specific state tokens |
| Forms | Phoenix FormField integration is now strong across most controls, select/combobox expose active-descendant keyboard state, and combobox empty/loading states announce changes politely, including an async LiveComponent server-filter story | Component-mode controls should expose more attrs/slots directly in PhoenixStorybook playgrounds |
| Overlays/menus | Browser-tested popover, dropdown, context menu, menubar, modal/sheet/drawer focus traps, topmost Escape/backdrop handling, outside inerting, scroll lock, stacking order, and focus restore | Richer nested overlay content examples still need deeper Radix/shadcn parity checks |
| Keyboard support | Covered for major actions, menus, select/combobox, rating, tabs, and date picker grid movement | Date picker month changes still depend on the parent LiveView handling prev/next events |
| Visual proof | Automated screenshots and videos for 84 routes, committed visual baselines, a CI-friendly diff command, and GitHub Actions wiring | Needs review tuning once real PR diffs start producing visual changes |
| Composability | Slots and `data-exo` styling are consistent | No shadcn-style `asChild`/polymorphic root pattern for advanced composition |

## Remaining priorities

1. Continue converting the remaining 68 page-mode Storybook examples to component-mode stories where PhoenixStorybook can expose attrs, slots, playground controls, and source examples.
2. Continue overlay parity work with richer nested overlay content examples and cross-type modal/sheet/drawer stacking.
3. Add docs that show copy-paste Phoenix usage for every component: basic, disabled, error, long content, dark mode, and keyboard/a11y notes.
4. Tune visual diff thresholds after the first few CI runs if Linux font rendering causes expected drift.

## Verification used

- `mix test` -> 496 tests, 0 failures.
- `bun run build:all`.
- `mix compile --warnings-as-errors` in `storybook`.
- `bun run test:browser` -> 60 tests, 0 failures.
- `bun run capture:components` -> 84 entries, 0 failed, 84 MP4 conversions in `output/playwright/exo-ui-components/2026-05-04T22-33-25-263Z`.
- `bun run capture:validate` -> 84 entries with non-empty screenshot, WebM, and MP4 files.
- `bun run visual:check` -> 84 current screenshots matched the committed baseline.
