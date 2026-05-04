defmodule Storybook.Components.WizardSidebar do
  use PhoenixStorybook.Story, :page

  def doc, do: "Step-by-step wizard sidebar navigation."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; gap: 3rem; flex-wrap: wrap;">
      <div>
        <p style="margin-bottom: 1rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          Step 2 of 4
        </p>
        <ExoUI.Components.wizard_sidebar
          aria_label="Checkout progress"
          steps={[
            %{id: "account", label: "Account details", status: :completed},
            %{id: "profile", label: "Profile info", status: :current},
            %{id: "billing", label: "Billing", status: :pending},
            %{id: "review", label: "Review & submit", status: :pending}
          ]}
        />
      </div>

      <div>
        <p style="margin-bottom: 1rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          All completed
        </p>
        <ExoUI.Components.wizard_sidebar steps={[
          %{id: "step1", label: "Step one", status: :completed},
          %{id: "step2", label: "Step two", status: :completed},
          %{id: "step3", label: "Step three", status: :completed}
        ]} />
      </div>
    </div>
    """
  end
end
