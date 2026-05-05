# Dashboard Drilldown Workflows

Use this pattern when a dashboard metric needs to become a server-owned
drilldown: metric filter, visible rows, chart context, detail drawer, and
review action state all stay in LiveView assigns.

## Structure

```heex
<.button
  :for={metric <- @metrics}
  type="button"
  phx-click="filter-dashboard"
  phx-value-metric={metric.id}
  phx-target={@myself}
  aria-pressed={metric.id == @active_metric}
>
  <.icon name={metric.icon} />
  {metric.label}
</.button>

<.table
  id="dashboard-drilldown-table"
  rows={@visible_accounts}
  row_id={&account_row_id/1}
  row_label={&account_row_label/1}
  empty_label="No accounts match the selected dashboard metric."
>
  <:col :let={account} label="Account">{account.name}</:col>
  <:col :let={account} label="Status">
    <.badge variant={account.status_variant}>{account.status}</.badge>
  </:col>
  <:col :let={account} label="Risk" align="right">{account.risk}</:col>
  <:col :let={account} label="Action" align="right">
    <.button type="button" phx-click={open_account(account.id, @myself)}>
      Open details
    </.button>
  </:col>
</.table>

<.drawer id="account-detail-drawer" side="right">
  <:title>{@selected_account.name} details</:title>
  <.list>
    <:item title="Owner">{@selected_account.owner}</:item>
    <:item title="ARR">{@selected_account.arr}</:item>
    <:item title="Next step">{@selected_account.next_step}</:item>
  </.list>
  <.progress value={@selected_account.health} label="Renewal health" />
</.drawer>
```

## Event Shape

```elixir
def handle_event("filter-dashboard", %{"metric" => metric}, socket) do
  {:noreply,
   assign(socket,
     active_metric: metric,
     selected_account_id: nil,
     drilldown_count: socket.assigns.drilldown_count + 1
   )}
end

def handle_event("open-dashboard-account", %{"id" => id}, socket) do
  {:noreply, assign(socket, selected_account_id: id)}
end
```

## Rules

- Treat metric clicks as filters, not navigation-only styling.
- Keep active metric, visible rows, selected account, reviewed IDs, and counters
  in server state.
- Mark metric controls with `aria-pressed` so the active drilldown is exposed.
- Keep the detail drawer mounted but closed until a row action selects a record.
- Mirror state into stable `data-*` attributes so browser tests and visual
  captures can prove the flow without private implementation knowledge.
- Browser coverage should verify metric filtering, row counts, drawer open
  state, selected detail content, review updates, and reset behavior.
