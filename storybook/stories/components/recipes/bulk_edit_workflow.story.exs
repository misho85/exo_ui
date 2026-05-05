defmodule Storybook.Components.BulkEditWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.BulkEditWorkflowDemo

  def component, do: BulkEditWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "bulk-edit-workflow-demo"}
      }
    ]
  end
end
