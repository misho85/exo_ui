defmodule Storybook.Components.ReleaseReadinessWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.ReleaseReadinessWorkflowDemo

  def component, do: ReleaseReadinessWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "release-readiness-workflow-demo"}
      }
    ]
  end
end
