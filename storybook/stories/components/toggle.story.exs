defmodule Storybook.Components.Toggle do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.toggle/1

  def variations do
    [
      %Variation{
        id: :off,
        attributes: %{checked: false}
      },
      %Variation{
        id: :on,
        attributes: %{checked: true}
      }
    ]
  end
end
