defmodule Storybook.Components.Charts.AreaChartStacked do
  use PhoenixStorybook.Story, :page

  def doc, do: "Stacked area chart for two numeric series."

  def render(assigns) do
    assigns =
      assign(assigns, :data, [
        {"January", 4200, 2400},
        {"February", 5800, 3200},
        {"March", 5100, 2900},
        {"April", 7300, 4100},
        {"May", 6700, 3800},
        {"June", 8900, 4800}
      ])

    ~H"""
    <div style="padding: 1rem; max-width: 620px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Area chart stacked</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Desktop and mobile trend
          </p>
        </div>
        <div data-exo="card-body">
          <ExoUI.Charts.area_chart_stacked data={@data} height={260} />
        </div>
      </div>
    </div>
    """
  end
end
