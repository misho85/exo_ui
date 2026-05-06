# Release Readiness Workflow Recipes

Release readiness screens combine checklist tables, progress, status tabs,
drawer-hosted review forms, command routing, and a guarded launch action. Keep
the launch gate server-owned so the UI can explain exactly why a release is
blocked.

The executable reference lives at `/components/recipes/release_readiness_workflow`.

## Pattern

Use status tabs for the main queue, table row actions for local review, and a
command palette for fast jumps between blockers, lanes, and ready checks.
Expose enough `data-*` state for browser tests to verify the workflow without
depending on visual text alone.

```heex
<.tabs id="release-tabs" active={@active_tab} aria_label="Release status">
  <:tab id="pending" label="Pending" click={JS.push("change-release-tab", value: %{tab: "pending"}, target: @myself)} />
  <:tab id="ready" label="Ready" click={JS.push("change-release-tab", value: %{tab: "ready"}, target: @myself)} />
  <:tab id="blocked" label="Blocked" click={JS.push("change-release-tab", value: %{tab: "blocked"}, target: @myself)} />
</.tabs>

<.progress value={@readiness_score} label="Readiness score" />

<.table id="release-checks" rows={@checks} row_id={&"release-check-#{&1.id}"}>
  <:col :let={check} label="Check">{check.title}</:col>
  <:col :let={check} label="Status">
    <.badge variant={status_variant(check.status)}>{check.status}</.badge>
  </:col>
  <:action :let={check}>
    <.button phx-click={open_release_check(check.id, @myself)}>
      Review {check.title}
    </.button>
  </:action>
</.table>
```

```elixir
defp open_release_check(id, target) do
  JS.push("open-release-check", value: %{id: id}, target: target)
  |> JS.set_attribute({"data-state", "open"}, to: "#release-check-drawer")
  |> JS.set_attribute({"aria-hidden", "false"}, to: "#release-check-drawer")
  |> JS.remove_attribute("inert", to: "#release-check-drawer")
  |> JS.focus_first(to: "#release-check-drawer [data-exo=\"drawer-content\"]")
end
```

## Review Drawer

Keep approval and blocker decisions in the LiveView or LiveComponent. Validation
should leave the drawer open and feed the same errors back into ExoUI inputs.

```heex
<.drawer id="release-check-drawer" side="right">
  <:title>Review {@selected_check.title}</:title>
  <.form for={%{}} as={:review} phx-change="change-release-review" phx-target={@myself}>
    <.select id="review-reviewer" name="review[reviewer]" label="Reviewer" value={@reviewer} options={reviewer_options()} />
    <.input name="review[note]" type="textarea" label="Review note" value={@review_note} errors={@errors[:note] || []} />
  </.form>
  <.button phx-click="block-release-check" phx-target={@myself}>Mark blocked</.button>
  <.button phx-click="approve-release-check" phx-target={@myself}>Approve check</.button>
</.drawer>
```

## Guarded Launch

Use `close_on_confirm={@launch_ready?}` so the confirm modal remains open while
the server reports unresolved checks, but closes automatically once every gate
is ready.

```heex
<.confirm_modal
  id="release-launch-confirm"
  title={if @launch_ready?, do: "Launch release", else: "Validate release readiness"}
  message="Launch is guarded until every pending or blocked check is resolved."
  confirm_text="Launch release"
  close_on_confirm={@launch_ready?}
  on_confirm={JS.push("launch-release", target: @myself)}
/>
```

## Playwright Proof

The browser test opens the guarded launch modal before the release is ready,
verifies that validation keeps it open, routes through the command palette,
validates the drawer note error, approves the remaining checks, confirms launch,
and resets the workflow.
