defmodule Storybook.Components.CommandRoutingWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.CommandRoutingWorkflowDemo

  def component, do: CommandRoutingWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "command-routing-workflow-demo"}
      }
    ]
  end
end
