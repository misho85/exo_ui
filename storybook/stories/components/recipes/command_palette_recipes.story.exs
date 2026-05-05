defmodule Storybook.Components.CommandPaletteRecipes do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.CommandPaletteRecipesDemo

  def component, do: CommandPaletteRecipesDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "command-palette-recipes-demo"}
      }
    ]
  end
end
