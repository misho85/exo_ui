# Role Operations Workflows

Use this pattern when each role needs its own operational queue with shared
lane filters, task rows, drawer details, and server-owned acknowledgement
state.

## Structure

```heex
<.button
  :for={role <- @roles}
  type="button"
  phx-click="change-role"
  phx-value-role={role.id}
  phx-target={@myself}
  aria-pressed={role.id == @active_role}
>
  <.icon name={role.icon} />
  {role.label}
</.button>

<.button
  :for={lane <- @lanes}
  type="button"
  phx-click="change-lane"
  phx-value-lane={lane.id}
  phx-target={@myself}
  aria-pressed={lane.id == @active_lane}
>
  {lane.label}
</.button>

<.table
  id="role-operations-table"
  rows={@visible_tasks}
  row_id={&task_row_id/1}
  row_label={&task_row_label/1}
  empty_label="No tasks match the selected role and lane."
>
  <:col :let={task} label="Task">{task.title}</:col>
  <:col :let={task} label="Lane">
    <.badge variant={lane_variant(task.lane)}>{task.lane_label}</.badge>
  </:col>
  <:col :let={task} label="Action" align="right">
    <.button type="button" phx-click={open_task(task.id, @myself)}>
      Open task
    </.button>
  </:col>
</.table>

<.drawer id="role-task-drawer" side="right">
  <:title>{@selected_task.title}</:title>
  <.alert kind={detail_alert_kind(@selected_task)} title={@selected_task.next_step}>
    {@selected_task.account} is assigned to {@selected_task.owner}.
  </.alert>
  <.progress value={@selected_task.progress} label="Task readiness" />
</.drawer>
```

## Event Shape

```elixir
def handle_event("change-role", %{"role" => role}, socket) do
  {:noreply,
   assign(socket,
     active_role: role,
     active_lane: "all",
     selected_task_id: nil
   )}
end

def handle_event("acknowledge-role-task", _params, socket) do
  {:noreply,
   update(socket, :acknowledged_ids, &MapSet.put(&1, socket.assigns.selected_task_id))}
end
```

## Rules

- Keep active role, active lane, visible rows, selected task, and acknowledged
  task IDs in server state.
- Reset lane state when switching roles unless the product explicitly keeps
  cross-role lane context.
- Use `aria-pressed` for role and lane controls so the active queue is exposed.
- Keep drawer details bound to the selected row and close/open the drawer with
  public ExoUI overlay helpers or equivalent LiveView JS.
- Mirror workflow state into stable `data-*` attributes for browser tests and
  visual capture.
- Browser coverage should verify role switching, lane filtering, row counts,
  drawer details, acknowledgement state, drawer close, and reset behavior.
