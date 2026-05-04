defmodule Storybook.Components.RadialChart do
  use PhoenixStorybook.Story, :page

  def doc, do: "Radial chart for multiple proportional segments."

  def render(assigns) do
    assigns =
      assign(assigns, :data, [
        {"Chrome", 275, "hsl(220, 70%, 50%)"},
        {"Safari", 200, "hsl(160, 60%, 45%)"},
        {"Firefox", 187, "hsl(30, 80%, 55%)"}
      ])

    ~H"""
    <div style="padding: 1rem; max-width: 520px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Radial chart</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Browser share
          </p>
        </div>
        <div data-exo="card-body" style="display: flex; justify-content: center;">
          <ExoUI.Charts.radial_chart data={@data} size={280} />
        </div>
      </div>
    </div>
    """
  end
end
