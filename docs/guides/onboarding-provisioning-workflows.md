# Onboarding Provisioning Workflow Recipes

Onboarding provisioning screens combine admin queues, identity setup,
workspace defaults, status tabs, command routing, drawer review forms, and
guarded account activation. Keep activation server-owned so an account cannot
be provisioned without a setup note.

The executable reference lives at `/components/recipes/onboarding_provisioning_workflow`.

## Pattern

Use tabs for status, filters for team ownership, table row actions for user
review, and command palette routes for fast jumps to identity setup, blocked
users, and provisioned accounts.

```heex
<.tabs id="onboarding-tabs" active={@active_tab} aria_label="Onboarding status">
  <:tab id="pending" label="Pending" click={JS.push("change-onboarding-tab", value: %{tab: "pending"}, target: @myself)} />
  <:tab id="provisioned" label="Provisioned" click={JS.push("change-onboarding-tab", value: %{tab: "provisioned"}, target: @myself)} />
  <:tab id="blocked" label="Blocked" click={JS.push("change-onboarding-tab", value: %{tab: "blocked"}, target: @myself)} />
</.tabs>

<.table id="onboarding-users" rows={@users} row_id={&"onboarding-user-#{&1.id}"}>
  <:col :let={user} label="User">{user.name}</:col>
  <:col :let={user} label="Team">{user.team}</:col>
  <:col :let={user} label="Status">
    <.badge variant={status_variant(user.status)}>{user.status}</.badge>
  </:col>
  <:action :let={user}>
    <.button phx-click={open_onboarding_user(user.id, @myself)}>
      Review {user.name}
    </.button>
  </:action>
</.table>
```

```elixir
defp open_onboarding_user(id, target) do
  JS.push("open-onboarding-user", value: %{id: id}, target: target)
  |> JS.set_attribute({"data-state", "open"}, to: "#onboarding-user-drawer")
  |> JS.set_attribute({"aria-hidden", "false"}, to: "#onboarding-user-drawer")
  |> JS.remove_attribute("inert", to: "#onboarding-user-drawer")
  |> JS.focus_first(to: "#onboarding-user-drawer [data-exo=\"drawer-content\"]")
end
```

## Drawer Review

Use the drawer for identity/workspace evidence and a short setup note. Validation
should keep the user in the review loop and render errors through the same ExoUI
input components used in production forms.

```heex
<.drawer id="onboarding-user-drawer" side="right">
  <:title>Review {@selected_user.name}</:title>
  <.form for={%{}} as={:review} phx-change="change-onboarding-review" phx-target={@myself}>
    <.select id="review-provisioner" name="review[provisioner]" label="Provisioner" value={@provisioner} options={provisioner_options()} />
    <.input name="review[note]" type="textarea" label="Setup note" value={@review_note} errors={@errors[:note] || []} />
  </.form>
  <.button phx-click="request-onboarding-info" phx-target={@myself}>Request setup info</.button>
  <.button phx-click="block-onboarding-user" phx-target={@myself}>Block onboarding</.button>
</.drawer>
```

## Guarded Activation

Use `close_on_confirm={@provision_ready?}` so the confirm modal stays open while
the server reports missing setup notes, but closes when activation succeeds.

```heex
<.confirm_modal
  id="onboarding-provision-confirm"
  title={if @provision_ready?, do: "Activate account", else: "Validate onboarding setup"}
  message="Account activation is guarded until identity and workspace setup are documented."
  confirm_text="Activate account"
  close_on_confirm={@provision_ready?}
  on_confirm={JS.push("provision-onboarding-user", target: @myself)}
/>
```

## Playwright Proof

The browser test opens the identity queue from the command palette, opens a
drawer, verifies that activation is blocked without a setup note, requests setup
info after filling the note, activates the account, and resets the workflow back
to its initial state.
