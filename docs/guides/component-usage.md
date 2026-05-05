# Component Usage Reference

This guide is the central copy-paste reference for the current ExoUI public
surface. It complements Storybook: Storybook proves rendering and interaction,
while this file shows how components should be used in real Phoenix LiveView
templates.

For full-page examples that combine multiple component families, see
`docs/guides/app-shell-workflows.md`,
`docs/guides/editable-record-workflows.md`,
`docs/guides/bulk-action-workflows.md`,
`docs/guides/bulk-edit-workflows.md`,
`docs/guides/async-save-workflows.md`,
`docs/guides/command-routing-workflows.md`,
`docs/guides/saved-filter-workflows.md`,
`docs/guides/action-form-recipes.md`,
`docs/guides/table-overlay-menu-recipes.md`,
`docs/guides/component-state-recipes.md`, and
`docs/guides/theme-tokens.md`.

## Setup

Import ExoUI in your app web helpers:

```elixir
def html_helpers do
  quote do
    use ExoUI
    # ...
  end
end
```

If your project keeps Phoenix's generated `CoreComponents`, avoid name clashes:

```elixir
use ExoUI, core_components: false
```

That skips ExoUI's `button`, `header`, `form`, `input`, `flash`,
`flash_group`, and `table`; the rest of the library is still imported.

Interactive components need the shipped hooks:

```js
import { hooks as exoHooks } from "../../deps/exo_ui/assets/js/index.js"

const liveSocket = new LiveSocket("/live", Socket, {
  hooks: { ...exoHooks, ...appHooks },
  params: { _csrf_token: csrfToken }
})
```

For overlay examples that use `JS.push/2`, alias LiveView JS in the LiveView:

```elixir
defmodule MyAppWeb.ProjectLive.Index do
  use MyAppWeb, :live_view
  alias Phoenix.LiveView.JS
end
```

## General Rules

- Give every interactive primitive a stable `id`: select, combobox, popover,
  modal, drawer, sheet, collapsible, command palette, carousel, accordion,
  tabs, sidebar layout, and date picker.
- Prefer `field={@form[:name]}` for form controls when a Phoenix form is
  available. The component then derives `id`, `name`, `value`, and validation
  errors from the field.
- Use visible labels whenever possible. If the title/label is intentionally
  hidden, pass `label` or `aria_label`.
- Keep components composed from ExoUI primitives instead of styled ad hoc
  markup: `alert`, `empty_state`, `separator`, `skeleton`, `badge`, cards, and
  table/list components cover common UI states.
- Use token values such as `var(--exo-primary)`, `var(--exo-success)`, and
  `var(--exo-warning)` for custom chart colors or overrides.

## Core

### Button

Use for actions, links styled as actions, and submit buttons. Supported sizes
are `xs`, `sm`, `md`, and `lg`; current theme variants include default,
`primary`, `secondary`, `danger`, `outline`, and `ghost`.

```heex
<.button phx-click="save">Save</.button>
<.button variant="outline" type="button" phx-click="cancel">Cancel</.button>
<.button variant="danger" size="sm" disabled>Delete</.button>
<.button navigate={~p"/projects/new"}>New project</.button>
```

### Badge

Use for status labels, counts, and compact metadata. Variants are `primary`,
`secondary`, `danger`, `warning`, `success`, and `info`.

```heex
<.badge variant="success">Active</.badge>
<.badge variant="warning">Pending review</.badge>
<.badge variant="secondary">Beta</.badge>
```

### Separator

Use instead of raw border dividers.

```heex
<.separator />
<div style="height: 2rem">
  <.separator orientation="vertical" />
</div>
```

### Icon

Renders a Lucide icon by name.

```heex
<.icon name="search" />
<.button>
  <.icon name="plus" />
  Add item
</.button>
```

### Theme Toggle

Requires the `ExoThemeToggle` hook and persists light, dark, and system modes.

```heex
<.theme_toggle id="app-theme" aria_label="Theme preference" />
```

### Header

Use for page titles with optional subtitle and action slots.

```heex
<.header>
  Projects
  <:subtitle>Manage workspace projects and access.</:subtitle>
  <:actions>
    <.button navigate={~p"/projects/new"}>New project</.button>
  </:actions>
</.header>
```

### Avatar

Always pass `name`; the fallback initials are derived from it when `src` is not
present.

```heex
<.avatar name="Ada Lovelace" size="sm" />
<.avatar name="Grace Hopper" src={~p"/images/grace.png"} size="lg" />
```

### Skeleton

Use as a loading placeholder with an accessible status label.

