# ExoUI component library status

**Date:** 2026-05-04
**Latest update:** 2026-05-06
**Scope:** public `ExoUI.Components.*` surface, Storybook routes, Playwright browser suite, generated screenshot/video capture.
**Baseline target:** functionality and documentation quality approaching shadcn/ui and daisyUI.

## Current status

ExoUI is no longer in the "many components have no story or no CSS" state captured in the April audits. The public component surface now has Storybook coverage and browser-level verification for the highest-risk interactive paths.

| Area | Current result |
| --- | --- |
| Public components | 61 public component delegates audited from `lib/exo_ui/components.ex` |
| Missing Storybook stories | 0 public components missing a story |
| Storybook story types | 81 component stories, 27 live component stories, 6 aggregate example stories, 0 component/layout page-mode stories |
| Playwright component capture | 114 Storybook routes captured |
| Capture artifacts | 114 screenshots, 114 WebM videos, 114 MP4 videos |
| Latest capture | `output/playwright/exo-ui-components/2026-05-06T16-23-24-915Z/viewer.html` |
| Browser suite | 95 Playwright tests passing |
| ExUnit suite | 529 tests passing |
| Visual regression | 114 committed screenshot baselines with pixel-diff checking |
| Usage documentation | Central copy-paste reference added at `docs/guides/component-usage.md` |

## What improved

