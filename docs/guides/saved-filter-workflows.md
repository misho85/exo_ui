# Saved Filter Workflows

Use this pattern when a table has server-owned filters that users can save and
reapply without losing the current LiveView state.

## Structure

```heex
<ExoUI.Components.Form.form
  for={%{}}
  as={:filters}
  phx-change="change-filters"
  phx-target={@myself}
>
  <ExoUI.Components.Form.input
    id="account-query"
    name="filters[query]"
    label="Search accounts"
    value={@query}
  />
  <ExoUI.Components.Form.select
    id="account-status"
    name="filters[status]"
    label="Status"
    value={@status}
    options={[{"All statuses", "all"}, {"Blocked", "blocked"}]}
  />
</ExoUI.Components.Form.form>

<.button type="button" phx-click="save-current-filter" phx-target={@myself}>
  Save current filter
</.button>

<.button
  :for={filter <- @saved_filters}
  type="button"
  phx-click="apply-saved-filter"
  phx-value-id={filter.id}
  phx-target={@myself}
  aria-pressed={filter.id == @active_filter_id}
>
  {filter.name}
</.button>

<.table
  id="accounts-table"
  rows={@filtered_records}
  row_id={&row_id/1}
  row_label={&row_label/1}
  empty_label="No accounts match the saved filter."
>
  <:col :let={record} label="Account">{record.name}</:col>
  <:col :let={record} label="Status">{record.status}</:col>
</.table>
```

## Event Shape

```elixir
def handle_event("change-filters", %{"filters" => params}, socket) do
  {:noreply,
   assign(socket,
     query: string_param(params, "query", ""),
     status: string_param(params, "status", "all"),
     active_filter_id: nil
   )}
end

def handle_event("apply-saved-filter", %{"id" => id}, socket) do
  filter = Enum.find(socket.assigns.saved_filters, &(&1.id == id))

  {:noreply,
   assign(socket,
     query: filter.query,
     status: filter.status,
     active_filter_id: filter.id
   )}
end
```

## Rules

- Keep filters, saved views, and active filter IDs in server state when table
  data is server-authoritative.
- Reset `active_filter_id` when a user edits filters manually.
- Use real buttons for saved views and set `aria-pressed` on the active view.
- Keep an explicit empty state on tables so aggressive saved filters do not
  render a visually blank surface.
- Expose a polite status region when the visible row count or active saved view
  changes.
- Browser coverage should verify manual filter edits, row counts, saved view
  creation, clearing filters, reapplying a saved view, and empty/table states.
