# Table Recipes

Use this pattern when tables need accessible row identity, aligned numeric
columns, row actions, empty states, and server-owned interaction state.

## Structure

```heex
<.table
  id="accounts-table"
  rows={@accounts}
  row_id={&"account-#{&1.id}"}
  row_label={&"Open #{&1.name}"}
  row_click={fn account ->
    JS.push("open-account", value: %{id: account.id})
  end}
  caption="Account review queue"
  empty_label="No accounts match the current filters."
  loading={@loading_accounts?}
  loading_label="Loading accounts"
  actions_label="Row actions"
>
  <:col :let={account} label="Account">{account.name}</:col>
  <:col :let={account} label="Owner">{account.owner}</:col>
  <:col :let={account} label="Status" align="center">
    <.badge variant={status_variant(account.status)}>{account.status}</.badge>
  </:col>
  <:col :let={account} label="ARR" align="right">
    {format_arr(account.arr)}
  </:col>
  <:action :let={account}>
    <.button type="button" size="sm" phx-click="review-account" phx-value-id={account.id}>
      Review {account.name}
    </.button>
  </:action>
  <:empty>
    <.empty_state title="No matching accounts" description="Adjust filters to restore rows." />
  </:empty>
  <:loading_state>
    Refreshing account rows...
  </:loading_state>
</.table>
```

## Event Shape

```elixir
def handle_event("open-account", %{"id" => id}, socket) do
  {:noreply, assign(socket, selected_id: id)}
end

def handle_event("review-account", %{"id" => id}, socket) do
  {:noreply, update(socket, :accounts, &mark_reviewed(&1, id))}
end
```

## Rules

- Always pass a stable `id` and `row_id` for dynamic tables.
- Use `caption` for screen-reader table names; tests can target it through
  `getByRole("table", name: ...)`.
- Use `row_label` when row cells are clickable so assistive tech gets an
  action-oriented label.
- `row_click` is attached to the row, not duplicated across every data cell;
  keep per-row navigation there and put explicit row actions in the `:action`
  slot.
- Keep row actions in the `:action` slot instead of hiding buttons inside data
  columns.
- Use `align="right"` for numeric values and `align="center"` for compact
  status columns.
- Use `loading` with `loading_label` or `:loading_state` while a server-owned
  filter, sort, or pagination request is refreshing rows; the table exposes
  `aria-busy` and a polite status row.
- Provide either `empty_label` or an `:empty` slot for zero-row states.
- Keep filtering, selected row, reviewed/escalated flags, and empty states in
  server assigns; the table should render from state instead of mutating DOM.
- Browser coverage should verify captions, row IDs, row labels, aligned cells,
  action slot buttons, filtered row counts, loading status, empty rendering, and
  reset behavior.
