defmodule ExoUI.Storybook.Components.DataTableWorkflowDemo do
  @moduledoc """
  Production-style server-owned data table workflow.

  Demonstrates filtering, sorting, page-size changes, pagination state, empty
  table rendering, and live status text around a plain ExoUI table.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       records: records(),
       query: "",
       segment: "all",
       sort: "arr_desc",
       page_size: 4,
       page: 1,
       last_action: "initial view"
     )}
  end

  @impl true
  def handle_event("change-data-table", %{"table" => params}, socket) do
    {:noreply,
     assign(socket,
       query: string_param(params, "query", ""),
       segment: string_param(params, "segment", "all"),
       sort: string_param(params, "sort", "arr_desc"),
       page_size: int_param(params, "page_size", socket.assigns.page_size),
       page: 1,
       last_action: "changed table controls"
     )}
  end

  def handle_event("next-data-page", _params, socket) do
    page_count = page_count(socket.assigns)

    {:noreply,
     assign(socket,
       page: min(socket.assigns.page + 1, page_count),
       last_action: "next page"
     )}
  end

  def handle_event("previous-data-page", _params, socket) do
    {:noreply,
     assign(socket,
       page: max(socket.assigns.page - 1, 1),
       last_action: "previous page"
     )}
  end

  def handle_event("reset-data-table", _params, socket) do
    {:noreply,
     assign(socket,
       query: "",
       segment: "all",
       sort: "arr_desc",
       page_size: 4,
       page: 1,
       last_action: "reset table"
     )}
  end

  @impl true
  def render(assigns) do
    rows = filtered_sorted_records(assigns)
    page_count = page_count(rows, assigns.page_size)
    page = assigns.page |> max(1) |> min(page_count)
    paged_rows = paginate(rows, page, assigns.page_size)
    range = visible_range(length(rows), page, assigns.page_size)

    assigns =
      assign(assigns,
        rows: rows,
        paged_rows: paged_rows,
        total_count: length(rows),
        page_count: page_count,
        page: page,
        range_start: elem(range, 0),
        range_end: elem(range, 1)
      )

    ~H"""
    <div
      id={@id}
      data-exo="data-table-workflow"
      data-query={@query}
      data-segment={@segment}
      data-sort={@sort}
      data-page-size={@page_size}
      data-page={@page}
      data-page-count={@page_count}
      data-total-count={@total_count}
      data-visible-count={length(@paged_rows)}
      data-last-action={@last_action}
      style="min-height: 720px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Data table workflow
        <:subtitle>
          Server-owned filtering, sorting, page size, pagination, and empty table state.
        </:subtitle>
        <:actions>
          <.badge variant={if @total_count == 0, do: "warning", else: "primary"}>
            {@total_count} results
          </.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Total results" value={@total_count} subtitle="after controls" />
        <.stat_card title="Visible rows" value={length(@paged_rows)} subtitle="current page" />
        <.stat_card title="Page" value={"#{@page} / #{@page_count}"} subtitle="server state" />
        <.stat_card title="Last action" value={@last_action} subtitle="status source" />
      </div>

      <.content_card title="Table controls">
        <ExoUI.Components.Form.form
          for={%{}}
          as={:table}
          phx-change="change-data-table"
          phx-target={@myself}
          style="display: grid; grid-template-columns: minmax(14rem, 1fr) 12rem 14rem 10rem; align-items: end; gap: 0.875rem;"
        >
          <ExoUI.Components.Form.input
            id="data-table-query"
            name="table[query]"
            label="Search table"
            value={@query}
            placeholder="Account, owner, or region"
          />
          <ExoUI.Components.Form.input
            id="data-table-segment"
            name="table[segment]"
            type="select"
            label="Segment"
            value={@segment}
            options={segment_options()}
          />
          <ExoUI.Components.Form.input
            id="data-table-sort"
            name="table[sort]"
            type="select"
            label="Sort"
            value={@sort}
            options={sort_options()}
          />
          <ExoUI.Components.Form.input
            id="data-table-page-size"
            name="table[page_size]"
            type="select"
            label="Rows per page"
            value={Integer.to_string(@page_size)}
            options={page_size_options()}
          />
        </ExoUI.Components.Form.form>
      </.content_card>

      <.content_card title="Accounts">
        <:action>
          <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
            <.button
              type="button"
              size="sm"
              variant="ghost"
              disabled={
                @query == "" and @segment == "all" and @sort == "arr_desc" and @page_size == 4
              }
              phx-click="reset-data-table"
              phx-target={@myself}
            >
              Reset table
            </.button>
          </div>
        </:action>

        <.table
          id="data-table-workflow-table"
          rows={@paged_rows}
          row_id={&record_row_id/1}
          row_label={&record_row_label/1}
          caption="Paginated account records"
          empty_label="No accounts match the current table controls."
        >
          <:col :let={record} label="Account">{record.name}</:col>
          <:col :let={record} label="Owner">{record.owner}</:col>
          <:col :let={record} label="Segment">{record.segment_label}</:col>
          <:col :let={record} label="Status">
            <.badge variant={record.status_variant}>{record.status}</.badge>
          </:col>
          <:col :let={record} label="Risk" align="right">{record.risk}</:col>
          <:col :let={record} label="ARR" align="right">{format_arr(record.arr)}</:col>
        </.table>

        <div
          data-exo="data-table-pagination"
          style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem;"
        >
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: var(--exo-text-sm);">
            Showing {@range_start}-{@range_end} of {@total_count}
          </p>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <.button
              type="button"
              size="sm"
              variant="outline"
              disabled={@page <= 1}
              phx-click="previous-data-page"
              phx-target={@myself}
            >
              Previous page
            </.button>
            <.badge variant="secondary">Page {@page}</.badge>
            <.button
              type="button"
              size="sm"
              variant="outline"
              disabled={@page >= @page_count}
              phx-click="next-data-page"
              phx-target={@myself}
            >
              Next page
            </.button>
          </div>
        </div>
      </.content_card>

      <p
        id="data-table-state"
        data-exo="data-table-state"
        data-query={@query}
        data-segment={@segment}
        data-sort={@sort}
        data-page-size={@page_size}
        data-page={@page}
        data-page-count={@page_count}
        data-total-count={@total_count}
        data-visible-count={length(@paged_rows)}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Showing {@range_start}-{@range_end} of {@total_count} records on page {@page}.
      </p>
    </div>
    """
  end

  defp filtered_sorted_records(assigns) do
    assigns.records
    |> Enum.filter(&matches_query?(&1, assigns.query))
    |> Enum.filter(&matches_segment?(&1, assigns.segment))
    |> sort_records(assigns.sort)
  end

  defp matches_query?(_record, ""), do: true

  defp matches_query?(record, query) do
    haystack =
      [record.name, record.owner, record.segment_label, record.status]
      |> Enum.join(" ")
      |> String.downcase()

    String.contains?(haystack, String.downcase(query))
  end

  defp matches_segment?(_record, "all"), do: true
  defp matches_segment?(record, segment), do: record.segment == segment

  defp sort_records(records, "arr_asc"), do: Enum.sort_by(records, & &1.arr, :asc)
  defp sort_records(records, "name_asc"), do: Enum.sort_by(records, & &1.name, :asc)
  defp sort_records(records, "risk_desc"), do: Enum.sort_by(records, & &1.risk, :desc)
  defp sort_records(records, _sort), do: Enum.sort_by(records, & &1.arr, :desc)

  defp paginate(rows, page, page_size) do
    rows
    |> Enum.drop((page - 1) * page_size)
    |> Enum.take(page_size)
  end

  defp page_count(assigns),
    do: assigns |> filtered_sorted_records() |> page_count(assigns.page_size)

  defp page_count(rows, page_size), do: max(ceil(length(rows) / page_size), 1)

  defp visible_range(0, _page, _page_size), do: {0, 0}

  defp visible_range(total_count, page, page_size) do
    start = (page - 1) * page_size + 1
    finish = min(page * page_size, total_count)
    {start, finish}
  end

  defp int_param(params, key, fallback) do
    case Integer.parse(Map.get(params, key, Integer.to_string(fallback))) do
      {value, _rest} when value in [2, 3, 4, 6] -> value
      _other -> fallback
    end
  end

  defp string_param(params, key, fallback),
    do: params |> Map.get(key, fallback) |> to_string() |> String.trim()

  defp format_arr(value), do: "$#{value}k"
  defp record_row_id(record), do: "data-table-row-#{record.id}"
  defp record_row_label(record), do: "Data table account #{record.name}"

  defp segment_options do
    [
      {"All segments", "all"},
      {"EMEA", "emea"},
      {"North America", "na"},
      {"APAC", "apac"}
    ]
  end

  defp sort_options do
    [
      {"ARR high to low", "arr_desc"},
      {"ARR low to high", "arr_asc"},
      {"Risk high to low", "risk_desc"},
      {"Account A-Z", "name_asc"}
    ]
  end

  defp page_size_options do
    [
      {"2 rows", "2"},
      {"3 rows", "3"},
      {"4 rows", "4"},
      {"6 rows", "6"}
    ]
  end

  defp records do
    [
      %{
        id: "northstar",
        name: "Northstar",
        owner: "Iva",
        segment: "emea",
        segment_label: "EMEA",
        status: "Blocked",
        status_variant: "danger",
        risk: 92,
        arr: 182
      },
      %{
        id: "helio",
        name: "Helio Bank",
        owner: "Mina",
        segment: "emea",
        segment_label: "EMEA",
        status: "Needs review",
        status_variant: "warning",
        risk: 74,
        arr: 164
      },
      %{
        id: "acme",
        name: "Acme Corp",
        owner: "Sara",
        segment: "na",
        segment_label: "North America",
        status: "Ready",
        status_variant: "success",
        risk: 22,
        arr: 148
      },
      %{
        id: "lumen",
        name: "Lumen Retail",
        owner: "Mina",
        segment: "emea",
        segment_label: "EMEA",
        status: "Ready",
        status_variant: "success",
        risk: 38,
        arr: 132
      },
      %{
        id: "atlas",
        name: "Atlas Labs",
        owner: "Leo",
        segment: "apac",
        segment_label: "APAC",
        status: "Needs review",
        status_variant: "warning",
        risk: 58,
        arr: 118
      },
      %{
        id: "orbit",
        name: "Orbit Labs",
        owner: "Sara",
        segment: "na",
        segment_label: "North America",
        status: "Ready",
        status_variant: "success",
        risk: 31,
        arr: 106
      },
      %{
        id: "vega",
        name: "Vega Health",
        owner: "Iva",
        segment: "emea",
        segment_label: "EMEA",
        status: "Needs review",
        status_variant: "warning",
        risk: 61,
        arr: 92
      },
      %{
        id: "kestrel",
        name: "Kestrel AI",
        owner: "Leo",
        segment: "apac",
        segment_label: "APAC",
        status: "Ready",
        status_variant: "success",
        risk: 27,
        arr: 84
      },
      %{
        id: "summit",
        name: "Summit Works",
        owner: "Mina",
        segment: "na",
        segment_label: "North America",
        status: "Blocked",
        status_variant: "danger",
        risk: 81,
        arr: 73
      },
      %{
        id: "quartz",
        name: "Quartz Media",
        owner: "Sara",
        segment: "emea",
        segment_label: "EMEA",
        status: "Ready",
        status_variant: "success",
        risk: 44,
        arr: 56
      },
      %{
        id: "ember",
        name: "Ember Foods",
        owner: "Iva",
        segment: "apac",
        segment_label: "APAC",
        status: "Needs review",
        status_variant: "warning",
        risk: 49,
        arr: 44
      },
      %{
        id: "pioneer",
        name: "Pioneer Grid",
        owner: "Leo",
        segment: "na",
        segment_label: "North America",
        status: "Ready",
        status_variant: "success",
        risk: 19,
        arr: 38
      }
    ]
  end
end
