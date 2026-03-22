defmodule Storybook.Components.Charts do
  use PhoenixStorybook.Story, :page

  def doc, do: "SVG chart components: trend_badge, sparkline, progress_bar, bar_chart, horizontal_bar_chart, area_chart, stacked_bar_chart."

  def render(assigns) do
    monthly = [
      {"Jan", 4200}, {"Feb", 5800}, {"Mar", 5100},
      {"Apr", 7300}, {"May", 6700}, {"Jun", 8900},
      {"Jul", 7800}, {"Aug", 9200}, {"Sep", 8600},
      {"Oct", 10400}, {"Nov", 9800}, {"Dec", 11200}
    ]

    horizontal = [
      {"Chrome", 64.2}, {"Safari", 19.8}, {"Firefox", 8.1},
      {"Edge", 4.5}, {"Other", 3.4}
    ]

    stacked = [
      {"Q1", %{"Revenue" => 12000, "Cost" => 8000}},
      {"Q2", %{"Revenue" => 15000, "Cost" => 9000}},
      {"Q3", %{"Revenue" => 13000, "Cost" => 7000}},
      {"Q4", %{"Revenue" => 19000, "Cost" => 10000}}
    ]

    colors = %{"Revenue" => "var(--exo-primary)", "Cost" => "var(--exo-danger)"}

    assigns =
      assigns
      |> assign(:monthly, monthly)
      |> assign(:horizontal, horizontal)
      |> assign(:stacked, stacked)
      |> assign(:colors, colors)

    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 800px;">

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
        <ExoUI.Components.content_card title="Revenue">
          <div style="display: flex; align-items: baseline; gap: 0.5rem;">
            <span style="font-size: 1.75rem; font-weight: 700; color: var(--exo-foreground); font-variant-numeric: tabular-nums;">$112K</span>
            <ExoUI.Charts.trend_badge current={112} previous={98} />
          </div>
          <div style="margin-top: 0.75rem;">
            <ExoUI.Charts.sparkline data={[42, 58, 51, 73, 67, 89, 78, 92, 86, 104, 98, 112]} width={220} height={48} />
          </div>
        </ExoUI.Components.content_card>

        <ExoUI.Components.content_card title="Customers">
          <div style="display: flex; align-items: baseline; gap: 0.5rem;">
            <span style="font-size: 1.75rem; font-weight: 700; color: var(--exo-foreground); font-variant-numeric: tabular-nums;">2,451</span>
            <ExoUI.Charts.trend_badge current={2451} previous={2800} />
          </div>
          <div style="margin-top: 0.75rem;">
            <ExoUI.Charts.sparkline data={[60, 55, 48, 52, 45, 42, 38, 45, 40, 45]} width={220} height={48} color="var(--exo-danger)" />
          </div>
        </ExoUI.Components.content_card>

        <ExoUI.Components.content_card title="Orders">
          <div style="display: flex; align-items: baseline; gap: 0.5rem;">
            <span style="font-size: 1.75rem; font-weight: 700; color: var(--exo-foreground); font-variant-numeric: tabular-nums;">1,342</span>
            <ExoUI.Charts.trend_badge current={1342} previous={1342} />
          </div>
          <div style="margin-top: 0.75rem;">
            <ExoUI.Charts.sparkline data={[30, 32, 31, 33, 34, 32, 33, 34, 33, 34]} width={220} height={48} color="var(--exo-muted-foreground)" />
          </div>
        </ExoUI.Components.content_card>
      </div>

      <ExoUI.Components.content_card title="System resources">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <ExoUI.Charts.progress_bar count={75} max={100} label="Disk" />
          <ExoUI.Charts.progress_bar count={42} max={100} label="Memory" color="var(--exo-warning)" />
          <ExoUI.Charts.progress_bar count={12} max={100} label="CPU" color="var(--exo-success)" />
        </div>
      </ExoUI.Components.content_card>

      <ExoUI.Components.content_card title="Monthly revenue">
        <ExoUI.Charts.bar_chart data={@monthly} height={240} />
      </ExoUI.Components.content_card>

      <ExoUI.Components.content_card title="Revenue trend">
        <ExoUI.Charts.area_chart data={@monthly} height={240} />
      </ExoUI.Components.content_card>

      <ExoUI.Components.content_card title="Browser market share">
        <ExoUI.Charts.horizontal_bar_chart data={@horizontal} height={220} />
      </ExoUI.Components.content_card>

      <ExoUI.Components.content_card title="Quarterly breakdown">
        <ExoUI.Charts.stacked_bar_chart data={@stacked} colors={@colors} legend_keys={["Revenue", "Cost"]} height={260} />
      </ExoUI.Components.content_card>

    </div>
    """
  end
end
