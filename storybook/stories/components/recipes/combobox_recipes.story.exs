defmodule Storybook.Components.ComboboxRecipes do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.ComboboxRecipesDemo

  def component, do: ComboboxRecipesDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "combobox-recipes-demo"}
      }
    ]
  end
end