```heex
<.skeleton type="text" rows={4} label="Loading profile" />
<.skeleton type="card" label="Loading dashboard card" />
<.skeleton type="table" rows={5} label="Loading invoices" />
```

### Empty State

Use when a list, table, search, or dashboard section has no content.

```heex
<.empty_state
  icon="!"
  title="No projects found"
  subtitle="Adjust filters or create a new project."
>
  <:action>
    <.button variant="outline" phx-click="clear-filters">Clear filters</.button>
  </:action>
</.empty_state>
```

### Spinner

Use inside pending states or standalone loading regions.

```heex
<.spinner label="Saving project" />
<.button disabled>
  <.spinner size="sm" label="Saving" />
  Saving
</.button>
```

### Kbd

Use for keyboard shortcuts.

```heex
<span>Open command palette <.kbd>Cmd</.kbd> <.kbd>K</.kbd></span>
```

### Scroll Area

Use for constrained scroll regions. Pass `aria_label` when the scrollable
content is a meaningful region.

```heex
<.scroll_area id="activity-feed" aria_label="Recent activity" style="max-height: 18rem">
  <div :for={activity <- @activities}>
    {activity.message}
  </div>
</.scroll_area>
```

### Navbar

Use for top-level navigation regions.

```heex
<.navbar aria-label="Primary">
  <:brand>
    <.link navigate={~p"/"}>Acme</.link>
  </:brand>
  <:center>
    <.link navigate={~p"/projects"}>Projects</.link>
    <.link navigate={~p"/reports"}>Reports</.link>
  </:center>
  <:end_content>
    <.theme_toggle id="navbar-theme" />
  </:end_content>
</.navbar>
```

### Footer

Use column slots for grouped links and `bottom` for legal or secondary content.

```heex
<.footer>
  <:column title="Product">
    <.link navigate={~p"/features"}>Features</.link>
    <.link navigate={~p"/pricing"}>Pricing</.link>
  </:column>
  <:column title="Company">
    <.link navigate={~p"/about"}>About</.link>
    <.link navigate={~p"/contact"}>Contact</.link>
  </:column>
  <:bottom>Copyright 2026 Acme Inc.</:bottom>
</.footer>
```

### Bottom Nav

Use for compact mobile navigation. Mark the current destination with `active`.

```heex
<.bottom_nav aria-label="Mobile primary">
  <:item label="Home" icon="home" navigate={~p"/"} active={@active == :home} />
  <:item label="Search" icon="search" navigate={~p"/search"} active={@active == :search} />
  <:item label="Account" icon="user" navigate={~p"/account"} active={@active == :account} />
</.bottom_nav>
```

### Indicator

Use for notification badges over another element.

```heex
<.indicator position="top-right">
  <.button variant="outline">Inbox</.button>
  <:badge>
    <.badge variant="danger">3</.badge>
  </:badge>
</.indicator>
```

### Swap

Use for a small two-state visual toggle. The hook updates the switch state on
click and keyboard activation.

```heex
<.swap id="favorite-project" active={@favorite?} label="Favorite project">
  <:on><.icon name="star" /></:on>
  <:off><.icon name="star-off" /></:off>
</.swap>
```

## Forms

### Form And Input

`form/1` wraps `Phoenix.Component.form/1` with ExoUI styling. `input/1`
supports `text`, `email`, `password`, `textarea`, `checkbox`, `hidden`, and a
legacy native `select` path. Prefer the dedicated `select/1` component for new
custom selects.

```heex
<.form for={@form} phx-submit="save">
  <.input field={@form[:name]} label="Name" placeholder="Project name" />
  <.input field={@form[:email]} type="email" label="Owner email" />
  <.input field={@form[:notes]} type="textarea" label="Notes" rows="4" />
  <.input field={@form[:public]} type="checkbox" label="Public project" />

  <div style="display: flex; justify-content: flex-end; gap: 0.5rem">
    <.button type="button" variant="ghost" phx-click="cancel">Cancel</.button>
    <.button type="submit">Save</.button>
  </div>
</.form>
```

Native select through `input/1` is kept for compatibility:

```heex
<.input
  field={@form[:status]}
  type="select"
  label="Status"
  prompt="Choose status"
  options={[{"Draft", "draft"}, {"Published", "published"}]}
/>
```

### Toggle

Use for boolean form fields.

```heex
<.toggle field={@form[:notifications]} label="Email notifications" />
<.toggle id="compact-mode" name="settings[compact]" checked={@compact?} aria_label="Compact mode" />
```

### Select

Use the custom select for single-value selection with optional icons, groups,
disabled options, and field integration.

