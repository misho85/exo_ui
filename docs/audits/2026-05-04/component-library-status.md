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
| Storybook story types | 81 component stories, 1 live component story, 2 aggregate example stories, 0 component/layout page-mode stories |
| Playwright component capture | 84 Storybook routes captured |
| Capture artifacts | 84 screenshots, 84 WebM videos, 84 MP4 videos |
| Latest capture | `output/playwright/exo-ui-components/2026-05-05T05-38-33-420Z/viewer.html` |
| Browser suite | 62 Playwright tests passing |
| ExUnit suite | 500 tests passing |
| Visual regression | 84 committed screenshot baselines with pixel-diff checking |
| Usage documentation | Central copy-paste reference added at `docs/guides/component-usage.md` |

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
- The capture workflow now also waits for LiveView `phx-connected` before demo interactions, preventing flaky closed overlay screenshots when a fresh Storybook server is still mounting.
- Overlay, sidebar, command palette, menu, hover card, and carousel elevation/backdrop styles now use semantic `--exo-*` tokens instead of hardcoded black shadow or backdrop values, with browser coverage preventing those values from creeping back into component CSS.
- `Avatar`, `Kbd`, `Spinner`, `Indicator`, `EmptyState`, and `Swap` are now component-mode PhoenixStorybook stories with introspectable attrs/slots, playground support, source examples, and refreshed Playwright visual baselines.
- `Icon`, `ContentCard`, `StatCard`, `MetricCard`, chart `ProgressBar`, and `RadialProgress` are also now component-mode stories.
- `Header`, `Footer`, `Hero`, and `ScrollArea` now expose their attrs and slots in component-mode Storybook stories, and the ScrollArea browser test targets the component by accessible region name instead of a hand-authored demo ID.
- `Accordion`, `Collapsible`, `Breadcrumb`, `Timeline`, and `Steps` now expose attrs and named slots in component-mode stories; their browser tests target accessible names, roles, and `data-exo` structure instead of page-demo IDs.
- The capture helper now avoids closing already-open modal/sheet/drawer examples, making overlay screenshot baselines more deterministic.
- `BottomNav`, `Navbar`, and `WizardSidebar` are now component-mode stories, including global `aria-label` coverage for the app navigation example and list-map attrs for wizard steps.
- `ThemeToggle`, `Fieldset`, `FileInput`, and `Rating` are now component-mode stories with real PhoenixStorybook attrs/variations instead of page-only examples; their browser tests now target accessible roles, names, and generated Storybook IDs.
- Overlay stacking is more robust when a second modal/sheet/drawer-style overlay opens programmatically while another overlay is already active; the registry no longer inert-hides an overlay root that is already opening, and focus now moves after the overlay is registered as topmost.
- `ChatBubble`, `List`, and `Table` are now component-mode stories. The table story keeps real row slots and function attrs via `{:eval, ...}` helpers so row IDs and ARIA row labels still render in the actual Storybook DOM.
- `Flash`, `FlashGroup`, and `ToastContainer` are now component-mode stories, keeping role/live-region coverage while exposing placements, close labels, flash maps, and toast data as Storybook attrs.
- Chart stories are now mostly component-mode: sparkline/trend badge plus radial, pie/donut, bar, line, area, and radar variants expose data, dimensions, colors, legends, and empty states as PhoenixStorybook attrs.
- `ExoUI.Charts` now keeps its public facade while exposing Phoenix component `attr` metadata directly on the public wrapper functions, so Storybook can load chart controls without delegating through metadata-blind `defdelegate` functions.
- Chart SVGs now generate a default `<desc>` screen-reader summary from their data when callers do not pass an explicit `description`, improving shadcn-style accessible chart parity without changing the visual output.
- Overlay stacking now registers opening overlays synchronously before focus scheduling, which removes the race where a fast Escape event could close the previous sheet instead of the topmost sheet.
- `Select`, `Combobox`, `DatePicker`, `RadioGroup`, and `Form` are now component-mode stories with generated PhoenixStorybook DOM IDs, exposed playground attributes/slots, refreshed browser selectors, and validated screenshot/video output. The `Form` story uses a Storybook-only wrapper to avoid the real `form/1` name collision with `Phoenix.Component.form/1` while still rendering `ExoUI.Components.Form.form/1`.
- `Carousel` and `Pagination` are now component-mode stories with playground-ready attrs/slots, generated Storybook IDs, updated browser selectors, and refreshed screenshot/video baselines.
- Menu stories are now component-mode: `Dropdown`, `DropdownMenu`, `ContextMenu`, `CommandPalette`, and `Menubar` expose real attrs/slots in PhoenixStorybook, use generated Storybook IDs, and keep keyboard/focus browser coverage against the generated DOM.
- Overlay stories are now component-mode: `Popover`, `Tooltip`, `HoverCard`, `ConfirmModal`, `Drawer`, and `Sheet` expose generated Storybook IDs, attrs/slots, source examples, and browser-tested trigger templates for opening/closing sheet and drawer variations.
- `ContentCard`, `StatCard`, and `MetricCard` now have direct browser coverage for header/body rendering, action/trailing slots, trend direction states, and body-only/minimal variants.
- `SidebarLayout` is now a component-mode Storybook story using a one-column preview so the app-shell layout is inspectable without being squeezed by the source panel.
- `SidebarItem` now renders real Lucide SVG icons instead of showing icon names or emoji as visible text, with CSS sizing and ExUnit coverage for the icon slot.
- The remaining aggregate routes, `Card` and `Charts overview`, are now PhoenixStorybook examples instead of page-mode stories. They still get screenshot/video capture, but they no longer hide as component-story gaps because the real components already have separate component-mode stories.
- A central component usage reference now covers the current Core, Form, Overlay/Menu, Feedback, Data Display, Chart, and Layout public surface with Phoenix/HEEx copy-paste examples, setup notes, a11y expectations, and the remaining API parity caveats.
- `show_modal/1` and `hide_modal/1` are now public overlay helpers, and the compatibility facade also exposes modal, drawer, sheet, and command palette show/hide helpers. Modal and confirm-modal Storybook examples now demonstrate opening from a trigger instead of relying on pre-opened markup.
- Initially open drawers now run the same mounted focus command pattern as modal and sheet, and `jason` is a runtime dependency because LiveView JS attributes require JSON encoding outside the test environment.
- `confirm_modal/1` now supports `close_on_confirm={false}` and `close_on_cancel={false}`, so destructive flows can push a validation event and keep the dialog open until the server explicitly closes it.

