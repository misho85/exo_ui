defmodule Storybook.Components.Flash do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Feedback.flash/1

  def template do
    """
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem; max-width: 600px;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :info,
        attributes: %{kind: :info, title: "Info", flash: %{}},
        slots: ["Your profile has been updated."]
      },
      %Variation{
        id: :success,
        attributes: %{kind: :success, title: "Success", flash: %{}},
        slots: ["Payment method saved."]
      },
      %Variation{
        id: :warning,
        attributes: %{kind: :warning, title: "Warning", flash: %{}},
        slots: ["The next sync may take a few minutes."]
      },
      %Variation{
        id: :error,
        attributes: %{kind: :error, title: "Error", flash: %{}},
        slots: ["Something went wrong. Please try again."]
      }
    ]
  end
end
