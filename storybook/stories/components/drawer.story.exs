defmodule Storybook.Components.Drawer do
  use PhoenixStorybook.Story, :page

  def doc, do: "Side drawer / offcanvas panel. Uses JS commands for show/hide, similar to modal."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem;">
      <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
        Below are static previews of the drawer panel. In a LiveView app, drawers overlay the page with a backdrop.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div>
          <p style="font-size: 0.75rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Right drawer</p>
          <div style="position: relative; height: 300px; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); overflow: hidden; background: var(--exo-muted);">
            <div style="position: absolute; top: 0; right: 0; bottom: 0; width: 70%; display: flex; flex-direction: column; background: var(--exo-background); border-left: 1px solid var(--exo-border); box-shadow: var(--exo-shadow-lg);">
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid var(--exo-border);">
                <span style="font-size: 1.125rem; font-weight: 600; color: var(--exo-foreground);">Settings</span>
                <span style="color: var(--exo-muted-foreground); cursor: pointer;">&#x2715;</span>
              </div>
              <div style="padding: 1.5rem; font-size: 0.875rem; color: var(--exo-foreground);">
                <p>Drawer content goes here. This is a right-side drawer panel.</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p style="font-size: 0.75rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Left drawer</p>
          <div style="position: relative; height: 300px; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); overflow: hidden; background: var(--exo-muted);">
            <div style="position: absolute; top: 0; left: 0; bottom: 0; width: 70%; display: flex; flex-direction: column; background: var(--exo-background); border-right: 1px solid var(--exo-border); box-shadow: var(--exo-shadow-lg);">
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid var(--exo-border);">
                <span style="font-size: 1.125rem; font-weight: 600; color: var(--exo-foreground);">Navigation</span>
                <span style="color: var(--exo-muted-foreground); cursor: pointer;">&#x2715;</span>
              </div>
              <div style="padding: 1.5rem; font-size: 0.875rem; color: var(--exo-foreground);">
                <p>Left-side navigation drawer.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    """
  end
end
