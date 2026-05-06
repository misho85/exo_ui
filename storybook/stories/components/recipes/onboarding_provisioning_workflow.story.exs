defmodule Storybook.Components.OnboardingProvisioningWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.OnboardingProvisioningWorkflowDemo

  def component, do: OnboardingProvisioningWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "onboarding-provisioning-workflow-demo"}
      }
    ]
  end
end
