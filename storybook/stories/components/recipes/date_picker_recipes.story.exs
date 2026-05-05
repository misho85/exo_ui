defmodule Storybook.Components.DatePickerRecipes do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.DatePickerRecipesDemo

  def component, do: DatePickerRecipesDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "date-picker-recipes-demo"}
      }
    ]
  end
end
