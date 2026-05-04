defmodule Storybook.Components.Slider do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.slider/1

  def template do
    """
    <div style="max-width: 320px; padding: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{
          name: "volume",
          value: 50,
          label: "Volume",
          description: "Applies to notification sounds."
        }
      },
      %Variation{
        id: :min_max,
        attributes: %{name: "brightness", value: 75, min: 0, max: 100, label: "Brightness"}
      },
      %Variation{
        id: :stepped,
        attributes: %{name: "rating", value: 3, min: 1, max: 5, step: 1, label: "Rating (1-5)"}
      },
      %Variation{
        id: :with_error,
        attributes: %{
          name: "threshold",
          value: 95,
          min: 0,
          max: 100,
          label: "Alert threshold",
          description: "Keep the threshold below 90 for this plan.",
          errors: ["must be 90 or lower"]
        }
      },
      %Variation{
        id: :disabled,
        attributes: %{
          name: "locked_quota",
          value: 40,
          min: 0,
          max: 100,
          label: "Locked quota",
          description: "Disabled sliders keep their current value visible.",
          disabled: true
        }
      },
      %Variation{
        id: :no_label,
        attributes: %{name: "opacity", value: 80}
      }
    ]
  end
end
