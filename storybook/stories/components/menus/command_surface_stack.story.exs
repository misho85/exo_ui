defmodule Storybook.Components.CommandSurfaceStack do
  use PhoenixStorybook.Story, :example

  def doc, do: "Command palette launched from a sheet, opening a drawer and guarded confirm."

  @impl true
  def render(assigns) do
    ~H"""
    <div style="min-height: 560px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
        <ExoUI.Components.button phx-click={
          ExoUI.Components.Overlay.show_sheet("command-surface-sheet")
        }>
          Open command surface
        </ExoUI.Components.button>
      </div>

      <ExoUI.Components.Overlay.sheet id="command-surface-sheet" side="right">
        <:title>Segment filters</:title>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p>
            Filter panels can launch a command palette without letting the hidden command
            surface become inert before it opens.
          </p>

          <ExoUI.Components.Form.input
            id="command-surface-query"
            name="filters[query]"
            label="Search segment"
            value="enterprise accounts"
            description="The command palette can jump to deeper filter tools."
          />

          <div
            aria-label="Active filters"
            style="display: grid; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); background: var(--exo-muted);"
          >
            <strong style="color: var(--exo-foreground);">Current segment</strong>
            <span>Status: active</span>
            <span>Plan: enterprise</span>
            <span>Risk score: elevated</span>
          </div>

          <ExoUI.Components.button
            type="button"
            variant="outline"
            phx-click={ExoUI.Components.Overlay.show_command_palette("command-surface-palette")}
          >
            Open filter commands
          </ExoUI.Components.button>
        </div>
        <:footer>
          <ExoUI.Components.button
            type="button"
            variant="ghost"
            phx-click={ExoUI.Components.Overlay.hide_sheet("command-surface-sheet")}
          >
            Close filters
          </ExoUI.Components.button>
        </:footer>
      </ExoUI.Components.Overlay.sheet>

      <ExoUI.Components.Overlay.command_palette
        id="command-surface-palette"
        label="Filter command palette"
        placeholder="Search filter commands..."
        shortcut="ctrl+shift+p"
      >
        <:item
          label="Open risk drawer"
          value="risk-drawer"
          search="risk drawer filters owner review"
          shortcut="R"
          click={ExoUI.Components.Overlay.show_drawer("command-surface-drawer")}
        />
        <:item
          label="Show saved views"
          value="saved-views"
          search="saved views filters"
          shortcut="V"
        />
        <:item
          label="Export current segment"
          value="export"
          search="export segment csv"
          shortcut="E"
        />
      </ExoUI.Components.Overlay.command_palette>

      <ExoUI.Components.Overlay.drawer id="command-surface-drawer" side="right">
        <:title>Risk filters</:title>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p>
            This drawer was opened by a command selected from the sheet command palette.
            The sheet stays visible but inert underneath.
          </p>
          <ExoUI.Components.Form.input
            id="command-surface-risk-owner"
            name="filters[risk_owner]"
            label="Risk owner"
            value="Mina"
          />
          <ExoUI.Components.Form.input
            id="command-surface-risk-note"
            name="filters[risk_note]"
            type="textarea"
            rows="4"
            label="Review note"
            value="Review elevated accounts before exporting or archiving this filtered segment."
          />
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
            <ExoUI.Components.button
              type="button"
              variant="ghost"
              phx-click={ExoUI.Components.Overlay.hide_drawer("command-surface-drawer")}
            >
              Close drawer
            </ExoUI.Components.button>
            <ExoUI.Components.button
              type="button"
              variant="danger"
              phx-click={ExoUI.Components.Overlay.show_modal("command-surface-confirm")}
            >
              Archive segment
            </ExoUI.Components.button>
          </div>
        </div>
      </ExoUI.Components.Overlay.drawer>

      <ExoUI.Components.Overlay.confirm_modal
        id="command-surface-confirm"
        title="Archive filtered segment"
        message="This guarded action remains open while the server validates the active filter set."
        confirm_text="Validate archive"
        cancel_text="Keep editing"
        variant="danger"
        close_on_confirm={false}
      />
    </div>
    """
  end
end
