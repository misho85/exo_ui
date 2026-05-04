defmodule Storybook.Components.Alert do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Feedback.alert/1

  def template do
    """
    <div style="padding: 1rem; max-width: 600px; display: flex; flex-direction: column; gap: 1rem;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :info,
        attributes: %{kind: :info, title: "Info"},
        slots: ["Your session will expire in 10 minutes."]
      },
      %Variation{
        id: :success,
        attributes: %{kind: :success, title: "Success"},
        slots: ["Your changes have been saved successfully."]
      },
      %Variation{
        id: :warning,
        attributes: %{kind: :warning, title: "Warning"},
        slots: ["This action cannot be undone. Please review before continuing."]
      },
      %Variation{
        id: :error,
        attributes: %{kind: :error, title: "Error"},
        slots: ["Failed to save changes. Please try again."]
      },
      %Variation{
        id: :no_title,
        attributes: %{kind: :info},
        slots: ["Inline alert without a title."]
      }
    ]
  end
end
