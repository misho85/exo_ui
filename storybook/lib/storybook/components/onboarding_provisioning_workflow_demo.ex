defmodule ExoUI.Storybook.Components.OnboardingProvisioningWorkflowDemo do
  @moduledoc """
  Production-style onboarding provisioning workflow.

  Demonstrates an admin provisioning queue with status tabs, team/search
  filters, command routing, table actions, drawer-hosted review validation,
  setup-info requests, guarded account activation, and reset-safe state.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok, assign_initial(socket, "initial onboarding provisioning review")}
  end

  @impl true
  def handle_event("change-onboarding-tab", %{"tab" => tab}, socket) do
    tab = normalize_tab(tab)

    {:noreply,
     assign(socket,
       active_tab: tab,
       selected_user_id: nil,
       last_action: "opened #{tab_label(tab)} onboarding queue"
     )}
  end

  def handle_event("change-onboarding-filters", %{"onboarding" => params}, socket) do
    {:noreply,
     assign(socket,
       query: Map.get(params, "query", ""),
       team_filter: normalize_team(Map.get(params, "team", "all")),
       selected_user_id: nil,
       last_action: "changed onboarding filters"
     )}
  end

  def handle_event("run-onboarding-command", %{"command" => command}, socket) do
    {active_tab, team_filter, query, label} =
      case command do
        "identity" -> {"pending", "identity", "", "identity setup"}
        "enterprise" -> {"pending", "all", "enterprise", "enterprise onboarding"}
        "blocked" -> {"blocked", "all", "", "blocked users"}
        "provisioned" -> {"provisioned", "all", "", "provisioned users"}
        _ -> {"pending", "all", "", "pending onboarding"}
      end

    {:noreply,
     assign(socket,
       active_tab: active_tab,
       team_filter: team_filter,
       query: query,
       selected_user_id: nil,
       command_count: socket.assigns.command_count + 1,
       last_action: "opened #{label} from command palette"
     )}
  end

  def handle_event("open-onboarding-user", %{"id" => id}, socket) do
    user = user_by_id(id, socket.assigns.decisions)

    {:noreply,
     assign(socket,
       selected_user_id: user.id,
       provisioner: "admin",
       review_note: "",
       errors: %{},
       last_action: "opened onboarding review for #{user.name}"
     )}
  end

  def handle_event("change-onboarding-review", %{"review" => params}, socket) do
    {:noreply,
     assign(socket,
       provisioner:
         normalize_provisioner(Map.get(params, "provisioner", socket.assigns.provisioner)),
       review_note: Map.get(params, "note", ""),
       errors: %{},
       last_action: "edited onboarding review note"
     )}
  end

  def handle_event("request-onboarding-info", _params, socket) do
    note = String.trim(socket.assigns.review_note)

    if String.length(note) < 14 do
      {:noreply,
       assign(socket,
         errors: %{note: ["Add at least 14 characters before requesting setup info."]},
         validation_count: socket.assigns.validation_count + 1,
         last_action: "blocked setup info request"
       )}
    else
      selected = user_by_id(socket.assigns.selected_user_id, socket.assigns.decisions)

      decisions =
        Map.put(socket.assigns.decisions, selected.id, %{
          status: "info",
          provisioner: socket.assigns.provisioner,
          note: note
        })

      {:noreply,
       assign(socket,
         decisions: decisions,
         errors: %{},
         info_count: socket.assigns.info_count + 1,
         last_action: "requested setup info for #{selected.name}"
       )}
    end
  end

  def handle_event("block-onboarding-user", _params, socket) do
    socket
    |> decide_user("blocked", "blocked onboarding for", :blocked_count)
    |> noreply()
  end

  def handle_event("provision-onboarding-user", _params, socket) do
    socket
    |> decide_user("provisioned", "provisioned account for", :provisioned_count)
    |> noreply()
  end

  def handle_event("reset-onboarding-provisioning", _params, socket) do
    {:noreply, assign_initial(socket, "reset onboarding provisioning review")}
  end

  @impl true
  def render(assigns) do
    users = decorate_users(users(), assigns.decisions)
    rows = visible_users(users, assigns)
    selected = selected_user(users, assigns.selected_user_id)
    provision_ready? = selected.id != "" && String.length(String.trim(assigns.review_note)) >= 14

    assigns =
      assign(assigns,
        users: users,
        rows: rows,
        selected_user: selected,
        visible_count: length(rows),
        pending_count: count_pending(users),
        provisioned_total: count_status(users, "provisioned"),
        blocked_total: count_status(users, "blocked"),
        info_total: count_status(users, "info"),
        high_touch_visible_count: count_high_touch(rows),
        readiness_score: readiness_score(users),
        note_errors: field_errors(assigns.errors, :note),
        provision_ready?: provision_ready?,
        can_reset?: can_reset?(assigns)
      )

    ~H"""
    <div
      id={@id}
      data-exo="onboarding-provisioning-workflow"
      data-active-tab={@active_tab}
      data-team-filter={@team_filter}
      data-query={@query}
      data-visible-count={@visible_count}
      data-pending-count={@pending_count}
      data-provisioned-total={@provisioned_total}
      data-blocked-total={@blocked_total}
      data-info-total={@info_total}
      data-high-touch-visible-count={@high_touch_visible_count}
      data-readiness-score={@readiness_score}
      data-selected-user={@selected_user.id}
      data-info-count={@info_count}
      data-provisioned-count={@provisioned_count}
      data-blocked-count={@blocked_count}
      data-validation-count={@validation_count}
      data-command-count={@command_count}
      data-last-action={@last_action}
      style="min-height: 820px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Onboarding provisioning workflow
        <:subtitle>
          Admin queue with command routing, setup validation, drawer review, guarded account activation, and progress state.
        </:subtitle>
        <:actions>
          <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
            <.button
              id="onboarding-open-command"
              type="button"
              variant="outline"
              phx-click={show_command_palette("onboarding-command")}
            >
              <.icon name="search" /> Open onboarding commands
            </.button>
            <.button
              type="button"
              variant="ghost"
              disabled={!@can_reset?}
              phx-click="reset-onboarding-provisioning"
              phx-target={@myself}
            >
              Reset onboarding
            </.button>
          </div>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Pending" value={@pending_count} subtitle="needs setup" />
        <.stat_card title="Setup info" value={@info_total} subtitle="requested" />
        <.stat_card title="Provisioned" value={@provisioned_total} subtitle="ready accounts" />
        <.stat_card title="Blocked" value={@blocked_total} subtitle="needs escalation" />
      </div>

      <.content_card title="Provisioning progress">
        <:action>
          <.badge variant={if @readiness_score >= 60, do: "success", else: "warning"}>
            {@readiness_score}% ready
          </.badge>
        </:action>
        <.progress
          value={@readiness_score}
          label="Provisioning readiness"
          aria_label="Onboarding provisioning readiness"
        />
      </.content_card>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Queue controls">
            <.tabs
              id="onboarding-tabs"
              active={@active_tab}
              aria_label="Onboarding provisioning status"
              activation="automatic"
            >
              <:tab id="pending" label="Pending" icon="clock" click={tab_click("pending", @myself)} />
              <:tab
                id="provisioned"
                label="Provisioned"
                icon="check"
                click={tab_click("provisioned", @myself)}
              />
              <:tab
                id="blocked"
                label="Blocked"
                icon="shield-x"
                click={tab_click("blocked", @myself)}
              />
            </.tabs>

            <ExoUI.Components.Form.form
              for={%{}}
              as={:onboarding}
              phx-change="change-onboarding-filters"
              phx-target={@myself}
              style="margin-top: 1rem; display: grid; grid-template-columns: minmax(0, 1fr) 13rem; gap: 0.75rem; align-items: start;"
            >
              <ExoUI.Components.Form.input
                id="onboarding-query"
                name="onboarding[query]"
                label="Search users"
                value={@query}
                placeholder="Search user, team, workspace..."
              />
              <ExoUI.Components.Form.select
                id="onboarding-team"
                name="onboarding[team]"
                label="Team"
                value={@team_filter}
                options={team_options()}
              />
            </ExoUI.Components.Form.form>
          </.content_card>

          <.content_card title="Provisioning queue">
            <:action>
              <.badge variant="secondary">{@visible_count} visible</.badge>
            </:action>
            <.table
              id="onboarding-table"
              rows={@rows}
              row_id={&row_id/1}
              row_label={&row_label/1}
              caption="Onboarding provisioning queue"
              empty_label="No onboarding users match the active status and filters."
            >
              <:col :let={user} label="User">{user.name}</:col>
              <:col :let={user} label="Team">
                <span data-exo="onboarding-team">{team_label(user.team)}</span>
              </:col>
              <:col :let={user} label="Plan">
                <.badge variant={plan_variant(user.plan)}>{plan_label(user.plan)}</.badge>
              </:col>
              <:col :let={user} label="Status">
                <.badge variant={status_variant(user.status)}>{status_label(user.status)}</.badge>
              </:col>
              <:action :let={user}>
                <.button
                  type="button"
                  size="sm"
                  variant="outline"
                  phx-click={open_user(user.id, @myself)}
                >
                  Review {user.name}
                </.button>
              </:action>
            </.table>
          </.content_card>
        </div>

        <.content_card title="Provisioning gates">
          <.list>
            <:item title="High touch visible">{@high_touch_visible_count} accounts</:item>
            <:item title="Info requests">{@info_count} this session</:item>
            <:item title="Provisioned">{@provisioned_count} this session</:item>
            <:item title="Blocked">{@blocked_count} this session</:item>
          </.list>
          <.separator />
          <.timeline>
            <:event title="Identity" meta="Required">
              Confirm SSO, email domain, and role mapping before activation.
            </:event>
            <:event title="Workspace" meta="Setup">
              Provision workspace defaults, starter project, and billing owner.
            </:event>
            <:event title="Activation" meta="Guarded">
              Account activation is blocked until a setup note is recorded.
            </:event>
          </.timeline>
        </.content_card>
      </div>

      <p
        id="onboarding-state"
        data-exo="onboarding-state"
        data-last-action={@last_action}
        data-selected-user={@selected_user.id}
        aria-live="polite"
        style="margin: 0; color: var(--exo-muted-foreground);"
      >
        Last action: {@last_action}.
      </p>

      <.command_palette
        id="onboarding-command"
        label="Onboarding provisioning command palette"
        placeholder="Search onboarding actions..."
        shortcut="ctrl+shift+o"
      >
        <:item
          label="Open identity setup"
          value="identity"
          search="identity sso domain role setup"
          shortcut="I"
          click={run_command("identity", @myself)}
        />
        <:item
          label="Open enterprise onboarding"
          value="enterprise"
          search="enterprise high touch workspace"
          shortcut="E"
          click={run_command("enterprise", @myself)}
        />
        <:item
          label="Open blocked onboarding"
          value="blocked"
          search="blocked escalation missing"
          shortcut="B"
          click={run_command("blocked", @myself)}
        />
        <:item
          label="Open provisioned accounts"
          value="provisioned"
          search="provisioned active complete"
          shortcut="P"
          click={run_command("provisioned", @myself)}
        />
      </.command_palette>

      <.drawer id="onboarding-user-drawer" side="right">
        <:title>Review {@selected_user.name}</:title>
        <div
          id="onboarding-user-detail"
          data-exo="onboarding-user-detail"
          data-user={@selected_user.id}
          data-status={@selected_user.status}
          data-plan={@selected_user.plan}
          style="display: flex; flex-direction: column; gap: 1rem;"
        >
          <.alert
            kind={if @selected_user.plan == "enterprise", do: "warning", else: "info"}
            title="Onboarding evidence"
          >
            {@selected_user.evidence}
          </.alert>

          <.list>
            <:item title="Workspace">{@selected_user.workspace}</:item>
            <:item title="Team">{team_label(@selected_user.team)}</:item>
            <:item title="Plan">{plan_label(@selected_user.plan)}</:item>
            <:item title="Status">{status_label(@selected_user.status)}</:item>
            <:item title="Provisioner">
              {if @selected_user.provisioner == "",
                do: "Not assigned",
                else: provisioner_label(@selected_user.provisioner)}
            </:item>
          </.list>

          <ExoUI.Components.Form.form
            for={%{}}
            as={:review}
            phx-change="change-onboarding-review"
            phx-target={@myself}
            style="display: flex; flex-direction: column; gap: 1rem;"
          >
            <ExoUI.Components.Form.select
              id="onboarding-provisioner"
              name="review[provisioner]"
              label="Provisioner"
              value={@provisioner}
              options={provisioner_options()}
            />
            <ExoUI.Components.Form.input
              id="onboarding-note"
              name="review[note]"
              type="textarea"
              rows="5"
              label="Setup note"
              value={@review_note}
              placeholder="Summarize identity and workspace setup..."
              errors={@note_errors}
            />
          </ExoUI.Components.Form.form>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; gap: 0.5rem;">
              <.button
                type="button"
                variant="outline"
                phx-click="request-onboarding-info"
                phx-target={@myself}
              >
                Request setup info
              </.button>
              <.button
                type="button"
                variant="danger"
                phx-click="block-onboarding-user"
                phx-target={@myself}
              >
                Block onboarding
              </.button>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
              <.button type="button" variant="ghost" phx-click={hide_drawer("onboarding-user-drawer")}>
                Close review
              </.button>
              <.button
                type="button"
                variant="primary"
                phx-click={prepare_provision_modal()}
              >
                Prepare activation
              </.button>
            </div>
          </div>
        </div>
      </.drawer>

      <.confirm_modal
        id="onboarding-provision-confirm"
        title={if @provision_ready?, do: "Activate account", else: "Validate onboarding setup"}
        message={
          if @provision_ready?,
            do: "The setup note is recorded. Confirm account activation and workspace provisioning.",
            else: "Account activation is guarded until identity and workspace setup are documented."
        }
        confirm_text="Activate account"
        cancel_text="Keep reviewing"
        variant={if @provision_ready?, do: "primary", else: "danger"}
        close_on_confirm={@provision_ready?}
        close_on_cancel={false}
        on_confirm={JS.push("provision-onboarding-user", target: @myself)}
        on_cancel={
          hide_modal("onboarding-provision-confirm") |> show_drawer_js("onboarding-user-drawer")
        }
      />
    </div>
    """
  end

  def row_id(user), do: "onboarding-user-#{user.id}"
  def row_label(user), do: "Review #{user.name}"

  defp assign_initial(socket, last_action) do
    assign(socket,
      active_tab: "pending",
      team_filter: "all",
      query: "",
      decisions: %{},
      selected_user_id: nil,
      provisioner: "admin",
      review_note: "",
      errors: %{},
      info_count: 0,
      provisioned_count: 0,
      blocked_count: 0,
      validation_count: 0,
      command_count: 0,
      last_action: last_action
    )
  end

  defp tab_click(tab, target),
    do: JS.push("change-onboarding-tab", value: %{tab: tab}, target: target)

  defp run_command(command, target) do
    JS.push("run-onboarding-command", value: %{command: command}, target: target)
    |> hide_command_palette("onboarding-command")
  end

  defp open_user(id, target) do
    JS.push("open-onboarding-user", value: %{id: id}, target: target)
    |> show_drawer_js("onboarding-user-drawer")
    |> hide_command_palette("onboarding-command")
  end

  defp prepare_provision_modal do
    hide_drawer("onboarding-user-drawer")
    |> show_modal_js("onboarding-provision-confirm")
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

  defp decide_user(socket, status, verb, counter_key) do
    note = String.trim(socket.assigns.review_note)

    if String.length(note) < 14 do
      assign(socket,
        errors: %{note: ["Add at least 14 characters before saving onboarding."]},
        validation_count: socket.assigns.validation_count + 1,
        last_action: "blocked onboarding decision"
      )
    else
      selected = user_by_id(socket.assigns.selected_user_id, socket.assigns.decisions)

      decisions =
        Map.put(socket.assigns.decisions, selected.id, %{
          status: status,
          provisioner: socket.assigns.provisioner,
          note: note
        })

      socket
      |> assign(
        decisions: decisions,
        active_tab: status,
        selected_user_id: nil,
        errors: %{},
        last_action: "#{verb} #{selected.name}"
      )
      |> update(counter_key, &(&1 + 1))
    end
  end

  defp noreply(socket), do: {:noreply, socket}

  defp decorate_users(users, decisions) do
    Enum.map(users, fn user ->
      decision = Map.get(decisions, user.id, %{})
      status = Map.get(decision, :status, user.status)

      user
      |> Map.put(:status, status)
      |> Map.put(:status_variant, status_variant(status))
      |> Map.put(:provisioner, Map.get(decision, :provisioner, user.provisioner))
      |> Map.put(:note, Map.get(decision, :note, user.note))
    end)
  end

  defp visible_users(users, assigns) do
    users
    |> Enum.filter(&tab_status?(&1, assigns.active_tab))
    |> Enum.filter(fn user ->
      assigns.team_filter == "all" || user.team == assigns.team_filter
    end)
    |> Enum.filter(&matches_query?(&1, assigns.query))
  end

  defp tab_status?(user, "pending"), do: user.status in ["pending", "info"]
  defp tab_status?(user, tab), do: user.status == tab

  defp matches_query?(_user, ""), do: true

  defp matches_query?(user, query) do
    haystack =
      [user.name, user.email, user.workspace, user.team, user.plan, user.evidence, user.status]
      |> Enum.join(" ")
      |> String.downcase()

    String.contains?(haystack, String.downcase(String.trim(query)))
  end

  defp selected_user(_users, nil), do: empty_user()

  defp selected_user(users, id) do
    Enum.find(users, empty_user(), &(to_string(&1.id) == to_string(id)))
  end

  defp user_by_id(id, decisions), do: selected_user(decorate_users(users(), decisions), id)

  defp count_pending(users), do: Enum.count(users, &(&1.status in ["pending", "info"]))
  defp count_status(users, status), do: Enum.count(users, &(&1.status == status))
  defp count_high_touch(users), do: Enum.count(users, &(&1.plan == "enterprise"))

  defp readiness_score(users) do
    if Enum.empty?(users),
      do: 0,
      else: round(count_status(users, "provisioned") / length(users) * 100)
  end

  defp can_reset?(assigns) do
    assigns.active_tab != "pending" ||
      assigns.team_filter != "all" ||
      assigns.query != "" ||
      assigns.decisions != %{} ||
      assigns.info_count > 0 ||
      assigns.provisioned_count > 0 ||
      assigns.blocked_count > 0 ||
      assigns.validation_count > 0 ||
      assigns.command_count > 0
  end

  defp normalize_tab(tab) when tab in ~w(pending provisioned blocked), do: tab
  defp normalize_tab(_tab), do: "pending"

  defp normalize_team(team) when team in ~w(all identity workspace success billing), do: team
  defp normalize_team(_team), do: "all"

  defp normalize_provisioner(provisioner)
       when provisioner in ~w(admin identity workspace success),
       do: provisioner

  defp normalize_provisioner(_provisioner), do: "admin"

  defp field_errors(errors, key), do: Map.get(errors, key, [])

  defp status_variant("provisioned"), do: "success"
  defp status_variant("blocked"), do: "danger"
  defp status_variant("info"), do: "info"
  defp status_variant(_status), do: "warning"

  defp plan_variant("enterprise"), do: "warning"
  defp plan_variant("business"), do: "primary"
  defp plan_variant(_plan), do: "secondary"

  defp status_label("provisioned"), do: "Provisioned"
  defp status_label("blocked"), do: "Blocked"
  defp status_label("info"), do: "Info requested"
  defp status_label(_status), do: "Pending"

  defp tab_label("provisioned"), do: "provisioned"
  defp tab_label("blocked"), do: "blocked"
  defp tab_label(_tab), do: "pending"

  defp plan_label("enterprise"), do: "Enterprise"
  defp plan_label("business"), do: "Business"
  defp plan_label(_plan), do: "Starter"

  defp team_label("identity"), do: "Identity"
  defp team_label("workspace"), do: "Workspace"
  defp team_label("success"), do: "Success"
  defp team_label("billing"), do: "Billing"
  defp team_label(_team), do: "All teams"

  defp provisioner_label("identity"), do: "Identity admin"
  defp provisioner_label("workspace"), do: "Workspace admin"
  defp provisioner_label("success"), do: "Success lead"
  defp provisioner_label(_provisioner), do: "Platform admin"

  defp team_options do
    [
      {"All teams", "all"},
      {"Identity", "identity"},
      {"Workspace", "workspace"},
      {"Success", "success"},
      {"Billing", "billing"}
    ]
  end

  defp provisioner_options do
    [
      {"Platform admin", "admin"},
      {"Identity admin", "identity"},
      {"Workspace admin", "workspace"},
      {"Success lead", "success"}
    ]
  end

  defp empty_user do
    %{
      id: "",
      name: "No user selected",
      email: "",
      workspace: "",
      team: "",
      plan: "starter",
      evidence: "Open an onboarding user to review setup requirements.",
      status: "pending",
      status_variant: "warning",
      provisioner: "",
      note: ""
    }
  end

  defp users do
    [
      %{
        id: "ana-enterprise",
        name: "Ana Markovic",
        email: "ana@example.com",
        workspace: "Acme Enterprise",
        team: "identity",
        plan: "enterprise",
        evidence:
          "SSO domain is verified, but role mapping and workspace defaults need approval.",
        status: "pending",
        status_variant: "warning",
        provisioner: "",
        note: ""
      },
      %{
        id: "luka-workspace",
        name: "Luka Ilic",
        email: "luka@example.com",
        workspace: "Northstar Studio",
        team: "workspace",
        plan: "business",
        evidence: "Workspace template is selected; billing owner still needs confirmation.",
        status: "pending",
        status_variant: "warning",
        provisioner: "",
        note: ""
      },
      %{
        id: "mina-success",
        name: "Mina Petrovic",
        email: "mina@example.com",
        workspace: "Orbit Labs",
        team: "success",
        plan: "business",
        evidence: "Customer success completed kickoff notes and activation checklist.",
        status: "provisioned",
        status_variant: "success",
        provisioner: "success",
        note: "Provisioned after success kickoff and workspace checklist."
      },
      %{
        id: "ivan-billing",
        name: "Ivan Jovanovic",
        email: "ivan@example.com",
        workspace: "Ridge Health",
        team: "billing",
        plan: "enterprise",
        evidence: "Billing tax profile is missing, blocking workspace activation.",
        status: "blocked",
        status_variant: "danger",
        provisioner: "",
        note: ""
      }
    ]
  end
end
