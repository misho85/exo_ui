# App Shell Workflow Recipes

Use these recipes when a page needs to combine layout, tables, forms, menus, and
stacked overlays in one LiveView workflow. The Storybook route
`/components/layout/app_shell_workflow` is the executable reference for these
patterns.

## Operations Dashboard

Keep overlay roots as siblings of the app shell so the shared overlay registry
can manage inert state and focus order across the whole page.

```heex
<div style="height: 720px; position: relative; overflow: hidden">
  <.sidebar_layout id="ops-shell">
    <:brand>Exo Ops</:brand>
    <:nav>
      <ul>
        <.sidebar_item href={~p"/ops"} icon="layout-dashboard" label="Overview" active />
        <.sidebar_item href={~p"/ops/accounts"} icon="building-2" label="Accounts" badge={4} />
      </ul>
    </:nav>
    <:topbar_start>
      <.button type="button" phx-click={show_command_palette("ops-command")}>
        Open command palette
      </.button>
    </:topbar_start>

    <.table id="accounts" rows={@accounts} row_id={&"account-#{&1.id}"}>
      <:col :let={account} label="Account">{account.name}</:col>
      <:col :let={account} label="Owner">{account.owner}</:col>
      <:col :let={account} label="Risk">
        <.badge variant={account.risk_variant}>{account.risk}</.badge>
      </:col>
      <:action :let={account}>
        <.button type="button" phx-click={show_drawer("account-review")}>
          Review {account.name}
        </.button>
      </:action>
    </.table>
  </.sidebar_layout>

  <.command_palette id="ops-command" shortcut="ctrl+shift+k">
    <:item label="Open filters" value="filters" click={show_sheet("review-filters")} />
    <:item label="Open account review" value="review" click={show_drawer("account-review")} />
  </.command_palette>

  <.sheet id="review-filters" side="right">
    <:title>Review filters</:title>
    <.input id="filter-query" name="filters[query]" label="Search accounts" />
    <.input
      id="risk-owner"
      name="filters[risk_owner]"
      label="Risk owner"
      errors={["Risk owner is required before exporting this segment."]}
    />
    <:footer>
      <.button type="button" phx-click={show_drawer("account-review")}>
        Review filtered account
      </.button>
    </:footer>
  </.sheet>

  <.drawer id="account-review" side="right">
    <:title>Account review</:title>
    <.input id="review-note" name="review[note]" type="textarea" label="Internal note" />
    <.button type="button" variant="danger" phx-click={show_modal("archive-confirm")}>
      Archive segment
    </.button>
  </.drawer>

  <.confirm_modal
    id="archive-confirm"
    title="Archive account segment"
    message="The server validates filters, owners, and audit notes before closing."
    confirm_text="Validate archive"
    close_on_confirm={false}
  />
</div>
```

## Verification Expectations

- Opening the command palette from the shell should focus the palette input.
- Selecting a command that opens a sheet or drawer should close the palette and
  make only the new topmost overlay interactive.
- Validation errors inside sheets and drawers should expose `aria-invalid`,
  `aria-describedby`, and `data-exo="field-error"`.
- Destructive confirmation actions that depend on server validation should use
  `close_on_confirm={false}` and close only after the LiveView updates state.
