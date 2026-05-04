defmodule Storybook.Components.BarChartMultiple do
  use PhoenixStorybook.Story, :page

  def doc, do: "Grouped vertical bar chart for two numeric series."

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
          <h3 data-exo="card-title">Bar chart multiple</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Desktop and mobile visitors
          </p>
        </div>
        <div data-exo="card-body">
          <ExoUI.Charts.bar_chart_multiple data={@data} height={260} />
        </div>
      </div>
    </div>
    """
  end
end
