defmodule Storybook.Components.AccessReviewWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.AccessReviewWorkflowDemo

  def component, do: AccessReviewWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "access-review-workflow-demo"}
      }
    ]
  end
end
