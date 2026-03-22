defmodule Storybook.Components.Charts do
  use PhoenixStorybook.Story, :page

  def doc, do: "SVG chart components: trend_badge, sparkline, progress_bar, bar_chart, horizontal_bar_chart, area_chart, stacked_bar_chart."

  def render(assigns) do
    monthly = [
      %{label: "Jan", value: 42},
      %{label: "Feb", value: 58},
      %{label: "Mar", value: 51},
      %{label: "Apr", value: 73},
      %{label: "May", value: 67},
      %{label: "Jun", value: 89}
    ]

    spark = [12, 28, 18, 42, 35, 55, 48, 72, 60, 85]

    horizontal = [
      %{label: "Chrome", value: 64.2},
      %{label: "Safari", value: 19.8},
      %{label: "Firefox", value: 8.1},
      %{label: "Edge", value: 4.5},
      %{label: "Other", value: 3.4}
    ]

    stacked = [
      %{label: "Q1", series: [%{name: "Revenue", value: 120}, %{name: "Cost", value: 80}]},
      %{label: "Q2", series: [%{name: "Revenue", value: 150}, %{name: "Cost", value: 90}]},
      %{label: "Q3", series: [%{name: "Revenue", value: 130}, %{name: "Cost", value: 70}]},
      %{label: "Q4", series: [%{name: "Revenue", value: 190}, %{name: "Cost", value: 100}]}
    ]

    assigns =
      assigns
      |> assign(:monthly, monthly)
      |> assign(:spark, spark)
      |> assign(:horizontal, horizontal)
      |> assign(:stacked, stacked)

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
          <ExoUI.Charts.progress_bar value={75} max={100} label="Storage" />
          <ExoUI.Charts.progress_bar value={42} max={100} label="Memory" />
          <ExoUI.Charts.progress_bar value={12} max={100} label="CPU" />
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
        <ExoUI.Charts.stacked_bar_chart data={@stacked} width={500} height={220} />
      </section>

    </div>
    """
  end
end
