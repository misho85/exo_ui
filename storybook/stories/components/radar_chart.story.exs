defmodule Storybook.Components.RadarChart do
  use PhoenixStorybook.Story, :page

  def doc, do: "Radar chart for cyclical category comparison."

  def render(assigns) do
    assigns =
      assign(assigns, :data, [
        {"January", 186},
        {"February", 305},
        {"March", 237},
        {"April", 273},
        {"May", 209},
        {"June", 214}
      ])

    ~H"""
    <div style="padding: 1rem; max-width: 520px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Radar chart</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Activity by month
          </p>
        </div>
        <div data-exo="card-body" style="display: flex; justify-content: center;">
          <ExoUI.Charts.radar_chart data={@data} size={280} />
        </div>
      </div>
    </div>
    """
  end
end
