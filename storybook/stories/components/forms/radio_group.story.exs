defmodule Storybook.Components.RadioGroup do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.radio_group/1

  def template do
    """
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem; max-width: 320px;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      {"plan",
       %Variation{
         id: :plan,
         attributes: %{
           name: "plan",
           label: "Select a plan",
           description: "Choose the subscription tier for this workspace.",
           value: "pro",
           options: [
             %{label: "Free", value: "free", description: "For evaluation workspaces."},
             %{label: "Pro", value: "pro", description: "Shared team operations."},
             %{
               label: "Enterprise",
               value: "enterprise",
               disabled: true,
               description: "Requires a sales-approved contract."
             }
           ]
         }
       }},
      {"priority",
       %Variation{
         id: :priority,
         attributes: %{
           name: "priority",
           label: "Priority",
           value: "medium",
           options: [
             {"Low", "low"},
             {"Medium", "medium"},
             {"High", "high"},
             %{label: "Critical", value: "critical", disabled: true}
           ]
         }
       }},
      {"frequency",
       %Variation{
         id: :invalid_frequency,
         attributes: %{
           name: "frequency",
           label: "Billing frequency",
           description: "Required before checkout.",
           errors: ["choose a billing frequency"],
           options: [{"Monthly", "monthly"}, {"Yearly", "yearly"}]
         }
       }},
      {"delivery",
       %Variation{
         id: :slot_items,
         attributes: %{name: "delivery", label: "Delivery method", value: "standard"},
         slots: [
           ~s|<:item value="standard">Standard delivery</:item>|,
           ~s|<:item value="express">Express delivery</:item>|,
           ~s|<:item value="pickup" disabled>Pickup unavailable</:item>|
         ]
       }},
      {"locked_plan",
       %Variation{
         id: :disabled,
         attributes: %{
           name: "locked_plan",
           label: "Locked selection",
           value: "enterprise",
           disabled: true,
           options: [{"Team", "team"}, {"Enterprise", "enterprise"}]
         }
       }}
    ]
    |> without_legacy_dom_ids()
  end

  defp without_legacy_dom_ids(variations),
    do: Enum.map(variations, fn {_dom_id, variation} -> variation end)
end
