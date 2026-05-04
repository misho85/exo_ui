defmodule Storybook.Components.Sheet do
  use PhoenixStorybook.Story, :page

  def doc, do: "Slide-out panel from the edge of the screen."

  def render(assigns) do
    ~H"""
    <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap;">
      <ExoUI.Components.button phx-click={ExoUI.Components.Overlay.show_sheet("sheet-right")}>
        Open right sheet
      </ExoUI.Components.button>
      <ExoUI.Components.button
        variant="outline"
        phx-click={ExoUI.Components.Overlay.show_sheet("sheet-left")}
      >
        Open left sheet
      </ExoUI.Components.button>
      <ExoUI.Components.button
        variant="secondary"
        phx-click={ExoUI.Components.Overlay.show_sheet("sheet-top")}
      >
        Open top sheet
      </ExoUI.Components.button>
      <ExoUI.Components.button
        variant="ghost"
        phx-click={ExoUI.Components.Overlay.show_sheet("sheet-bottom")}
      >
        Open bottom sheet
      </ExoUI.Components.button>
    </div>

    <ExoUI.Components.sheet id="sheet-right">
      <:title>Sheet title</:title>
      <p>Sheet content goes here.</p>
      <:footer>
        <button
          data-exo="btn"
          data-variant="outline"
          phx-click={ExoUI.Components.Overlay.hide_sheet("sheet-right")}
        >
          Cancel
        </button>
        <button data-exo="btn">Save</button>
      </:footer>
    </ExoUI.Components.sheet>

    <ExoUI.Components.sheet id="sheet-left" side="left">
      <:title>Left sheet</:title>
      <p>Content from the left side.</p>
    </ExoUI.Components.sheet>

    <ExoUI.Components.sheet id="sheet-top" side="top">
      <:title>Top sheet</:title>
      <p>Compact sheet for command palettes or global search.</p>
    </ExoUI.Components.sheet>

    <ExoUI.Components.sheet id="sheet-bottom" side="bottom" label="Mobile actions">
      <p>Bottom sheet without a visible title uses aria-label.</p>
    </ExoUI.Components.sheet>
    """
  end
end
