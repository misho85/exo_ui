defmodule Storybook.Components.Charts.HorizontalBarChart do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.horizontal_bar_chart/1

  def template do
    """
    <div style="padding: 1rem; max-width: 620px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Horizontal bar chart</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Browser share
          </p>
        </div>
        <div data-exo="card-body">
          <.psb-variation/>
        </div>
      </div>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :browser_share, attributes: %{data: browser_data(), height: 260}},
      %Variation{id: :empty, attributes: %{data: [], height: 260, empty_text: "No browser data"}}
    ]
  end

  defp browser_data do
    [
      {"Chrome", 275},
      {"Safari", 200},
      {"Firefox", 187},
      {"Edge", 173},
      {"Other", 90}
    ]
  end
end
