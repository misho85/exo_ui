defmodule ExoUI.Storybook.Components.DashboardDrilldownWorkflowDemo do
  @moduledoc """
  Production-style dashboard drilldown workflow.

  Demonstrates metric-driven filtering, server-owned table state, chart
  summaries, drawer-hosted account details, review actions, and live status
  text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       active_metric: "all",
       selected_account_id: nil,
       reviewed_ids: MapSet.new(),
       drilldown_count: 0,
       last_action: "initial dashboard"
     )}
  end

  @impl true
  def handle_event("filter-dashboard", %{"metric" => metric}, socket) do
    metric = normalize_metric(metric)

    {:noreply,
     assign(socket,
       active_metric: metric,
       selected_account_id: nil,
       drilldown_count: socket.assigns.drilldown_count + 1,
       last_action: "filtered #{metric_label(metric)}"
     )}
  end

  def handle_event("open-dashboard-account", %{"id" => id}, socket) do
    account = account_by_id(id)

    {:noreply,
     assign(socket,
       selected_account_id: account.id,
       drilldown_count: socket.assigns.drilldown_count + 1,
       last_action: "opened #{account.name}"
     )}
  end

  def handle_event("mark-dashboard-reviewed", _params, socket) do
    account = account_by_id(socket.assigns.selected_account_id)

    {:noreply,
     assign(socket,
       reviewed_ids: MapSet.put(socket.assigns.reviewed_ids, account.id),
       last_action: "marked #{account.name} reviewed"
     )}
  end

  def handle_event("reset-dashboard", _params, socket) do
    {:noreply,
     assign(socket,
       active_metric: "all",
       selected_account_id: nil,
       reviewed_ids: MapSet.new(),
       drilldown_count: 0,
       last_action: "reset dashboard"
     )}
  end

  @impl true
  def render(assigns) do
    accounts = decorate_accounts(accounts(), assigns.reviewed_ids)
    rows = filter_accounts(accounts, assigns.active_metric)
    selected_account = selected_account(accounts, assigns.selected_account_id)

    assigns =
      assign(assigns,
        accounts: accounts,
        rows: rows,
        selected_account: selected_account,
        metrics: metric_cards(accounts),
        chart_data: chart_data(rows),
        visible_count: length(rows),
        total_arr: total_arr(rows),
        reviewed_count: MapSet.size(assigns.reviewed_ids)
      )

    ~H"""
    <div
      id={@id}
      data-exo="dashboard-drilldown-workflow"
      data-active-metric={@active_metric}
      data-visible-count={@visible_count}
      data-total-arr={@total_arr}
      data-selected-account={@selected_account.id}
      data-reviewed-count={@reviewed_count}
      data-drilldown-count={@drilldown_count}
      data-last-action={@last_action}
      style="min-height: 760px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Dashboard drilldown workflow
        <:subtitle>
          Metric filters, chart context, account table rows, and drawer-hosted review details.
        </:subtitle>
        <:actions>
          <.badge variant="primary">{metric_label(@active_metric)}</.badge>
        </:actions>
      </.header>

      <section
        aria-label="Dashboard metric filters"
        style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;"
      >
        <.button
          :for={metric <- @metrics}
          id={"dashboard-metric-#{metric.id}"}
          type="button"
          variant={if metric.id == @active_metric, do: nil, else: "outline"}
          phx-click="filter-dashboard"
          phx-value-metric={metric.id}
          phx-target={@myself}
          aria-pressed={if metric.id == @active_metric, do: "true", else: "false"}
          style="height: auto; justify-content: flex-start; padding: 1rem; text-align: left;"
        >
          <span style="display: grid; gap: 0.25rem;">
            <span style="display: flex; align-items: center; gap: 0.5rem;">
              <.icon name={metric.icon} />
              <span>{metric.label}</span>
            </span>
            <strong style="font-size: 1.5rem; line-height: 1;">{metric.value}</strong>
            <span style="font-size: var(--exo-text-sm); opacity: 0.8;">{metric.subtitle}</span>
          </span>
        </.button>
      </section>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Account drilldown">
            <:action>
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem;">
                <.badge variant="secondary">{@visible_count} visible</.badge>
                <.button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={
                    @active_metric == "all" and @selected_account_id == nil and @reviewed_count == 0
                  }
                  phx-click="reset-dashboard"
                  phx-target={@myself}
                >
                  Reset dashboard
                </.button>
              </div>
            </:action>

            <.table
              id="dashboard-drilldown-table"
              rows={@rows}
              row_id={&account_row_id/1}
              row_label={&account_row_label/1}
              caption="Dashboard drilldown accounts"
              empty_label="No accounts match the selected dashboard metric."
            >
              <:col :let={account} label="Account">
                <span style="display: grid; gap: 0.125rem;">
                  <strong>{account.name}</strong>
                  <span style="color: var(--exo-muted-foreground); font-size: var(--exo-text-sm);">
                    {account.segment_label}
                  </span>
                </span>
              </:col>
              <:col :let={account} label="Owner">{account.owner}</:col>
              <:col :let={account} label="Stage">{account.stage}</:col>
              <:col :let={account} label="Status">
                <.badge variant={account.status_variant}>{account.status}</.badge>
              </:col>
              <:col :let={account} label="Risk" align="right">
                <.badge variant={risk_variant(account.risk)}>{account.risk}</.badge>
              </:col>
              <:col :let={account} label="ARR" align="right">{format_arr(account.arr)}</:col>
              <:col :let={account} label="Action" align="right">
                <.button
                  type="button"
                  size="sm"
                  variant="outline"
                  phx-click={open_account(account.id, @myself)}
                >
                  Open details
                </.button>
              </:col>
            </.table>
          </.content_card>

          <.content_card title="Visible risk distribution">
            <ExoUI.Charts.horizontal_bar_chart
              data={@chart_data}
              height={190}
              aria_label="Risk score by visible account"
            />
          </.content_card>
        </div>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Dashboard state">
            <.list>
              <:item title="Active metric">{metric_label(@active_metric)}</:item>
              <:item title="Visible accounts">{@visible_count}</:item>
              <:item title="Visible ARR">{format_arr(@total_arr)}</:item>
              <:item title="Reviewed">{@reviewed_count}</:item>
              <:item title="Drilldowns">{@drilldown_count}</:item>
            </.list>
          </.content_card>

          <.content_card title="Operational insight">
            <p style="margin: 0; color: var(--exo-muted-foreground); font-size: var(--exo-text-sm);">
              {insight_text(@active_metric, @visible_count, @total_arr)}
            </p>
          </.content_card>
        </aside>
      </div>

      <.drawer id="dashboard-drilldown-drawer" side="right">
        <:title>{drawer_title(@selected_account)}</:title>
        <section
          id="dashboard-drilldown-detail"
          data-exo="dashboard-drilldown-detail"
          data-selected-account={@selected_account.id}
          data-reviewed={if @selected_account.reviewed, do: "true", else: "false"}
          style="display: flex; flex-direction: column; gap: 1rem;"
        >
          <.alert
            :if={@selected_account.id != ""}
            kind={detail_alert_kind(@selected_account)}
            title={@selected_account.next_step}
          >
            {detail_summary(@selected_account)}
          </.alert>

          <.list>
            <:item title="Account">{@selected_account.name}</:item>
            <:item title="Owner">{@selected_account.owner}</:item>
            <:item title="Segment">{@selected_account.segment_label}</:item>
            <:item title="Stage">{@selected_account.stage}</:item>
            <:item title="ARR">{format_arr(@selected_account.arr)}</:item>
            <:item title="Status">
              <.badge variant={@selected_account.status_variant}>{@selected_account.status}</.badge>
            </:item>
          </.list>

          <.progress
            value={@selected_account.health}
            label="Renewal health"
            aria_label="Renewal health"
          />

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
            <.button
              type="button"
              variant="ghost"
              phx-click={hide_drawer("dashboard-drilldown-drawer")}
            >
              Close details
            </.button>
            <.button
              type="button"
              disabled={@selected_account.id == "" or @selected_account.reviewed}
              phx-click="mark-dashboard-reviewed"
              phx-target={@myself}
            >
              Mark reviewed
            </.button>
          </div>
        </section>
      </.drawer>

      <p
        id="dashboard-drilldown-state"
        data-exo="dashboard-drilldown-state"
        data-active-metric={@active_metric}
        data-visible-count={@visible_count}
        data-total-arr={@total_arr}
        data-selected-account={@selected_account.id}
        data-reviewed-count={@reviewed_count}
        data-drilldown-count={@drilldown_count}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Showing {metric_label(@active_metric)} with {@visible_count} accounts; {@last_action}.
      </p>
    </div>
    """
  end

  defp open_account(id, target) do
    JS.push("open-dashboard-account", value: %{id: id}, target: target)
    |> show_drawer_js("dashboard-drilldown-drawer")
  end

  defp show_drawer_js(js, id) do
    js
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> JS.remove_attribute("inert", to: "##{id}")
    |> JS.focus_first(to: "##{id} [data-exo=\"drawer-content\"]")
  end

  defp decorate_accounts(accounts, reviewed_ids) do
    Enum.map(accounts, fn account ->
      reviewed = MapSet.member?(reviewed_ids, account.id)

      account
      |> Map.put(:reviewed, reviewed)
      |> Map.put(:status, if(reviewed, do: "Reviewed", else: account.status))
      |> Map.put(:status_variant, if(reviewed, do: "success", else: account.status_variant))
    end)
  end

  defp filter_accounts(accounts, metric) do
    accounts
    |> do_filter_accounts(metric)
    |> Enum.sort_by(& &1.risk, :desc)
  end

  defp do_filter_accounts(accounts, "at_risk"), do: Enum.filter(accounts, &(&1.risk >= 75))

  defp do_filter_accounts(accounts, "renewals"),
    do: Enum.filter(accounts, &(&1.stage == "Renewal"))

  defp do_filter_accounts(accounts, "expansion"),
    do: Enum.filter(accounts, &(&1.stage == "Expansion"))

  defp do_filter_accounts(accounts, _metric), do: accounts

  defp selected_account(_accounts, nil), do: empty_account()

  defp selected_account(accounts, id) do
    Enum.find(accounts, &(&1.id == id)) || empty_account()
  end

  defp account_by_id(nil), do: empty_account()
  defp account_by_id(id), do: Enum.find(accounts(), &(&1.id == id)) || empty_account()

  defp normalize_metric(metric) when metric in ["all", "at_risk", "renewals", "expansion"],
    do: metric

  defp normalize_metric(_metric), do: "all"

  defp metric_cards(accounts) do
    [
      %{
        id: "all",
        label: "All accounts",
        value: length(accounts),
        subtitle: "full book",
        icon: "layout-dashboard"
      },
      %{
        id: "at_risk",
        label: "At risk",
        value: accounts |> Enum.filter(&(&1.risk >= 75)) |> length(),
        subtitle: "risk score 75+",
        icon: "shield-alert"
      },
      %{
        id: "renewals",
        label: "Renewals",
        value: accounts |> Enum.filter(&(&1.stage == "Renewal")) |> length(),
        subtitle: "active renewal work",
        icon: "refresh-cw"
      },
      %{
        id: "expansion",
        label: "Expansion",
        value: accounts |> Enum.filter(&(&1.stage == "Expansion")) |> length(),
        subtitle: "growth motions",
        icon: "trending-up"
      }
    ]
  end

  defp metric_label("at_risk"), do: "At risk"
  defp metric_label("renewals"), do: "Renewals"
  defp metric_label("expansion"), do: "Expansion"
  defp metric_label(_metric), do: "All accounts"

  defp chart_data(rows), do: Enum.map(rows, &{&1.name, &1.risk})

  defp total_arr(rows), do: Enum.reduce(rows, 0, &(&1.arr + &2))

  defp account_row_id(account), do: "dashboard-account-#{account.id}"
  defp account_row_label(account), do: "Dashboard account #{account.name}"

  defp risk_variant(risk) when risk >= 80, do: "danger"
  defp risk_variant(risk) when risk >= 65, do: "warning"
  defp risk_variant(_risk), do: "success"

  defp detail_alert_kind(%{reviewed: true}), do: :success
  defp detail_alert_kind(%{risk: risk}) when risk >= 80, do: :error
  defp detail_alert_kind(%{risk: risk}) when risk >= 65, do: :warning
  defp detail_alert_kind(_account), do: :info

  defp drawer_title(%{id: ""}), do: "Account details"
  defp drawer_title(account), do: "#{account.name} details"

  defp detail_summary(%{reviewed: true, name: name}),
    do: "#{name} has been reviewed in this session."

  defp detail_summary(account), do: "Risk #{account.risk}; renewal health #{account.health}."

  defp insight_text("at_risk", count, arr),
    do: "#{count} high-risk accounts represent #{format_arr(arr)} in visible ARR."

  defp insight_text("renewals", count, arr),
    do: "#{count} renewal workstreams need owner follow-through across #{format_arr(arr)}."

  defp insight_text("expansion", count, arr),
    do: "#{count} expansion motions are ready for account-plan review across #{format_arr(arr)}."

  defp insight_text(_metric, count, arr),
    do: "#{count} accounts are visible in the dashboard with #{format_arr(arr)} total ARR."

  defp format_arr(value), do: "$#{value}k"

  defp empty_account do
    %{
      id: "",
      name: "No account selected",
      owner: "None",
      segment_label: "None",
      stage: "None",
      arr: 0,
      risk: 0,
      health: 0,
      status: "Not selected",
      status_variant: "secondary",
      next_step: "Select an account",
      reviewed: false
    }
  end

  defp accounts do
    [
      %{
        id: "northstar",
        name: "Northstar",
        owner: "Iva",
        segment_label: "EMEA",
        stage: "Renewal",
        arr: 182,
        risk: 92,
        health: 42,
        status: "Blocked",
        status_variant: "danger",
        next_step: "Assign executive sponsor"
      },
      %{
        id: "helio",
        name: "Helio Bank",
        owner: "Mina",
        segment_label: "EMEA",
        stage: "Compliance",
        arr: 164,
        risk: 74,
        health: 58,
        status: "Needs review",
        status_variant: "warning",
        next_step: "Resolve duplicate domain"
      },
      %{
        id: "acme",
        name: "Acme Corp",
        owner: "Sara",
        segment_label: "North America",
        stage: "Expansion",
        arr: 148,
        risk: 22,
        health: 88,
        status: "Ready",
        status_variant: "success",
        next_step: "Prepare expansion quote"
      },
      %{
        id: "atlas",
        name: "Atlas Works",
        owner: "Unassigned",
        segment_label: "North America",
        stage: "Compliance",
        arr: 140,
        risk: 78,
        health: 51,
        status: "Needs owner",
        status_variant: "warning",
        next_step: "Assign account owner"
      },
      %{
        id: "vega",
        name: "Vega Health",
        owner: "Iva",
        segment_label: "EMEA",
        stage: "Renewal",
        arr: 121,
        risk: 81,
        health: 49,
        status: "Escalated",
        status_variant: "danger",
        next_step: "Collect security evidence"
      },
      %{
        id: "orbit",
        name: "Orbit Labs",
        owner: "Sara",
        segment_label: "APAC",
        stage: "Expansion",
        arr: 116,
        risk: 18,
        health: 91,
        status: "Ready",
        status_variant: "success",
        next_step: "Confirm procurement path"
      },
      %{
        id: "lumen",
        name: "Lumen Retail",
        owner: "Mina",
        segment_label: "EMEA",
        stage: "Renewal",
        arr: 96,
        risk: 41,
        health: 72,
        status: "On track",
        status_variant: "success",
        next_step: "Send renewal proposal"
      },
      %{
        id: "quartz",
        name: "Quartz Media",
        owner: "Iva",
        segment_label: "EMEA",
        stage: "Expansion",
        arr: 84,
        risk: 67,
        health: 63,
        status: "Monitoring",
        status_variant: "secondary",
        next_step: "Review stakeholder map"
      }
    ]
  end
end
