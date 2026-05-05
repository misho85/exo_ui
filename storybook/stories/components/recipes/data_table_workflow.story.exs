defmodule Storybook.Components.DataTableWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.DataTableWorkflowDemo

  def component, do: DataTableWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "data-table-workflow-demo"}
      }
    ]
  end
end