```heex
<.select
  id="project-status"
  field={@form[:status]}
  label="Status"
  prompt="Choose status"
>
  <:option value="draft" icon="file">Draft</:option>
  <:option value="active" icon="check" group="Visible">Active</:option>
  <:option value="archived" icon="archive" group="Hidden">Archived</:option>
  <:option value="deleted" disabled>Deleted</:option>
</.select>
```

### Combobox

Use when users need search plus a submitted hidden value. Client filtering is
enough for static option lists.

```heex
<.combobox
  id="country"
  field={@form[:country]}
  label="Country"
  prompt="Search countries..."
  filter="client"
>
  <:option value="rs">Serbia</:option>
  <:option value="hr">Croatia</:option>
  <:option value="ba">Bosnia and Herzegovina</:option>
  <:empty>No countries found.</:empty>
</.combobox>
```

For server-filtered LiveViews and LiveComponents, use the dedicated guide:
[Combobox Usage](combobox.md).

### Radio Group

Use tuple options for simple groups or `:item` slots for custom labels.

```heex
<.radio_group
  field={@form[:billing_cycle]}
  label="Billing cycle"
  options={[{"Monthly", "monthly"}, {"Yearly", "yearly"}]}
/>

<.radio_group id="plan" name="account[plan]" value={@plan} label="Plan">
  <:item value="starter">Starter</:item>
  <:item value="pro">Pro</:item>
  <:item value="enterprise" disabled>Enterprise</:item>
</.radio_group>
```

### Slider

Use for numeric ranges.

```heex
<.slider
  field={@form[:seats]}
  label="Seats"
  min={1}
  max={100}
  step={1}
  description="Choose the number of seats for this workspace."
/>
```

### Date Picker

The component renders the calendar grid. The parent LiveView owns month changes
and selected date changes through events. Use `target={@myself}` inside a
LiveComponent; omit `target` in a regular LiveView unless you are routing the
event to a specific component.

```heex
<.date_picker
  id="due-date"
  field={@form[:due_date]}
  label="Due date"
  current_month={@calendar_month}
  selected={@selected_date}
  min={Date.utc_today()}
  available_dates={@available_dates}
  on_select="select-due-date"
  on_prev_month="previous-calendar-month"
  on_next_month="next-calendar-month"
  target={@myself}
/>
```

```elixir
def handle_event("select-due-date", %{"date" => date}, socket) do
  {:noreply, assign(socket, selected_date: Date.from_iso8601!(date))}
end

def handle_event("previous-calendar-month", _params, socket) do
  {:noreply, update(socket, :calendar_month, &previous_month/1)}
end

def handle_event("next-calendar-month", _params, socket) do
  {:noreply, update(socket, :calendar_month, &next_month/1)}
end
```

### Rating

Use for interactive ratings or readonly scores.

```heex
<.rating field={@form[:score]} label="Score" max={5} />
<.rating id="average-score" value={4} max={5} readonly label="Average score" />
```

### Fieldset

Use to group related controls and shared validation.

```heex
<.fieldset
  legend="Notification channels"
  description="Choose where the workspace sends updates."
>
  <.input field={@form[:email_notifications]} type="checkbox" label="Email" />
  <.input field={@form[:sms_notifications]} type="checkbox" label="SMS" />
</.fieldset>
```

### File Input

Use with LiveView uploads or a normal multipart form.

```heex
<.file_input
  field={@form[:avatar]}
  label="Avatar"
  accept="image/png,image/jpeg"
  description="PNG or JPEG up to 2MB."
/>
```

### Translate Error

`translate_error/1` delegates to `ExoUI.Utils.translate_error/1`. Configure
the function used by form components:

```elixir
config :exo_ui, :translate_function, {MyAppWeb.CoreComponents, :translate_error}
```

## Overlays And Menus

### Modal

Use `show_modal/1` and `hide_modal/1` for client-side open/close commands, or
drive `show` from LiveView state when the server owns the lifecycle. Provide a
title, or pass `label` when there is no visible title.

```heex
<.button phx-click={show_modal("invite-modal")}>Invite member</.button>

<.modal
  id="invite-modal"
  on_cancel={JS.push("close-invite-modal")}
>
  <:title>Invite member</:title>
  <p>Send an invitation to this workspace.</p>
  <:actions>
    <.button variant="ghost" phx-click={hide_modal("invite-modal")}>Cancel</.button>
    <.button phx-click={JS.push("send-invite") |> hide_modal("invite-modal")}>
      Send invite
    </.button>
  </:actions>
</.modal>
```

### Confirm Modal

Use for destructive or irreversible confirmation flows.

