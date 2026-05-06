# Access Review Workflows

Use this pattern for security/admin review queues where a user filters access
grants, opens a detailed review drawer, asks for more evidence, approves access,
or revokes access through a guarded confirmation.

## Structure

```heex
<.tabs id="access-tabs" active={@active_tab} aria_label="Access review status">
  <:tab id="pending" label="Pending" click="change-access-tab" />
  <:tab id="approved" label="Approved" click="change-access-tab" />
  <:tab id="revoked" label="Revoked" click="change-access-tab" />
</.tabs>

<.form for={%{}} as={:access} phx-change="change-access-filters">
  <.input name="access[query]" label="Search access" value={@query} />
  <.select
    id="access-risk"
    name="access[risk]"
    label="Risk"
    value={@risk_filter}
    options={[{"All risks", "all"}, {"High", "high"}, {"Medium", "medium"}, {"Low", "low"}]}
  />
</.form>

<.table rows={@rows} row_id={&"access-grant-#{&1.id}"} caption="Access review grants">
  <:col :let={grant} label="User">{grant.user}</:col>
  <:col :let={grant} label="Resource">{grant.resource}</:col>
  <:col :let={grant} label="Risk">
    <.badge variant={risk_variant(grant.risk)}>{grant.risk}</.badge>
  </:col>
  <:col :let={grant} label="Action">
    <.button phx-click={open_access_drawer(grant.id, @myself)}>Review</.button>
  </:col>
</.table>
```

## Drawer Decisions

Keep the decision note and validation state in LiveView assigns. Use a drawer
for review details and a confirm modal for destructive revocation.

```heex
<.drawer id="access-review-drawer" side="right">
  <:title>Review {@selected_grant.user}</:title>

  <.input
    name="review[note]"
    type="textarea"
    label="Decision note"
    value={@review_note}
    errors={Map.get(@errors, :note, [])}
  />

  <.button phx-click="request-access-evidence">Request evidence</.button>
  <.button phx-click={JS.push("approve-access") |> hide_drawer("access-review-drawer")}>
    Approve access
  </.button>
  <.button variant="danger" phx-click={show_modal("revoke-access-confirm")}>
    Prepare revoke
  </.button>
</.drawer>

<.confirm_modal
  id="revoke-access-confirm"
  title="Revoke access?"
  message="This removes the selected grant."
  confirm_text="Revoke access"
  close_on_confirm={false}
  on_confirm={
    JS.push("revoke-access")
    |> hide_modal("revoke-access-confirm")
    |> hide_drawer("access-review-drawer")
  }
/>
```

## Rules

- Treat the table rows as server-owned state: tabs, risk filters, search, and
  decisions should all re-render from assigns.
- Keep `pending`, `approved`, and `revoked` as explicit status groups so tabs
  remain predictable after a decision moves a row.
- Route command-palette actions to the same filter state used by visible
  controls. Commands should close explicitly after `JS.push`.
- Keep evidence requests non-destructive and validate them inside the drawer.
  Do not close the drawer on validation failure.
- Use a confirm modal for revocation and close both modal and drawer only after
  the server event is pushed.
- Browser coverage should verify tabs, command routing, filters, row actions,
  drawer details, validation errors, confirm-modal revocation, reset state, and
  live status attributes.
