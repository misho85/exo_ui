# Bulk Edit Workflows

Use this pattern when users can filter a server-owned table, select the visible
rows, and apply a successful bulk update without leaving the page.

## Structure

```heex
<ExoUI.Components.Form.form
  for={%{}}
  as={:filters}
  phx-change="filter-bulk-edit"
  phx-target={@myself}
>
  <ExoUI.Components.Form.input
    id="bulk-edit-status-filter"
    name="filters[status]"
    type="select"
    label="Status filter"
    value={@status}
    options={[{"All statuses", "all"}, {"Needs review", "needs_review"}]}
  />
</ExoUI.Components.Form.form>

<.button type="button" phx-click="select-filtered" phx-target={@myself}>
  Select filtered
</.button>

<.table
  id="bulk-edit-table"
  rows={@filtered_records}
  row_id={&row_id/1}
  row_label={&row_label/1}
  empty_label="No accounts remain in the active bulk edit filter."
>
  <:col :let={record} label="Select">
    <ExoUI.Components.Form.input
      id={"bulk-select-#{record.id}"}
      type="checkbox"
      name={"bulk[selected][#{record.id}]"}
      label={"Select #{record.name}"}
      checked={MapSet.member?(@selected_ids, record.id)}
      phx-click="toggle-selection"
      phx-value-id={record.id}
      phx-target={@myself}
    />
  </:col>
  <:col :let={record} label="Account">{record.name}</:col>
  <:col :let={record} label="Status">{record.status}</:col>
</.table>

<ExoUI.Components.Form.form
  for={%{}}
  as={:bulk_edit}
  phx-change="change-bulk-edit"
  phx-target={@myself}
>
  <ExoUI.Components.Form.input
    id="bulk-edit-owner"
    name="bulk_edit[owner]"
    type="select"
    label="New owner"
    value={@edit_owner}
    options={[{"Mina", "Mina"}, {"Sara", "Sara"}]}
  />
  <.button type="button" phx-click="apply-bulk-edit" phx-target={@myself}>
    Apply bulk edit
  </.button>
</ExoUI.Components.Form.form>
```

## Event Shape

```elixir
def handle_event("apply-bulk-edit", _params, socket) do
  records =
    Enum.map(socket.assigns.records, fn record ->
      if MapSet.member?(socket.assigns.selected_ids, record.id) do
        %{record | owner: socket.assigns.edit_owner, status: "Ready"}
      else
        record
      end
    end)

  {:noreply,
   assign(socket,
     records: records,
     selected_ids: MapSet.new(),
     edit_state: "applied",
     updated_count: MapSet.size(socket.assigns.selected_ids)
   )}
end
```

## Rules

- Clear row selection when filters change so hidden rows are not edited by
  accident.
- Disable the apply action until at least one visible row is selected.
- Keep the bulk edit form state on the server when permissions or table data
  are server-authoritative.
- After a successful edit, clear selection and expose `updated_count` in a
  polite status region.
- Keep a table empty state visible because a successful edit can remove all rows
  from the current filter.
- Browser coverage should verify filtering, selecting, applying, selection
  clearing, empty state, and updated rows after clearing filters.
