defmodule Storybook.Components.Charts.ProgressBar do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.Primitives.progress_bar/1

  def template do
    """
    <div style="padding: 1rem; min-width: 22rem; max-width: 32rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :desktop, attributes: %{label: "Desktop", count: 186, max: 305}},
      %Variation{
        id: :mobile_success,
        attributes: %{label: "Mobile", count: 200, max: 305, color: "var(--exo-success)"}
      },
      %Variation{
        id: :tablet_warning,
        attributes: %{label: "Tablet", count: 73, max: 305, color: "var(--exo-warning)"}
      }
    ]
  end
end
