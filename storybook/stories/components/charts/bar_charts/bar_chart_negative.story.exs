defmodule Storybook.Components.Charts.BarChartNegative do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.bar_chart_negative/1

  def template do
    """
    <div style="padding: 1rem; max-width: 620px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Bar chart negative</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Revenue variance by month
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
      %Variation{id: :variance, attributes: %{data: variance_data(), height: 260}},
      %Variation{id: :empty, attributes: %{data: [], height: 260, empty_text: "No variance data"}}
    ]
  end

  defp variance_data do
    [
      {"January", 4200},
      {"February", -3800},
      {"March", 5100},
      {"April", -2300},
      {"May", 6700},
      {"June", -1900}
    ]
  end
end
