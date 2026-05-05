defmodule Storybook.Components.WizardSidebar do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.wizard_sidebar/1

  def template do
    """
    <div style="padding: 1rem; max-width: 24rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :checkout,
        attributes: %{aria_label: "Checkout progress", steps: checkout_steps()}
      },
      %Variation{
        id: :completed,
        attributes: %{steps: completed_steps()}
      }
    ]
  end

  defp checkout_steps do
    [
      %{id: "account", label: "Account details", status: :completed},
      %{id: "profile", label: "Profile info", status: :current},
      %{id: "billing", label: "Billing", status: :pending},
      %{id: "review", label: "Review & submit", status: :pending}
    ]
  end

  defp completed_steps do
    [
      %{id: "step1", label: "Step one", status: :completed},
      %{id: "step2", label: "Step two", status: :completed},
      %{id: "step3", label: "Step three", status: :completed}
    ]
  end
end
