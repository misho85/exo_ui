defmodule ExoUI.Storybook.Components.ReleaseReadinessWorkflowDemo do
  @moduledoc """
  Production-style release readiness workflow.

  Demonstrates a launch checklist with status tabs, lane/search filters,
  command routing, table actions, drawer-hosted review validation, progress
  feedback, and a guarded launch confirmation.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok, assign_initial(socket, "initial release readiness")}
  end

  @impl true
  def handle_event("change-release-tab", %{"tab" => tab}, socket) do
    tab = normalize_tab(tab)

    {:noreply,
     assign(socket,
       active_tab: tab,
       selected_check_id: nil,
       last_action: "opened #{tab_label(tab)} checks"
     )}
  end

  def handle_event("change-release-filters", %{"release" => params}, socket) do
    {:noreply,
     assign(socket,
       query: Map.get(params, "query", ""),
       lane_filter: normalize_lane(Map.get(params, "lane", "all")),
       selected_check_id: nil,
       last_action: "changed release filters"
     )}
  end

  def handle_event("run-release-command", %{"command" => command}, socket) do
    {active_tab, lane_filter, query, label} =
      case command do
        "blockers" -> {"blocked", "all", "", "release blockers"}
        "engineering" -> {"pending", "engineering", "", "engineering checks"}
        "rollback" -> {"blocked", "operations", "rollback", "rollback readiness"}
        "ready" -> {"ready", "all", "", "ready checks"}
        _ -> {"pending", "all", "", "pending checks"}
      end

    {:noreply,
     assign(socket,
       active_tab: active_tab,
       lane_filter: lane_filter,
       query: query,
       selected_check_id: nil,
       command_count: socket.assigns.command_count + 1,
       last_action: "opened #{label} from command palette"
     )}
  end

  def handle_event("open-release-check", %{"id" => id}, socket) do
    check = check_by_id(id, socket.assigns.decisions)

    {:noreply,
     assign(socket,
       selected_check_id: check.id,
       reviewer: "release-manager",
       review_note: "",
       errors: %{},
       launch_error: nil,
       last_action: "opened release check for #{check.title}"
     )}
  end

  def handle_event("change-release-review", %{"review" => params}, socket) do
    {:noreply,
     assign(socket,
       reviewer: normalize_reviewer(Map.get(params, "reviewer", socket.assigns.reviewer)),
       review_note: Map.get(params, "note", ""),
       errors: %{},
       last_action: "edited release review note"
     )}
  end

  def handle_event("approve-release-check", _params, socket) do
    socket
    |> decide_check("ready", "approved", :approval_count)
    |> noreply()
  end

  def handle_event("block-release-check", _params, socket) do
    socket
    |> decide_check("blocked", "blocked", :blocker_count)
    |> noreply()
  end

  def handle_event("prepare-release-launch", _params, socket) do
    {:noreply,
     assign(socket,
       launch_error: nil,
       last_action: "opened guarded launch confirmation"
     )}
  end

  def handle_event("launch-release", _params, socket) do
    checks = decorate_checks(checks(), socket.assigns.decisions)

    if launch_ready?(checks) do
      {:noreply,
       assign(socket,
         release_state: "launched",
         active_tab: "ready",
         launch_count: socket.assigns.launch_count + 1,
         selected_check_id: nil,
         launch_error: nil,
         last_action: "launched Polaris release"
       )}
    else
      {:noreply,
       assign(socket,
         release_state: release_state(checks),
         launch_error: "Resolve every pending and blocked release check before launch.",
         validation_count: socket.assigns.validation_count + 1,
         last_action: "blocked release launch"
       )}
    end
  end

  def handle_event("reset-release-readiness", _params, socket) do
    {:noreply, assign_initial(socket, "reset release readiness")}
  end

  @impl true
  def render(assigns) do
    checks = decorate_checks(checks(), assigns.decisions)
    rows = visible_checks(checks, assigns)
    selected = selected_check(checks, assigns.selected_check_id)
    readiness_score = readiness_score(checks)
    launch_ready? = launch_ready?(checks)

    assigns =
      assign(assigns,
        checks: checks,
        rows: rows,
        selected_check: selected,
        visible_count: length(rows),
        pending_count: count_status(checks, "pending"),
        ready_count: count_status(checks, "ready"),
        blocked_count: count_status(checks, "blocked"),
        high_risk_visible_count: count_risk(rows, "high"),
        readiness_score: readiness_score,
        launch_ready?: launch_ready?,
        note_errors: field_errors(assigns.errors, :note),
        can_reset?: can_reset?(assigns, checks)
      )

    ~H"""
    <div
      id={@id}
      data-exo="release-readiness-workflow"
      data-active-tab={@active_tab}
      data-lane-filter={@lane_filter}
      data-query={@query}
      data-visible-count={@visible_count}
      data-pending-count={@pending_count}
      data-ready-count={@ready_count}
      data-blocked-count={@blocked_count}
      data-high-risk-visible-count={@high_risk_visible_count}
      data-readiness-score={@readiness_score}
      data-release-state={@release_state}
      data-selected-check={@selected_check.id}
      data-approval-count={@approval_count}
      data-blocker-count={@blocker_count}
      data-validation-count={@validation_count}
      data-command-count={@command_count}
      data-launch-count={@launch_count}
      data-last-action={@last_action}
      style="min-height: 820px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Release readiness workflow
        <:subtitle>
          Launch checklist with tabs, command routing, drawer review, guarded launch validation, and progress feedback.
        </:subtitle>
        <:actions>
          <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
            <.button
              id="release-readiness-open-command"
              type="button"
              variant="outline"
              phx-click={show_command_palette("release-command")}
            >
              <.icon name="search" /> Open release commands
            </.button>
            <.button
              type="button"
              variant="primary"
              phx-click={prepare_launch(@myself)}
            >
              Prepare launch
            </.button>
            <.button
              type="button"
              variant="ghost"
              disabled={!@can_reset?}
              phx-click="reset-release-readiness"
              phx-target={@myself}
            >
              Reset release
            </.button>
          </div>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Pending" value={@pending_count} subtitle="must be cleared" />
        <.stat_card title="Ready" value={@ready_count} subtitle="approved checks" />
        <.stat_card title="Blocked" value={@blocked_count} subtitle="release blockers" />
        <.stat_card title="State" value={@release_state} subtitle="server-owned" />
      </div>

      <.content_card title="Release progress">
        <:action>
          <.badge variant={if @launch_ready?, do: "success", else: "warning"}>
            {if @launch_ready?, do: "Launchable", else: "Needs review"}
          </.badge>
        </:action>
        <.progress
          value={@readiness_score}
          label="Readiness score"
          aria_label="Release readiness score"
        />
        <p
          id="release-readiness-state"
          data-exo="release-readiness-state"
          data-last-action={@last_action}
          data-release-state={@release_state}
          data-launch-error={@launch_error || ""}
          aria-live="polite"
          style="margin: 0.75rem 0 0; color: var(--exo-muted-foreground);"
        >
          Last action: {@last_action}.
        </p>
        <.alert :if={@launch_error} kind="danger" title="Launch blocked">
          {@launch_error}
        </.alert>
      </.content_card>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Checklist controls">
            <.tabs
              id="release-readiness-tabs"
              active={@active_tab}
              aria_label="Release readiness status"
              activation="automatic"
            >
              <:tab id="pending" label="Pending" icon="clock" click={tab_click("pending", @myself)} />
              <:tab id="ready" label="Ready" icon="check" click={tab_click("ready", @myself)} />
              <:tab
                id="blocked"
                label="Blocked"
                icon="octagon-alert"
                click={tab_click("blocked", @myself)}
              />
            </.tabs>

            <ExoUI.Components.Form.form
              for={%{}}
              as={:release}
              phx-change="change-release-filters"
              phx-target={@myself}
              style="margin-top: 1rem; display: grid; grid-template-columns: minmax(0, 1fr) 13rem; gap: 0.75rem; align-items: start;"
            >
              <ExoUI.Components.Form.input
                id="release-query"
                name="release[query]"
                label="Search checks"
                value={@query}
                placeholder="Search owner, lane, evidence..."
              />
              <ExoUI.Components.Form.select
                id="release-lane"
                name="release[lane]"
                label="Lane"
                value={@lane_filter}
                options={lane_options()}
              />
            </ExoUI.Components.Form.form>
          </.content_card>

          <.content_card title="Release checklist">
            <:action>
              <.badge variant="secondary">{@visible_count} visible</.badge>
            </:action>
            <.table
              id="release-readiness-table"
              rows={@rows}
              row_id={&row_id/1}
              row_label={&row_label/1}
              caption="Release readiness checks"
              empty_label="No release checks match the active status and filters."
            >
              <:col :let={check} label="Check">{check.title}</:col>
              <:col :let={check} label="Lane">
                <span data-exo="release-check-lane">{lane_label(check.lane)}</span>
              </:col>
              <:col :let={check} label="Risk">
                <.badge variant={risk_variant(check.risk)}>{risk_label(check.risk)}</.badge>
              </:col>
              <:col :let={check} label="Status">
                <.badge variant={check.status_variant}>{status_label(check.status)}</.badge>
              </:col>
              <:action :let={check}>
                <.button
                  type="button"
                  size="sm"
                  variant="outline"
                  phx-click={open_check(check.id, @myself)}
                >
                  Review {check.title}
                </.button>
              </:action>
            </.table>
          </.content_card>
        </div>

        <.content_card title="Launch gates">
          <.list>
            <:item title="Readiness">
              {@readiness_score}% approved
            </:item>
            <:item title="Pending">
              {@pending_count} checks
            </:item>
            <:item title="Blocked">
              {@blocked_count} checks
            </:item>
            <:item title="High risk visible">
              {@high_risk_visible_count} rows
            </:item>
          </.list>
          <.separator />
          <.timeline>
            <:event title="T minus 24h" meta="Freeze">
              Engineering freeze and migration smoke tests are reviewed first.
            </:event>
            <:event title="T minus 4h" meta="Operations">
              Rollback runbook and support brief must both be ready.
            </:event>
            <:event title="Launch" meta={status_label(@release_state)}>
              The guarded confirm modal blocks until every gate is ready.
            </:event>
          </.timeline>
        </.content_card>
      </div>

      <.command_palette
        id="release-command"
        label="Release readiness command palette"
        placeholder="Search release checks..."
        shortcut="ctrl+shift+r"
      >
        <:item
          label="Open release blockers"
          value="blockers"
          search="blocked blockers release launch"
          shortcut="B"
          click={run_command("blockers", @myself)}
        />
        <:item
          label="Open engineering checks"
          value="engineering"
          search="engineering migration smoke pending"
          shortcut="E"
          click={run_command("engineering", @myself)}
        />
        <:item
          label="Open rollback readiness"
          value="rollback"
          search="rollback operations runbook blocked"
          shortcut="R"
          click={run_command("rollback", @myself)}
        />
        <:item
          label="Open ready checks"
          value="ready"
          search="ready approved launchable"
          shortcut="Y"
          click={run_command("ready", @myself)}
        />
      </.command_palette>

      <.drawer id="release-check-drawer" side="right">
        <:title>Review {@selected_check.title}</:title>
        <div
          id="release-check-detail"
          data-exo="release-check-detail"
          data-check={@selected_check.id}
          data-status={@selected_check.status}
          data-risk={@selected_check.risk}
          style="display: flex; flex-direction: column; gap: 1rem;"
        >
          <.alert
            kind={if @selected_check.status == "blocked", do: "danger", else: "info"}
            title="Release check"
          >
            {@selected_check.evidence}
          </.alert>

          <.list>
            <:item title="Owner">{@selected_check.owner}</:item>
            <:item title="Lane">{lane_label(@selected_check.lane)}</:item>
            <:item title="Current status">{status_label(@selected_check.status)}</:item>
            <:item title="Reviewer">
              {if @selected_check.reviewer == "",
                do: "Not reviewed",
                else: reviewer_label(@selected_check.reviewer)}
            </:item>
          </.list>

          <ExoUI.Components.Form.form
            for={%{}}
            as={:review}
            phx-change="change-release-review"
            phx-target={@myself}
            style="display: flex; flex-direction: column; gap: 1rem;"
          >
            <ExoUI.Components.Form.select
              id="release-reviewer"
              name="review[reviewer]"
              label="Reviewer"
              value={@reviewer}
              options={reviewer_options()}
            />
            <ExoUI.Components.Form.input
              id="release-note"
              name="review[note]"
              type="textarea"
              rows="5"
              label="Review note"
              value={@review_note}
              placeholder="Describe the evidence or blocker..."
              errors={@note_errors}
            />
          </ExoUI.Components.Form.form>

          <div style="display: flex; justify-content: space-between; gap: 0.5rem;">
            <.button
              type="button"
              variant="danger"
              phx-click="block-release-check"
              phx-target={@myself}
            >
              Mark blocked
            </.button>
            <div style="display: flex; gap: 0.5rem;">
              <.button type="button" variant="ghost" phx-click={hide_drawer("release-check-drawer")}>
                Close review
              </.button>
              <.button
                type="button"
                variant="primary"
                phx-click="approve-release-check"
                phx-target={@myself}
              >
                Approve check
              </.button>
            </div>
          </div>
        </div>
      </.drawer>

      <.confirm_modal
        id="release-launch-confirm"
        title={if @launch_ready?, do: "Launch Polaris release", else: "Validate release readiness"}
        message={
          if @launch_ready?,
            do: "All release checks are ready. Confirm the launch handoff.",
            else: "Launch is guarded until every pending or blocked check is resolved."
        }
        confirm_text="Launch release"
        cancel_text="Keep reviewing"
        variant={if @launch_ready?, do: "primary", else: "danger"}
        close_on_confirm={@launch_ready?}
        on_confirm={JS.push("launch-release", target: @myself)}
      />
    </div>
    """
  end

  def row_id(check), do: "release-check-#{check.id}"
  def row_label(check), do: "Review #{check.title}"

  defp assign_initial(socket, last_action) do
    decisions = %{}
    checks = decorate_checks(checks(), decisions)

    assign(socket,
      active_tab: "pending",
      lane_filter: "all",
      query: "",
      decisions: decisions,
      selected_check_id: nil,
      reviewer: "release-manager",
      review_note: "",
      errors: %{},
      launch_error: nil,
      release_state: release_state(checks),
      approval_count: 0,
      blocker_count: 0,
      validation_count: 0,
      command_count: 0,
      launch_count: 0,
      last_action: last_action
    )
  end

  defp tab_click(tab, target),
    do: JS.push("change-release-tab", value: %{tab: tab}, target: target)

  defp run_command(command, target) do
    JS.push("run-release-command", value: %{command: command}, target: target)
    |> hide_command_palette("release-command")
  end

  defp open_check(id, target) do
    JS.push("open-release-check", value: %{id: id}, target: target)
    |> show_drawer_js("release-check-drawer")
    |> hide_command_palette("release-command")
  end

  defp prepare_launch(target) do
    JS.push("prepare-release-launch", target: target)
    |> show_modal_js("release-launch-confirm")
  end

  defp show_drawer_js(js, id) do
    js
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> JS.remove_attribute("inert", to: "##{id}")
    |> JS.focus_first(to: "##{id} [data-exo=\"drawer-content\"]")
  end

  defp show_modal_js(js, id) do
    js
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> JS.remove_attribute("inert", to: "##{id}")
    |> JS.show(to: "##{id}")
    |> JS.focus_first(to: "##{id} [data-exo=\"modal-content\"]")
  end

  defp decide_check(socket, status, verb, counter_key) do
    note = String.trim(socket.assigns.review_note)

    if String.length(note) < 12 do
      assign(socket,
        errors: %{note: ["Add at least 12 characters before saving the review."]},
        validation_count: socket.assigns.validation_count + 1,
        last_action: "blocked release review"
      )
    else
      selected = check_by_id(socket.assigns.selected_check_id, socket.assigns.decisions)

      decisions =
        Map.put(socket.assigns.decisions, selected.id, %{
          status: status,
          reviewer: socket.assigns.reviewer,
          note: note
        })

      checks = decorate_checks(checks(), decisions)

      socket
      |> assign(
        decisions: decisions,
        errors: %{},
        launch_error: nil,
        release_state: release_state(checks),
        active_tab: status,
        last_action: "#{verb} #{selected.title}"
      )
      |> update(counter_key, &(&1 + 1))
    end
  end

  defp noreply(socket), do: {:noreply, socket}

  defp decorate_checks(checks, decisions) do
    Enum.map(checks, fn check ->
      decision = Map.get(decisions, check.id, %{})
      status = Map.get(decision, :status, check.status)

      check
      |> Map.put(:status, status)
      |> Map.put(:status_variant, status_variant(status))
      |> Map.put(:reviewer, Map.get(decision, :reviewer, check.reviewer))
      |> Map.put(:note, Map.get(decision, :note, check.note))
    end)
  end

  defp visible_checks(checks, assigns) do
    checks
    |> Enum.filter(&(&1.status == assigns.active_tab))
    |> Enum.filter(fn check ->
      assigns.lane_filter == "all" || check.lane == assigns.lane_filter
    end)
    |> Enum.filter(&matches_query?(&1, assigns.query))
  end

  defp matches_query?(_check, ""), do: true

  defp matches_query?(check, query) do
    haystack =
      [check.title, check.owner, check.lane, check.risk, check.evidence, check.status]
      |> Enum.join(" ")
      |> String.downcase()

    String.contains?(haystack, String.downcase(String.trim(query)))
  end

  defp selected_check(_checks, nil), do: empty_check()

  defp selected_check(checks, id) do
    Enum.find(checks, empty_check(), &(to_string(&1.id) == to_string(id)))
  end

  defp check_by_id(id, decisions), do: selected_check(decorate_checks(checks(), decisions), id)

  defp readiness_score(checks) do
    if Enum.empty?(checks),
      do: 0,
      else: round(count_status(checks, "ready") / length(checks) * 100)
  end

  defp count_status(checks, status), do: Enum.count(checks, &(&1.status == status))
  defp count_risk(checks, risk), do: Enum.count(checks, &(&1.risk == risk))
  defp launch_ready?(checks), do: Enum.all?(checks, &(&1.status == "ready"))

  defp release_state(checks) do
    cond do
      launch_ready?(checks) -> "ready"
      count_status(checks, "blocked") > 0 -> "blocked"
      true -> "reviewing"
    end
  end

  defp can_reset?(assigns, checks) do
    assigns.active_tab != "pending" ||
      assigns.lane_filter != "all" ||
      assigns.query != "" ||
      assigns.decisions != %{} ||
      assigns.launch_count > 0 ||
      release_state(checks) != "blocked"
  end

  defp normalize_tab(tab) when tab in ~w(pending ready blocked), do: tab
  defp normalize_tab(_tab), do: "pending"

  defp normalize_lane(lane) when lane in ~w(all engineering product operations support), do: lane
  defp normalize_lane(_lane), do: "all"

  defp normalize_reviewer(reviewer)
       when reviewer in ~w(release-manager engineering-lead product-lead support-lead),
       do: reviewer

  defp normalize_reviewer(_reviewer), do: "release-manager"

  defp field_errors(errors, key), do: Map.get(errors, key, [])

  defp status_variant("ready"), do: "success"
  defp status_variant("blocked"), do: "danger"
  defp status_variant(_status), do: "warning"

  defp risk_variant("high"), do: "danger"
  defp risk_variant("medium"), do: "warning"
  defp risk_variant(_risk), do: "secondary"

  defp status_label("ready"), do: "Ready"
  defp status_label("blocked"), do: "Blocked"
  defp status_label("pending"), do: "Pending"
  defp status_label("reviewing"), do: "Reviewing"
  defp status_label("launched"), do: "Launched"
  defp status_label(status), do: status

  defp tab_label("ready"), do: "ready"
  defp tab_label("blocked"), do: "blocked"
  defp tab_label(_tab), do: "pending"

  defp risk_label("high"), do: "High"
  defp risk_label("medium"), do: "Medium"
  defp risk_label(_risk), do: "Low"

  defp lane_label("engineering"), do: "Engineering"
  defp lane_label("product"), do: "Product"
  defp lane_label("operations"), do: "Operations"
  defp lane_label("support"), do: "Support"
  defp lane_label(_lane), do: "All lanes"

  defp reviewer_label("engineering-lead"), do: "Engineering lead"
  defp reviewer_label("product-lead"), do: "Product lead"
  defp reviewer_label("support-lead"), do: "Support lead"
  defp reviewer_label(_reviewer), do: "Release manager"

  defp lane_options do
    [
      {"All lanes", "all"},
      {"Engineering", "engineering"},
      {"Product", "product"},
      {"Operations", "operations"},
      {"Support", "support"}
    ]
  end

  defp reviewer_options do
    [
      {"Release manager", "release-manager"},
      {"Engineering lead", "engineering-lead"},
      {"Product lead", "product-lead"},
      {"Support lead", "support-lead"}
    ]
  end

  defp empty_check do
    %{
      id: "",
      title: "No check selected",
      lane: "",
      owner: "",
      risk: "low",
      evidence: "Open a release check to review its evidence.",
      status: "pending",
      status_variant: "warning",
      reviewer: "",
      note: ""
    }
  end

  defp checks do
    [
      %{
        id: "migration-smoke",
        title: "Migration smoke test",
        lane: "engineering",
        owner: "Mina",
        risk: "high",
        evidence:
          "Database migration replay finished, but production smoke approval is still missing.",
        status: "pending",
        status_variant: "warning",
        reviewer: "",
        note: ""
      },
      %{
        id: "rollout-flags",
        title: "Feature flag rollout",
        lane: "product",
        owner: "Luka",
        risk: "medium",
        evidence: "Gradual rollout flags are configured for 5%, 25%, 50%, and global release.",
        status: "pending",
        status_variant: "warning",
        reviewer: "",
        note: ""
      },
      %{
        id: "support-brief",
        title: "Support launch brief",
        lane: "support",
        owner: "Sara",
        risk: "low",
        evidence: "Support macros, escalation contacts, and known issue copy are ready.",
        status: "ready",
        status_variant: "success",
        reviewer: "support-lead",
        note: "Support brief reviewed and ready for launch handoff."
      },
      %{
        id: "rollback-runbook",
        title: "Rollback runbook",
        lane: "operations",
        owner: "Ivan",
        risk: "high",
        evidence: "Rollback owner is assigned, but the command checklist still needs approval.",
        status: "blocked",
        status_variant: "danger",
        reviewer: "",
        note: ""
      }
    ]
  end
end
