defmodule ExoUI.Storybook.Components.SavedFiltersWorkflowDemo do
  @moduledoc """
  Production-style saved table filters workflow.

  Demonstrates server-owned filters, saved views, table empty states, active
  filter status, and copy-pasteable form/table composition.
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
       owner: "all",
       active_filter_id: nil,
       saved_filters: saved_filters(),
       last_action: "initial view"
     )}
  end

  @impl true
  def handle_event("change-saved-filters", %{"filters" => params}, socket) do
    {:noreply,
     assign(socket,
       query: string_param(params, "query", ""),
       status: string_param(params, "status", "all"),
       owner: string_param(params, "owner", "all"),
       active_filter_id: nil,
       last_action: "manual filters"
     )}
  end

  def handle_event("apply-saved-filter", %{"id" => id}, socket) do
    case Enum.find(socket.assigns.saved_filters, &(&1.id == id)) do
      nil ->
        {:noreply, socket}

      filter ->
        {:noreply,
         assign(socket,
           query: filter.query,
           status: filter.status,
           owner: filter.owner,
           active_filter_id: filter.id,
           last_action: "applied #{filter.name}"
         )}
    end
  end

  def handle_event("save-current-filter", _params, socket) do
    filter = current_filter(socket.assigns)

    filters =
      socket.assigns.saved_filters
      |> Enum.reject(&(&1.id == filter.id))
      |> Kernel.++([filter])

    {:noreply,
     assign(socket,
       saved_filters: filters,
       active_filter_id: filter.id,
       last_action: "saved current view"
     )}
  end

  def handle_event("clear-saved-filters", _params, socket) do
    {:noreply,
     assign(socket,
       query: "",
       status: "all",
       owner: "all",
       active_filter_id: nil,
       last_action: "cleared filters"
     )}
  end

  @impl true
  def render(assigns) do
    filtered_records = filtered_records(assigns.records, assigns)

    assigns =
      assign(assigns,
        filtered_records: filtered_records,
        active_filter_name: active_filter_name(assigns),
        filter_summary: filter_summary(assigns)
      )

    ~H"""
    <div
      id={@id}
      data-exo="saved-filters-workflow"
      data-query={@query}
      data-status={@status}
      data-owner={@owner}
      data-active-filter={@active_filter_id || ""}
      data-saved-filter-count={length(@saved_filters)}
      data-filtered-count={length(@filtered_records)}
      data-last-action={@last_action}
      style="min-height: 700px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Saved filters workflow
        <:subtitle>
          Filter a table, save the current view, clear filters, and restore saved views from server state.
        </:subtitle>
        <:actions>
          <.badge variant={if @active_filter_id, do: "primary", else: "secondary"}>
            {@active_filter_name}
          </.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card
          title="Visible records"
          value={length(@filtered_records)}
          subtitle="after filters"
        />
        <.stat_card title="Saved views" value={length(@saved_filters)} subtitle="server-owned" />
        <.stat_card title="Last action" value={@last_action} subtitle="workflow status" />
      </div>

      <.content_card title="Filter controls">
        <ExoUI.Components.Form.form
          for={%{}}
          as={:filters}
          phx-change="change-saved-filters"
          phx-target={@myself}
          style="display: grid; grid-template-columns: minmax(14rem, 1fr) 12rem 12rem; align-items: end; gap: 0.875rem;"
        >
          <ExoUI.Components.Form.input
            id="saved-filter-query"
            name="filters[query]"
            label="Search accounts"
            value={@query}
            placeholder="Account, owner, or region"
          />
          <ExoUI.Components.Form.select
            id="saved-filter-status"
            name="filters[status]"
            label="Status"
            value={@status}
            options={status_options()}
          />
          <ExoUI.Components.Form.select
            id="saved-filter-owner"
            name="filters[owner]"
            label="Owner"
            value={@owner}
            options={owner_options()}
          />
        </ExoUI.Components.Form.form>
      </.content_card>

      <div style="display: grid; grid-template-columns: 18rem minmax(0, 1fr); gap: 1rem;">
        <.content_card title="Saved views">
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <.button
              :for={filter <- @saved_filters}
              type="button"
              variant={if filter.id == @active_filter_id, do: nil, else: "outline"}
              phx-click="apply-saved-filter"
              phx-value-id={filter.id}
              phx-target={@myself}
              aria-pressed={if filter.id == @active_filter_id, do: "true", else: "false"}
              style="justify-content: flex-start; width: 100%;"
            >
              {filter.name}
            </.button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
            <.button type="button" phx-click="save-current-filter" phx-target={@myself}>
              Save current filter
            </.button>
            <.button
              type="button"
              variant="ghost"
              phx-click="clear-saved-filters"
              phx-target={@myself}
              disabled={@query == "" and @status == "all" and @owner == "all"}
            >
              Clear filters
            </.button>
          </div>
        </.content_card>

        <.content_card title="Accounts table">
          <:action>
            <.badge variant={if @filtered_records == [], do: "warning", else: "success"}>
              {@filter_summary}
            </.badge>
          </:action>

          <.table
            id="saved-filters-table"
            rows={@filtered_records}
            row_id={&record_row_id/1}
            row_label={&record_row_label/1}
            caption="Accounts filtered by saved views"
            empty_label="No accounts match the saved filter."
          >
            <:col :let={record} label="Account">{record.name}</:col>
            <:col :let={record} label="Owner">{owner_label(record.owner)}</:col>
            <:col :let={record} label="Status">
              <.badge variant={record.status_variant}>{record.status}</.badge>
            </:col>
            <:col :let={record} label="Region">{record.region}</:col>
            <:col :let={record} label="Value" align="right">{record.value}</:col>
          </.table>
        </.content_card>
      </div>

      <p
        id="saved-filters-state"
        data-exo="saved-filters-state"
        data-query={@query}
        data-status={@status}
        data-owner={@owner}
        data-active-filter={@active_filter_id || ""}
        data-saved-filter-count={length(@saved_filters)}
        data-filtered-count={length(@filtered_records)}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Showing {length(@filtered_records)} records from {@active_filter_name}.
      </p>
    </div>
    """
  end

  defp filtered_records(records, assigns) do
    Enum.filter(records, fn record ->
      query_match?(record, assigns.query) and status_match?(record, assigns.status) and
        owner_match?(record, assigns.owner)
    end)
  end

  defp query_match?(_record, ""), do: true

  defp query_match?(record, query) do
    haystack =
      [record.name, record.owner, record.status, record.region]
      |> Enum.join(" ")
      |> String.downcase()

    String.contains?(haystack, String.downcase(query))
  end

  defp status_match?(_record, "all"), do: true
  defp status_match?(record, status), do: record.status_id == status

  defp owner_match?(_record, "all"), do: true
  defp owner_match?(record, "unassigned"), do: record.owner == ""
  defp owner_match?(record, owner), do: record.owner == owner

  defp current_filter(assigns) do
    %{
      id: "custom-filter",
      name: current_filter_name(assigns),
      query: assigns.query,
      status: assigns.status,
      owner: assigns.owner
    }
  end

  defp current_filter_name(assigns) do
    cond do
      assigns.query != "" -> "Saved: #{assigns.query}"
      assigns.status != "all" -> "Saved: #{status_label(assigns.status)}"
      assigns.owner != "all" -> "Saved: #{owner_label(assigns.owner)}"
      true -> "Saved: all accounts"
    end
  end

  defp active_filter_name(%{active_filter_id: nil}), do: "Manual filters"

  defp active_filter_name(assigns) do
    assigns.saved_filters
    |> Enum.find(&(&1.id == assigns.active_filter_id))
    |> then(fn
      nil -> "Manual filters"
      filter -> filter.name
    end)
  end

  defp filter_summary(assigns) do
    [status_label(assigns.status), owner_label(assigns.owner)]
    |> Enum.reject(&(&1 in ["All statuses", "All owners"]))
    |> case do
      [] -> "All records"
      parts -> Enum.join(parts, " / ")
    end
  end

  defp string_param(params, key, fallback),
    do: params |> Map.get(key, fallback) |> to_string() |> String.trim()

  defp status_options do
    [
      {"All statuses", "all"},
      {"Ready", "ready"},
      {"Needs review", "review"},
      {"Blocked", "blocked"}
    ]
  end

  defp owner_options do
    [
      {"All owners", "all"},
      {"Mina", "Mina"},
      {"Sara", "Sara"},
      {"Leo", "Leo"},
      {"Unassigned", "unassigned"}
    ]
  end

  defp status_label("ready"), do: "Ready"
  defp status_label("review"), do: "Needs review"
  defp status_label("blocked"), do: "Blocked"
  defp status_label(_status), do: "All statuses"

  defp owner_label(""), do: "Unassigned"
  defp owner_label("unassigned"), do: "Unassigned"
  defp owner_label("all"), do: "All owners"
  defp owner_label(owner), do: owner

  defp record_row_id(record), do: "saved-filter-record-#{record.id}"
  defp record_row_label(record), do: "Saved filter account #{record.name}"

  defp saved_filters do
    [
      %{
        id: "blocked-handoff",
        name: "Blocked handoff",
        query: "",
        status: "blocked",
        owner: "unassigned"
      },
      %{
        id: "emea-review",
        name: "EMEA review",
        query: "EMEA",
        status: "review",
        owner: "all"
      }
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
        region: "NA",
        value: "$42k"
      },
      %{
        id: "northstar",
        name: "Northstar",
        owner: "",
        status: "Blocked",
        status_id: "blocked",
        status_variant: "danger",
        region: "EMEA",
        value: "$18k"
      },
      %{
        id: "helio",
        name: "Helio Bank",
        owner: "Sara",
        status: "Needs review",
        status_id: "review",
        status_variant: "warning",
        region: "EMEA",
        value: "$31k"
      },
      %{
        id: "atlas",
        name: "Atlas Labs",
        owner: "Leo",
        status: "Needs review",
        status_id: "review",
        status_variant: "warning",
        region: "APAC",
        value: "$27k"
      },
      %{
        id: "lumen",
        name: "Lumen Retail",
        owner: "Mina",
        status: "Ready",
        status_id: "ready",
        status_variant: "success",
        region: "EMEA",
        value: "$36k"
      }
    ]
  end
end
