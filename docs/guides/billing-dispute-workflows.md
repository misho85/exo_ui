# Billing Dispute Workflow Recipes

Billing dispute screens combine finance queues, search/filter state, table row
actions, drawer-hosted review forms, evidence requests, and guarded credit
confirmation. Keep the dispute decision server-owned so a credit cannot be
issued without a review note.

The executable reference lives at `/components/recipes/billing_dispute_workflow`.

## Pattern

Use tabs for status, a select/search form for queue ownership, and a command
palette for fast routing between high-value disputes and completed decisions.

```heex
<.tabs id="billing-tabs" active={@active_tab} aria_label="Billing dispute status">
  <:tab id="open" label="Open" click={JS.push("change-billing-tab", value: %{tab: "open"}, target: @myself)} />
  <:tab id="approved" label="Approved" click={JS.push("change-billing-tab", value: %{tab: "approved"}, target: @myself)} />
  <:tab id="denied" label="Denied" click={JS.push("change-billing-tab", value: %{tab: "denied"}, target: @myself)} />
</.tabs>

<.table id="billing-disputes" rows={@disputes} row_id={&"billing-dispute-#{&1.id}"}>
  <:col :let={dispute} label="Customer">{dispute.customer}</:col>
  <:col :let={dispute} label="Amount">{"$#{dispute.amount}"}</:col>
  <:col :let={dispute} label="Status">
    <.badge variant={status_variant(dispute.status)}>{dispute.status}</.badge>
  </:col>
  <:action :let={dispute}>
    <.button phx-click={open_billing_dispute(dispute.id, @myself)}>
      Review {dispute.customer}
    </.button>
  </:action>
</.table>
```

```elixir
defp open_billing_dispute(id, target) do
  JS.push("open-billing-dispute", value: %{id: id}, target: target)
  |> JS.set_attribute({"data-state", "open"}, to: "#billing-dispute-drawer")
  |> JS.set_attribute({"aria-hidden", "false"}, to: "#billing-dispute-drawer")
  |> JS.remove_attribute("inert", to: "#billing-dispute-drawer")
  |> JS.focus_first(to: "#billing-dispute-drawer [data-exo=\"drawer-content\"]")
end
```

## Drawer Review

The drawer owns the visible review form, but the LiveView or LiveComponent owns
the decision state. Validation errors should flow back into the same ExoUI input
component used by production forms.

```heex
<.drawer id="billing-dispute-drawer" side="right">
  <:title>Review {@selected_dispute.customer}</:title>
  <.form for={%{}} as={:review} phx-change="change-billing-review" phx-target={@myself}>
    <.input name="review[reviewer]" type="select" label="Reviewer" value={@reviewer} options={reviewer_options()} />
    <.input name="review[note]" type="textarea" label="Review note" value={@review_note} errors={@errors[:note] || []} />
  </.form>
  <.button phx-click="request-billing-evidence" phx-target={@myself}>Request evidence</.button>
  <.button phx-click="deny-billing-dispute" phx-target={@myself}>Deny dispute</.button>
</.drawer>
```

## Guarded Credit

Use `close_on_confirm={@credit_ready?}` and keep the drawer open while the
server reports missing evidence or a missing note. Once the note is valid, the
same confirm action can issue the credit and close both overlays.

```heex
<.confirm_modal
  id="billing-credit-confirm"
  title={if @credit_ready?, do: "Issue customer credit", else: "Validate dispute credit"}
  message="Credit issuance is guarded until a review note explains the evidence."
  confirm_text="Issue credit"
  close_on_confirm={@credit_ready?}
  on_confirm={confirm_credit(@myself, @credit_ready?)}
/>
```

## Playwright Proof

The browser test opens the payments queue from the command palette, opens a
drawer, verifies that the guarded credit confirm stays open without a review
note, requests evidence after filling the note, issues the credit, and resets
the workflow back to the initial queue.
