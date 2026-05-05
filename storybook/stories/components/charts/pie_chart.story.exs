defmodule Storybook.Components.Charts.PieChart do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.pie_chart/1

  def template do
    """
    <div style="padding: 1rem; max-width: 520px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Pie chart</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Browser share
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
      %Variation{id: :browser_share, attributes: %{data: browser_data(), size: 260}},
      %Variation{id: :empty, attributes: %{data: [], size: 260, empty_text: "No browser data"}}
    ]
  end

  defp browser_data do
    [
      {"Chrome", 275, "hsl(220, 70%, 50%)"},
      {"Safari", 200, "hsl(160, 60%, 45%)"},
      {"Firefox", 187, "hsl(30, 80%, 55%)"},
      {"Edge", 173, "hsl(280, 65%, 60%)"},
      {"Other", 90, "hsl(340, 75%, 55%)"}
    ]
  end
end
