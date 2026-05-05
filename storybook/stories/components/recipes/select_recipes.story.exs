defmodule Storybook.Components.SelectRecipes do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.SelectRecipesDemo

  def component, do: SelectRecipesDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "select-recipes-demo"}
      }
    ]
  end
end