- Core/action components now have real CSS coverage, keyboard behavior checks, and browser tests for button safety, theme toggle, swap, and toggle.
- Form controls now include much stronger ARIA wiring: `aria-invalid`, `aria-describedby`, stable description/error IDs, FormField support for previously weak controls, and browser tests for select, combobox, rating, grouped controls, and date picker semantics.
- Layout/navigation/data-display components have broader Storybook and browser coverage, including carousel controls, breadcrumbs, timeline, scroll area, accordion, and collapsible behavior.
- Accordion and collapsible now hide closed content from assistive tech and focus with `aria-hidden` plus `inert`, and their hooks keep those states synced after interaction.
- Modal, sheet, and drawer now share stronger overlay focus isolation: open overlays inert outside page siblings, lock page scroll, trap Tab/Shift+Tab inside the dialog, keep Escape and backdrop interaction scoped to the active/topmost overlay, and restore focus to the trigger after close.
- Select and combobox now assign stable option IDs and sync `aria-activedescendant`; combobox keyboard selection keeps focus on the search input while Enter commits the active option.
- Select and button-trigger combobox triggers now expose both the field label and selected value to assistive tech, and disabled choice controls disable their hidden submitted value to match native form behavior.
- `select/1` now accepts the same simple `options={[{label, value}]}` shape that made legacy `input type="select"` convenient, while keeping the slot API for icons, groups, and disabled rows.
- `combobox/1` now accepts the same simple `options={[{label, value}]}` data shape for client/static lists, including grouped option maps, while keeping option slots for richer row markup.
- `radio_group/1` now accepts option maps with per-option disabled states and descriptions, so common shadcn-style labelled radio rows no longer require slot markup.
- `slider/1` now supports `show_value`, `value_suffix`, and `aria_value_text`, with an `ExoSlider` hook that keeps the visible `<output>` and `aria-valuetext` synced as the range changes.
- `file_input/1` now supports `show_selected` and `empty_label`, with an `ExoFileInput` hook that keeps a polite selected-file summary synced after users choose one or more files.
- `input/1` now supports text-like prefix/suffix adornments plus leading/trailing Lucide icons while keeping the real input responsible for value, focus, `aria-invalid`, and `aria-describedby`.
- Combobox empty/loading states now update a polite live region, expose `aria-busy` on the listbox while loading, and document the keyboard model in Storybook.
- Combobox server filtering can now target nested LiveComponents, and Storybook includes an async remote-search demo with loading, empty, result, and selection states.
- Combobox now has a copy-paste usage guide for client filtering, LiveView server filtering, LiveComponent-targeted filtering, and live-region status text.
- Storybook browser tests now wait for LiveView `phx-connected` with configurable browser/server timeouts, avoiding false negatives caused by clicking server-rendered markup before hooks mount or by slow cold Storybook starts.
- Rating no longer hardcodes amber in component CSS; it uses `--exo-rating-active`, and the browser test verifies keyboard selection and visible focus styling.
- Date picker now has roving keyboard grid navigation for Arrow keys, Home, End, PageUp, and PageDown, plus browser coverage against a fixed-date Storybook example.
- Date picker now exposes a `target` attribute for parent-controlled LiveComponent events, and Storybook includes a live controlled-month recipe with browser coverage for prev/next month and selected-date updates.
- Date picker and shared form field ID generation now derive stable lowercase IDs from labels when `id`/`name` are omitted, and no longer render broken month references like `aria-labelledby="-month"` when no stable ID is available.
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
- `table/1` now supports a server-owned loading state with `loading`, `loading_label`, and `:loading_state`, exposing `aria-busy` plus a polite status row without forcing callers to wrap the table in custom markup.
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
- `Bulk Action Workflow` is now a live Storybook recipe route covering server-owned filtering, stable row selection, select filtered/clear selection actions, async bulk action state, and guarded destructive validation that keeps the confirm modal open on failure.
- `docs/guides/bulk-action-workflows.md` now documents the filtered table and bulk confirm pattern as a copy-paste production recipe.
- `Bulk Edit Workflow` is now a live Storybook recipe route covering filtered row selection, server-owned bulk edit controls, successful table updates, selection clearing, empty-state-safe filters, and updated row verification after filters are cleared.
- `docs/guides/bulk-edit-workflows.md` now documents the same successful bulk update pattern as a copy-paste production recipe.
- `Dashboard Drilldown Workflow` is now a live Storybook recipe route covering metric-driven filtering, chart context, server-owned visible rows, drawer-hosted account details, review state, reset state, and live status text.
- `docs/guides/dashboard-drilldown-workflows.md` now documents the same dashboard metric -> table -> drawer detail pattern as a copy-paste production recipe.
- `Data Table Workflow` is now a live Storybook recipe route covering server-owned filtering, sorting, page-size changes, pagination state, empty-table rendering, and live row-count status text.
- `docs/guides/data-table-workflows.md` now documents the same advanced table state pattern as a copy-paste production recipe.
- `Import Export Workflow` is now a live Storybook recipe route covering file input review, staged import rows, validation warnings, committed rows, progress state, export format, and prepared export filename.
- `docs/guides/import-export-workflows.md` now documents the same staged import, validation, commit, and export package pattern as a copy-paste production recipe.
- `Async Save Workflow` is now a live Storybook recipe route covering validated draft state, disabled submit while saving, explicit `aria-busy`, polite live-region status text, stale request protection, and server-confirmed success state.
- `docs/guides/async-save-workflows.md` now documents the same dirty -> saving -> saved pattern as a copy-paste production recipe.
- `Command Routing Workflow` is now a live Storybook recipe route covering multi-screen navigation, command palette routing, focus-safe command close, active screen state, source tracking, route counters, and drilldown return actions.
- `docs/guides/command-routing-workflows.md` now documents the same multi-screen command palette routing pattern as a copy-paste production recipe.
- `Role Operations Workflow` is now a live Storybook recipe route covering role-specific queues, lane filtering, server-owned task rows, drawer-hosted task details, acknowledgement state, reset behavior, and live status text.
- `docs/guides/role-operations-workflows.md` now documents the same role queue -> lane filter -> task drawer pattern as a copy-paste production recipe.
- `Saved Filters Workflow` is now a live Storybook recipe route covering server-owned table filters, saved views, clear/apply flows, active saved-view state, empty-table-safe rendering, row-count status updates, and persisted filter controls.
- `docs/guides/saved-filter-workflows.md` now documents the same saved table filter pattern as a copy-paste production recipe.
- `Button Recipes` is now a live Storybook recipe route covering variants, size composition, disabled link safety, loading/save state, destructive confirmation, reset state, and live status text.
- `docs/guides/button-recipes.md` now documents loading, disabled-link, icon, and destructive-confirm button patterns.
- `Input Recipes` is now a live Storybook recipe route covering text, email, textarea, checkbox, readonly, disabled, validation, submit safety, reset state, and live status text.
- `docs/guides/input-recipes.md` now documents input validation, textarea limits, checkbox requirements, disabled/readonly behavior, and submit safety patterns.
- `Select Recipes` is now a live Storybook recipe route covering prompt validation, grouped options, icons, disabled options, disabled selects, server-owned state, submit safety, reset state, and live status text.
- `docs/guides/select-recipes.md` now documents grouped/icon select options, disabled option safety, hidden submitted values, and LiveView-owned select state.
- `Combobox Recipes` is now a live Storybook recipe route covering client filtering, input triggers, server filtering, grouped options, disabled options, clearable values, creatable rows, disabled comboboxes, submit safety, reset state, and live status text.
- `docs/guides/combobox-recipes.md` now documents client/server combobox patterns, hidden submitted values, clear behavior, disabled option safety, input-trigger mode, and server-owned state.
- `Table Recipes` is now a live Storybook recipe route covering captions, stable row IDs, row labels, aligned cells, clickable rows, action slots, filters, empty states, reset state, and live status text.
- `docs/guides/table-recipes.md` now documents table captions, row click state, action slots, aligned numeric cells, empty rendering, and server-owned table state.
- `Modal Recipes` is now a live Storybook recipe route covering titled modals, titleless labelled modals, form draft state, close callbacks, guarded confirms, reset state, and live status text.
- `docs/guides/modal-recipes.md` now documents modal naming, form state, action slots, labelled titleless dialogs, and server-validated confirmation patterns.
- `Drawer Recipes` is now a live Storybook recipe route covering right drawers, left navigation drawers, titleless labelled drawers, long drawer-body scrolling, validation that keeps the drawer open, close callbacks, reset state, and live status text.
- `docs/guides/drawer-recipes.md` now documents drawer side selection, accessible naming, long body scroll ownership, server-owned draft state, and invalid submit paths that intentionally omit `hide_drawer/2`.
- `Command Palette Recipes` is now a live Storybook recipe route covering trigger open, scoped shortcuts, keyboard filtering, `aria-activedescendant`, empty states, disabled commands, manual-only palettes, `close={false}` preview commands, reset state, and live status text.
- `docs/guides/command-palette-recipes.md` now documents trigger/shortcut palettes, manual-only command surfaces, searchable synonyms, disabled commands, non-closing previews, and explicit `JS.push(...) |> hide_command_palette(id)` pipelines for LiveView-patching commands.
- `Date Picker Recipes` is now a live Storybook recipe route covering parent-owned month state, date selection, min/max navigation bounds, available-day markers, hidden form values, validation errors, disabled calendars, reset state, keyboard movement, and live status text.
- `docs/guides/date-picker-recipes.md` now documents parent-controlled calendars, hidden ISO date submission, LiveComponent event targeting, min/max bounds, available-day marker semantics, disabled calendars, server validation, and browser coverage expectations.
- `Access Review Workflow` is now a live Storybook recipe route for a security/admin product flow covering status tabs, risk/search filters, command-palette routing, table row actions, drawer-hosted review details, evidence-note validation, guarded revocation, reset state, and live status text.
- `docs/guides/access-review-workflows.md` now documents the same access review pattern as a copy-paste production recipe, including targeted LiveComponent tab events, explicit command close, drawer validation, and modal-plus-drawer close pipelines after revoke.
- `Incident Response Workflow` is now a live Storybook recipe route for an operations product flow covering status tabs, severity/search filters, command-palette routing, table row actions, drawer-hosted triage details, timeline events, escalation validation, guarded resolution, reset state, and live status text.
- `docs/guides/incident-response-workflows.md` now documents the same incident response pattern as a copy-paste production recipe, including targeted LiveComponent tab events, command routing, drawer validation, escalation, acknowledgement, and modal-plus-drawer close pipelines after resolution.
- `Release Readiness Workflow` is now a live Storybook recipe route for a launch-management flow covering status tabs, lane/search filters, command-palette routing, progress feedback, table row actions, drawer-hosted review validation, guarded launch confirmation, reset state, and live status text.
- `docs/guides/release-readiness-workflows.md` now documents the same release checklist pattern as a copy-paste production recipe, including targeted LiveComponent tab events, command routing, drawer validation, progress state, and `close_on_confirm={@launch_ready?}` guarded launch behavior.
- `Billing Dispute Workflow` is now a live Storybook recipe route for a finance/support flow covering status tabs, queue/search filters, command-palette routing, table row actions, drawer-hosted review validation, evidence requests, guarded credit confirmation, reset state, and live status text.
- `docs/guides/billing-dispute-workflows.md` now documents the same billing dispute pattern as a copy-paste production recipe, including targeted LiveComponent tab events, drawer validation, evidence requests, and `close_on_confirm={@credit_ready?}` guarded credit behavior.
- `Onboarding Provisioning Workflow` is now a live Storybook recipe route for an admin/SaaS setup flow covering status tabs, team/search filters, command-palette routing, progress feedback, table row actions, drawer-hosted setup validation, setup-info requests, guarded account activation, reset state, and live status text.
- `docs/guides/onboarding-provisioning-workflows.md` now documents the same onboarding provisioning pattern as a copy-paste production recipe, including targeted LiveComponent tab events, drawer validation, setup-info requests, and `close_on_confirm={@provision_ready?}` guarded activation behavior.
- Storybook demos, recipe demos, and the central usage guide now avoid raw `input`, `select`, `textarea`, and `button` markup where ExoUI provides an equivalent component. Existing workflow demos now use `select/1` instead of deprecated native `input type="select"`, and browser/capture automation drives the ExoUI popover select instead of Playwright's native `selectOption`.
- `button/1` now accepts `popovertarget` and `popovertargetaction`, so Popover API close actions can use the same ExoUI button primitive instead of hand-authored native buttons.
- `pagination/1` now renders disabled previous/next controls as real disabled buttons instead of non-focusable spans, and exposes a polite page status for assistive tech.
- `wizard_sidebar/1` now renders pending steps as disabled buttons instead of divs, keeping one consistent control shape across completed, current, and unavailable steps.
- `accordion/1` no longer renders a hidden checkbox as a second state mirror; the button `aria-expanded` state is the single source for CSS and hook behavior.
- `table/1` now binds `row_click` once on the row instead of duplicating it across every data cell; clickable rows are focusable and Enter/Space-activatable while action-slot controls keep their own handlers.
- `tabs/1` and `wizard_sidebar/1` now accept `target`, so event-name clicks can be routed directly to a parent LiveComponent instead of requiring every caller to hand-build `JS.push(..., target: @myself)`.
- `Navigation Shell Workflow` is now a live Storybook recipe route combining navbar, breadcrumbs, targeted tabs, targeted wizard steps, step summary, pagination, bottom navigation, table state, reset behavior, screenshot/video capture, and browser coverage.
- `bottom_nav/1` now supports event-owned items with `click`, `click_value`, and `target`, rendering real button controls with `phx-value-item` when a LiveComponent owns mobile navigation state while preserving link rendering for route navigation.
- `pagination/1` now supports LiveComponent event mode with `on_click` and `target`, while preserving `patch_fn` route mode for URL-owned pagination.
- `Navigation Shell Workflow` now uses event-mode bottom navigation and event-mode pagination directly, without wrapper controls or hash-link fallbacks.
- `docs/guides/navigation-shell-workflows.md` now documents LiveComponent-owned navigation shells, including when to pass `target={@myself}` to tabs, wizard sidebar, pagination, and bottom nav.
- `Onboarding Provisioning Workflow` now reopens the drawer from guarded confirm cancel after failed activation validation, preserving the server-rendered field error instead of forcing a brittle row re-open.

