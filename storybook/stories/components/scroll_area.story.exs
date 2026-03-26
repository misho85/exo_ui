defmodule Storybook.Components.ScrollArea do
  use PhoenixStorybook.Story, :page

  def doc, do: "Scrollable container with custom scrollbar styling."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; max-width: 400px;">
      <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Vertical scroll</h3>
      <ExoUI.Components.scroll_area style="height: 200px; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); padding: 1rem;">
        <div :for={i <- 1..20}>
          <p style="padding: 0.25rem 0; font-size: 0.875rem;">Item {i}</p>
        </div>
      </ExoUI.Components.scroll_area>
    </div>
    """
  end
end
