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
| Storybook story types | 81 component stories, 3 live component stories, 6 aggregate example stories, 0 component/layout page-mode stories |
| Playwright component capture | 90 Storybook routes captured |
| Capture artifacts | 90 screenshots, 90 WebM videos, 90 MP4 videos |
| Latest capture | `output/playwright/exo-ui-components/2026-05-05T11-14-10-108Z/viewer.html` |
| Browser suite | 70 Playwright tests passing |
| ExUnit suite | 503 tests passing |
| Visual regression | 90 committed screenshot baselines with pixel-diff checking |
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
- Date picker now exposes a `target` attribute for parent-controlled LiveComponent events, and Storybook includes a live controlled-month recipe with browser coverage for prev/next month and selected-date updates.
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
- Modal, sheet, and drawer roots now share topmost-only interactivity across cross-type stacks. Lower open overlays remain visible but are marked `inert` and `aria-hidden` until the active overlay above them closes, and Storybook now includes an `Overlay Stack` example route with screenshot/video capture.
- `command_palette/1` now exposes a configurable `shortcut` attribute. The default remains `mod+k`, custom shortcuts such as `ctrl+j` work, and `shortcut={nil}` makes a palette manual-only so multiple command surfaces do not steal each other's keyboard events.
- Command palette trigger-driven opening now follows the dialog lifecycle more closely: public show/hide helpers sync `data-state` and `aria-hidden`, the hook observes externally opened palettes, traps Tab inside the dialog, and restores focus to the trigger on close.
- Command palette now participates in the shared overlay registry like modal, sheet, and drawer: trigger-open palettes receive a stack index, lock page scroll, inert outside Storybook/page siblings, keep sibling trigger/content branches isolated even inside the same story container, and restore focus only after inert state is released.
- The Overlay Stack example now covers a richer modal -> sheet -> drawer workflow with an audit summary, a long review form, sticky drawer actions, and internal drawer-body scrolling. Browser coverage verifies tabbing from the drawer close control into the form, editing a field, keeping lower overlays inert, scrolling the drawer body instead of the document, and restoring focus back down the stack.
- Overlay focus scheduling no longer overwrites focus when a user tabs into an opening panel before the deferred first-focus frame runs, which closes a race in stacked modal/sheet/drawer flows with form-heavy content.
- The Overlay Stack example now includes a validation-error field and a destructive rollback confirm modal opened from inside the stacked drawer. Browser coverage verifies `aria-invalid`, field error rendering, topmost confirm interactivity, lower drawer inerting, `close_on_confirm={false}`, Escape close order, and focus restoration back to the rollback trigger.
- The capture demo for `Overlay Stack` now records the full modal -> sheet -> drawer -> destructive confirm path, including the guarded confirm action that stays open after "Validate rollback".
- Closed overlay roots, including command palettes, are no longer inerted just because another overlay is active. This lets a sheet safely launch a hidden command palette root as the next topmost overlay.
- `Command Surface Stack` is now a Storybook example route and browser-tested recipe for sheet -> command palette -> drawer -> guarded confirm flows. The capture video records command search, Enter selection, drawer opening, and a confirm action that stays open for server validation.
- `App Shell Workflow` is now a production-style Storybook example route combining sidebar layout, stat cards, a table, dropdown menu, command palette, validation sheet, account drawer, and guarded archive confirm in one executable page workflow.
- `docs/guides/app-shell-workflows.md` now documents the same app-shell pattern as a copy-paste recipe, including the expected focus, inert, validation, and destructive-confirm behaviors.
- `Editable Record Workflow` is now a live Storybook route combining table rows, dropdown row actions, command palette search, drawer-hosted form validation, parent-controlled date picker month navigation, saved row updates, and guarded delete confirmation.
- `docs/guides/editable-record-workflows.md`, `docs/guides/component-state-recipes.md`, and `docs/guides/theme-tokens.md` now document production recipes for editable records, disabled/error/loading/long-content states, and safe token customization.
- The capture workflow default LiveView readiness timeout is now 30s, reducing false failures on slower Storybook routes while keeping the timeout configurable through `CAPTURE_STORY_READY_TIMEOUT`.
- `Component Recipe Matrix` is now an executable Storybook recipe route covering action states, invalid/disabled form states, select wiring, table rows, empty table state, row dropdown actions, command palette search, drawer validation, and guarded confirm behavior in one page.
- `docs/guides/action-form-recipes.md` and `docs/guides/table-overlay-menu-recipes.md` now document the same state and workflow recipes as copy-paste references.

