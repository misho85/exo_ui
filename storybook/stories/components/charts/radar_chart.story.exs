defmodule Storybook.Components.Charts.RadarChart do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.radar_chart/1

  def template do
    """
    <div style="padding: 1rem; max-width: 520px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Radar chart</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Activity by month
          </p>
        </div>
        <div data-exo="card-body" style="display: flex; justify-content: center;">
          <.psb-variation/>
        </div>
      </div>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :activity, attributes: %{data: monthly_data(), size: 280}},
      %Variation{id: :empty, attributes: %{data: [], size: 280, empty_text: "No activity data"}}
    ]
  end

  defp monthly_data do
    [
      {"January", 186},
      {"February", 305},
      {"March", 237},
      {"April", 273},
      {"May", 209},
      {"June", 214}
    ]
  end
end