```heex
<.confirm_modal
  id="delete-project"
  show={@delete_modal_open?}
  title="Delete project"
  message="This permanently removes the project and all related records."
  confirm_text="Delete"
  cancel_text="Keep project"
  variant="danger"
  on_confirm={JS.push("delete-project")}
  on_cancel={JS.push("close-delete-modal")}
/>
```

When the server must validate before closing, keep the confirm action open and
close it later from the LiveView:

```heex
<.confirm_modal
  id="archive-project"
  show={@archive_modal_open?}
  title="Archive project"
  message="The archive request will be validated before the dialog closes."
  confirm_text="Validate archive"
  close_on_confirm={false}
  on_confirm={JS.push("validate-archive")}
/>
```

### Popover

Use for anchored non-modal content. The browser Popover API and ExoUI hooks
handle open state and placement.

```heex
<.popover id="project-help" side="bottom" align="start">
  <:trigger>
    <.button variant="ghost">Help</.button>
  </:trigger>

  <div style="padding: 0.75rem; max-width: 18rem">
    Projects group issues, files, and team permissions.
  </div>
</.popover>
```

### Dropdown Menu

Use for action menus. The slot supports labels, separators, links, disabled
items, icons, shortcuts, and danger variants.

```heex
<.dropdown_menu id="project-actions">
  <:trigger>
    <.button variant="outline">Actions</.button>
  </:trigger>

  <:entry type="label">Project</:entry>
  <:entry click="rename-project" icon="pencil">Rename</:entry>
  <:entry patch={~p"/projects/#{@project}/settings"} icon="settings">Settings</:entry>
  <:entry type="separator" />
  <:entry click="archive-project" icon="archive" shortcut="A">Archive</:entry>
  <:entry click="delete-project" icon="trash" variant="danger">Delete</:entry>
</.dropdown_menu>
```

`dropdown/1` is deprecated and kept only for older call sites:

```heex
<.dropdown>
  <:trigger><.button variant="ghost">Legacy actions</.button></:trigger>
  <:item>Edit</:item>
  <:item>Archive</:item>
</.dropdown>
```

### Tooltip

Use for concise, non-interactive help.

```heex
<.tooltip id="api-key-help" text="Only shown once after generation.">
  <.icon name="circle-help" />
</.tooltip>

<.tooltip id="billing-help" side="right">
  Billing cycle
  <:content>Annual billing includes the current workspace discount.</:content>
</.tooltip>
```

### Collapsible

Use for disclosure sections with one trigger and one content region.

```heex
<.collapsible id="advanced-filters" open={false}>
  <:trigger>Advanced filters</:trigger>
  <div>
    <.input name="filters[owner]" label="Owner" />
    <.input name="filters[tag]" label="Tag" />
  </div>
</.collapsible>
```

### Drawer

Drawers slide from the left or right edge and expose public `show_drawer/1` and
`hide_drawer/1` helpers.

```heex
<.button phx-click={show_drawer("project-drawer")}>Open drawer</.button>

<.drawer id="project-drawer" side="right" on_cancel={JS.push("drawer-cancelled")}>
  <:title>Project details</:title>
  <p>Use drawers for secondary task panels.</p>
</.drawer>
```

### Sheet

Sheets can open from any edge. Use them for filters, editors, or mobile panels.

```heex
<.button phx-click={show_sheet("filters-sheet")}>Filters</.button>

<.sheet id="filters-sheet" side="right" on_cancel={JS.push("close-filters")}>
  <:title>Filters</:title>
  <.select id="filter-status" name="filters[status]" label="Status">
    <:option value="open">Open</:option>
    <:option value="closed">Closed</:option>
  </.select>
  <:footer>
    <.button variant="ghost" phx-click={hide_sheet("filters-sheet")}>Cancel</.button>
    <.button phx-click={JS.push("apply-filters") |> hide_sheet("filters-sheet")}>Apply</.button>
  </:footer>
</.sheet>
```

### Stacked Overlays

Modal, sheet, and drawer roots share the same overlay registry. When one opens
another, only the topmost overlay remains interactive; lower overlays stay
visible but become inert and `aria-hidden` until they return to the top.

```heex
<.button phx-click={show_modal("review-modal")}>Review deployment</.button>

<.modal id="review-modal">
  <:title>Review deployment</:title>
  <p>Review the release before opening secondary panels.</p>
  <:actions>
    <.button variant="outline" phx-click={show_sheet("audit-sheet")}>
      Open audit sheet
    </.button>
  </:actions>
</.modal>

<.sheet id="audit-sheet" side="right">
  <:title>Audit trail</:title>
  <p>Audit details stay above the modal until the sheet closes.</p>
  <:footer>
    <.button phx-click={hide_sheet("audit-sheet")}>Done</.button>
  </:footer>
</.sheet>
```

