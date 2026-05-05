defmodule Storybook.Components.Tooltip do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.tooltip/1

  def template do
    """
    <div style="display: flex; flex-wrap: wrap; gap: 3rem; padding: 4rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :top,
        attributes: %{text: "Tooltip on top"},
        slots: [~s|<ExoUI.Components.button>Hover me</ExoUI.Components.button>|]
      },
      %Variation{
        id: :bottom,
        attributes: %{text: "Tooltip on bottom", side: "bottom"},
        slots: [~s|<ExoUI.Components.button>Bottom</ExoUI.Components.button>|]
      },
      %Variation{
        id: :left,
        attributes: %{text: "Tooltip on left", side: "left"},
        slots: [~s|<ExoUI.Components.button>Left</ExoUI.Components.button>|]
      },
      %Variation{
        id: :right,
        attributes: %{text: "Tooltip on right", side: "right"},
        slots: [~s|<ExoUI.Components.button>Right</ExoUI.Components.button>|]
      },
      %Variation{
        id: :without_arrow,
        attributes: %{text: "No arrow", arrow: false},
        slots: [~s|<ExoUI.Components.button>No arrow</ExoUI.Components.button>|]
      },
      %Variation{
        id: :rich_content,
        slots: [
          ~s|<:content><strong>Pro tip:</strong> Use keyboard shortcuts.</:content>|,
          ~s|<ExoUI.Components.button>Rich tooltip</ExoUI.Components.button>|
        ]
      },
      %Variation{
        id: :fast_delay,
        attributes: %{text: "Fast!", delay: 200},
        slots: [~s|<ExoUI.Components.button>Fast delay</ExoUI.Components.button>|]
      },
      %Variation{
        id: :align_start,
        attributes: %{text: "Aligned to start", side: "bottom", align: "start"},
        slots: [~s|<ExoUI.Components.button>Align start</ExoUI.Components.button>|]
      },
      %Variation{
        id: :align_end,
        attributes: %{text: "Aligned to end", side: "bottom", align: "end"},
        slots: [~s|<ExoUI.Components.button>Align end</ExoUI.Components.button>|]
      }
    ]
  end
end
