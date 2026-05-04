# ExoUI component library status

**Date:** 2026-05-04
**Scope:** public `ExoUI.Components.*` surface, Storybook routes, Playwright browser suite, generated screenshot/video capture.
**Baseline target:** functionality and documentation quality approaching shadcn/ui and daisyUI.

## Current status

ExoUI is no longer in the "many components have no story or no CSS" state captured in the April audits. The public component surface now has Storybook coverage and browser-level verification for the highest-risk interactive paths.

| Area | Current result |
| --- | --- |
| Public components | 61 public component delegates audited from `lib/exo_ui/components.ex` |
| Missing Storybook stories | 0 public components missing a story |
| Playwright component capture | 83 Storybook routes captured |
| Capture artifacts | 83 screenshots, 83 WebM videos, 83 MP4 videos |
| Latest capture | `output/playwright/exo-ui-components/2026-05-04T14-43-44-205Z/viewer.html` |
| Browser suite | 56 Playwright tests passing |
| ExUnit suite | 495 tests passing after disclosure changes |

## What improved

- Core/action components now have real CSS coverage, keyboard behavior checks, and browser tests for button safety, theme toggle, swap, and toggle.
- Form controls now include much stronger ARIA wiring: `aria-invalid`, `aria-describedby`, stable description/error IDs, FormField support for previously weak controls, and browser tests for select, combobox, rating, grouped controls, and date picker semantics.
- Layout/navigation/data-display components have broader Storybook and browser coverage, including carousel controls, breadcrumbs, timeline, scroll area, accordion, and collapsible behavior.
- Accordion and collapsible now hide closed content from assistive tech and focus with `aria-hidden` plus `inert`, and their hooks keep those states synced after interaction.
- Storybook browser tests now wait for LiveView `phx-connected`, avoiding false negatives caused by clicking server-rendered markup before hooks mount.
- Rating no longer hardcodes amber in component CSS; it uses `--exo-rating-active`, and the browser test verifies keyboard selection and visible focus styling.
- Date picker now has roving keyboard grid navigation for Arrow keys, Home, End, PageUp, and PageDown, plus browser coverage against a fixed-date Storybook example.
- The capture workflow now produces a real manifest and validated local screenshot/video files for every captured component route.

## Comparison vs shadcn/daisyUI

| Capability | ExoUI now | Gap vs shadcn/daisyUI |
| --- | --- | --- |
| Component stories | Broad Storybook route coverage exists | Many stories are still page-style examples rather than introspectable component stories/playgrounds |
| Theming | Token-driven CSS with light/dark support and reduced-motion guard | Needs more component-specific semantic tokens and fewer hardcoded overlay/shadow colors |
| Forms | Phoenix FormField integration is now strong across most controls | Select/combobox can still improve active-descendant semantics and loading/live-region polish |
| Overlays/menus | Browser-tested popover, dropdown, context menu, menubar, modal/sheet/drawer paths | Needs deeper focus-trap/inert-outside audit against Radix/shadcn expectations |
| Keyboard support | Covered for major actions, menus, select/combobox, rating, tabs, and date picker grid movement | Date picker month changes still depend on the parent LiveView handling prev/next events |
| Visual proof | Automated screenshots and videos for 83 routes | Not yet turned into CI visual regression baselines |
| Composability | Slots and `data-exo` styling are consistent | No shadcn-style `asChild`/polymorphic root pattern for advanced composition |

## Remaining priorities

1. Convert more page-mode Storybook examples to component-mode stories where PhoenixStorybook can expose attrs, slots, playground controls, and source examples.
2. Audit overlays against Radix/shadcn expectations: focus trap, outside inerting, nested overlays, escape stack order, focus restoration, and scroll lock edge cases.
3. Improve select/combobox active option semantics with `aria-activedescendant` or document the DOM-focus pattern explicitly.
4. Add CI-friendly visual regression from the existing capture output instead of using screenshots/videos only as manual proof.
5. Replace remaining hardcoded overlay/shadow colors with semantic tokens where the component owns the visual state.
6. Add docs that show copy-paste Phoenix usage for every component: basic, disabled, error, long content, dark mode, and keyboard/a11y notes.

## Verification used

- `mix test` -> 495 tests, 0 failures.
- `mix compile --warnings-as-errors` in `storybook`.
- `bun run test:browser` -> 56 tests, 0 failures.
- `bun run capture:components` -> 83 entries, 0 failed, 83 MP4 conversions.
- Manifest validation checked that every manifest entry has non-empty screenshot, WebM, and MP4 files.
