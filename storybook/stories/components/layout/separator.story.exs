defmodule Storybook.Components.Separator do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.separator/1

  def variations do
    [
      %Variation{
        id: :horizontal,
        attributes: %{orientation: "horizontal"}
      },
      %Variation{
        id: :vertical,
        attributes: %{orientation: "vertical", style: "height: 40px;"}
      }
    ]
  end
end