## Comparison vs shadcn/daisyUI

| Capability | ExoUI now | Gap vs shadcn/daisyUI |
| --- | --- | --- |
| Component stories | Broad Storybook route coverage exists; all real component stories are component/live-component stories, and aggregate demos are explicit examples | No component/layout page-mode stories remain |
| Theming | Token-driven CSS with light/dark support, reduced-motion guard, semantic elevation/backdrop tokens, and browser checks against hardcoded component backdrops | Needs docs for token customization patterns and more component-specific state tokens |
| Forms | Phoenix FormField integration is now strong across most controls, select/combobox expose active-descendant keyboard state, and combobox empty/loading states announce changes politely, including an async LiveComponent server-filter story | Component-mode controls should expose more attrs/slots directly in PhoenixStorybook playgrounds |
| Overlays/menus | Browser-tested popover, dropdown, context menu, menubar, modal/confirm-modal/sheet/drawer focus traps, topmost Escape/backdrop handling, outside inerting, scroll lock, stacking order, focus restore, public show/hide helpers for modal/drawer/sheet/command palette, and guarded confirm actions that can stay open for server validation | Richer nested overlay content examples still need deeper Radix/shadcn parity checks |
| Keyboard support | Covered for major actions, menus, select/combobox, rating, tabs, and date picker grid movement | Date picker month changes still depend on the parent LiveView handling prev/next events |
| Visual proof | Automated screenshots and videos for 84 routes, committed visual baselines, a CI-friendly diff command, and GitHub Actions wiring | Needs review tuning once real PR diffs start producing visual changes |
| Composability | Slots and `data-exo` styling are consistent | No shadcn-style `asChild`/polymorphic root pattern for advanced composition |
| Usage docs | Central copy-paste usage reference exists for the current public component surface | Still needs richer per-component edge-case pages for variants, long content, and recipes |

## Remaining priorities

1. Continue overlay parity work with richer nested overlay content examples and cross-type modal/sheet/drawer stacking.
2. Expand the new component usage reference into per-component recipe pages: disabled states, validation errors, long content, dark mode, and richer keyboard/a11y notes.
3. Tune visual diff thresholds after the first few CI runs if Linux font rendering causes expected drift.

## Verification used

- `mix test` -> 500 tests, 0 failures.
- `bun run build:all`.
- `mix compile --warnings-as-errors` in `storybook`.
- `bun run test:browser` -> 62 tests, 0 failures.
- `bun run capture:components` -> 84 entries, 0 failed, 84 MP4 conversions in `output/playwright/exo-ui-components/2026-05-05T05-38-33-420Z`.
- `bun run capture:validate` -> 84 entries with non-empty screenshot, WebM, and MP4 files.
- `bun run visual:update` -> refreshed the expected screenshot baselines from the latest capture after adding guarded confirm-modal examples and capture interaction.
- `bun run visual:check` -> 84 current screenshots matched the committed baseline.
- Documentation-only update added `docs/guides/component-usage.md` and linked it from README.
