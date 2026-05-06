defmodule ExoUI.Storybook.Components.BulkActionWorkflowDemo do
  @moduledoc """
  Production-style filtered table and bulk action workflow.

  Combines filter forms, table row selection, bulk action state, and a
  server-guarded confirm modal that can keep the action open on validation
  failure.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       records: records(),
       query: "",
       status: "all",
       selected_ids: MapSet.new(),
       bulk_state: "ready",
       bulk_error: nil
     )}
  end

  @impl true
  def handle_event("filter-bulk-queue", %{"filters" => params}, socket) do
    {:noreply,
     assign(socket,
       query: string_param(params, "query", ""),
       status: string_param(params, "status", "all"),
       bulk_error: nil
     )}
  end

  def handle_event("toggle-selection", %{"id" => id}, socket) do
    selected_ids =
      if MapSet.member?(socket.assigns.selected_ids, id) do
        MapSet.delete(socket.assigns.selected_ids, id)
      else
        MapSet.put(socket.assigns.selected_ids, id)
      end

    {:noreply,
     assign(socket,
       selected_ids: selected_ids,
       bulk_state: selection_state(selected_ids),
       bulk_error: nil
     )}
  end

  def handle_event("select-filtered", _params, socket) do
    selected_ids = socket.assigns.records |> filtered_records(socket.assigns) |> ids_to_set()

    {:noreply,
     assign(socket,
       selected_ids: selected_ids,
       bulk_state: selection_state(selected_ids),
       bulk_error: nil
     )}
  end

  def handle_event("clear-selection", _params, socket) do
    {:noreply,
     assign(socket,
       selected_ids: MapSet.new(),
       bulk_state: "ready",
       bulk_error: nil
     )}
  end

  def handle_event("queue-bulk-archive", _params, socket) do
    {:noreply, assign(socket, bulk_state: "saving", bulk_error: nil)}
  end

  def handle_event("validate-bulk-archive", _params, socket) do
    selected_records = selected_records(socket.assigns.records, socket.assigns.selected_ids)
    blocked = Enum.filter(selected_records, &(&1.owner == "" or &1.status == "Blocked"))

    if blocked == [] do
      archived_ids = socket.assigns.selected_ids

      records =
        Enum.map(socket.assigns.records, fn record ->
          if MapSet.member?(archived_ids, record.id) do
            %{record | status: "Archived", status_variant: "secondary"}
          else
            record
          end
        end)

      {:noreply,
       assign(socket,
         records: records,
         selected_ids: MapSet.new(),
         bulk_state: "archived",
         bulk_error: nil
       )}
    else
      names = blocked |> Enum.map(& &1.name) |> Enum.join(", ")

      {:noreply,
       assign(socket,
         bulk_state: "blocked",
         bulk_error:
           "Cannot archive #{names} until blocked status and missing owners are resolved."
       )}
    end
  end

  @impl true
  def render(assigns) do
    assigns =
      assign(
        assigns,
        :filtered_records,
        filtered_records(assigns.records, assigns)
      )

    ~H"""
    <div
      id={@id}
      data-exo="bulk-action-workflow"
      style="min-height: 700px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Bulk action workflow
        <:subtitle>
          Filter a queue, select rows, queue an async bulk action, and keep guarded confirms open.
        </:subtitle>
        <:actions>
          <.badge variant={bulk_state_variant(@bulk_state)}>{@bulk_state}</.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card
          title="Filtered rows"
          value={length(@filtered_records)}
          subtitle="visible records"
        />
        <.stat_card title="Selected rows" value={MapSet.size(@selected_ids)} subtitle="bulk target" />
        <.stat_card title="Bulk state" value={@bulk_state} subtitle="server-owned state" />
      </div>

      <.content_card title="Queue filters">
        <ExoUI.Components.Form.form
          for={%{}}
          as={:filters}
          phx-change="filter-bulk-queue"
          phx-target={@myself}
          style="display: grid; grid-template-columns: 1fr 14rem; align-items: end; gap: 0.875rem;"
        >
          <ExoUI.Components.Form.input
            id="bulk-filter-query"
            name="filters[query]"
            label="Search queue"
            value={@query}
            placeholder="Account or owner"
          />
          <ExoUI.Components.Form.select
            id="bulk-filter-status"
            name="filters[status]"
            label="Status"
            value={@status}
            options={status_options()}
          />
        </ExoUI.Components.Form.form>
      </.content_card>

      <.content_card title="Accounts queue">
        <:action>
          <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
            <.button
              type="button"
              size="sm"
              variant="outline"
              disabled={@filtered_records == []}
              phx-click="select-filtered"
              phx-target={@myself}
            >
              Select filtered
            </.button>
            <.button
              type="button"
              size="sm"
              variant="ghost"
              disabled={MapSet.size(@selected_ids) == 0}
              phx-click="clear-selection"
              phx-target={@myself}
            >
              Clear selection
            </.button>
            <.button
              type="button"
              size="sm"
              variant="danger"
              disabled={MapSet.size(@selected_ids) == 0}
              phx-click={queue_bulk_archive(@myself)}
            >
              Queue bulk archive
            </.button>
          </div>
        </:action>

        <.table
          id="bulk-action-table"
          rows={@filtered_records}
          row_id={&row_id/1}
          row_label={&row_label/1}
          caption="Filtered account queue"
          empty_label="No accounts match the active filters."
        >
          <:col :let={record} label="Select">
            <ExoUI.Components.Form.input
              id={"bulk-select-#{record.id}"}
              type="checkbox"
              name={"bulk[selected][#{record.id}]"}
              label={"Select #{record.name}"}
              checked={MapSet.member?(@selected_ids, record.id)}
              phx-click="toggle-selection"
              phx-value-id={record.id}
              phx-target={@myself}
            />
          </:col>
          <:col :let={record} label="Account">{record.name}</:col>
          <:col :let={record} label="Owner">{owner_label(record.owner)}</:col>
          <:col :let={record} label="Status">
            <.badge variant={record.status_variant}>{record.status}</.badge>
          </:col>
          <:col :let={record} label="SLA" align="right">{record.sla}</:col>
        </.table>
      </.content_card>

      <p
        id="bulk-action-state"
        data-exo="bulk-action-state"
        data-query={@query}
        data-status={@status}
        data-selected-count={MapSet.size(@selected_ids)}
        data-bulk-state={@bulk_state}
      >
        {MapSet.size(@selected_ids)} selected from {length(@filtered_records)} visible records.
      </p>

      <p
        :if={@bulk_error}
        id="bulk-action-error"
        data-exo="bulk-action-error"
        role="alert"
        style="color: var(--exo-danger);"
      >
        {@bulk_error}
      </p>

      <.confirm_modal
        id="bulk-archive-confirm"
        title="Archive selected accounts"
        message="The async bulk action is server-guarded and remains open if any selected row fails validation."
        confirm_text="Validate bulk archive"
        cancel_text="Keep selection"
        variant="danger"
        close_on_confirm={false}
        on_confirm={JS.push("validate-bulk-archive", target: @myself)}
      />
    </div>
    """
  end

  def row_id(record), do: "bulk-record-#{record.id}"
  def row_label(record), do: "Bulk select #{record.name}"

  defp queue_bulk_archive(target) do
    JS.push("queue-bulk-archive", target: target)
    |> show_modal_js("bulk-archive-confirm")
  end

  defp show_modal_js(js, id) do
    js
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> JS.remove_attribute("inert", to: "##{id}")
    |> JS.show(to: "##{id}")
    |> JS.focus_first(to: "##{id} [data-exo=\"modal-content\"]")
  end

  defp filtered_records(records, assigns) do
    records
    |> Enum.filter(&matches_query?(&1, assigns.query))
    |> Enum.filter(&matches_status?(&1, assigns.status))
  end

  defp matches_query?(_record, ""), do: true

  defp matches_query?(record, query) do
    haystack = "#{record.name} #{record.owner} #{record.status}" |> String.downcase()
    String.contains?(haystack, String.downcase(query))
  end

  defp matches_status?(_record, "all"), do: true
  defp matches_status?(record, status), do: String.downcase(record.status) == status

  defp selected_records(records, selected_ids),
    do: Enum.filter(records, &MapSet.member?(selected_ids, &1.id))

  defp ids_to_set(records), do: records |> Enum.map(& &1.id) |> MapSet.new()

  defp selection_state(selected_ids) do
    if MapSet.size(selected_ids) == 0, do: "ready", else: "selected"
  end

  defp bulk_state_variant("blocked"), do: "danger"
  defp bulk_state_variant("saving"), do: "warning"
  defp bulk_state_variant("archived"), do: "success"
  defp bulk_state_variant("selected"), do: "primary"
  defp bulk_state_variant(_state), do: "secondary"

  defp owner_label(""), do: "Unassigned"
  defp owner_label(owner), do: owner

  defp string_param(params, key, fallback),
    do: params |> Map.get(key, fallback) |> to_string() |> String.trim()

  defp status_options do
    [
      {"All statuses", "all"},
      {"Needs review", "needs review"},
      {"Blocked", "blocked"},
      {"Ready", "ready"},
      {"Archived", "archived"}
    ]
  end

  defp records do
    [
      %{
        id: "acme",
        name: "Acme Corp",
        owner: "Mina",
        status: "Needs review",
        status_variant: "warning",
        sla: "2h"
      },
      %{
        id: "northstar",
        name: "Northstar",
        owner: "",
        status: "Blocked",
        status_variant: "danger",
        sla: "Overdue"
      },
      %{
        id: "orbit",
        name: "Orbit Labs",
        owner: "Sara",
        status: "Ready",
        status_variant: "success",
        sla: "1d"
      },
      %{
        id: "helio",
        name: "Helio Bank",
        owner: "Mina",
        status: "Needs review",
        status_variant: "warning",
        sla: "4h"
      }
    ]
  end
end
