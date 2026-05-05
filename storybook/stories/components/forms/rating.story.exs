defmodule Storybook.Components.Rating do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.rating/1

  def template do
    """
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :interactive,
        attributes: %{
          id: "rating-basic",
          name: "score",
          value: 3,
          label: "Product rating",
          description: "Choose a score from one to five."
        }
      },
      %Variation{
        id: :readonly,
        attributes: %{id: "rating-readonly", name: "display", value: 4, readonly: true}
      },
      %Variation{
        id: :large,
        attributes: %{id: "rating-large", name: "large", value: 2, size: "lg"}
      },
      %Variation{
        id: :with_error,
        attributes: %{
          id: "rating-error",
          name: "support_score",
          value: 0,
          label: "Support rating",
          description: "Required before submitting feedback.",
          errors: ["choose a rating"]
        }
      },
      %Variation{
        id: :disabled,
        attributes: %{id: "rating-disabled", name: "locked_score", value: 3, disabled: true}
      }
    ]
  end
end
