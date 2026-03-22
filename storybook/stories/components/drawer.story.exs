defmodule Storybook.Components.Drawer do
  use PhoenixStorybook.Story, :page

  def doc, do: "Side drawer / offcanvas panel. Note: requires LiveView for phx-click handlers."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; gap: 1rem; flex-wrap: wrap;">
      <p style="font-size: 0.875rem; color: var(--exo-muted-foreground); width: 100%;">
        The drawer component renders a side panel that overlays the page. It uses JS commands for show/hide, similar to the modal component.
      </p>

      <ExoUI.Components.drawer id="drawer-demo-right" show={false} side="right">
        <:title>Settings</:title>
        <p>Drawer content goes here. This is a right-side drawer.</p>
      </ExoUI.Components.drawer>

      <ExoUI.Components.drawer id="drawer-demo-left" show={false} side="left">
        <:title>Navigation</:title>
        <p>Left-side drawer content.</p>
      </ExoUI.Components.drawer>
    </div>
    """
  end
end
