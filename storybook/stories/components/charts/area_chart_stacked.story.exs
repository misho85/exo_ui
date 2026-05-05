defmodule Storybook.Components.Charts.AreaChartStacked do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.area_chart_stacked/1

  def template do
    """
    <div style="padding: 1rem; max-width: 620px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Area chart stacked</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Desktop and mobile trend
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
      %Variation{id: :devices, attributes: %{data: device_data(), height: 260}},
      %Variation{id: :empty, attributes: %{data: [], height: 260, empty_text: "No device data"}}
    ]
  end

  defp device_data do
    [
      {"January", 4200, 2400},
      {"February", 5800, 3200},
      {"March", 5100, 2900},
      {"April", 7300, 4100},
      {"May", 6700, 3800},
      {"June", 8900, 4800}
    ]
  end
end
