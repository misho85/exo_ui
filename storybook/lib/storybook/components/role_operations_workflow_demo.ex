defmodule ExoUI.Storybook.Components.RoleOperationsWorkflowDemo do
  @moduledoc """
  Production-style role operations workflow.

  Demonstrates role-specific queues, lane filtering, server-owned task rows,
  drawer-hosted task details, acknowledgement state, reset behavior, and live
  status text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @roles [
    %{id: "ops", label: "Operations", icon: "workflow"},
    %{id: "support", label: "Support", icon: "messages-square"},
    %{id: "finance", label: "Finance", icon: "receipt"}
  ]

  @lanes [
    %{id: "all", label: "All lanes"},
    %{id: "inbox", label: "Inbox"},
    %{id: "blocked", label: "Blocked"},
    %{id: "handoff", label: "Handoff"}
  ]

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       active_role: "ops",
       active_lane: "all",
       selected_task_id: nil,
       acknowledged_ids: MapSet.new(),
       action_count: 0,
       last_action: "initial operations view"
     )}
  end

  @impl true
  def handle_event("change-role", %{"role" => role}, socket) do
    role = normalize_role(role)

    {:noreply,
     assign(socket,
       active_role: role,
       active_lane: "all",
       selected_task_id: nil,
       action_count: socket.assigns.action_count + 1,
       last_action: "changed role to #{role_label(role)}"
     )}
  end

  def handle_event("change-lane", %{"lane" => lane}, socket) do
    lane = normalize_lane(lane)

    {:noreply,
     assign(socket,
       active_lane: lane,
       selected_task_id: nil,
       action_count: socket.assigns.action_count + 1,
       last_action: "filtered #{lane_label(lane)}"
     )}
  end

  def handle_event("open-role-task", %{"id" => id}, socket) do
    task = task_by_id(id)

    {:noreply,
     assign(socket,
       selected_task_id: task.id,
       action_count: socket.assigns.action_count + 1,
       last_action: "opened #{task.title}"
     )}
  end

  def handle_event("acknowledge-role-task", _params, socket) do
    task = task_by_id(socket.assigns.selected_task_id)

    {:noreply,
     assign(socket,
       acknowledged_ids: MapSet.put(socket.assigns.acknowledged_ids, task.id),
       last_action: "acknowledged #{task.title}"
     )}
  end

  def handle_event("reset-role-operations", _params, socket) do
    {:noreply,
     assign(socket,
       active_role: "ops",
       active_lane: "all",
       selected_task_id: nil,
       acknowledged_ids: MapSet.new(),
       action_count: 0,
       last_action: "reset operations view"
     )}
  end

  @impl true
  def render(assigns) do
    tasks = decorate_tasks(tasks(), assigns.acknowledged_ids)
    rows = visible_tasks(tasks, assigns.active_role, assigns.active_lane)
    selected_task = selected_task(tasks, assigns.selected_task_id)

    assigns =
      assign(assigns,
        roles: @roles,
        lanes: @lanes,
        tasks: tasks,
        rows: rows,
        selected_task: selected_task,
        visible_count: length(rows),
        blocked_count: count_lane(rows, "blocked"),
        handoff_count: count_lane(rows, "handoff"),
        acknowledged_count: MapSet.size(assigns.acknowledged_ids),
        role_counts: role_counts(tasks)
      )

    ~H"""
    <div
      id={@id}
      data-exo="role-operations-workflow"
      data-active-role={@active_role}
      data-active-lane={@active_lane}
      data-visible-count={@visible_count}
      data-blocked-count={@blocked_count}
      data-handoff-count={@handoff_count}
      data-selected-task={@selected_task.id}
      data-acknowledged-count={@acknowledged_count}
      data-action-count={@action_count}
      data-last-action={@last_action}
      style="min-height: 760px; padding: 1rem; display: grid; grid-template-columns: 15rem minmax(0, 1fr); gap: 1rem;"
    >
      <aside style="display: flex; flex-direction: column; gap: 1rem;">
        <.content_card title="Roles">
          <div role="list" style="display: grid; gap: 0.5rem;">
            <.button
              :for={role <- @roles}
              id={"role-operations-role-#{role.id}"}
              type="button"
              variant={if role.id == @active_role, do: nil, else: "ghost"}
              phx-click="change-role"
              phx-value-role={role.id}
              phx-target={@myself}
              aria-pressed={if role.id == @active_role, do: "true", else: "false"}
              style="justify-content: space-between; width: 100%;"
            >
              <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
                <.icon name={role.icon} />
                {role.label}
              </span>
              <.badge variant="secondary">{Map.get(@role_counts, role.id, 0)}</.badge>
            </.button>
          </div>
        </.content_card>

        <.content_card title="Lanes">
          <div role="list" style="display: grid; gap: 0.5rem;">
            <.button
              :for={lane <- @lanes}
              id={"role-operations-lane-#{lane.id}"}
              type="button"
              size="sm"
              variant={if lane.id == @active_lane, do: "outline", else: "ghost"}
              phx-click="change-lane"
              phx-value-lane={lane.id}
              phx-target={@myself}
              aria-pressed={if lane.id == @active_lane, do: "true", else: "false"}
              style="justify-content: flex-start; width: 100%;"
            >
              {lane.label}
            </.button>
          </div>
        </.content_card>

        <.content_card title="Queue state">
          <.list>
            <:item title="Visible">{@visible_count}</:item>
            <:item title="Blocked">{@blocked_count}</:item>
            <:item title="Handoffs">{@handoff_count}</:item>
            <:item title="Acknowledged">{@acknowledged_count}</:item>
          </.list>
        </.content_card>
      </aside>

      <main style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
        <.header>
          {role_label(@active_role)} operations
          <:subtitle>
            Role-owned task queues with lane filters, detail drawers, and acknowledged handoffs.
          </:subtitle>
          <:actions>
            <.badge variant="primary">{lane_label(@active_lane)}</.badge>
          </:actions>
        </.header>

        <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
          <.stat_card title="Visible tasks" value={@visible_count} subtitle="current role/lane" />
          <.stat_card title="Blocked" value={@blocked_count} subtitle="needs action" />
          <.stat_card title="Handoffs" value={@handoff_count} subtitle="cross-team work" />
          <.stat_card title="Actions" value={@action_count} subtitle="this session" />
        </div>

        <.content_card title="Role queue">
          <:action>
            <.button
              type="button"
              size="sm"
              variant="ghost"
              disabled={@active_role == "ops" and @active_lane == "all" and @acknowledged_count == 0}
              phx-click="reset-role-operations"
              phx-target={@myself}
            >
              Reset operations
            </.button>
          </:action>

          <.table
            id="role-operations-table"
            rows={@rows}
            row_id={&task_row_id/1}
            row_label={&task_row_label/1}
            caption="Role operations tasks"
            empty_label="No tasks match the selected role and lane."
          >
            <:col :let={task} label="Task">
              <span style="display: grid; gap: 0.125rem;">
                <strong>{task.title}</strong>
                <span style="color: var(--exo-muted-foreground); font-size: var(--exo-text-sm);">
                  {task.account}
                </span>
              </span>
            </:col>
            <:col :let={task} label="Owner">{task.owner}</:col>
            <:col :let={task} label="Lane">
              <.badge variant={lane_variant(task.lane)}>{lane_label(task.lane)}</.badge>
            </:col>
            <:col :let={task} label="Priority">{task.priority}</:col>
            <:col :let={task} label="SLA" align="right">{task.sla}</:col>
            <:col :let={task} label="Status">
              <.badge variant={task.status_variant}>{task.status}</.badge>
            </:col>
            <:col :let={task} label="Action" align="right">
              <.button
                type="button"
                size="sm"
                variant="outline"
                phx-click={open_task(task.id, @myself)}
              >
                Open task
              </.button>
            </:col>
          </.table>
        </.content_card>

        <.alert :if={@blocked_count > 0} kind={:warning} title="Blocked work in view">
          {@blocked_count} visible tasks are blocked and should be acknowledged before handoff.
        </.alert>

        <p
          id="role-operations-state"
          data-exo="role-operations-state"
          data-active-role={@active_role}
          data-active-lane={@active_lane}
          data-visible-count={@visible_count}
          data-blocked-count={@blocked_count}
          data-handoff-count={@handoff_count}
          data-selected-task={@selected_task.id}
          data-acknowledged-count={@acknowledged_count}
          data-action-count={@action_count}
          data-last-action={@last_action}
          role="status"
          aria-live="polite"
        >
          Showing {role_label(@active_role)} / {lane_label(@active_lane)} with {@visible_count} tasks; {@last_action}.
        </p>
      </main>

      <.drawer id="role-operations-drawer" side="right">
        <:title>{drawer_title(@selected_task)}</:title>
        <section
          id="role-operations-detail"
          data-exo="role-operations-detail"
          data-selected-task={@selected_task.id}
          data-acknowledged={if @selected_task.acknowledged, do: "true", else: "false"}
          style="display: flex; flex-direction: column; gap: 1rem;"
        >
          <.alert
            :if={@selected_task.id != ""}
            kind={detail_alert_kind(@selected_task)}
            title={@selected_task.next_step}
          >
            {detail_summary(@selected_task)}
          </.alert>

          <.list>
            <:item title="Task">{@selected_task.title}</:item>
            <:item title="Account">{@selected_task.account}</:item>
            <:item title="Owner">{@selected_task.owner}</:item>
            <:item title="Role">{role_label(@selected_task.role)}</:item>
            <:item title="Lane">{lane_label(@selected_task.lane)}</:item>
            <:item title="SLA">{@selected_task.sla}</:item>
            <:item title="Status">
              <.badge variant={@selected_task.status_variant}>{@selected_task.status}</.badge>
            </:item>
          </.list>

          <.progress
            value={@selected_task.progress}
            label="Task readiness"
            aria_label="Task readiness"
          />

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
            <.button
              type="button"
              variant="ghost"
              phx-click={hide_drawer("role-operations-drawer")}
            >
              Close task
            </.button>
            <.button
              type="button"
              disabled={@selected_task.id == "" or @selected_task.acknowledged}
              phx-click="acknowledge-role-task"
              phx-target={@myself}
            >
              Acknowledge task
            </.button>
          </div>
        </section>
      </.drawer>
    </div>
    """
  end

  defp open_task(id, target) do
    JS.push("open-role-task", value: %{id: id}, target: target)
    |> show_drawer_js("role-operations-drawer")
  end

  defp show_drawer_js(js, id) do
    js
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> JS.remove_attribute("inert", to: "##{id}")
    |> JS.focus_first(to: "##{id} [data-exo=\"drawer-content\"]")
  end

  defp decorate_tasks(tasks, acknowledged_ids) do
    Enum.map(tasks, fn task ->
      acknowledged = MapSet.member?(acknowledged_ids, task.id)

      task
      |> Map.put(:acknowledged, acknowledged)
      |> Map.put(:status, if(acknowledged, do: "Acknowledged", else: task.status))
      |> Map.put(:status_variant, if(acknowledged, do: "success", else: task.status_variant))
    end)
  end

  defp visible_tasks(tasks, role, lane) do
    tasks
    |> Enum.filter(&(&1.role == role))
    |> Enum.filter(&(lane == "all" or &1.lane == lane))
    |> Enum.sort_by(&priority_rank/1)
  end

  defp role_counts(tasks) do
    Enum.reduce(tasks, %{}, fn task, counts ->
      Map.update(counts, task.role, 1, &(&1 + 1))
    end)
  end

  defp count_lane(tasks, lane), do: Enum.count(tasks, &(&1.lane == lane))

  defp selected_task(_tasks, nil), do: empty_task()

  defp selected_task(tasks, id) do
    Enum.find(tasks, &(&1.id == id)) || empty_task()
  end

  defp task_by_id(nil), do: empty_task()
  defp task_by_id(id), do: Enum.find(tasks(), &(&1.id == id)) || empty_task()

  defp normalize_role(role) when role in ["ops", "support", "finance"], do: role
  defp normalize_role(_role), do: "ops"

  defp normalize_lane(lane) when lane in ["all", "inbox", "blocked", "handoff"], do: lane
  defp normalize_lane(_lane), do: "all"

  defp role_label("support"), do: "Support"
  defp role_label("finance"), do: "Finance"
  defp role_label("ops"), do: "Operations"
  defp role_label(_role), do: "No role"

  defp lane_label("inbox"), do: "Inbox"
  defp lane_label("blocked"), do: "Blocked"
  defp lane_label("handoff"), do: "Handoff"
  defp lane_label(_lane), do: "All lanes"

  defp lane_variant("blocked"), do: "danger"
  defp lane_variant("handoff"), do: "warning"
  defp lane_variant(_lane), do: "secondary"

  defp detail_alert_kind(%{acknowledged: true}), do: :success
  defp detail_alert_kind(%{lane: "blocked"}), do: :error
  defp detail_alert_kind(%{lane: "handoff"}), do: :warning
  defp detail_alert_kind(_task), do: :info

  defp drawer_title(%{id: ""}), do: "Task details"
  defp drawer_title(task), do: task.title

  defp detail_summary(%{acknowledged: true, title: title}),
    do: "#{title} has been acknowledged in this session."

  defp detail_summary(task),
    do: "#{task.account} is assigned to #{task.owner} with #{task.sla} remaining."

  defp priority_rank(%{priority: "P0"}), do: 0
  defp priority_rank(%{priority: "P1"}), do: 1
  defp priority_rank(%{priority: "P2"}), do: 2
  defp priority_rank(_task), do: 3

  defp task_row_id(task), do: "role-operation-task-#{task.id}"
  defp task_row_label(task), do: "Role operation task #{task.title}"

  defp empty_task do
    %{
      id: "",
      role: "",
      lane: "all",
      title: "No task selected",
      account: "None",
      owner: "None",
      priority: "None",
      sla: "None",
      progress: 0,
      status: "Not selected",
      status_variant: "secondary",
      next_step: "Select a task",
      acknowledged: false
    }
  end

  defp tasks do
    [
      %{
        id: "northstar-renewal",
        role: "ops",
        lane: "blocked",
        title: "Unblock renewal handoff",
        account: "Northstar",
        owner: "Iva",
        priority: "P0",
        sla: "2h",
        progress: 35,
        status: "Blocked",
        status_variant: "danger",
        next_step: "Assign executive sponsor"
      },
      %{
        id: "atlas-owner",
        role: "ops",
        lane: "inbox",
        title: "Assign account owner",
        account: "Atlas Works",
        owner: "Unassigned",
        priority: "P1",
        sla: "4h",
        progress: 48,
        status: "Ready",
        status_variant: "secondary",
        next_step: "Select owner before routing"
      },
      %{
        id: "vega-security",
        role: "ops",
        lane: "handoff",
        title: "Route security evidence",
        account: "Vega Health",
        owner: "Mina",
        priority: "P1",
        sla: "6h",
        progress: 62,
        status: "Waiting",
        status_variant: "warning",
        next_step: "Send evidence package to support"
      },
      %{
        id: "lumen-proposal",
        role: "ops",
        lane: "inbox",
        title: "Send renewal proposal",
        account: "Lumen Retail",
        owner: "Iva",
        priority: "P2",
        sla: "1d",
        progress: 82,
        status: "Ready",
        status_variant: "success",
        next_step: "Send final proposal"
      },
      %{
        id: "helio-domain",
        role: "support",
        lane: "blocked",
        title: "Resolve duplicate domain",
        account: "Helio Bank",
        owner: "Mina",
        priority: "P0",
        sla: "1h",
        progress: 24,
        status: "Blocked",
        status_variant: "danger",
        next_step: "Confirm canonical domain"
      },
      %{
        id: "orbit-procurement",
        role: "support",
        lane: "handoff",
        title: "Confirm procurement path",
        account: "Orbit Labs",
        owner: "Sara",
        priority: "P1",
        sla: "5h",
        progress: 67,
        status: "Waiting",
        status_variant: "warning",
        next_step: "Handoff procurement notes"
      },
      %{
        id: "quartz-map",
        role: "support",
        lane: "inbox",
        title: "Review stakeholder map",
        account: "Quartz Media",
        owner: "Iva",
        priority: "P2",
        sla: "1d",
        progress: 74,
        status: "Ready",
        status_variant: "secondary",
        next_step: "Update stakeholder coverage"
      },
      %{
        id: "acme-quote",
        role: "finance",
        lane: "inbox",
        title: "Prepare expansion quote",
        account: "Acme Corp",
        owner: "Sara",
        priority: "P1",
        sla: "4h",
        progress: 71,
        status: "Ready",
        status_variant: "success",
        next_step: "Validate pricing approval"
      },
      %{
        id: "northstar-terms",
        role: "finance",
        lane: "handoff",
        title: "Review renewal terms",
        account: "Northstar",
        owner: "Iva",
        priority: "P1",
        sla: "8h",
        progress: 58,
        status: "Waiting",
        status_variant: "warning",
        next_step: "Confirm redline owner"
      },
      %{
        id: "atlas-invoice",
        role: "finance",
        lane: "blocked",
        title: "Clear invoice hold",
        account: "Atlas Works",
        owner: "Unassigned",
        priority: "P0",
        sla: "3h",
        progress: 31,
        status: "Blocked",
        status_variant: "danger",
        next_step: "Resolve missing PO"
      }
    ]
  end
end