## Comparison vs shadcn/daisyUI

| Capability | ExoUI now | Gap vs shadcn/daisyUI |
| --- | --- | --- |
| Component stories | Broad Storybook route coverage exists; all real component stories are component/live-component stories, and aggregate demos are explicit examples | No component/layout page-mode stories remain |
| Theming | Token-driven CSS with light/dark support, reduced-motion guard, semantic elevation/backdrop tokens, browser checks against hardcoded component backdrops, and token customization recipes | Needs more component-specific state tokens as the design language matures |
| Forms | Phoenix FormField integration is now strong across most controls, generated field IDs are stable/lowercase, date picker month labelling is valid with and without caller IDs, text-like inputs support prefix/suffix and icon adornments, select, combobox, and radio group accept richer `options` data without forcing callers back to native/raw markup, slider can expose a synced visible value and `aria-valuetext`, file input can expose a synced selected-file summary, select/combobox expose active-descendant keyboard state, labelled choice triggers include the current value in their accessible name, disabled custom choices no longer submit hidden values, combobox empty/loading states announce changes politely, and async save, saved-filter, and bulk-edit success paths have live coverage | Component-mode controls should keep getting direct primitive-focused tests as APIs evolve |
| Overlays/menus | Browser-tested popover, dropdown, context menu, menubar, modal/confirm-modal/sheet/drawer focus traps, command palette trigger open/focus trap/focus restore, shared overlay registry participation, topmost Escape/backdrop handling, outside inerting, scroll lock, same-type and cross-type stacking order, lower-overlay inerting, focus restore, long-form stacked drawer scrolling, stacked validation errors, command-surface stacks, destructive confirm flows inside stacked overlays, public show/hide helpers for modal/drawer/sheet/command palette, configurable command palette shortcuts, and guarded confirm actions that can stay open for server validation | Keep tightening primitive APIs and browser tests instead of adding more broad example pages |
| Keyboard support | Covered for major actions, menus, select/combobox, rating, targeted tabs/wizard flows, event-owned bottom navigation, event-owned pagination, date picker grid movement, parent-controlled date picker month changes, pagination disabled-button semantics, wizard disabled-step semantics, accordion button state, and command palette driven multi-screen routing | Needs deeper primitive-level shortcut and focus-state coverage |
| Visual proof | Automated screenshots and videos for 114 routes, committed visual baselines, a CI-friendly diff command, and GitHub Actions wiring | Needs review tuning once real PR diffs start producing visual changes |
| Composability | Slots and `data-exo` styling are consistent | No shadcn-style `asChild`/polymorphic root pattern for advanced composition |
| Usage docs | Central copy-paste usage reference exists for the current public component surface, plus button, input, select, combobox, table, modal, drawer, command-palette, date-picker, access-review, incident-response, release-readiness, billing-dispute, onboarding-provisioning, app-shell, editable-record, bulk-action, bulk-edit, dashboard-drilldown, data-table, async-save, saved-filter, command-routing, role-operations, action/form, table/overlay/menu, component-state, and token recipes | Still needs more narrow per-component pages as new high-traffic primitives emerge |

