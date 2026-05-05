defmodule ExoUI.Storybook.Components.BulkEditWorkflowDemo do
  @moduledoc """
  Production-style successful bulk edit workflow.

  Demonstrates filtered table selection, bulk form controls, successful server
  updates, selection clearing, empty-state-safe filters, and status
  announcements.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       records: records(),
       query: "",
       status: "all",
       selected_ids: MapSet.new(),
       edit_owner: "Mina",
       edit_status: "ready",
       edit_state: "ready",
       updated_count: 0,
       last_action: "initial view"
     )}
  end

  @impl true
  def handle_event("filter-bulk-edit", %{"filters" => params}, socket) do
    {:noreply,
     assign(socket,
       query: string_param(params, "query", ""),
       status: string_param(params, "status", "all"),
       selected_ids: MapSet.new(),
       edit_state: "ready",
       last_action: "filtered table"
     )}
  end

  def handle_event("change-bulk-edit", %{"bulk_edit" => params}, socket) do
    {:noreply,
     assign(socket,
       edit_owner: string_param(params, "owner", socket.assigns.edit_owner),
       edit_status: string_param(params, "status", socket.assigns.edit_status),
       edit_state: selection_state(socket.assigns.selected_ids),
       last_action: "edited bulk form"
     )}
  end

  def handle_event("toggle-bulk-edit-selection", %{"id" => id}, socket) do
    selected_ids =
      if MapSet.member?(socket.assigns.selected_ids, id) do
        MapSet.delete(socket.assigns.selected_ids, id)
      else
        MapSet.put(socket.assigns.selected_ids, id)
      end

    {:noreply,
     assign(socket,
       selected_ids: selected_ids,
       edit_state: selection_state(selected_ids),
       last_action: "toggled row"
     )}
  end

  def handle_event("select-bulk-edit-filtered", _params, socket) do
    selected_ids = socket.assigns.records |> filtered_records(socket.assigns) |> ids_to_set()

    {:noreply,
     assign(socket,
       selected_ids: selected_ids,
       edit_state: selection_state(selected_ids),
       last_action: "selected filtered rows"
     )}
  end

  def handle_event("clear-bulk-edit-selection", _params, socket) do
    {:noreply,
     assign(socket,
       selected_ids: MapSet.new(),
       edit_state: "ready",
       last_action: "cleared selection"
     )}
  end

  def handle_event("clear-bulk-edit-filters", _params, socket) do
    {:noreply,
     assign(socket,
       query: "",
       status: "all",
       selected_ids: MapSet.new(),
       edit_state: if(socket.assigns.updated_count > 0, do: "applied", else: "ready"),
       last_action: "cleared filters"
     )}
  end

  def handle_event("apply-bulk-edit", _params, socket) do
    selected_count = MapSet.size(socket.assigns.selected_ids)

    if selected_count == 0 do
      {:noreply,
       assign(socket,
         edit_state: "blocked",
         last_action: "no selected rows"
       )}
    else
      records =
        Enum.map(socket.assigns.records, fn record ->
          if MapSet.member?(socket.assigns.selected_ids, record.id) do
            apply_record_edit(record, socket.assigns)
          else
            record
          end
        end)

      {:noreply,
       assign(socket,
         records: records,
         selected_ids: MapSet.new(),
         edit_state: "applied",
         updated_count: selected_count,
         last_action: "applied bulk edit"
       )}
    end
  end

  @impl true
  def render(assigns) do
    filtered_records = filtered_records(assigns.records, assigns)

    assigns =
      assign(assigns,
        filtered_records: filtered_records,
        selected_count: MapSet.size(assigns.selected_ids),
        filter_summary: filter_summary(assigns)
      )

    ~H"""
    <div
      id={@id}
      data-exo="bulk-edit-workflow"
      data-query={@query}
      data-status={@status}
      data-selected-count={@selected_count}
      data-filtered-count={length(@filtered_records)}
      data-edit-owner={@edit_owner}
      data-edit-status={@edit_status}
      data-edit-state={@edit_state}
      data-updated-count={@updated_count}
      data-last-action={@last_action}
      aria-busy={if @edit_state == "applying", do: "true"}
      style="min-height: 720px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Bulk edit workflow
        <:subtitle>
          Filter a queue, select rows, apply a successful bulk edit, and verify the table state updates.
        </:subtitle>
        <:actions>
          <.badge variant={edit_state_variant(@edit_state)}>{@edit_state}</.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Visible records" value={length(@filtered_records)} subtitle="after filter" />
        <.stat_card title="Selected rows" value={@selected_count} subtitle="bulk target" />
        <.stat_card title="Updated rows" value={@updated_count} subtitle="last apply" />
        <.stat_card title="Bulk state" value={@edit_state} subtitle={@last_action} />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 20rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Queue filters">
            <ExoUI.Components.Form.form
              for={%{}}
              as={:filters}
              phx-change="filter-bulk-edit"
              phx-target={@myself}
              style="display: grid; grid-template-columns: minmax(14rem, 1fr) 13rem; align-items: end; gap: 0.875rem;"
            >
              <ExoUI.Components.Form.input
                id="bulk-edit-query"
                name="filters[query]"
                label="Search queue"
                value={@query}
                placeholder="Account or owner"
              />
              <ExoUI.Components.Form.input
                id="bulk-edit-status-filter"
                name="filters[status]"
                type="select"
                label="Status filter"
                value={@status}
                options={filter_status_options()}
              />
            </ExoUI.Components.Form.form>
          </.content_card>

          <.content_card title="Editable accounts">
            <:action>
              <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
                <.button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={@filtered_records == []}
                  phx-click="select-bulk-edit-filtered"
                  phx-target={@myself}
                >
                  Select filtered
                </.button>
                <.button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={@selected_count == 0}
                  phx-click="clear-bulk-edit-selection"
                  phx-target={@myself}
                >
                  Clear selection
                </.button>
                <.button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={@query == "" and @status == "all"}
                  phx-click="clear-bulk-edit-filters"
                  phx-target={@myself}
                >
                  Clear filters
                </.button>
              </div>
            </:action>

            <.table
              id="bulk-edit-table"
              rows={@filtered_records}
              row_id={&record_row_id/1}
              row_label={&record_row_label/1}
              caption="Bulk editable account queue"
              empty_label="No accounts remain in the active bulk edit filter."
            >
              <:col :let={record} label="Select">
                <ExoUI.Components.Form.input
                  id={"bulk-edit-select-#{record.id}"}
                  type="checkbox"
                  name={"bulk_edit[selected][#{record.id}]"}
                  label={"Select #{record.name}"}
                  checked={MapSet.member?(@selected_ids, record.id)}
                  phx-click="toggle-bulk-edit-selection"
                  phx-value-id={record.id}
                  phx-target={@myself}
                />
              </:col>
              <:col :let={record} label="Account">{record.name}</:col>
              <:col :let={record} label="Owner">{owner_label(record.owner)}</:col>
              <:col :let={record} label="Status">
                <.badge variant={record.status_variant}>{record.status}</.badge>
              </:col>
              <:col :let={record} label="Tier" align="right">{record.tier}</:col>
            </.table>
          </.content_card>
        </div>

        <.content_card title="Bulk edit">
          <:action>
            <.badge variant={if @selected_count > 0, do: "primary", else: "secondary"}>
              {@selected_count} selected
            </.badge>
          </:action>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <p style="margin: 0; color: var(--exo-muted-foreground); font-size: var(--exo-text-sm);">
              {@filter_summary}
            </p>

            <ExoUI.Components.Form.form
              for={%{}}
              as={:bulk_edit}
              phx-change="change-bulk-edit"
              phx-target={@myself}
              style="display: flex; flex-direction: column; gap: 0.875rem;"
            >
              <ExoUI.Components.Form.input
                id="bulk-edit-owner"
                name="bulk_edit[owner]"
                type="select"
                label="New owner"
                value={@edit_owner}
                options={owner_options()}
              />
              <ExoUI.Components.Form.input
                id="bulk-edit-status"
                name="bulk_edit[status]"
                type="select"
                label="New status"
                value={@edit_status}
                options={edit_status_options()}
              />
              <.button
                type="button"
                disabled={@selected_count == 0}
                phx-click="apply-bulk-edit"
                phx-target={@myself}
              >
                Apply bulk edit
              </.button>
            </ExoUI.Components.Form.form>
          </div>
        </.content_card>
      </div>

      <p
        id="bulk-edit-state"
        data-exo="bulk-edit-state"
        data-query={@query}
        data-status={@status}
        data-selected-count={@selected_count}
        data-filtered-count={length(@filtered_records)}
        data-edit-owner={@edit_owner}
        data-edit-status={@edit_status}
        data-edit-state={@edit_state}
        data-updated-count={@updated_count}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        {status_message(@edit_state, @updated_count, length(@filtered_records))}
      </p>
    </div>
    """
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
  defp matches_status?(record, status), do: record.status_id == status

  defp apply_record_edit(record, assigns) do
    %{
      record
      | owner: assigns.edit_owner,
        status_id: assigns.edit_status,
        status: status_label(assigns.edit_status),
        status_variant: status_variant(assigns.edit_status)
    }
  end

  defp ids_to_set(records), do: records |> Enum.map(& &1.id) |> MapSet.new()

  defp selection_state(selected_ids) do
    if MapSet.size(selected_ids) == 0, do: "ready", else: "selected"
  end

  defp filter_summary(assigns) do
    case assigns.status do
      "all" -> "Bulk edit applies to selected visible records."
      status -> "Current filter: #{status_label(status)} records."
    end
  end

  defp status_message("applied", updated_count, visible_count) do
    "Applied bulk edit to #{updated_count} records. #{visible_count} records remain visible."
  end

  defp status_message("blocked", _updated_count, _visible_count),
    do: "Select rows before applying."

  defp status_message("selected", _updated_count, visible_count),
    do: "#{visible_count} visible records ready for bulk edit."

  defp status_message(_state, _updated_count, visible_count),
    do: "#{visible_count} visible records."

  defp edit_state_variant("applied"), do: "success"
  defp edit_state_variant("blocked"), do: "danger"
  defp edit_state_variant("selected"), do: "primary"
  defp edit_state_variant(_state), do: "secondary"

  defp string_param(params, key, fallback),
    do: params |> Map.get(key, fallback) |> to_string() |> String.trim()

  defp owner_label(""), do: "Unassigned"
  defp owner_label(owner), do: owner

  defp status_label("ready"), do: "Ready"
  defp status_label("needs_review"), do: "Needs review"
  defp status_label("blocked"), do: "Blocked"
  defp status_label(_status), do: "All statuses"

  defp status_variant("ready"), do: "success"
  defp status_variant("needs_review"), do: "warning"
  defp status_variant("blocked"), do: "danger"
  defp status_variant(_status), do: "secondary"

  defp record_row_id(record), do: "bulk-edit-record-#{record.id}"
  defp record_row_label(record), do: "Bulk edit account #{record.name}"

  defp filter_status_options do
    [
      {"All statuses", "all"},
      {"Needs review", "needs_review"},
      {"Blocked", "blocked"},
      {"Ready", "ready"}
    ]
  end

  defp edit_status_options do
    [
      {"Ready", "ready"},
      {"Needs review", "needs_review"},
      {"Blocked", "blocked"}
    ]
  end

  defp owner_options do
    [
      {"Mina", "Mina"},
      {"Sara", "Sara"},
      {"Leo", "Leo"}
    ]
  end

  defp records do
    [
      %{
        id: "acme",
        name: "Acme Corp",
        owner: "Mina",
        status: "Ready",
        status_id: "ready",
        status_variant: "success",
        tier: "A"
      },
      %{
        id: "northstar",
        name: "Northstar",
        owner: "",
        status: "Blocked",
        status_id: "blocked",
        status_variant: "danger",
        tier: "C"
      },
      %{
        id: "orbit",
        name: "Orbit Labs",
        owner: "Sara",
        status: "Ready",
        status_id: "ready",
        status_variant: "success",
        tier: "B"
      },
      %{
        id: "helio",
        name: "Helio Bank",
        owner: "Mina",
        status: "Needs review",
        status_id: "needs_review",
        status_variant: "warning",
        tier: "A"
      },
      %{
        id: "atlas",
        name: "Atlas Labs",
        owner: "Leo",
        status: "Needs review",
        status_id: "needs_review",
        status_variant: "warning",
        tier: "B"
      },
      %{
        id: "lumen",
        name: "Lumen Retail",
        owner: "Sara",
        status: "Needs review",
        status_id: "needs_review",
        status_variant: "warning",
        tier: "A"
      }
    ]
  end
end
