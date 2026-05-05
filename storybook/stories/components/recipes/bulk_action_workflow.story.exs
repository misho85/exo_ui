defmodule Storybook.Components.BulkActionWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.BulkActionWorkflowDemo

  def component, do: BulkActionWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "bulk-action-workflow-demo"}
      }
    ]
  end
end
