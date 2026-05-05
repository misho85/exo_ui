defmodule ExoUI.Storybook.Components.IncidentResponseWorkflowDemo do
  @moduledoc """
  Production-style incident response workflow.

  Demonstrates an operations incident queue with status tabs, severity/search
  filters, command routing, table row actions, drawer-hosted triage notes,
  validation, escalation, guarded resolution, reset behavior, and live status.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok, assign_initial(socket, "initial incident response")}
  end

  @impl true
  def handle_event("change-incident-tab", %{"tab" => tab}, socket) do
    tab = normalize_tab(tab)

    {:noreply,
     assign(socket,
       active_tab: tab,
       selected_incident_id: nil,
       last_action: "opened #{tab_label(tab)} incidents"
     )}
  end

  def handle_event("change-incident-filters", %{"incident" => params}, socket) do
    {:noreply,
     assign(socket,
       query: Map.get(params, "query", ""),
       severity_filter: normalize_severity(Map.get(params, "severity", "all")),
       selected_incident_id: nil,
       last_action: "changed incident filters"
     )}
  end

  def handle_event("run-incident-command", %{"command" => command}, socket) do
    {active_tab, severity_filter, query, label} =
      case command do
        "critical" -> {"open", "critical", "", "critical incidents"}
        "payments" -> {"open", "all", "payments", "payments incidents"}
        "resolved" -> {"resolved", "all", "", "resolved incidents"}
        _ -> {"open", "all", "", "open incidents"}
      end

    {:noreply,
     assign(socket,
       active_tab: active_tab,
       severity_filter: severity_filter,
       query: query,
       selected_incident_id: nil,
       command_count: socket.assigns.command_count + 1,
       last_action: "opened #{label} from command palette"
     )}
  end

  def handle_event("open-incident", %{"id" => id}, socket) do
    incident = incident_by_id(id, socket.assigns.decisions)

    {:noreply,
     assign(socket,
       selected_incident_id: incident.id,
       triage_note: "",
       owner: "platform",
       errors: %{},
       last_action: "opened incident #{incident.title}"
     )}
  end

  def handle_event("change-incident-triage", %{"triage" => params}, socket) do
    {:noreply,
     assign(socket,
       owner: normalize_owner(Map.get(params, "owner", socket.assigns.owner)),
       triage_note: Map.get(params, "note", ""),
       errors: %{},
       last_action: "edited incident triage"
     )}
  end

  def handle_event("escalate-incident", _params, socket) do
    note = String.trim(socket.assigns.triage_note)

    if String.length(note) < 10 do
      {:noreply,
       assign(socket,
         errors: %{note: ["Add at least 10 characters before escalating."]},
         validation_count: socket.assigns.validation_count + 1,
         last_action: "blocked incident escalation"
       )}
    else
      selected = selected_incident(socket.assigns.decisions, socket.assigns.selected_incident_id)

      {:noreply,
       assign(socket,
         decisions:
           Map.put(socket.assigns.decisions, selected.id, %{
             status: "escalated",
             note: note,
             owner: socket.assigns.owner
           }),
         errors: %{},
         escalation_count: socket.assigns.escalation_count + 1,
         last_action: "escalated #{selected.title}"
       )}
    end
  end

  def handle_event("acknowledge-incident", _params, socket) do
    selected = selected_incident(socket.assigns.decisions, socket.assigns.selected_incident_id)

    {:noreply,
     assign(socket,
       decisions:
         Map.put(socket.assigns.decisions, selected.id, %{
           status: "acknowledged",
           note: socket.assigns.triage_note,
           owner: socket.assigns.owner
         }),
       acknowledged_count: socket.assigns.acknowledged_count + 1,
       errors: %{},
       last_action: "acknowledged #{selected.title}"
     )}
  end

  def handle_event("resolve-incident", _params, socket) do
    selected = selected_incident(socket.assigns.decisions, socket.assigns.selected_incident_id)

    {:noreply,
     assign(socket,
       decisions:
         Map.put(socket.assigns.decisions, selected.id, %{
           status: "resolved",
           note: socket.assigns.triage_note,
           owner: socket.assigns.owner
         }),
       active_tab: "resolved",
       selected_incident_id: nil,
       resolved_count: socket.assigns.resolved_count + 1,
       errors: %{},
       last_action: "resolved #{selected.title}"
     )}
  end

  def handle_event("reset-incident-response", _params, socket) do
    {:noreply, assign_initial(socket, "reset incident response")}
  end

  @impl true
  def render(assigns) do
    incidents = decorate_incidents(incidents(), assigns.decisions)
    rows = visible_incidents(incidents, assigns)
    selected = selected_incident(assigns.decisions, assigns.selected_incident_id)

    assigns =
      assign(assigns,
        incidents: incidents,
        rows: rows,
        selected_incident: selected,
        visible_count: length(rows),
        open_count: count_status(incidents, "open"),
        resolved_total: count_status(incidents, "resolved"),
        critical_visible_count: count_severity(rows, "critical"),
        note_errors: field_errors(assigns.errors, :note),
        can_reset?: can_reset?(assigns)
      )

    ~H"""
    <div
      id={@id}
      data-exo="incident-response-workflow"
      data-active-tab={@active_tab}
      data-severity-filter={@severity_filter}
      data-query={@query}
      data-visible-count={@visible_count}
      data-open-count={@open_count}
      data-critical-visible-count={@critical_visible_count}
      data-acknowledged-count={@acknowledged_count}
      data-escalation-count={@escalation_count}
      data-resolved-count={@resolved_count}
      data-validation-count={@validation_count}
      data-command-count={@command_count}
      data-selected-incident={@selected_incident.id}
      data-last-action={@last_action}
      style="min-height: 780px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Incident response workflow
        <:subtitle>
          Operations queue with severity filters, command routing, triage validation, escalation, and guarded resolution.
        </:subtitle>
        <:actions>
          <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
            <.button
              id="incident-open-command"
              type="button"
              variant="outline"
              phx-click={show_command_palette("incident-command")}
            >
              <.icon name="search" /> Open incident commands
            </.button>
            <.button
              type="button"
              variant="ghost"
              disabled={!@can_reset?}
              phx-click="reset-incident-response"
              phx-target={@myself}
            >
              Reset incidents
            </.button>
          </div>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Open" value={@open_count} subtitle="active incidents" />
        <.stat_card title="Critical" value={@critical_visible_count} subtitle="visible rows" />
        <.stat_card title="Escalated" value={@escalation_count} subtitle="this session" />
        <.stat_card title="Resolved" value={@resolved_total} subtitle="all incidents" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Incident controls">
            <.tabs
              id="incident-response-tabs"
              active={@active_tab}
              aria_label="Incident status"
              activation="automatic"
            >
              <:tab id="open" label="Open" icon="radio-tower" click={tab_click("open", @myself)} />
              <:tab
                id="resolved"
                label="Resolved"
                icon="check"
                click={tab_click("resolved", @myself)}
              />
            </.tabs>

            <ExoUI.Components.Form.form
              for={%{}}
              as={:incident}
              phx-change="change-incident-filters"
              phx-target={@myself}
              style="display: grid; grid-template-columns: minmax(14rem, 1fr) 12rem; gap: 0.875rem; align-items: end; margin-top: 1rem;"
            >
              <ExoUI.Components.Form.input
                id="incident-query"
                name="incident[query]"
                label="Search incidents"
                value={@query}
                placeholder="Service, owner, or summary"
              />
              <ExoUI.Components.Form.input
                id="incident-severity"
                name="incident[severity]"
                type="select"
                label="Severity"
                value={@severity_filter}
                options={severity_options()}
              />
            </ExoUI.Components.Form.form>
          </.content_card>

          <.content_card title="Incident queue">
            <:action>
              <.badge variant={if @visible_count == 0, do: "warning", else: "primary"}>
                {@visible_count} visible
              </.badge>
            </:action>

            <.table
              id="incident-response-table"
              rows={@rows}
              row_id={&incident_row_id/1}
              row_label={&incident_row_label/1}
              caption="Incident response queue"
              empty_label="No incidents match the current filters."
            >
              <:col :let={incident} label="Incident">
                <span style="display: grid; gap: 0.125rem;">
                  <strong>{incident.title}</strong>
                  <span style="color: var(--exo-muted-foreground); font-size: var(--exo-text-sm);">
                    {incident.service}
                  </span>
                </span>
              </:col>
              <:col :let={incident} label="Severity">
                <.badge variant={severity_variant(incident.severity)}>
                  {severity_label(incident.severity)}
                </.badge>
              </:col>
              <:col :let={incident} label="Owner">{incident.owner}</:col>
              <:col :let={incident} label="Status">
                <.badge variant={status_variant(incident.status)}>
                  {status_label(incident.status)}
                </.badge>
              </:col>
              <:col :let={incident} label="Started" align="right">{incident.started}</:col>
              <:col :let={incident} label="Action" align="right">
                <.button
                  type="button"
                  size="sm"
                  variant="outline"
                  phx-click={open_incident_click(incident.id, @myself)}
                >
                  Open incident {incident.title}
                </.button>
              </:col>
            </.table>
          </.content_card>
        </div>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Response state">
            <.list>
              <:item title="Status">{tab_label(@active_tab)}</:item>
              <:item title="Severity">{severity_label(@severity_filter)}</:item>
              <:item title="Acknowledged">{@acknowledged_count}</:item>
              <:item title="Validations">{@validation_count}</:item>
            </.list>
          </.content_card>

          <.content_card title="Coverage">
            <.list>
              <:item title="Navigation">status tabs and command palette</:item>
              <:item title="Queue">filters, empty state, row actions</:item>
              <:item title="Drawer">triage details and validation</:item>
              <:item title="Confirm">guarded resolution</:item>
            </.list>
          </.content_card>

          <.alert
            kind={if @critical_visible_count > 0, do: :warning, else: :info}
            title="Incident status"
          >
            {@last_action}
          </.alert>
        </aside>
      </div>

      <p
        id="incident-response-state"
        data-exo="incident-response-state"
        data-active-tab={@active_tab}
        data-severity-filter={@severity_filter}
        data-query={@query}
        data-visible-count={@visible_count}
        data-open-count={@open_count}
        data-acknowledged-count={@acknowledged_count}
        data-escalation-count={@escalation_count}
        data-resolved-count={@resolved_count}
        data-validation-count={@validation_count}
        data-command-count={@command_count}
        data-selected-incident={@selected_incident.id}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
        style="margin: 0; color: var(--exo-muted-foreground);"
      >
        Showing {@visible_count} {tab_label(@active_tab)} incidents; {@last_action}.
      </p>

      <.command_palette
        id="incident-command"
        label="Incident command palette"
        placeholder="Search incident commands..."
        shortcut="ctrl+shift+i"
        empty_label="No incident commands match."
      >
        <:item
          label="Open critical incidents"
          value="critical"
          search="critical incident sev1 outage"
          shortcut="C"
          click={command_click("critical", @myself)}
        />
        <:item
          label="Find payments incidents"
          value="payments"
          search="payments checkout billing incidents"
          shortcut="P"
          click={command_click("payments", @myself)}
        />
        <:item
          label="Open resolved incidents"
          value="resolved"
          search="resolved incidents postmortem"
          shortcut="R"
          click={command_click("resolved", @myself)}
        />
      </.command_palette>

      <.drawer id="incident-response-drawer" side="right">
        <:title>{drawer_title(@selected_incident)}</:title>
        <section
          id="incident-response-detail"
          data-exo="incident-response-detail"
          data-selected-incident={@selected_incident.id}
          data-status={@selected_incident.status}
          data-severity={@selected_incident.severity}
          style="display: flex; flex-direction: column; gap: 1rem;"
        >
          <.alert
            kind={detail_alert_kind(@selected_incident)}
            title={detail_alert_title(@selected_incident)}
          >
            {detail_summary(@selected_incident)}
          </.alert>

          <.list>
            <:item title="Incident">{@selected_incident.title}</:item>
            <:item title="Service">{@selected_incident.service}</:item>
            <:item title="Owner">{@selected_incident.owner}</:item>
            <:item title="Severity">{severity_label(@selected_incident.severity)}</:item>
            <:item title="Started">{@selected_incident.started}</:item>
            <:item title="Status">
              <.badge variant={status_variant(@selected_incident.status)}>
                {status_label(@selected_incident.status)}
              </.badge>
            </:item>
          </.list>

          <.timeline>
            <:event title="Detected" time={@selected_incident.started}>
              {@selected_incident.detection}
            </:event>
            <:event title="Current action" time="now" current>
              {next_step(@selected_incident)}
            </:event>
          </.timeline>

          <ExoUI.Components.Form.form
            for={%{}}
            as={:triage}
            phx-change="change-incident-triage"
            phx-target={@myself}
            style="display: grid; gap: 0.875rem;"
          >
            <ExoUI.Components.Form.input
              id="incident-owner"
              name="triage[owner]"
              type="select"
              label="Response owner"
              value={@owner}
              options={owner_options()}
            />
            <ExoUI.Components.Form.input
              id="incident-note"
              name="triage[note]"
              type="textarea"
              label="Triage note"
              value={@triage_note}
              rows="4"
              description="Required before escalating an incident."
              errors={@note_errors}
            />
          </ExoUI.Components.Form.form>

          <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
            <.button
              type="button"
              variant="ghost"
              phx-click={hide_drawer("incident-response-drawer")}
            >
              Close incident
            </.button>
            <.button
              type="button"
              variant="outline"
              disabled={@selected_incident.id == ""}
              phx-click="escalate-incident"
              phx-target={@myself}
            >
              Escalate incident
            </.button>
            <.button
              type="button"
              variant="secondary"
              disabled={@selected_incident.id == ""}
              phx-click="acknowledge-incident"
              phx-target={@myself}
            >
              Acknowledge incident
            </.button>
            <.button
              type="button"
              variant="danger"
              disabled={@selected_incident.id == ""}
              phx-click={show_modal("incident-resolve-confirm")}
            >
              Prepare resolve
            </.button>
          </div>
        </section>
      </.drawer>

      <.confirm_modal
        id="incident-resolve-confirm"
        title="Resolve incident?"
        message={resolve_message(@selected_incident)}
        confirm_text="Resolve incident"
        cancel_text="Keep open"
        variant="danger"
        close_on_confirm={false}
        on_confirm={resolve_click(@myself)}
      />
    </div>
    """
  end

  defp assign_initial(socket, last_action) do
    assign(socket,
      active_tab: "open",
      severity_filter: "all",
      query: "",
      selected_incident_id: nil,
      decisions: %{},
      owner: "platform",
      triage_note: "",
      errors: %{},
      acknowledged_count: 0,
      escalation_count: 0,
      resolved_count: 0,
      validation_count: 0,
      command_count: 0,
      last_action: last_action
    )
  end

  defp decorate_incidents(incidents, decisions) do
    Enum.map(incidents, fn incident ->
      decision = Map.get(decisions, incident.id, %{})

      incident
      |> Map.put(:status, Map.get(decision, :status, incident.status))
      |> Map.put(:decision_note, Map.get(decision, :note, ""))
      |> Map.put(:decision_owner, Map.get(decision, :owner, incident.owner))
    end)
  end

  defp visible_incidents(incidents, assigns) do
    incidents
    |> Enum.filter(&(status_group(&1.status) == assigns.active_tab))
    |> Enum.filter(&(assigns.severity_filter == "all" or &1.severity == assigns.severity_filter))
    |> Enum.filter(&matches_query?(&1, assigns.query))
    |> Enum.sort_by(&{severity_rank(&1.severity), &1.title})
  end

  defp matches_query?(_incident, ""), do: true

  defp matches_query?(incident, query) do
    haystack =
      [incident.title, incident.service, incident.owner, incident.detection]
      |> Enum.join(" ")
      |> String.downcase()

    String.contains?(haystack, String.downcase(query))
  end

  defp selected_incident(_decisions, nil), do: empty_incident()
  defp selected_incident(decisions, id), do: incident_by_id(id, decisions)

  defp incident_by_id(nil, _decisions), do: empty_incident()

  defp incident_by_id(id, decisions) do
    incidents()
    |> decorate_incidents(decisions)
    |> Enum.find(&(&1.id == id))
    |> case do
      nil -> empty_incident()
      incident -> incident
    end
  end

  defp count_status(incidents, status),
    do: Enum.count(incidents, &(status_group(&1.status) == status))

  defp count_severity(incidents, severity), do: Enum.count(incidents, &(&1.severity == severity))

  defp status_group("resolved"), do: "resolved"
  defp status_group(_status), do: "open"

  defp normalize_tab(tab) when tab in ["open", "resolved"], do: tab
  defp normalize_tab(_tab), do: "open"

  defp normalize_severity(severity) when severity in ["all", "critical", "high", "medium"],
    do: severity

  defp normalize_severity(_severity), do: "all"

  defp normalize_owner(owner) when owner in ["platform", "payments", "support"], do: owner
  defp normalize_owner(_owner), do: "platform"

  defp tab_label("resolved"), do: "Resolved"
  defp tab_label(_tab), do: "Open"

  defp severity_label("critical"), do: "Critical"
  defp severity_label("high"), do: "High"
  defp severity_label("medium"), do: "Medium"
  defp severity_label(_severity), do: "All"

  defp severity_variant("critical"), do: "danger"
  defp severity_variant("high"), do: "warning"
  defp severity_variant(_severity), do: "secondary"

  defp status_label("acknowledged"), do: "Acknowledged"
  defp status_label("escalated"), do: "Escalated"
  defp status_label("resolved"), do: "Resolved"
  defp status_label(_status), do: "Open"

  defp status_variant("acknowledged"), do: "secondary"
  defp status_variant("escalated"), do: "warning"
  defp status_variant("resolved"), do: "success"
  defp status_variant(_status), do: "danger"

  defp severity_rank("critical"), do: 0
  defp severity_rank("high"), do: 1
  defp severity_rank(_severity), do: 2

  defp detail_alert_kind(%{status: "resolved"}), do: :success
  defp detail_alert_kind(%{status: "escalated"}), do: :warning
  defp detail_alert_kind(%{severity: "critical"}), do: :error
  defp detail_alert_kind(_incident), do: :info

  defp detail_alert_title(%{status: "escalated"}), do: "Escalated incident"
  defp detail_alert_title(%{severity: "critical"}), do: "Critical incident"
  defp detail_alert_title(_incident), do: "Incident triage"

  defp detail_summary(%{id: ""}), do: "Open an incident row to begin triage."

  defp detail_summary(incident) do
    "#{incident.service} is assigned to #{incident.owner}; #{incident.detection}"
  end

  defp next_step(%{status: "escalated"}), do: "Coordinate with the incident commander."

  defp next_step(%{status: "acknowledged"}),
    do: "Continue mitigation and prepare resolution notes."

  defp next_step(%{status: "resolved"}), do: "Review post-incident follow-up."

  defp next_step(_incident),
    do: "Assign an owner, capture triage notes, and choose a response action."

  defp drawer_title(%{id: ""}), do: "Incident triage"
  defp drawer_title(incident), do: "Triage #{incident.title}"

  defp resolve_message(%{id: ""}), do: "Select an incident before resolving it."
  defp resolve_message(incident), do: "Resolve #{incident.title} for #{incident.service}?"

  defp can_reset?(assigns) do
    assigns.active_tab != "open" or assigns.severity_filter != "all" or assigns.query != "" or
      assigns.decisions != %{} or assigns.selected_incident_id != nil or
      assigns.acknowledged_count != 0 or assigns.escalation_count != 0 or
      assigns.resolved_count != 0 or assigns.validation_count != 0 or assigns.command_count != 0
  end

  defp field_errors(errors, field), do: Map.get(errors, field, [])

  defp tab_click(tab, target) do
    JS.push("change-incident-tab", value: %{tab: tab}, target: target)
  end

  defp command_click(command, target) do
    JS.push("run-incident-command", value: %{command: command}, target: target)
    |> hide_command_palette("incident-command")
  end

  defp open_incident_click(id, target) do
    JS.push("open-incident", value: %{id: id}, target: target)
    |> show_drawer_js("incident-response-drawer")
  end

  defp resolve_click(target) do
    JS.push("resolve-incident", target: target)
    |> hide_modal("incident-resolve-confirm")
    |> hide_drawer("incident-response-drawer")
  end

  defp show_drawer_js(js, id) do
    js
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> JS.remove_attribute("inert", to: "##{id}")
    |> JS.focus_first(to: "##{id} [data-exo=\"drawer-content\"]")
  end

  defp incident_row_id(incident), do: "incident-row-#{incident.id}"
  defp incident_row_label(incident), do: "Incident #{incident.title}"

  defp severity_options do
    [
      {"All severities", "all"},
      {"Critical", "critical"},
      {"High", "high"},
      {"Medium", "medium"}
    ]
  end

  defp owner_options do
    [
      {"Platform", "platform"},
      {"Payments", "payments"},
      {"Support", "support"}
    ]
  end

  defp empty_incident do
    %{
      id: "",
      title: "No incident selected",
      service: "None",
      owner: "None",
      severity: "medium",
      status: "open",
      started: "none",
      detection: "No incident selected.",
      decision_note: "",
      decision_owner: "platform"
    }
  end

  defp incidents do
    [
      %{
        id: "checkout-latency",
        title: "Checkout API latency",
        service: "Payments",
        owner: "Payments",
        severity: "critical",
        status: "open",
        started: "14m ago",
        detection: "p95 latency crossed the checkout SLO for three regions."
      },
      %{
        id: "auth-errors",
        title: "Auth error spike",
        service: "Identity",
        owner: "Platform",
        severity: "critical",
        status: "open",
        started: "22m ago",
        detection: "Login failures are above baseline after the latest token rotation."
      },
      %{
        id: "search-index",
        title: "Search indexing lag",
        service: "Search",
        owner: "Platform",
        severity: "high",
        status: "open",
        started: "48m ago",
        detection: "Indexing jobs are delayed and customer dashboards show stale records."
      },
      %{
        id: "webhook-delay",
        title: "Webhook delivery delay",
        service: "Integrations",
        owner: "Support",
        severity: "medium",
        status: "open",
        started: "1h ago",
        detection: "Partner webhooks are delayed because queue workers are saturated."
      },
      %{
        id: "cdn-purge",
        title: "CDN purge recovered",
        service: "Edge",
        owner: "Platform",
        severity: "high",
        status: "resolved",
        started: "yesterday",
        detection: "Purge queue recovered after regional cache invalidation was retried."
      }
    ]
  end
end
