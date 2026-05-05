# Table, Menu, And Overlay Recipes

These recipes cover the composition path most likely to break in production:
row actions that open menus, command palettes, drawers, and guarded confirms.

## Row Actions

```heex
<.table id="accounts" rows={@accounts} row_id={&"account-#{&1.id}"} caption="Accounts">
  <:col :let={account} label="Account">{account.name}</:col>
  <:col :let={account} label="Owner">{account.owner}</:col>
  <:action :let={account}>
    <.dropdown_menu id={"account-actions-#{account.id}"}>
      <:trigger>
        <.button type="button" size="sm" variant="ghost">
          Actions for {account.name}
        </.button>
      </:trigger>
      <:entry icon="pencil" click={JS.push("edit-account", value: %{id: account.id}) |> show_drawer("account-drawer")}>
        Edit
      </:entry>
      <:entry type="separator" />
      <:entry icon="trash-2" variant="danger" click={show_modal("delete-account")}>
        Delete
      </:entry>
    </.dropdown_menu>
  </:action>
  <:empty>No accounts match the current filters.</:empty>
</.table>
```

Rules:

- Always pass `row_id` for stable DOM updates and visual regression snapshots.
- Use `row_label` when a row click is meaningful.
- Keep row actions as buttons or links with visible labels. Icon-only row
  actions need an accessible label.

## Command Palette To Drawer

```heex
<.button type="button" phx-click={show_command_palette("account-command")}>
  Open commands
</.button>

<.command_palette id="account-command" shortcut="ctrl+shift+a">
  <:item
    label="Open account drawer"
    value="drawer"
    search="account drawer edit"
    click={show_drawer("account-drawer")}
  />
</.command_palette>

<.drawer id="account-drawer" side="right">
  <:title>Edit account</:title>
  <.input name="account[owner]" label="Owner" errors={@errors[:owner] || []} />
</.drawer>
```

Rules:

- Use custom shortcuts when more than one command surface can appear on a page.
- Command items that open another overlay should close the palette or rely on
  the command palette item close behavior.
- Drawer content should keep the same field components and validation contract
  as the main page.

## Guarded Confirm

```heex
<.confirm_modal
  id="delete-account"
  title="Delete account"
  message="The server validates this action before closing the dialog."
  confirm_text="Validate delete"
  close_on_confirm={false}
  on_confirm={JS.push("delete-account")}
/>
```

Rules:

- Use `close_on_confirm={false}` when the server can reject the action.
- Render the server-side rejection as a `role="alert"` message near the guarded
  action or inside the active drawer/form.
- Browser coverage should click confirm and verify the modal remains open on
  validation failure.
