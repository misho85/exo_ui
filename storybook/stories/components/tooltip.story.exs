defmodule Storybook.Components.Tooltip do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.tooltip/1

  def template do
    """
    <div style="padding: 4rem; display: flex; gap: 3rem; flex-wrap: wrap; justify-content: center;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :top,
        attributes: %{text: "Tooltip on top", position: "top"},
        slots: ["Hover me"]
      },
      %Variation{
        id: :bottom,
        attributes: %{text: "Tooltip on bottom", position: "bottom"},
        slots: ["Hover me"]
      },
      %Variation{
        id: :left,
        attributes: %{text: "Tooltip on left", position: "left"},
        slots: ["Hover me"]
      },
      %Variation{
        id: :right,
        attributes: %{text: "Tooltip on right", position: "right"},
        slots: ["Hover me"]
      }
    ]
  end
end
