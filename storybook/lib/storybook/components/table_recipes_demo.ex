defmodule ExoUI.Storybook.Components.TableRecipesDemo do
  @moduledoc """
  Production-style table recipes.

  Demonstrates captions, stable row IDs, row labels, aligned cells, row click,
  action slots, empty states, server-owned filters, and live status text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       records: initial_records(),
       filter: "all",
       selected_id: nil,
       last_action: "initial table recipe"
     )}
  end

  @impl true
  def handle_event("filter-table-recipes", %{"filter" => filter}, socket) do
    filter = normalize_filter(filter)

    {:noreply,
     assign(socket,
       filter: filter,
       selected_id: nil,
       last_action: "filtered #{filter} rows"
     )}
  end

  def handle_event("open-table-row", %{"id" => id}, socket) do
    {:noreply,
     assign(socket,
       selected_id: id,
       last_action: "opened #{record_name(socket.assigns.records, id)}"
     )}
  end

  def handle_event("review-table-row", %{"id" => id}, socket) do
    {:noreply,
     assign(socket,
       records: update_record(socket.assigns.records, id, &Map.put(&1, :reviewed, true)),
       selected_id: id,
       last_action: "reviewed #{record_name(socket.assigns.records, id)}"
     )}
  end

  def handle_event("escalate-table-row", %{"id" => id}, socket) do
    {:noreply,
     assign(socket,
       records: update_record(socket.assigns.records, id, &Map.put(&1, :escalated, true)),
       selected_id: id,
       last_action: "escalated #{record_name(socket.assigns.records, id)}"
     )}
  end

  def handle_event("reset-table-recipes", _params, socket) do
    {:noreply,
     assign(socket,
       records: initial_records(),
       filter: "all",
       selected_id: nil,
       last_action: "reset table recipe"
     )}
  end

  @impl true
  def render(assigns) do
    visible_records = visible_records(assigns.records, assigns.filter)

    assigns =
      assign(assigns,
        visible_records: visible_records,
        selected_record: selected_record(assigns.records, assigns.selected_id),
        reviewed_count: Enum.count(assigns.records, & &1.reviewed),
        escalated_count: Enum.count(assigns.records, & &1.escalated)
      )

    ~H"""
    <div
      id={@id}
      data-exo="table-recipes-workflow"
      data-filter={@filter}
      data-selected-row={@selected_id || ""}
      data-visible-count={length(@visible_records)}
      data-reviewed-count={@reviewed_count}
      data-escalated-count={@escalated_count}
      data-last-action={@last_action}
      style="min-height: 780px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Table recipes
        <:subtitle>
          Stable rows, accessible labels, row actions, aligned numeric cells, filters, and empty states.
        </:subtitle>
        <:actions>
          <.badge variant={if @filter == "empty", do: "warning", else: "primary"}>
            {length(@visible_records)} visible
          </.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card
          title="Visible rows"
          value={length(@visible_records)}
          subtitle={filter_label(@filter)}
        />
        <.stat_card title="Reviewed" value={@reviewed_count} subtitle="action slot state" />
        <.stat_card title="Escalated" value={@escalated_count} subtitle="blocked records" />
        <.stat_card
          title="Selected"
          value={selected_label(@selected_record)}
          subtitle="row click state"
        />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <.content_card title="Accounts table">
          <:action>
            <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
              <.button
                :for={{filter, label} <- filter_options()}
                type="button"
                size="sm"
                variant={if @filter == filter, do: "primary", else: "outline"}
                phx-click="filter-table-recipes"
                phx-value-filter={filter}
                phx-target={@myself}
                aria-pressed={if @filter == filter, do: "true", else: "false"}
              >
                {label}
              </.button>
              <.button
                type="button"
                size="sm"
                variant="ghost"
                disabled={
                  @filter == "all" and is_nil(@selected_id) and @reviewed_count == 0 and
                    @escalated_count == 0
                }
                phx-click="reset-table-recipes"
                phx-target={@myself}
              >
                Reset table
              </.button>
            </div>
          </:action>

          <.table
            id="table-recipes-table"
            rows={@visible_records}
            row_id={&record_row_id/1}
            row_label={&record_row_label/1}
            row_click={
              fn record -> JS.push("open-table-row", value: %{id: record.id}, target: @myself) end
            }
            caption="Table recipe account review queue"
            empty_label="No accounts match this table recipe filter."
            actions_label="Row actions"
          >
            <:col :let={record} label="Account">
              <span style="font-weight: 600;">{record.name}</span>
            </:col>
            <:col :let={record} label="Owner">{record.owner}</:col>
            <:col :let={record} label="Status" align="center">
              <.badge variant={status_variant(record.status)}>{status_label(record.status)}</.badge>
            </:col>
            <:col :let={record} label="Health" align="center">
              <.badge variant={health_variant(record.health)}>{record.health}</.badge>
            </:col>
            <:col :let={record} label="ARR" align="right">{format_arr(record.arr)}</:col>
            <:col :let={record} label="Review" align="center">
              <%= cond do %>
                <% record.escalated -> %>
                  <.badge variant="danger">Escalated</.badge>
                <% record.reviewed -> %>
                  <.badge variant="success">Reviewed</.badge>
                <% true -> %>
                  <.badge variant="secondary">Pending</.badge>
              <% end %>
            </:col>
            <:action :let={record}>
              <.button
                type="button"
                size="sm"
                variant="ghost"
                disabled={record.reviewed}
                phx-click="review-table-row"
                phx-value-id={record.id}
                phx-target={@myself}
              >
                Review {record.name}
              </.button>
              <.button
                type="button"
                size="sm"
                variant="outline"
                disabled={record.status != "blocked" or record.escalated}
                phx-click="escalate-table-row"
                phx-value-id={record.id}
                phx-target={@myself}
              >
                Escalate {record.name}
              </.button>
            </:action>
            <:empty>
              <.empty_state
                title="No matching accounts"
                description="Use another table filter to restore rows."
              />
            </:empty>
          </.table>
        </.content_card>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Selected row">
            <.list>
              <:item title="Account">{selected_label(@selected_record)}</:item>
              <:item title="Owner">{selected_value(@selected_record, :owner)}</:item>
              <:item title="Status">{selected_status(@selected_record)}</:item>
              <:item title="ARR">{selected_arr(@selected_record)}</:item>
            </.list>
          </.content_card>

          <.alert
            kind={if @filter == "empty", do: :warning, else: :info}
            title="Table state"
          >
            {@last_action}
          </.alert>
        </aside>
      </div>

      <p
        id="table-recipes-state"
        data-exo="table-recipes-state"
        data-filter={@filter}
        data-selected-row={@selected_id || ""}
        data-visible-count={length(@visible_records)}
        data-reviewed-count={@reviewed_count}
        data-escalated-count={@escalated_count}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Table recipe: {length(@visible_records)} visible rows; {@last_action}.
      </p>
    </div>
    """
  end

  defp initial_records do
    [
      %{
        id: "northstar",
        name: "Northstar CRM",
        owner: "Lena",
        status: "open",
        health: "Healthy",
        arr: 128_000,
        reviewed: false,
        escalated: false
      },
      %{
        id: "helio",
        name: "Helio Labs",
        owner: "Mika",
        status: "blocked",
        health: "At risk",
        arr: 94_000,
        reviewed: false,
        escalated: false
      },
      %{
        id: "arc",
        name: "Arc Retail",
        owner: "Noah",
        status: "open",
        health: "Watch",
        arr: 72_000,
        reviewed: false,
        escalated: false
      },
      %{
        id: "summit",
        name: "Summit Health",
        owner: "Iva",
        status: "blocked",
        health: "At risk",
        arr: 156_000,
        reviewed: false,
        escalated: false
      }
    ]
  end

  defp visible_records(_records, "empty"), do: []
  defp visible_records(records, "all"), do: records
  defp visible_records(records, filter), do: Enum.filter(records, &(&1.status == filter))

  defp update_record(records, id, update_fun) do
    Enum.map(records, fn record ->
      if record.id == id, do: update_fun.(record), else: record
    end)
  end

  defp selected_record(_records, nil), do: nil
  defp selected_record(records, id), do: Enum.find(records, &(&1.id == id))

  defp record_row_id(record), do: "table-recipe-#{record.id}"
  defp record_row_label(record), do: "Open #{record.name}"

  defp record_name(records, id) do
    case Enum.find(records, &(&1.id == id)) do
      nil -> "unknown row"
      record -> record.name
    end
  end

  defp normalize_filter(filter) when filter in ["all", "open", "blocked", "empty"], do: filter
  defp normalize_filter(_filter), do: "all"

  defp filter_options do
    [
      {"all", "All rows"},
      {"open", "Open rows"},
      {"blocked", "Blocked rows"},
      {"empty", "Empty state"}
    ]
  end

  defp filter_label("all"), do: "all records"
  defp filter_label("open"), do: "open only"
  defp filter_label("blocked"), do: "blocked only"
  defp filter_label("empty"), do: "empty state"
  defp filter_label(_filter), do: "filtered"

  defp status_label("open"), do: "Open"
  defp status_label("blocked"), do: "Blocked"
  defp status_label(status), do: status

  defp status_variant("open"), do: "success"
  defp status_variant("blocked"), do: "warning"
  defp status_variant(_status), do: "secondary"

  defp health_variant("Healthy"), do: "success"
  defp health_variant("Watch"), do: "warning"
  defp health_variant("At risk"), do: "danger"
  defp health_variant(_health), do: "secondary"

  defp format_arr(arr), do: "$#{div(arr, 1_000)}k"

  defp selected_label(nil), do: "None"
  defp selected_label(record), do: record.name

  defp selected_value(nil, _key), do: "None"
  defp selected_value(record, key), do: Map.fetch!(record, key)

  defp selected_status(nil), do: "None"
  defp selected_status(record), do: status_label(record.status)

  defp selected_arr(nil), do: "None"
  defp selected_arr(record), do: format_arr(record.arr)
end
