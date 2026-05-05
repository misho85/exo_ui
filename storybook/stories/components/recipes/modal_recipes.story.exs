defmodule Storybook.Components.ModalRecipes do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.ModalRecipesDemo

  def component, do: ModalRecipesDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "modal-recipes-demo"}
      }
    ]
  end
end
