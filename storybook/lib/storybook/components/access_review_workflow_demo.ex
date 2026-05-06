defmodule ExoUI.Storybook.Components.AccessReviewWorkflowDemo do
  @moduledoc """
  Production-style access review workflow.

  Demonstrates a security/admin review queue with tabs, filters, command
  routing, table rows, drawer-hosted review details, server validation,
  guarded revocation, reset behavior, and live status text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok, assign_initial(socket, "initial access review")}
  end

  @impl true
  def handle_event("change-access-tab", %{"tab" => tab}, socket) do
    tab = normalize_tab(tab)

    {:noreply,
     assign(socket,
       active_tab: tab,
       selected_grant_id: nil,
       last_action: "opened #{tab_label(tab)} tab"
     )}
  end

  def handle_event("change-access-filters", %{"access" => params}, socket) do
    {:noreply,
     assign(socket,
       query: Map.get(params, "query", ""),
       risk_filter: normalize_risk(Map.get(params, "risk", "all")),
       selected_grant_id: nil,
       last_action: "changed access filters"
     )}
  end

  def handle_event("run-access-command", %{"command" => command}, socket) do
    {active_tab, risk_filter, query, label} =
      case command do
        "high-risk" -> {"pending", "high", "", "high-risk queue"}
        "approved" -> {"approved", "all", "", "approved grants"}
        "finance" -> {"pending", "all", "finance", "finance access"}
        _ -> {"pending", "all", "", "pending access"}
      end

    {:noreply,
     assign(socket,
       active_tab: active_tab,
       risk_filter: risk_filter,
       query: query,
       selected_grant_id: nil,
       command_count: socket.assigns.command_count + 1,
       last_action: "opened #{label} from command palette"
     )}
  end

  def handle_event("open-access-grant", %{"id" => id}, socket) do
    grant = grant_by_id(id, socket.assigns.decisions)

    {:noreply,
     assign(socket,
       selected_grant_id: grant.id,
       review_note: "",
       review_owner: "security",
       errors: %{},
       last_action: "opened access review for #{grant.user}"
     )}
  end

  def handle_event("change-access-review-note", %{"review" => params}, socket) do
    {:noreply,
     assign(socket,
       review_note: Map.get(params, "note", ""),
       review_owner: normalize_owner(Map.get(params, "owner", socket.assigns.review_owner)),
       errors: %{},
       last_action: "edited review note"
     )}
  end

  def handle_event("request-access-evidence", _params, socket) do
    note = String.trim(socket.assigns.review_note)

    if String.length(note) < 8 do
      {:noreply,
       assign(socket,
         errors: %{note: ["Add at least 8 characters before requesting evidence."]},
         validation_count: socket.assigns.validation_count + 1,
         last_action: "blocked evidence request"
       )}
    else
      selected = selected_grant(socket.assigns.decisions, socket.assigns.selected_grant_id)

      {:noreply,
       assign(socket,
         decisions:
           Map.put(socket.assigns.decisions, selected.id, %{
             status: "evidence",
             note: note,
             owner: socket.assigns.review_owner
           }),
         errors: %{},
         evidence_count: socket.assigns.evidence_count + 1,
         last_action: "requested evidence for #{selected.user}"
       )}
    end
  end

  def handle_event("approve-access-grant", _params, socket) do
    selected = selected_grant(socket.assigns.decisions, socket.assigns.selected_grant_id)

    {:noreply,
     assign(socket,
       decisions:
         Map.put(socket.assigns.decisions, selected.id, %{
           status: "approved",
           note: socket.assigns.review_note,
           owner: socket.assigns.review_owner
         }),
       active_tab: "approved",
       selected_grant_id: nil,
       approved_count: socket.assigns.approved_count + 1,
       errors: %{},
       last_action: "approved #{selected.user}"
     )}
  end

  def handle_event("revoke-access-grant", _params, socket) do
    selected = selected_grant(socket.assigns.decisions, socket.assigns.selected_grant_id)

    {:noreply,
     assign(socket,
       decisions:
         Map.put(socket.assigns.decisions, selected.id, %{
           status: "revoked",
           note: socket.assigns.review_note,
           owner: socket.assigns.review_owner
         }),
       active_tab: "revoked",
       selected_grant_id: nil,
       revoked_count: socket.assigns.revoked_count + 1,
       errors: %{},
       last_action: "revoked #{selected.user}"
     )}
  end

  def handle_event("reset-access-review", _params, socket) do
    {:noreply, assign_initial(socket, "reset access review")}
  end

  @impl true
  def render(assigns) do
    grants = decorate_grants(grants(), assigns.decisions)
    rows = visible_grants(grants, assigns)
    selected = selected_grant(assigns.decisions, assigns.selected_grant_id)

    assigns =
      assign(assigns,
        grants: grants,
        rows: rows,
        selected_grant: selected,
        visible_count: length(rows),
        pending_count: count_status(grants, "pending"),
        approved_total: count_status(grants, "approved"),
        revoked_total: count_status(grants, "revoked"),
        high_risk_count: count_risk(rows, "high"),
        note_errors: field_errors(assigns.errors, :note),
        can_reset?: can_reset?(assigns)
      )

    ~H"""
    <div
      id={@id}
      data-exo="access-review-workflow"
      data-active-tab={@active_tab}
      data-risk-filter={@risk_filter}
      data-query={@query}
      data-visible-count={@visible_count}
      data-pending-count={@pending_count}
      data-approved-count={@approved_count}
      data-revoked-count={@revoked_count}
      data-evidence-count={@evidence_count}
      data-validation-count={@validation_count}
      data-command-count={@command_count}
      data-selected-grant={@selected_grant.id}
      data-last-action={@last_action}
      style="min-height: 780px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Access review workflow
        <:subtitle>
          Security review queue with tabs, command routing, evidence validation, drawer detail, and guarded revocation.
        </:subtitle>
        <:actions>
          <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
            <.button
              id="access-review-open-command"
              type="button"
              variant="outline"
              phx-click={show_command_palette("access-review-command")}
            >
              <.icon name="search" /> Open access commands
            </.button>
            <.button
              type="button"
              variant="ghost"
              disabled={!@can_reset?}
              phx-click="reset-access-review"
              phx-target={@myself}
            >
              Reset review
            </.button>
          </div>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Pending" value={@pending_count} subtitle="needs decision" />
        <.stat_card title="High risk" value={@high_risk_count} subtitle="visible rows" />
        <.stat_card title="Approved" value={@approved_total} subtitle="all grants" />
        <.stat_card title="Revoked" value={@revoked_total} subtitle="all grants" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Review controls">
            <.tabs
              id="access-review-tabs"
              active={@active_tab}
              aria_label="Access review status"
              activation="automatic"
            >
              <:tab id="pending" label="Pending" icon="clock" click={tab_click("pending", @myself)} />
              <:tab
                id="approved"
                label="Approved"
                icon="check"
                click={tab_click("approved", @myself)}
              />
              <:tab
                id="revoked"
                label="Revoked"
                icon="shield-x"
                click={tab_click("revoked", @myself)}
              />
            </.tabs>

            <ExoUI.Components.Form.form
              for={%{}}
              as={:access}
              phx-change="change-access-filters"
              phx-target={@myself}
              style="display: grid; grid-template-columns: minmax(14rem, 1fr) 12rem; gap: 0.875rem; align-items: end; margin-top: 1rem;"
            >
              <ExoUI.Components.Form.input
                id="access-review-query"
                name="access[query]"
                label="Search access"
                value={@query}
                placeholder="User, team, role, or resource"
              />
              <ExoUI.Components.Form.select
                id="access-review-risk"
                name="access[risk]"
                label="Risk"
                value={@risk_filter}
                options={risk_options()}
              />
            </ExoUI.Components.Form.form>
          </.content_card>

          <.content_card title="Access grants">
            <:action>
              <.badge variant={if @visible_count == 0, do: "warning", else: "primary"}>
                {@visible_count} visible
              </.badge>
            </:action>

            <.table
              id="access-review-table"
              rows={@rows}
              row_id={&grant_row_id/1}
              row_label={&grant_row_label/1}
              caption="Access review grants"
              empty_label="No access grants match the current review filters."
            >
              <:col :let={grant} label="User">
                <span style="display: grid; gap: 0.125rem;">
                  <strong>{grant.user}</strong>
                  <span style="color: var(--exo-muted-foreground); font-size: var(--exo-text-sm);">
                    {grant.team}
                  </span>
                </span>
              </:col>
              <:col :let={grant} label="Resource">{grant.resource}</:col>
              <:col :let={grant} label="Role">{grant.role}</:col>
              <:col :let={grant} label="Risk">
                <.badge variant={risk_variant(grant.risk)}>{risk_label(grant.risk)}</.badge>
              </:col>
              <:col :let={grant} label="Status">
                <.badge variant={status_variant(grant.status)}>{status_label(grant.status)}</.badge>
              </:col>
              <:col :let={grant} label="Last used" align="right">{grant.last_used}</:col>
              <:col :let={grant} label="Action" align="right">
                <.button
                  type="button"
                  size="sm"
                  variant="outline"
                  phx-click={open_grant_click(grant.id, @myself)}
                >
                  Open access review for {grant.user}
                </.button>
              </:col>
            </.table>
          </.content_card>
        </div>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Review summary">
            <.list>
              <:item title="Current tab">{tab_label(@active_tab)}</:item>
              <:item title="Risk filter">{risk_label(@risk_filter)}</:item>
              <:item title="Evidence">{@evidence_count}</:item>
              <:item title="Validations">{@validation_count}</:item>
            </.list>
          </.content_card>

          <.content_card title="Coverage">
            <.list>
              <:item title="Navigation">tabs plus command palette routing</:item>
              <:item title="Tables">server filters, empty state, row actions</:item>
              <:item title="Drawer">review details and form validation</:item>
              <:item title="Confirm">guarded revoke action</:item>
            </.list>
          </.content_card>

          <.alert kind={if @validation_count > 0, do: :warning, else: :info} title="Access status">
            {@last_action}
          </.alert>
        </aside>
      </div>

      <p
        id="access-review-state"
        data-exo="access-review-state"
        data-active-tab={@active_tab}
        data-risk-filter={@risk_filter}
        data-query={@query}
        data-visible-count={@visible_count}
        data-pending-count={@pending_count}
        data-approved-count={@approved_count}
        data-revoked-count={@revoked_count}
        data-evidence-count={@evidence_count}
        data-validation-count={@validation_count}
        data-command-count={@command_count}
        data-selected-grant={@selected_grant.id}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
        style="margin: 0; color: var(--exo-muted-foreground);"
      >
        Showing {@visible_count} {tab_label(@active_tab)} grants; {@last_action}.
      </p>

      <.command_palette
        id="access-review-command"
        label="Access review command palette"
        placeholder="Search access commands..."
        shortcut="ctrl+shift+a"
        empty_label="No access review commands match."
      >
        <:item
          label="Open high-risk queue"
          value="high-risk"
          search="high risk pending access security"
          shortcut="H"
          click={command_click("high-risk", @myself)}
        />
        <:item
          label="Open approved grants"
          value="approved"
          search="approved access grants"
          shortcut="A"
          click={command_click("approved", @myself)}
        />
        <:item
          label="Find finance access"
          value="finance"
          search="finance access grants"
          shortcut="F"
          click={command_click("finance", @myself)}
        />
      </.command_palette>

      <.drawer id="access-review-drawer" side="right">
        <:title>{drawer_title(@selected_grant)}</:title>
        <section
          id="access-review-detail"
          data-exo="access-review-detail"
          data-selected-grant={@selected_grant.id}
          data-status={@selected_grant.status}
          data-risk={@selected_grant.risk}
          style="display: flex; flex-direction: column; gap: 1rem;"
        >
          <.alert
            kind={detail_alert_kind(@selected_grant)}
            title={detail_alert_title(@selected_grant)}
          >
            {detail_summary(@selected_grant)}
          </.alert>

          <.list>
            <:item title="User">{@selected_grant.user}</:item>
            <:item title="Email">{@selected_grant.email}</:item>
            <:item title="Team">{@selected_grant.team}</:item>
            <:item title="Resource">{@selected_grant.resource}</:item>
            <:item title="Role">{@selected_grant.role}</:item>
            <:item title="Last used">{@selected_grant.last_used}</:item>
            <:item title="Status">
              <.badge variant={status_variant(@selected_grant.status)}>
                {status_label(@selected_grant.status)}
              </.badge>
            </:item>
          </.list>

          <ExoUI.Components.Form.form
            for={%{}}
            as={:review}
            phx-change="change-access-review-note"
            phx-target={@myself}
            style="display: grid; gap: 0.875rem;"
          >
            <ExoUI.Components.Form.select
              id="access-review-owner"
              name="review[owner]"
              label="Routing owner"
              value={@review_owner}
              options={owner_options()}
            />
            <ExoUI.Components.Form.input
              id="access-review-note"
              name="review[note]"
              type="textarea"
              label="Decision note"
              value={@review_note}
              rows="4"
              description="Required when requesting additional evidence."
              errors={@note_errors}
            />
          </ExoUI.Components.Form.form>

          <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
            <.button
              type="button"
              variant="ghost"
              phx-click={hide_drawer("access-review-drawer")}
            >
              Close review
            </.button>
            <.button
              type="button"
              variant="outline"
              disabled={@selected_grant.id == ""}
              phx-click="request-access-evidence"
              phx-target={@myself}
            >
              Request evidence
            </.button>
            <.button
              type="button"
              variant="secondary"
              disabled={@selected_grant.id == ""}
              phx-click={approve_click(@myself)}
            >
              Approve access
            </.button>
            <.button
              type="button"
              variant="danger"
              disabled={@selected_grant.id == ""}
              phx-click={show_modal("access-review-revoke-confirm")}
            >
              Prepare revoke
            </.button>
          </div>
        </section>
      </.drawer>

      <.confirm_modal
        id="access-review-revoke-confirm"
        title="Revoke access?"
        message={revoke_message(@selected_grant)}
        confirm_text="Revoke access"
        cancel_text="Keep access"
        variant="danger"
        close_on_confirm={false}
        on_confirm={revoke_click(@myself)}
      />
    </div>
    """
  end

  defp assign_initial(socket, last_action) do
    assign(socket,
      active_tab: "pending",
      risk_filter: "all",
      query: "",
      selected_grant_id: nil,
      decisions: %{},
      review_note: "",
      review_owner: "security",
      errors: %{},
      approved_count: 0,
      revoked_count: 0,
      evidence_count: 0,
      validation_count: 0,
      command_count: 0,
      last_action: last_action
    )
  end

  defp decorate_grants(grants, decisions) do
    Enum.map(grants, fn grant ->
      decision = Map.get(decisions, grant.id, %{})

      grant
      |> Map.put(:status, Map.get(decision, :status, grant.status))
      |> Map.put(:decision_note, Map.get(decision, :note, ""))
      |> Map.put(:decision_owner, Map.get(decision, :owner, "security"))
    end)
  end

  defp visible_grants(grants, assigns) do
    grants
    |> Enum.filter(&(status_group(&1.status) == assigns.active_tab))
    |> Enum.filter(&(assigns.risk_filter == "all" or &1.risk == assigns.risk_filter))
    |> Enum.filter(&matches_query?(&1, assigns.query))
    |> Enum.sort_by(&{risk_rank(&1.risk), &1.user})
  end

  defp matches_query?(_grant, ""), do: true

  defp matches_query?(grant, query) do
    haystack =
      [grant.user, grant.email, grant.team, grant.role, grant.resource]
      |> Enum.join(" ")
      |> String.downcase()

    String.contains?(haystack, String.downcase(query))
  end

  defp selected_grant(_decisions, nil), do: empty_grant()

  defp selected_grant(decisions, id), do: grant_by_id(id, decisions)

  defp grant_by_id(nil, _decisions), do: empty_grant()

  defp grant_by_id(id, decisions) do
    grants()
    |> decorate_grants(decisions)
    |> Enum.find(&(&1.id == id))
    |> case do
      nil -> empty_grant()
      grant -> grant
    end
  end

  defp count_status(grants, status), do: Enum.count(grants, &(status_group(&1.status) == status))
  defp count_risk(grants, risk), do: Enum.count(grants, &(&1.risk == risk))

  defp status_group("approved"), do: "approved"
  defp status_group("revoked"), do: "revoked"
  defp status_group(_status), do: "pending"

  defp normalize_tab(tab) when tab in ["pending", "approved", "revoked"], do: tab
  defp normalize_tab(_tab), do: "pending"

  defp normalize_risk(risk) when risk in ["all", "low", "medium", "high"], do: risk
  defp normalize_risk(_risk), do: "all"

  defp normalize_owner(owner) when owner in ["security", "it", "manager"], do: owner
  defp normalize_owner(_owner), do: "security"

  defp tab_label("approved"), do: "Approved"
  defp tab_label("revoked"), do: "Revoked"
  defp tab_label(_tab), do: "Pending"

  defp risk_label("high"), do: "High"
  defp risk_label("medium"), do: "Medium"
  defp risk_label("low"), do: "Low"
  defp risk_label(_risk), do: "All"

  defp risk_variant("high"), do: "danger"
  defp risk_variant("medium"), do: "warning"
  defp risk_variant(_risk), do: "secondary"

  defp status_label("approved"), do: "Approved"
  defp status_label("revoked"), do: "Revoked"
  defp status_label("evidence"), do: "Evidence requested"
  defp status_label(_status), do: "Pending"

  defp status_variant("approved"), do: "success"
  defp status_variant("revoked"), do: "danger"
  defp status_variant("evidence"), do: "warning"
  defp status_variant(_status), do: "secondary"

  defp risk_rank("high"), do: 0
  defp risk_rank("medium"), do: 1
  defp risk_rank(_risk), do: 2

  defp detail_alert_kind(%{status: "revoked"}), do: :error
  defp detail_alert_kind(%{status: "approved"}), do: :success
  defp detail_alert_kind(%{risk: "high"}), do: :warning
  defp detail_alert_kind(_grant), do: :info

  defp detail_alert_title(%{status: "evidence"}), do: "Evidence requested"
  defp detail_alert_title(%{risk: "high"}), do: "High-risk access"
  defp detail_alert_title(_grant), do: "Access review"

  defp detail_summary(%{id: ""}), do: "Open a row to review access details."

  defp detail_summary(grant) do
    "#{grant.user} has #{grant.role} access to #{grant.resource}; last used #{grant.last_used}."
  end

  defp drawer_title(%{id: ""}), do: "Access review"
  defp drawer_title(grant), do: "Review #{grant.user}"

  defp revoke_message(%{id: ""}), do: "Select an access grant before revoking access."

  defp revoke_message(grant) do
    "Revoke #{grant.role} access to #{grant.resource} for #{grant.user}?"
  end

  defp can_reset?(assigns) do
    assigns.active_tab != "pending" or assigns.risk_filter != "all" or assigns.query != "" or
      assigns.decisions != %{} or assigns.selected_grant_id != nil or assigns.approved_count != 0 or
      assigns.revoked_count != 0 or assigns.evidence_count != 0 or assigns.validation_count != 0 or
      assigns.command_count != 0
  end

  defp field_errors(errors, field), do: Map.get(errors, field, [])

  defp command_click(command, target) do
    JS.push("run-access-command", value: %{command: command}, target: target)
    |> hide_command_palette("access-review-command")
  end

  defp tab_click(tab, target) do
    JS.push("change-access-tab", value: %{tab: tab}, target: target)
  end

  defp open_grant_click(id, target) do
    JS.push("open-access-grant", value: %{id: id}, target: target)
    |> show_drawer_js("access-review-drawer")
  end

  defp approve_click(target) do
    JS.push("approve-access-grant", target: target)
    |> hide_drawer("access-review-drawer")
  end

  defp revoke_click(target) do
    JS.push("revoke-access-grant", target: target)
    |> hide_modal("access-review-revoke-confirm")
    |> hide_drawer("access-review-drawer")
  end

  defp show_drawer_js(js, id) do
    js
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> JS.remove_attribute("inert", to: "##{id}")
    |> JS.focus_first(to: "##{id} [data-exo=\"drawer-content\"]")
  end

  defp grant_row_id(grant), do: "access-grant-#{grant.id}"
  defp grant_row_label(grant), do: "Access grant for #{grant.user}"

  defp risk_options do
    [
      {"All risks", "all"},
      {"High", "high"},
      {"Medium", "medium"},
      {"Low", "low"}
    ]
  end

  defp owner_options do
    [
      {"Security", "security"},
      {"IT operations", "it"},
      {"Manager review", "manager"}
    ]
  end

  defp empty_grant do
    %{
      id: "",
      user: "No grant selected",
      email: "none",
      team: "None",
      role: "None",
      resource: "None",
      risk: "low",
      status: "pending",
      last_used: "none",
      decision_note: "",
      decision_owner: "security"
    }
  end

  defp grants do
    [
      %{
        id: "ana-admin",
        user: "Ana Markovic",
        email: "ana@example.com",
        team: "Finance",
        role: "Workspace admin",
        resource: "Billing console",
        risk: "high",
        status: "pending",
        last_used: "2h ago"
      },
      %{
        id: "mina-prod",
        user: "Mina Kovac",
        email: "mina@example.com",
        team: "Engineering",
        role: "Production deployer",
        resource: "Deploy pipeline",
        risk: "high",
        status: "pending",
        last_used: "1d ago"
      },
      %{
        id: "sara-crm",
        user: "Sara Ilic",
        email: "sara@example.com",
        team: "Sales",
        role: "Account editor",
        resource: "CRM records",
        risk: "medium",
        status: "pending",
        last_used: "3d ago"
      },
      %{
        id: "lena-support",
        user: "Lena Petrovic",
        email: "lena@example.com",
        team: "Support",
        role: "Ticket export",
        resource: "Support desk",
        risk: "low",
        status: "pending",
        last_used: "5d ago"
      },
      %{
        id: "ivan-reports",
        user: "Ivan Jovanovic",
        email: "ivan@example.com",
        team: "Analytics",
        role: "Report viewer",
        resource: "Revenue reports",
        risk: "low",
        status: "approved",
        last_used: "4h ago"
      },
      %{
        id: "nora-vault",
        user: "Nora Simic",
        email: "nora@example.com",
        team: "Operations",
        role: "Secret reader",
        resource: "Credential vault",
        risk: "high",
        status: "revoked",
        last_used: "19d ago"
      }
    ]
  end
end
