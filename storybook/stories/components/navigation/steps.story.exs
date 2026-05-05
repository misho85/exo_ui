defmodule Storybook.Components.Steps do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.steps/1

  def template do
    """
    <div style="padding: 1rem; max-width: 38rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :horizontal, slots: account_steps()},
      %Variation{
        id: :vertical,
        attributes: %{orientation: "vertical", aria_label: "Shipping progress"},
        slots: shipping_steps()
      }
    ]
  end

  defp account_steps do
    [
      ~s|<:step title="Account" status="complete" description="Login details saved" />|,
      ~s|<:step title="Profile" status="current" description="Add public profile data" />|,
      ~s|<:step title="Review" status="upcoming" description="Confirm and submit" />|
    ]
  end

  defp shipping_steps do
    [
      ~s|<:step title="Order placed" status="complete" />|,
      ~s|<:step title="Processing" status="complete" />|,
      ~s|<:step title="Shipped" status="current" />|,
      ~s|<:step title="Delivered" status="upcoming" />|
    ]
  end
end
