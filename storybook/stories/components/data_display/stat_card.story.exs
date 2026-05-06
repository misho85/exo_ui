defmodule Storybook.Components.StatCard do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.stat_card/1

  def template do
    """
    <div style="padding: 1rem; min-width: 14rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :positive_trend,
        attributes: %{
          title: "Total users",
          value: "12,481",
          icon: "users",
          trend: "+12%",
          trend_direction: "up",
          subtitle: "vs last month"
        }
      },
      %Variation{
        id: :negative_trend,
        attributes: %{
          title: "Bounce rate",
          value: "24.3%",
          icon: "percent",
          trend: "-3.1%",
          trend_direction: "down",
          subtitle: "vs last month"
        }
      },
      %Variation{
        id: :minimal,
        attributes: %{title: "Active sessions", value: "1,024"}
      }
    ]
  end
end
