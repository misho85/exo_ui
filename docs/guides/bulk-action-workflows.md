# Bulk Action Workflows

Use this pattern for operational tables where users filter a queue, select
multiple rows, and run a guarded server action.

## Structure

```heex
<.form for={%{}} as={:filters} phx-change="filter-queue">
  <.input name="filters[query]" label="Search queue" value={@query} />
  <.input
    name="filters[status]"
    type="select"
    label="Status"
    value={@status}
    options={[{"All statuses", "all"}, {"Blocked", "blocked"}]}
  />
</.form>

<.table id="accounts" rows={@filtered_accounts} row_id={&"account-#{&1.id}"}>
  <:col :let={account} label="Select">
    <.input
      id={"select-#{account.id}"}
      type="checkbox"
      name={"bulk[selected][#{account.id}]"}
      label={"Select #{account.name}"}
      checked={MapSet.member?(@selected_ids, account.id)}
      phx-click="toggle-selection"
      phx-value-id={account.id}
    />
  </:col>
  <:col :let={account} label="Account">{account.name}</:col>
  <:col :let={account} label="Status">
    <.badge variant={account.status_variant}>{account.status}</.badge>
  </:col>
</.table>

<.button
  type="button"
  variant="danger"
  disabled={MapSet.size(@selected_ids) == 0}
  phx-click={queue_bulk_action(@myself)}
>
  Queue bulk archive
</.button>

<.confirm_modal
  id="bulk-confirm"
  title="Archive selected accounts"
  message="The server validates every selected row before the destructive action completes."
  confirm_text="Validate bulk archive"
  variant="danger"
  close_on_confirm={false}
  on_confirm={JS.push("validate-bulk-action")}
/>
```

```elixir
defp queue_bulk_action(target) do
  JS.push("queue-bulk-action", target: target)
  |> JS.set_attribute({"data-state", "open"}, to: "#bulk-confirm")
  |> JS.set_attribute({"aria-hidden", "false"}, to: "#bulk-confirm")
  |> JS.remove_attribute("inert", to: "#bulk-confirm")
  |> JS.show(to: "#bulk-confirm")
  |> JS.focus_first(to: "#bulk-confirm [data-exo=\"modal-content\"]")
end
```

## Rules

- Keep filter state server-owned when it changes which rows are actionable.
- Render row selection as real checkboxes with labels that include the row name.
- Disable bulk action buttons until at least one row is selected.
- Store selection by stable row IDs, not row index, so filtering and sorting do
  not move the selected target.
- Use `close_on_confirm={false}` for destructive or async actions that the
  server can reject.
- Render server rejections as `role="alert"` near the table or active action
  bar.
- Browser coverage should verify filter state, selected count, disabled/enabled
  bulk buttons, confirm open state, and blocked validation messages.
