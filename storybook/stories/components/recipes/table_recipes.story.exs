defmodule Storybook.Components.TableRecipes do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.TableRecipesDemo

  def component, do: TableRecipesDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "table-recipes-demo"}
      }
    ]
  end
end
