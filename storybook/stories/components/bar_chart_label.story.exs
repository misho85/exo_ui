defmodule Storybook.Components.BarChartLabel do
  use PhoenixStorybook.Story, :page

  def doc, do: "Vertical bar chart with value labels."

  def render(assigns) do
    assigns =
      assign(assigns, :data, [
        {"January", 4200},
        {"February", 5800},
        {"March", 5100},
        {"April", 7300},
        {"May", 6700},
        {"June", 8900}
      ])

    ~H"""
    <div style="padding: 1rem; max-width: 620px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Bar chart label</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Bars with numeric labels
          </p>
        </div>
        <div data-exo="card-body">
          <ExoUI.Charts.bar_chart_label data={@data} height={260} />
        </div>
      </div>
    </div>
    """
  end
end
