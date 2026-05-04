defmodule Storybook.Components.Progress do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Feedback.progress/1

  def template do
    """
    <div style="max-width: 400px; padding: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{value: 65, label: "Storage used", aria_label: "Storage used"}
      },
      %Variation{
        id: :low,
        attributes: %{value: 12, label: "CPU usage", aria_label: "CPU usage"}
      },
      %Variation{
        id: :full,
        attributes: %{value: 100, label: "Upload complete", aria_label: "Upload complete"}
      },
      %Variation{
        id: :custom_max,
        attributes: %{value: 3, max: 5, label: "Import steps", aria_label: "Import steps"}
      },
      %Variation{
        id: :clamped,
        attributes: %{value: 150, max: 100, label: "Over quota", aria_label: "Over quota"}
      },
      %Variation{
        id: :no_label,
        attributes: %{value: 42, aria_label: "Background task progress"}
      }
    ]
  end
end
