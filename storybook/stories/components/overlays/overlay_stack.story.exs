defmodule Storybook.Components.OverlayStack do
  use PhoenixStorybook.Story, :example

  def doc, do: "Cross-type overlay stacking: modal -> sheet -> drawer."

  @impl true
  def render(assigns) do
    ~H"""
    <div style="min-height: 560px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
        <ExoUI.Components.button phx-click={
          ExoUI.Components.Overlay.show_modal("overlay-stack-modal")
        }>
          Open stacked overlay flow
        </ExoUI.Components.button>
        <ExoUI.Components.button
          variant="outline"
          phx-click={ExoUI.Components.Overlay.show_sheet("overlay-stack-sheet")}
        >
          Open sheet directly
        </ExoUI.Components.button>
      </div>

      <ExoUI.Components.Overlay.modal id="overlay-stack-modal">
        <:title>Deployment review</:title>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <p>
            This modal can open a sheet or drawer without losing the active overlay order.
          </p>
          <label style="display: grid; gap: 0.35rem; color: var(--exo-foreground);">
            Release note
            <input
              data-exo="input"
              value="Ship the verified build"
              style="width: 100%; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); padding: 0.5rem 0.75rem; background: var(--exo-background); color: var(--exo-foreground);"
            />
          </label>
        </div>
        <:actions>
          <ExoUI.Components.button
            variant="outline"
            phx-click={ExoUI.Components.Overlay.show_sheet("overlay-stack-sheet")}
          >
            Open audit sheet
          </ExoUI.Components.button>
          <ExoUI.Components.button
            variant="secondary"
            phx-click={ExoUI.Components.Overlay.show_drawer("overlay-stack-drawer")}
          >
            Open drawer
          </ExoUI.Components.button>
          <ExoUI.Components.button phx-click={
            ExoUI.Components.Overlay.hide_modal("overlay-stack-modal")
          }>
            Close workflow
          </ExoUI.Components.button>
        </:actions>
      </ExoUI.Components.Overlay.modal>

      <ExoUI.Components.Overlay.sheet id="overlay-stack-sheet" side="right">
        <:title>Audit trail</:title>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <p>
            The sheet becomes the top overlay. The modal remains visible but is inert until
            this sheet closes.
          </p>
          <ExoUI.Components.button
            variant="outline"
            phx-click={ExoUI.Components.Overlay.show_drawer("overlay-stack-drawer")}
          >
            Open stacked drawer
          </ExoUI.Components.button>
        </div>
        <:footer>
          <ExoUI.Components.button
            variant="ghost"
            phx-click={ExoUI.Components.Overlay.hide_sheet("overlay-stack-sheet")}
          >
            Close sheet
          </ExoUI.Components.button>
        </:footer>
      </ExoUI.Components.Overlay.sheet>

      <ExoUI.Components.Overlay.drawer id="overlay-stack-drawer" side="right">
        <:title>Review notes</:title>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <p>
            This drawer is now the only interactive overlay. Escape closes it before returning
            focus to the sheet.
          </p>
          <ExoUI.Components.button phx-click={
            ExoUI.Components.Overlay.hide_drawer("overlay-stack-drawer")
          }>
            Close drawer
          </ExoUI.Components.button>
        </div>
      </ExoUI.Components.Overlay.drawer>
    </div>
    """
  end
end
