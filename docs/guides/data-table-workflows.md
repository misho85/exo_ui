# Data Table Workflows

Use this pattern when table state is server-owned: filtering, sorting, page
size, pagination, and empty states should all be derived from assigns.

## Structure

```heex
<ExoUI.Components.Form.form
  for={%{}}
  as={:table}
  phx-change="change-data-table"
  phx-target={@myself}
>
  <ExoUI.Components.Form.input
    id="table-query"
    name="table[query]"
    label="Search table"
    value={@query}
  />
  <ExoUI.Components.Form.select
    id="table-sort"
    name="table[sort]"
    label="Sort"
    value={@sort}
    options={[{"ARR high to low", "arr_desc"}, {"Risk high to low", "risk_desc"}]}
  />
</ExoUI.Components.Form.form>

<.table
  id="accounts-table"
  rows={@paged_rows}
  row_id={&row_id/1}
  row_label={&row_label/1}
  empty_label="No accounts match the current table controls."
>
  <:col :let={record} label="Account">{record.name}</:col>
  <:col :let={record} label="Status">{record.status}</:col>
  <:col :let={record} label="ARR" align="right">{record.arr}</:col>
</.table>

<.button type="button" phx-click="previous-page" phx-target={@myself}>
  Previous page
</.button>
<.button type="button" phx-click="next-page" phx-target={@myself}>
  Next page
</.button>
```

## Event Shape

```elixir
def handle_event("change-data-table", %{"table" => params}, socket) do
  {:noreply,
   assign(socket,
     query: string_param(params, "query", ""),
     sort: string_param(params, "sort", "arr_desc"),
     page_size: int_param(params, "page_size", 25),
     page: 1
   )}
end

def handle_event("next-page", _params, socket) do
  {:noreply, assign(socket, page: min(socket.assigns.page + 1, page_count(socket.assigns)))}
end
```

## Rules

- Keep filter, sort, page size, and current page in server state when data is
  server-authoritative.
- Reset `page` to `1` whenever filters, sort, or page size changes.
- Clamp page changes to the valid page range.
- Derive visible rows from `records -> filter -> sort -> paginate` in that
  order.
- Keep a table empty state visible for filters that remove all rows.
- Expose a polite status region with total count, page count, and visible row
  count.
- Browser coverage should verify filtering, sorting, page-size changes,
  next/previous paging, empty state, and recovery from an empty filter.
