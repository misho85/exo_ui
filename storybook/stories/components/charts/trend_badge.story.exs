defmodule Storybook.Components.Charts.TrendBadge do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.trend_badge/1

  def template do
    """
    <div style="padding: 1rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :up, attributes: %{current: 112, previous: 98}},
      %Variation{id: :down, attributes: %{current: 84, previous: 98}},
      %Variation{id: :flat, attributes: %{current: 98, previous: 98}},
      %Variation{id: :new_value, attributes: %{current: 12, previous: 0}}
    ]
  end
end
