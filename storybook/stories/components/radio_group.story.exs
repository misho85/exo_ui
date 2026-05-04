defmodule Storybook.Components.RadioGroup do
  use PhoenixStorybook.Story, :page

  def doc, do: "Radio button group for single-choice selection."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem; max-width: 320px;">
      <ExoUI.Components.radio_group
        name="plan"
        label="Select a plan"
        description="Choose the subscription tier for this workspace."
        value="pro"
        options={[{"Free", "free"}, {"Pro", "pro"}, {"Enterprise", "enterprise"}]}
      />

      <ExoUI.Components.radio_group
        name="priority"
        label="Priority"
        value="medium"
        options={[{"Low", "low"}, {"Medium", "medium"}, {"High", "high"}, {"Critical", "critical"}]}
      />

      <ExoUI.Components.radio_group
        name="frequency"
        label="Billing frequency"
        description="Required before checkout."
        errors={["choose a billing frequency"]}
        options={[{"Monthly", "monthly"}, {"Yearly", "yearly"}]}
      />
    </div>
    """
  end
end