## Comparison vs shadcn/daisyUI

| Capability | ExoUI now | Gap vs shadcn/daisyUI |
| --- | --- | --- |
| Component stories | Broad Storybook route coverage exists; all real component stories are component/live-component stories, and aggregate demos are explicit examples | No component/layout page-mode stories remain |
| Theming | Token-driven CSS with light/dark support, reduced-motion guard, semantic elevation/backdrop tokens, browser checks against hardcoded component backdrops, and token customization recipes | Needs more component-specific state tokens as the design language matures |
| Forms | Phoenix FormField integration is now strong across most controls, select/combobox expose active-descendant keyboard state, and combobox empty/loading states announce changes politely, including an async LiveComponent server-filter story | Component-mode controls should expose more attrs/slots directly in PhoenixStorybook playgrounds |
| Overlays/menus | Browser-tested popover, dropdown, context menu, menubar, modal/confirm-modal/sheet/drawer focus traps, command palette trigger open/focus trap/focus restore, shared overlay registry participation, topmost Escape/backdrop handling, outside inerting, scroll lock, same-type and cross-type stacking order, lower-overlay inerting, focus restore, long-form stacked drawer scrolling, stacked validation errors, command-surface stacks, destructive confirm flows inside stacked overlays, public show/hide helpers for modal/drawer/sheet/command palette, configurable command palette shortcuts, app-shell recipes, editable-record recipes, and guarded confirm actions that can stay open for server validation | Needs more real-app recipes over time, but the core overlay/menu interaction parity is much closer |
| Keyboard support | Covered for major actions, menus, select/combobox, rating, tabs, date picker grid movement, and parent-controlled date picker month changes | Needs broader multi-screen workflow shortcuts once app-level navigation examples grow |
| Visual proof | Automated screenshots and videos for 90 routes, committed visual baselines, a CI-friendly diff command, and GitHub Actions wiring | Needs review tuning once real PR diffs start producing visual changes |
| Composability | Slots and `data-exo` styling are consistent | No shadcn-style `asChild`/polymorphic root pattern for advanced composition |
| Usage docs | Central copy-paste usage reference exists for the current public component surface, plus app-shell, editable-record, action/form, table/overlay/menu, component-state, token, and combobox recipes | Still needs more narrow per-component pages for the highest-traffic primitives |

## Remaining priorities

1. Keep expanding narrow per-component recipe pages for the highest-traffic primitives: button, input, select, combobox, table, modal, drawer, command palette, and date picker.
2. Add more app-level workflow examples over time, especially multi-screen navigation, filters, bulk actions, and async save states.
3. Tune visual diff thresholds after the first few CI runs if Linux font rendering causes expected drift.

## Verification used

- `mix test` -> 503 tests, 0 failures.
- `mix compile --warnings-as-errors` in `storybook`.
- `bun run test:browser` -> 70 tests, 0 failures.
- `bun run capture:components` -> 90 entries, 0 failed, 90 MP4 conversions in `output/playwright/exo-ui-components/2026-05-05T11-14-10-108Z`.
- `bun run capture:validate` -> 90 entries with non-empty screenshot, WebM, and MP4 files.
- `bun run visual:update` -> refreshed the expected screenshot baselines from the latest capture after adding Component Recipe Matrix.
- `bun run visual:check` -> 90 current screenshots matched the committed baseline.
- `docs/guides/component-usage.md` now links to app-shell, editable-record, action/form, table/overlay/menu, component-state, and token guides.
