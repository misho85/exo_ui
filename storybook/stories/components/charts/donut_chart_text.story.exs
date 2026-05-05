defmodule Storybook.Components.Charts.DonutChartText do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.donut_chart_text/1

  def template do
    """
    <div style="padding: 1rem; max-width: 520px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Donut chart text</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Total visitors by browser
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
      %Variation{
        id: :visitors,
        attributes: %{
          data: browser_data(),
          size: 260,
          inner_radius: 78,
          center_value: "925",
          center_label: "Visitors"
        }
      },
      %Variation{
        id: :empty,
        attributes: %{data: [], size: 260, empty_text: "No visitor data"}
      }
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
