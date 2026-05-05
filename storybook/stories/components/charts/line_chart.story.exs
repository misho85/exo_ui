defmodule Storybook.Components.Charts.LineChart do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.line_chart/1

  def template do
    """
    <div style="padding: 1rem; max-width: 620px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Line chart</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Visitors trend
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
      %Variation{id: :visitors, attributes: %{data: monthly_data(), height: 260}},
      %Variation{id: :empty, attributes: %{data: [], height: 260, empty_text: "No visitor data"}}
    ]
  end

  defp monthly_data do
    [
      {"January", 4200},
      {"February", 5800},
      {"March", 5100},
      {"April", 7300},
      {"May", 6700},
      {"June", 8900}
    ]
  end
end