For deeper workflows, put the editing form in the topmost overlay. The overlay
registry keeps the modal and sheet visible but inert, while the drawer body owns
scroll for long content.

```heex
<.sheet id="audit-sheet" side="right">
  <:title>Audit trail</:title>
  <.button variant="outline" phx-click={show_drawer("review-drawer")}>
    Open review form
  </.button>
</.sheet>

<.drawer id="review-drawer" side="right">
  <:title>Review notes</:title>
  <.input id="release-name" name="release[name]" label="Release name" />
  <.input
    id="risk-owner"
    name="release[risk_owner]"
    label="Risk owner"
    errors={["Risk owner is required before rollback approval."]}
  />
  <.input id="release-notes" name="release[notes]" type="textarea" label="Notes" rows="5" />
  <fieldset>
    <legend>Long review checklist</legend>
    <label :for={index <- 1..12}>
      <input type="checkbox" name={"release[check_#{index}]"} />
      Checkpoint {index}
    </label>
  </fieldset>
  <.button type="button" variant="danger" phx-click={show_modal("rollback-confirm")}>
    Request rollback
  </.button>
  <.button type="button" phx-click={hide_drawer("review-drawer")}>Save review</.button>
</.drawer>

<.confirm_modal
  id="rollback-confirm"
  title="Rollback deployment"
  message="The rollback request stays open until server-side validation succeeds."
  confirm_text="Validate rollback"
  cancel_text="Keep reviewing"
  variant="danger"
  close_on_confirm={false}
  on_confirm={JS.push("validate-rollback")}
/>
```

### Hover Card

Use for richer preview content on hover/focus.

```heex
<.hover_card id="owner-card" side="bottom" align="start">
  <:trigger>
    <.avatar name={@owner.name} src={@owner.avatar_url} />
  </:trigger>

  <strong>{@owner.name}</strong>
  <p>{@owner.title}</p>
</.hover_card>
```

### Context Menu

Use for right-click menus over a specific region.

```heex
<.context_menu id="file-context" label="File actions">
  <:trigger>
    <div data-file-id={@file.id}>{@file.name}</div>
  </:trigger>

  <:item label="Open" />
  <:item label="Rename" />
  <:item label="Separator" separator />
  <:item label="Delete" />
</.context_menu>
```

### Command Palette

Use for global search/action surfaces. It can be opened through the configured
keyboard shortcut or with the public `show_command_palette/1` helper. The
default shortcut is `mod+k`, which maps to Cmd+K on macOS and Ctrl+K elsewhere.
When opened from a trigger, the hook keeps focus inside the dialog and restores
focus to the trigger after Escape, backdrop click, or command selection closes it.

```heex
<.button variant="outline" phx-click={show_command_palette("global-command")}>
  Search
</.button>

<.command_palette id="global-command" placeholder="Search commands..." shortcut="mod+k">
  <:item label="Projects" value="projects" shortcut="G P" click="goto-projects" />
  <:item label="New project" value="new-project" shortcut="N P" click="new-project" />
  <:item label="Billing settings" value="billing" click="goto-billing" />
  <:empty>No matching commands.</:empty>
</.command_palette>
```

Use a custom shortcut for local command surfaces, or `shortcut={nil}` when the
palette should only open from your own trigger:

```heex
<.command_palette id="project-jump" shortcut="ctrl+j" placeholder="Jump to...">
  <:item label="Jump to dashboard" value="dashboard" />
  <:item label="Jump to projects" value="projects" />
</.command_palette>

<.command_palette id="manual-command" shortcut={nil}>
  <:item label="Run import" value="import" />
</.command_palette>
```

For local command surfaces opened from another overlay, keep the palette root as
a sibling of the sheet/drawer roots and let command items open the next overlay:

```heex
<.sheet id="filters-sheet" side="right">
  <:title>Segment filters</:title>
  <.input id="segment-query" name="filters[query]" label="Search segment" />
  <.button type="button" phx-click={show_command_palette("filter-command")}>
    Open filter commands
  </.button>
</.sheet>

<.command_palette id="filter-command" shortcut="ctrl+shift+p">
  <:item
    label="Open risk drawer"
    value="risk-drawer"
    click={show_drawer("risk-filter-drawer")}
  />
</.command_palette>

<.drawer id="risk-filter-drawer" side="right">
  <:title>Risk filters</:title>
  <.input id="risk-owner" name="filters[risk_owner]" label="Risk owner" />
  <.button type="button" variant="danger" phx-click={show_modal("archive-segment")}>
    Archive segment
  </.button>
</.drawer>

<.confirm_modal
  id="archive-segment"
  title="Archive filtered segment"
  message="The server validates the active filter set before closing."
  confirm_text="Validate archive"
  close_on_confirm={false}
/>
```

