defmodule Storybook.Components.RadialProgress do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Feedback.radial_progress/1

  def template do
    """
    <div style="display: flex; gap: 2rem; align-items: center; padding: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %VariationGroup{
        id: :values,
        variations:
          Enum.map([0, 25, 50, 75, 100], fn value ->
            %Variation{
              id: String.to_atom("value_#{value}"),
              attributes: %{
                value: value,
                show_value: true,
                aria_label: "#{value} percent complete"
              }
            }
          end)
      },
      %VariationGroup{
        id: :sizes,
        variations:
          Enum.map(~w(sm md lg), fn size ->
            %Variation{
              id: String.to_atom("size_#{size}"),
              attributes: %{
                value: 65,
                size: size,
                show_value: true,
                aria_label: "#{String.capitalize(size)} progress"
              }
            }
          end)
      },
      %Variation{
        id: :without_value,
        attributes: %{value: 40, show_value: false, aria_label: "Background task progress"}
      },
      %Variation{
        id: :custom_max,
        attributes: %{
          value: 3,
          max: 5,
          show_value: true,
          aria_label: "Task progress",
          aria_value_text: "3 of 5 tasks complete"
        }
      }
    ]
  end
end
