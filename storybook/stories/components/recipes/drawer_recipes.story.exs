defmodule Storybook.Components.DrawerRecipes do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.DrawerRecipesDemo

  def component, do: DrawerRecipesDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "drawer-recipes-demo"}
      }
    ]
  end
end