### Menubar

Use for app-style horizontal menus.

```heex
<.menubar id="editor-menu">
  <:menu label="File">
    <button type="button" role="menuitem" phx-click="new-file">New file</button>
    <button type="button" role="menuitem" phx-click="save-file">Save</button>
  </:menu>
  <:menu label="Edit">
    <button type="button" role="menuitem" phx-click="undo">Undo</button>
    <button type="button" role="menuitem" phx-click="redo">Redo</button>
  </:menu>
</.menubar>
```

## Feedback

### Flash And Flash Group

Use `flash_group/1` in your root layout and `flash/1` for custom locations.

```heex
<.flash_group flash={@flash} />

<.flash kind={:success} title="Saved">
  Project settings were saved.
</.flash>
```

### Toast Container

Use with LiveView streams. Toast items need `kind`, `message`, and optional
`title`.

```heex
<.toast_container
  id="app-toasts"
  toasts={@streams.toasts}
  placement="bottom-right"
/>
```

```elixir
socket =
  stream_insert(socket, :toasts, %{
    id: System.unique_integer([:positive]),
    kind: :success,
    title: "Saved",
    message: "Project updated."
  })
```

### Alert

Use for persistent banners and inline callouts.

```heex
<.alert kind={:warning} title="Payment required">
  Add a payment method before the next billing cycle.
  <:action>
    <.button variant="outline" navigate={~p"/billing"}>Billing</.button>
  </:action>
</.alert>
```

### Progress

Use for linear progress.

```heex
<.progress value={72} max={100} label="Upload progress" />
<.progress value={3} max={5} aria_label="Completed onboarding steps" />
```

### Radial Progress

Use for compact circular progress.

```heex
<.radial_progress value={64} max={100} size="lg" aria_label="Storage used" />
<.radial_progress value={3} max={5} show_value={false}>
  3/5
</.radial_progress>
```

## Data Display And Navigation

### Table

Use with lists or LiveView streams. Pass `row_id` for stable DOM IDs and
`row_label` for clickable rows.

```heex
<.table
  id="users"
  rows={@users}
  row_id={fn user -> "user-#{user.id}" end}
  row_label={fn user -> "Open user #{user.name}" end}
>
  <:col :let={user} label="Name">{user.name}</:col>
  <:col :let={user} label="Role">{user.role}</:col>
  <:col :let={user} label="Status">
    <.badge variant={if user.active, do: "success", else: "secondary"}>
      {if user.active, do: "Active", else: "Inactive"}
    </.badge>
  </:col>
  <:action :let={user}>
    <.button size="sm" variant="ghost" patch={~p"/users/#{user}"}>View</.button>
  </:action>
  <:empty>No users found.</:empty>
</.table>
```

### List

Use for title/value detail groups.

```heex
<.list>
  <:item title="Owner">{@project.owner.name}</:item>
  <:item title="Created">{Calendar.strftime(@project.inserted_at, "%b %d, %Y")}</:item>
  <:item title="Status"><.badge variant="success">Active</.badge></:item>
</.list>
```

### Content Card

Use as the base content card primitive.

```heex
<.content_card title="Recent activity">
  <:action>
    <.button size="sm" variant="ghost" navigate={~p"/activity"}>View all</.button>
  </:action>

  <.list>
    <:item title="Deploy">Production deploy completed.</:item>
    <:item title="Billing">Invoice generated.</:item>
  </.list>
</.content_card>
```

### Stat Card And Metric Card

Use for dashboard metrics.

```heex
<.stat_card
  title="Revenue"
  value="$42,300"
  icon="$"
  trend="+12%"
  trend_direction="up"
  subtitle="Compared with last month"
/>

<.metric_card title="Conversion" value="8.4%" subtitle="Last 7 days">
  <:trailing>
    <.badge variant="success">+0.8%</.badge>
  </:trailing>
</.metric_card>
```

### Wizard Sidebar

Use when users move through a multi-step workflow.

```heex
<.wizard_sidebar
  steps={[
    %{id: "account", label: "Account", status: :completed},
    %{id: "billing", label: "Billing", status: :current},
    %{id: "confirm", label: "Confirm", status: :upcoming}
  ]}
  on_click="goto-step"
/>
```

### Breadcrumb

Use for hierarchical navigation.

