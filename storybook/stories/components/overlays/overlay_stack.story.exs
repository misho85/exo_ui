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
          <ExoUI.Components.Form.input
            id="overlay-stack-release-note"
            name="release[note]"
            label="Release note"
            value="Ship the verified build"
          />
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
          <div
            aria-label="Audit summary"
            style="display: grid; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); background: var(--exo-muted);"
          >
            <strong style="color: var(--exo-foreground);">Preflight checks</strong>
            <span>3 reviewers assigned</span>
            <span>2 blocking risks still need owner sign-off</span>
          </div>
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
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p>
            This drawer is now the only interactive overlay. It contains a long form so the
            drawer body, not the document, owns scrolling while the overlay stack is active.
          </p>
          <ExoUI.Components.Form.form
            id="overlay-stack-release-form"
            for={%{}}
            as={:release}
            aria-label="Release review form"
            style="display: flex; flex-direction: column; gap: 1rem;"
          >
            <ExoUI.Components.Form.input
              id="overlay-stack-release-name"
              name="release[name]"
              label="Release name"
              value="Verified production rollout"
              description="Used in audit exports and approval notifications."
            />
            <ExoUI.Components.Form.input
              id="overlay-stack-release-owner"
              name="release[owner]"
              label="Release owner"
              value="Mina"
            />
            <ExoUI.Components.Form.input
              id="overlay-stack-risk-owner"
              name="release[risk_owner]"
              label="Risk owner"
              value=""
              errors={["Risk owner is required before rollback approval."]}
              description="Required for destructive rollback approval."
            />
            <ExoUI.Components.Form.input
              id="overlay-stack-release-notes"
              name="release[notes]"
              type="textarea"
              rows="5"
              label="Review notes"
              value="Confirm deployment windows, rollback owners, and customer-facing copy before closing the workflow."
            />
            <fieldset
              data-exo="overlay-stack-checklist"
              style="display: grid; gap: 0.75rem; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); padding: 1rem; margin: 0;"
            >
              <legend style="padding: 0 0.25rem; color: var(--exo-foreground); font-weight: 600;">
                Long review checklist
              </legend>
              <ExoUI.Components.Form.input
                :for={index <- 1..14}
                id={"overlay-stack-check-#{index}"}
                name={"release[check_#{index}]"}
                type="checkbox"
                label={"Checkpoint #{index}: verify owner, rollback path, and customer impact notes."}
              />
            </fieldset>
            <div style="position: sticky; bottom: -1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem 0 0; background: var(--exo-background); border-top: 1px solid var(--exo-border);">
              <ExoUI.Components.button
                type="button"
                variant="ghost"
                phx-click={ExoUI.Components.Overlay.hide_drawer("overlay-stack-drawer")}
              >
                Cancel review
              </ExoUI.Components.button>
              <ExoUI.Components.button
                type="button"
                variant="danger"
                phx-click={ExoUI.Components.Overlay.show_modal("overlay-stack-rollback-confirm")}
              >
                Request rollback
              </ExoUI.Components.button>
              <ExoUI.Components.button type="button">
                Save review
              </ExoUI.Components.button>
            </div>
          </ExoUI.Components.Form.form>
        </div>
      </ExoUI.Components.Overlay.drawer>

      <ExoUI.Components.Overlay.confirm_modal
        id="overlay-stack-rollback-confirm"
        title="Rollback deployment"
        message="This rollback request stays open until server-side validation succeeds."
        confirm_text="Validate rollback"
        cancel_text="Keep reviewing"
        variant="danger"
        close_on_confirm={false}
      />
    </div>
    """
  end
end
