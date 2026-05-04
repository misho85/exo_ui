defmodule Storybook.Components.Sheet do
  use PhoenixStorybook.Story, :page

  def doc, do: "Slide-out panel from the edge of the screen."

  def render(assigns) do
    ~H"""
    <div style="display: flex; gap: 1rem; padding: 1rem;">
      <button
        data-exo="btn"
        phx-click={ExoUI.Components.Overlay.show_sheet("sheet-right")}
      >
        Open right sheet
      </button>
      <button
        data-exo="btn"
        phx-click={ExoUI.Components.Overlay.show_sheet("sheet-left")}
      >
        Open left sheet
      </button>
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
    """
  end
end