```heex
<.breadcrumb>
  <:item navigate={~p"/"}>Home</:item>
  <:item navigate={~p"/projects"}>Projects</:item>
  <:item current>{@project.name}</:item>
</.breadcrumb>
```

### Tabs

Use `id` when you want keyboard handling through the `ExoTabs` hook. Use
`click`, `patch`, or `navigate` per tab.

```heex
<.tabs id="project-tabs" active={@active_tab} aria_label="Project sections">
  <:tab id="overview" label="Overview" click="change-tab" />
  <:tab id="activity" label="Activity" click="change-tab" />
  <:tab id="settings" label="Settings" patch={~p"/projects/#{@project}/settings"} />

  <:panel tab="overview">Overview content</:panel>
  <:panel tab="activity">Activity content</:panel>
  <:panel tab="settings">Settings content</:panel>
</.tabs>
```

### Pagination

Use a path function so the component stays route-agnostic.

```heex
<.pagination
  page={@page}
  total_pages={@total_pages}
  patch_fn={fn page -> ~p"/projects?page=#{page}" end}
/>
```

### Steps

Use for compact progress display.

```heex
<.steps aria_label="Checkout progress">
  <:step title="Cart" status="complete" />
  <:step title="Shipping" status="current" description="Choose address" />
  <:step title="Payment" status="upcoming" />
</.steps>
```

### Timeline

Use for chronological event lists.

```heex
<.timeline aria_label="Order timeline">
  <:event title="Order placed" time="Mar 20, 2026" datetime="2026-03-20" variant="primary">
    The order was created.
  </:event>
  <:event title="Processing" time="Mar 21, 2026" datetime="2026-03-21" current>
    Warehouse processing started.
  </:event>
</.timeline>
```

### Carousel

Use for horizontal content galleries. The hook handles keyboard navigation and
controls.

```heex
<.carousel id="feature-carousel" aria_label="Featured projects" loop>
  <:item label="Analytics project">
    <.content_card title="Analytics">Weekly dashboard refresh.</.content_card>
  </:item>
  <:item label="Mobile project">
    <.content_card title="Mobile">New onboarding flow.</.content_card>
  </:item>
</.carousel>
```

### Accordion

Use for FAQ and detail sections. `variant="plus"` enables the plus indicator
style from the default theme.

```heex
<.accordion id="faq" type="single" collapsible variant="plus">
  <:item title="Can I invite guests?" open>
    Yes, guests can be invited per workspace.
  </:item>
  <:item title="Can I export data?">
    Exports are available from project settings.
  </:item>
</.accordion>
```

### Hero

Use for page-level banners and first-viewport product messaging.

```heex
<.hero>
  <:title>Project operations</:title>
  <:subtitle>Track work, owners, and delivery health from one LiveView.</:subtitle>
  <:actions>
    <.button navigate={~p"/projects/new"}>Create project</.button>
    <.button variant="outline" navigate={~p"/projects"}>Browse projects</.button>
  </:actions>
</.hero>
```

### Chat Bubble

Use for conversation views.

```heex
<.chat_bubble side="start">
  <:avatar><.avatar name="Ada Lovelace" size="sm" /></:avatar>
  <:header>Ada <span>09:42</span></:header>
  The deployment finished successfully.
  <:footer>Delivered</:footer>
</.chat_bubble>

<.chat_bubble side="end">
  Thanks, I will review the release notes.
</.chat_bubble>
```

## Charts

All chart components render SVG and accept `aria_label`, `description`, and
`empty_text` where applicable. Provide `description` when the chart communicates
important data that is not available elsewhere on the page.

### Primitive Charts

```heex
<.trend_badge current={112} previous={98} aria_label="Revenue trend" />

<.sparkline
  data={[12, 18, 14, 24, 28, 32]}
  aria_label="Weekly signups trend"
  description="Weekly signups rose from 12 to 32."
/>

<.progress_bar label="Desktop" count={186} max={305} />
```

### Bar Charts

Single-series bar charts use `{label, value}` tuples.

```heex
<.bar_chart data={@monthly_visitors} height={260} />
<.horizontal_bar_chart data={@monthly_visitors} height={260} />
<.bar_chart_label data={@monthly_visitors} height={260} />
<.bar_chart_negative data={@monthly_variance} height={260} />
```

Two-series bar charts use `{label, value1, value2}` tuples:

```heex
<.bar_chart_multiple
  data={[
    {"January", 4200, 2400},
    {"February", 5800, 3200},
    {"March", 5100, 2900}
  ]}
  height={260}
/>
```

Stacked bars use `{label, values_by_key}` tuples plus colors:

