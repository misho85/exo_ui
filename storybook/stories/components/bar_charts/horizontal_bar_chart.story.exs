defmodule Storybook.Components.HorizontalBarChart do
  use PhoenixStorybook.Story, :page

  def doc, do: "Horizontal bar chart for category comparison."

  def render(assigns) do
    assigns =
      assign(assigns, :data, [
        {"Chrome", 275},
        {"Safari", 200},
        {"Firefox", 187},
        {"Edge", 173},
        {"Other", 90}
      ])

    ~H"""
    <div style="padding: 1rem; max-width: 620px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Horizontal bar chart</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Browser share
          </p>
        </div>
        <div data-exo="card-body">
          <ExoUI.Charts.horizontal_bar_chart data={@data} height={260} />
        </div>
      </div>
    </div>
    """
  end
end
