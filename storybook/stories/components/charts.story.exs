defmodule Storybook.Components.Charts do
  use PhoenixStorybook.Story, :page

  def doc, do: "SVG chart components: trend_badge, sparkline, progress_bar, bar_chart, horizontal_bar_chart, area_chart, stacked_bar_chart."

  def render(assigns) do
    monthly = [
      {"Jan", 42}, {"Feb", 58}, {"Mar", 51},
      {"Apr", 73}, {"May", 67}, {"Jun", 89}
    ]

    spark = [12, 28, 18, 42, 35, 55, 48, 72, 60, 85]

    horizontal = [
      {"Chrome", 64.2}, {"Safari", 19.8}, {"Firefox", 8.1},
      {"Edge", 4.5}, {"Other", 3.4}
    ]

    stacked = [
      {"Q1", %{"Revenue" => 120, "Cost" => 80}},
      {"Q2", %{"Revenue" => 150, "Cost" => 90}},
      {"Q3", %{"Revenue" => 130, "Cost" => 70}},
      {"Q4", %{"Revenue" => 190, "Cost" => 100}}
    ]

    colors = %{"Revenue" => "var(--exo-primary)", "Cost" => "var(--exo-danger)"}

    assigns =
      assigns
      |> assign(:monthly, monthly)
      |> assign(:spark, spark)
      |> assign(:horizontal, horizontal)
      |> assign(:stacked, stacked)
      |> assign(:colors, colors)

    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 800px;">

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
        <ExoUI.Components.content_card title="Revenue">
          <div style="display: flex; align-items: baseline; gap: 0.5rem;">
            <span style="font-size: 1.5rem; font-weight: 700; color: var(--exo-foreground);">$89K</span>
            <ExoUI.Charts.trend_badge current={89} previous={72} />
          </div>
          <div style="margin-top: 0.75rem;">
            <ExoUI.Charts.sparkline data={@spark} width={200} height={40} />
          </div>
        </ExoUI.Components.content_card>

        <ExoUI.Components.content_card title="Users">
          <div style="display: flex; align-items: baseline; gap: 0.5rem;">
            <span style="font-size: 1.5rem; font-weight: 700; color: var(--exo-foreground);">2,451</span>
            <ExoUI.Charts.trend_badge current={45} previous={60} />
          </div>
          <div style="margin-top: 0.75rem;">
            <ExoUI.Charts.sparkline data={[60, 55, 48, 52, 45, 42, 38, 45, 40, 45]} width={200} height={40} color="var(--exo-danger)" />
          </div>
        </ExoUI.Components.content_card>

        <ExoUI.Components.content_card title="Orders">
          <div style="display: flex; align-items: baseline; gap: 0.5rem;">
            <span style="font-size: 1.5rem; font-weight: 700; color: var(--exo-foreground);">342</span>
            <ExoUI.Charts.trend_badge current={100} previous={100} />
          </div>
          <div style="margin-top: 0.75rem;">
            <ExoUI.Charts.sparkline data={[30, 32, 31, 33, 34, 32, 33, 34, 33, 34]} width={200} height={40} color="var(--exo-muted-foreground)" />
          </div>
        </ExoUI.Components.content_card>
      </div>

      <ExoUI.Components.content_card title="Storage usage">
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <ExoUI.Charts.progress_bar count={75} max={100} label="Disk" />
          <ExoUI.Charts.progress_bar count={42} max={100} label="Memory" color="var(--exo-warning)" />
          <ExoUI.Charts.progress_bar count={12} max={100} label="CPU" color="var(--exo-success)" />
        </div>
      </ExoUI.Components.content_card>

      <ExoUI.Components.content_card title="Monthly revenue">
        <ExoUI.Charts.bar_chart data={@monthly} height={220} />
      </ExoUI.Components.content_card>

      <ExoUI.Components.content_card title="Revenue trend">
        <ExoUI.Charts.area_chart data={@monthly} height={220} />
      </ExoUI.Components.content_card>

      <ExoUI.Components.content_card title="Browser market share">
        <ExoUI.Charts.horizontal_bar_chart data={@horizontal} height={200} />
      </ExoUI.Components.content_card>

      <ExoUI.Components.content_card title="Quarterly breakdown">
        <ExoUI.Charts.stacked_bar_chart data={@stacked} colors={@colors} legend_keys={["Revenue", "Cost"]} height={240} />
      </ExoUI.Components.content_card>

    </div>
    """
  end
end
