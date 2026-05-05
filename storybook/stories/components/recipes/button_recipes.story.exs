defmodule Storybook.Components.ButtonRecipes do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.ButtonRecipesDemo

  def component, do: ButtonRecipesDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "button-recipes-demo"}
      }
    ]
  end
end
