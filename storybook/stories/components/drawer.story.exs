defmodule Storybook.Components.Drawer do
  use PhoenixStorybook.Story, :page

  def doc, do: "Side drawer / offcanvas panel. Uses JS commands for show/hide, similar to modal."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem;">
      <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
        Click a button to open a drawer.
      </p>

      <div style="display: flex; gap: 1rem;">
        <ExoUI.Components.button
          phx-click={
            Phoenix.LiveView.JS.show(to: "#drawer-right")
            |> Phoenix.LiveView.JS.add_class("overflow-hidden", to: "body")
          }
        >
          Open Right Drawer
        </ExoUI.Components.button>

        <ExoUI.Components.button
          variant="outline"
          phx-click={
            Phoenix.LiveView.JS.show(to: "#drawer-left")
            |> Phoenix.LiveView.JS.add_class("overflow-hidden", to: "body")
          }
        >
          Open Left Drawer
        </ExoUI.Components.button>
      </div>

      <ExoUI.Components.drawer id="drawer-right" side="right">
        <:title>Settings</:title>
        <p>Drawer content goes here. This is a right-side drawer panel.</p>
      </ExoUI.Components.drawer>

      <ExoUI.Components.drawer id="drawer-left" side="left">
        <:title>Navigation</:title>
        <p>Left-side navigation drawer.</p>
      </ExoUI.Components.drawer>
    </div>
    """
  end
end
