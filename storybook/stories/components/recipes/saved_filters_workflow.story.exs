defmodule Storybook.Components.SavedFiltersWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.SavedFiltersWorkflowDemo

  def component, do: SavedFiltersWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "saved-filters-workflow-demo"}
      }
    ]
  end
end
