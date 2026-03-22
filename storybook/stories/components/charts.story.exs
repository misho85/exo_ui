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
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem; max-width: 800px;">

      <section>
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">trend_badge</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
          <ExoUI.Charts.trend_badge current={89} previous={72} />
          <ExoUI.Charts.trend_badge current={45} previous={60} />
          <ExoUI.Charts.trend_badge current={100} previous={100} />
        </div>
      </section>

      <section>
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">sparkline</h3>
        <div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: center;">
          <ExoUI.Charts.sparkline data={@spark} width={120} height={40} />
          <ExoUI.Charts.sparkline data={@spark} width={200} height={60} />
        </div>
      </section>

      <section>
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">progress_bar</h3>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 400px;">
          <ExoUI.Charts.progress_bar count={75} max={100} label="Storage" />
          <ExoUI.Charts.progress_bar count={42} max={100} label="Memory" />
          <ExoUI.Charts.progress_bar count={12} max={100} label="CPU" />
        </div>
      </section>

      <section>
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">bar_chart</h3>
        <ExoUI.Charts.bar_chart data={@monthly} width={500} height={200} />
      </section>

      <section>
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">horizontal_bar_chart</h3>
        <ExoUI.Charts.horizontal_bar_chart data={@horizontal} width={400} height={200} />
      </section>

      <section>
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">area_chart</h3>
        <ExoUI.Charts.area_chart data={@monthly} width={500} height={200} />
      </section>

      <section>
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">stacked_bar_chart</h3>
        <ExoUI.Charts.stacked_bar_chart data={@stacked} colors={@colors} legend_keys={["Revenue", "Cost"]} width={500} height={220} />
      </section>

    </div>
    """
  end
end
