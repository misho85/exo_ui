defmodule Storybook.Components.BarChartNegative do
  use PhoenixStorybook.Story, :page

  def doc, do: "Vertical bar chart with positive and negative values."

  def render(assigns) do
    assigns =
      assign(assigns, :data, [
        {"January", 4200},
        {"February", -3800},
        {"March", 5100},
        {"April", -2300},
        {"May", 6700},
        {"June", -1900}
      ])

    ~H"""
    <div style="padding: 1rem; max-width: 620px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Bar chart negative</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Revenue variance by month
          </p>
        </div>
        <div data-exo="card-body">
          <ExoUI.Charts.bar_chart_negative data={@data} height={260} />
        </div>
      </div>
    </div>
    """
  end
end
