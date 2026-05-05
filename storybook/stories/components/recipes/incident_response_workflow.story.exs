defmodule Storybook.Components.IncidentResponseWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.IncidentResponseWorkflowDemo

  def component, do: IncidentResponseWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "incident-response-workflow-demo"}
      }
    ]
  end
end
