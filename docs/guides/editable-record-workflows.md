# Editable Record Workflow Recipes

Editable records are the highest-risk composition path for a UI library because
they combine table semantics, row actions, menus, overlay focus management,
form validation, and destructive confirmation in one screen. The Storybook route
`/components/data_display/editable_record_workflow` is the executable reference.

## Pattern

Use a stable table row ID, route every menu action through `JS.push/2`, and then
open the drawer with the public ExoUI helper. Keep the form state in the parent
LiveView or LiveComponent so validation errors can render through the same input
components that production code uses.

```heex
<.table id="accounts" rows={@accounts} row_id={&"account-#{&1.id}"}>
  <:col :let={account} label="Account">{account.name}</:col>
  <:col :let={account} label="Owner">{account.owner}</:col>
  <:action :let={account}>
    <.dropdown_menu id={"account-actions-#{account.id}"}>
      <:trigger>
        <.button type="button" size="sm" variant="ghost">
          Actions for {account.name}
        </.button>
      </:trigger>
      <:entry click={JS.push("edit-account", value: %{id: account.id}) |> show_drawer("account-drawer")}>
        Edit record
      </:entry>
    </.dropdown_menu>
  </:action>
</.table>

<.drawer id="account-drawer" side="right">
  <:title>Edit {@draft.name}</:title>
  <.form for={%{}} as={:account} phx-change="validate-account" phx-submit="save-account">
    <.input name="account[owner]" label="Owner" value={@draft.owner} errors={@errors[:owner] || []} />
    <.date_picker
      id="account-renewal"
      name="account[renewal_date]"
      selected={@draft.renewal_date}
      current_month={@calendar_month}
      target={@myself}
      on_select="select-renewal-date"
      on_prev_month="previous-renewal-month"
      on_next_month="next-renewal-month"
    />
    <.button type="submit">Save record</.button>
  </.form>
</.drawer>
```

## Validation Contract

- Keep the drawer open while validation fails.
- Put the error list back into the exact ExoUI field component through `errors`.
- Use `close_on_confirm={false}` for destructive confirmations that must wait
  for server validation.
- Prefer command palette entries for cross-record actions, and row dropdowns for
  record-local actions.

## Playwright Proof

The browser test opens the row dropdown, searches through the command palette,
opens the drawer, triggers a validation error, moves the date picker month from
the parent LiveComponent, saves the row back into the table, and verifies that a
guarded delete confirm remains open after server validation fails.
