defmodule Storybook.Components.Separator do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.separator/1

  def variations do
    [
      %Variation{
        id: :horizontal,
        attributes: %{orientation: "horizontal", decorative: true}
      },
      %Variation{
        id: :vertical,
        attributes: %{orientation: "vertical", decorative: true, style: "height: 40px;"}
      },
      %Variation{
        id: :semantic,
        attributes: %{
          decorative: false,
          label: "Panel sections",
          orientation: "horizontal"
        }
      }
    ]
  end
end
