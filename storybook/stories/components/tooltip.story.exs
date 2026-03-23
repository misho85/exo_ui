defmodule Storybook.Components.Tooltip do
  use PhoenixStorybook.Story, :page

  def doc, do: "Tooltip with CSS anchor positioning. Hover or focus to show."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-wrap: wrap; gap: 3rem; padding: 4rem;">
      <div>
        <h3>Top (default)</h3>
        <ExoUI.Components.tooltip id="tip-top" text="Tooltip on top">
          <ExoUI.Components.button>Hover me</ExoUI.Components.button>
        </ExoUI.Components.tooltip>
      </div>

      <div>
        <h3>Bottom</h3>
        <ExoUI.Components.tooltip id="tip-bottom" text="Tooltip on bottom" side="bottom">
          <ExoUI.Components.button>Bottom</ExoUI.Components.button>
        </ExoUI.Components.tooltip>
      </div>

      <div>
        <h3>Left</h3>
        <ExoUI.Components.tooltip id="tip-left" text="Tooltip on left" side="left">
          <ExoUI.Components.button>Left</ExoUI.Components.button>
        </ExoUI.Components.tooltip>
      </div>

      <div>
        <h3>Right</h3>
        <ExoUI.Components.tooltip id="tip-right" text="Tooltip on right" side="right">
          <ExoUI.Components.button>Right</ExoUI.Components.button>
        </ExoUI.Components.tooltip>
      </div>

      <div>
        <h3>No arrow</h3>
        <ExoUI.Components.tooltip id="tip-noarrow" text="No arrow" arrow={false}>
          <ExoUI.Components.button>No arrow</ExoUI.Components.button>
        </ExoUI.Components.tooltip>
      </div>

      <div>
        <h3>Rich content</h3>
        <ExoUI.Components.tooltip id="tip-rich">
          <:content>
            <strong>Pro tip:</strong> Use keyboard shortcuts.
          </:content>
          <ExoUI.Components.button>Rich tooltip</ExoUI.Components.button>
        </ExoUI.Components.tooltip>
      </div>

      <div>
        <h3>Fast delay (200ms)</h3>
        <ExoUI.Components.tooltip id="tip-fast" text="Fast!" delay={200}>
          <ExoUI.Components.button>Fast delay</ExoUI.Components.button>
        </ExoUI.Components.tooltip>
      </div>
    </div>
    """
  end
end