## Remaining priorities

1. Stop expanding broad workflow recipes by default; put new effort into component internals, component-mode stories, and primitive-level tests.
2. Tune visual diff thresholds after the first few CI runs if Linux font rendering causes expected drift.
3. Keep tightening high-traffic primitives such as select, combobox, date picker, table, overlay, and navigation before adding any new example surface.

## Verification used

- `mix test` -> 529 tests, 0 failures.
- `mix compile --warnings-as-errors`.
- `mix compile --warnings-as-errors` in `storybook`.
- `mix test test/exo_ui/components/input_test.exs` -> 17 tests, 0 failures after adding text-like input prefix/suffix and icon adornments.
- `bunx playwright test test/browser/form_controls.spec.js -g "input and checkbox expose error descriptions"` -> 1 test, 0 failures after verifying the Storybook input adornment wrapper and hidden decorative icons.
- `mix test test/exo_ui/components/table_test.exs` -> 8 tests, 0 failures after adding table loading status support.
- `bunx playwright test test/browser/data_feedback.spec.js -g "table renders caption"` -> 1 test, 0 failures after verifying `aria-busy` and the loading status row in Storybook.
- `mix test test/exo_ui/components/file_input_test.exs` -> 7 tests, 0 failures after adding selected-file summary output support.
- `bunx playwright test test/browser/form_controls.spec.js -g "grouped form controls expose invalid state"` -> 1 test, 0 failures after verifying the file-input selected summary updates after a multi-file selection.
- `mix test test/exo_ui/components/slider_test.exs` -> 15 tests, 0 failures after adding slider visible value and `aria-valuetext` support.
- `bunx playwright test test/browser/form_controls.spec.js -g "grouped form controls expose invalid state"` -> 1 test, 0 failures after verifying the slider output hook updates text and `aria-valuetext` from an input event.
- `mix test test/exo_ui/components/radio_group_test.exs` -> 18 tests, 0 failures after adding `radio_group/1` option map descriptions and disabled item support.
- `bunx playwright test test/browser/form_controls.spec.js -g "grouped form controls expose invalid state"` -> 1 test, 0 failures after adding the Storybook radio-group data-disabled coverage.
- `mix test test/exo_ui/components/combobox_test.exs` -> 35 tests, 0 failures after adding `combobox/1` options data support.
- `bunx playwright test test/browser/combobox.spec.js` -> 4 tests, 0 failures after moving the component Storybook combobox variation to the `options` API.
- `mix test test/exo_ui/components/select_test.exs test/exo_ui/components/storybook_primitive_usage_test.exs` -> 30 tests, 0 failures after adding `select/1` options support and guarding against native select regressions in Storybook/capture automation.
- `bunx playwright test test/browser/access_review_workflow.spec.js test/browser/billing_dispute_workflow.spec.js test/browser/bulk_action_workflow.spec.js test/browser/bulk_edit_workflow.spec.js test/browser/data_table_workflow.spec.js test/browser/drawer_recipes.spec.js test/browser/import_export_workflow.spec.js test/browser/incident_response_workflow.spec.js test/browser/onboarding_provisioning_workflow.spec.js test/browser/release_readiness_workflow.spec.js test/browser/saved_filters_workflow.spec.js` -> 11 tests, 0 failures after replacing workflow native select usage with ExoUI select.
- `mix test test/exo_ui/components/fieldset_test.exs test/exo_ui/components/date_picker_test.exs` -> 15 tests, 0 failures after stable lowercase form IDs and date picker month labelling fixes.
- `bunx playwright test test/browser/data_feedback.spec.js -g "date picker exposes calendar semantics"` -> 1 test, 0 failures after date picker month-reference coverage.
- `mix test test/exo_ui/components/select_test.exs test/exo_ui/components/combobox_test.exs` -> 59 tests, 0 failures after select/combobox accessible-name and disabled hidden-value fixes.
- `bunx playwright test test/browser/select.spec.js test/browser/combobox.spec.js` -> 7 tests, 0 failures after component-level select/combobox browser coverage.
- `mix test test/exo_ui/components/bottom_nav_test.exs test/exo_ui/components/pagination_test.exs` -> 16 tests, 0 failures after event-mode bottom nav and pagination support.
- `bunx playwright test test/browser/navigation_progress.spec.js test/browser/content_structure.spec.js` -> 9 tests, 0 failures after the pagination, wizard, and accordion semantics pass.
- `mix test test/exo_ui/components/table_test.exs` -> 6 tests, 0 failures after the row-level table click semantics pass.
- `bunx playwright test test/browser/data_feedback.spec.js -g "table renders caption"` and `bunx playwright test test/browser/table_recipes.spec.js` -> 2 focused table browser checks, 0 failures.
- `mix test test/exo_ui/components/tabs_test.exs test/exo_ui/components/wizard_test.exs` -> 6 tests, 0 failures after the LiveComponent `target` support pass.
- `bunx playwright test test/browser/navigation_shell_workflow.spec.js` -> 1 focused workflow check, 0 failures after event-mode pagination and bottom-nav targeting.
- `bunx playwright test test/browser/navigation_shell_workflow.spec.js test/browser/onboarding_provisioning_workflow.spec.js` -> 2 focused workflow checks, 0 failures.
- `PLAYWRIGHT_TEST_TIMEOUT=180000 bun run test:browser` -> 95 tests, 0 failures.
- `bun run capture:components` -> 114 entries, 0 failed, 114 MP4 conversions in `output/playwright/exo-ui-components/2026-05-06T16-23-24-915Z`.
- `bun run capture:validate` -> 114 entries with non-empty screenshot, WebM, and MP4 files.
- `bun run visual:update` -> refreshed the expected screenshot baselines from the latest capture after the file-input selected summary pass.
- `bun run visual:check` -> 114 current screenshots matched the committed baseline.
- `docs/guides/component-usage.md` now links to button, input, select, combobox, table, modal, drawer, command-palette, date-picker, access-review, incident-response, release-readiness, billing-dispute, onboarding-provisioning, app-shell, editable-record, bulk-action, bulk-edit, dashboard-drilldown, data-table, import-export, async-save, command-routing, navigation-shell, role-operations, saved-filter, action/form, table/overlay/menu, component-state, and token guides.
