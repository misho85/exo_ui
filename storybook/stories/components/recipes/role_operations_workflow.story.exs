defmodule Storybook.Components.RoleOperationsWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.RoleOperationsWorkflowDemo

  def component, do: RoleOperationsWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "role-operations-workflow-demo"}
      }
    ]
  end
end
