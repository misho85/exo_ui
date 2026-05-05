defmodule Storybook.Components.InputRecipes do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.InputRecipesDemo

  def component, do: InputRecipesDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "input-recipes-demo"}
      }
    ]
  end
end