```heex
<.stacked_bar_chart
  data={[
    {"January", %{"Desktop" => 186, "Mobile" => 80}},
    {"February", %{"Desktop" => 305, "Mobile" => 200}},
    {"March", %{"Desktop" => 237, "Mobile" => 120}}
  ]}
  colors={%{
    "Desktop" => "var(--exo-primary)",
    "Mobile" => "color-mix(in oklch, var(--exo-primary) 50%, transparent)"
  }}
  legend_keys={["Desktop", "Mobile"]}
  height={280}
/>
```

### Line And Area Charts

```heex
<.line_chart data={@monthly_visitors} height={260} />

<.line_chart_multiple
  data={[
    {"January", 4200, 2400},
    {"February", 5800, 3200},
    {"March", 5100, 2900}
  ]}
  height={260}
/>

<.area_chart id="visitors-area" data={@monthly_visitors} height={260} />
<.area_chart_stacked id="devices-area" data={@device_visitors} height={260} />
```

### Radial Charts

Pie, donut, donut-with-text, radial, and radar charts all support empty states
and accessible descriptions.

```heex
<.pie_chart data={@browser_share} size={260} />
<.donut_chart data={@browser_share} size={260} inner_radius={70} />
<.donut_chart_text
  data={@browser_share}
  size={260}
  center_value="925"
  center_label="Visitors"
/>
<.radial_chart data={@browser_share} size={280} />
<.radar_chart data={@monthly_visitors} size={280} />
```

Recommended data setup:

```elixir
assign(socket,
  monthly_visitors: [
    {"January", 4200},
    {"February", 5800},
    {"March", 5100}
  ],
  monthly_variance: [
    {"January", 4200},
    {"February", -3800},
    {"March", 5100}
  ],
  device_visitors: [
    {"January", 4200, 2400},
    {"February", 5800, 3200},
    {"March", 5100, 2900}
  ],
  browser_share: [
    {"Chrome", 275, "hsl(220, 70%, 50%)"},
    {"Safari", 200, "hsl(160, 60%, 45%)"},
    {"Firefox", 187, "hsl(30, 80%, 55%)"}
  ]
)
```

## Layouts

### Sidebar Layout

Use for app shells with sidebar navigation, topbar, footer, and page content.

```heex
<.sidebar_layout id="app-shell" content_class="page-content">
  <:brand>
    <.link navigate={~p"/"}>Acme</.link>
  </:brand>

  <:nav>
    <ul>
      <.sidebar_item href={~p"/"} icon="layout-dashboard" label="Dashboard" active={@active == :dashboard} />
      <.sidebar_item href={~p"/projects"} icon="folder" label="Projects" active={@active == :projects} badge={3} />
      <.sidebar_item href={~p"/settings"} icon="settings" label="Settings" />
    </ul>
  </:nav>

  <:topbar_start>
    <.breadcrumb>
      <:item navigate={~p"/"}>Home</:item>
      <:item current>Projects</:item>
    </.breadcrumb>
  </:topbar_start>

  <:topbar_end>
    <.theme_toggle id="shell-theme" />
  </:topbar_end>

  <:footer>
    <.avatar name={@current_user.name} size="sm" />
  </:footer>

  <.header>
    Projects
    <:subtitle>Workspace project health and ownership.</:subtitle>
  </.header>
</.sidebar_layout>
```

### Sidebar Item

`sidebar_item/1` is designed for use inside `sidebar_layout/1`, but it can also
be used in custom sidebar markup.

```heex
<.sidebar_item
  href={~p"/reports"}
  icon="chart-column"
  label="Reports"
  active={@active == :reports}
  badge={12}
/>
```

## Current Parity Notes

ExoUI now has Storybook and visual capture coverage for the public component
surface. The main remaining shadcn/daisyUI-style parity gaps are:

- Modal can be opened with public JS helpers or parent LiveView state; flows
  that must validate on the server before closing can use
  `close_on_confirm={false}` and close later from LiveView.
- Modal, sheet, and drawer stacking is browser-tested, including lower overlay
  inerting while another overlay is topmost.
- Command palette shortcuts are configurable; use `shortcut={nil}` for
  manual-only palettes when the host app owns keyboard routing. Trigger-driven
  palettes restore focus to their opener on close.
- `input type="select"` and `dropdown/1` are legacy compatibility paths. Prefer
  `select/1` and `dropdown_menu/1`.
- Advanced composition patterns such as Radix-style `asChild` are not part of
  the current LiveView API.
- Some decorative icon props, such as `empty_state.icon` and `stat_card.icon`,
  are plain rendered content today rather than dedicated icon slots.
