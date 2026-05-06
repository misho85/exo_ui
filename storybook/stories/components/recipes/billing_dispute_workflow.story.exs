defmodule Storybook.Components.BillingDisputeWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.BillingDisputeWorkflowDemo

  def component, do: BillingDisputeWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "billing-dispute-workflow-demo"}
      }
    ]
  end
end
