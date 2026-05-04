defmodule Storybook.Components.ScrollArea do
  use PhoenixStorybook.Story, :page

  def doc, do: "Scrollable container with custom scrollbar styling."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: grid; gap: 2rem; max-width: 560px;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Vertical scroll</h3>
        <ExoUI.Components.scroll_area
          id="vertical-scroll"
          aria_label="Scrollable item list"
          style="height: 200px; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); padding: 1rem;"
        >
          <div :for={i <- 1..20}>
            <p style="padding: 0.25rem 0; font-size: 0.875rem;">Item {i}</p>
          </div>
        </ExoUI.Components.scroll_area>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Horizontal scroll</h3>
        <ExoUI.Components.scroll_area
          id="horizontal-scroll"
          aria_label="Scrollable columns"
          orientation="horizontal"
          style="border: 1px solid var(--exo-border); border-radius: var(--exo-radius); padding: 1rem;"
        >
          <div style="display: flex; gap: 0.75rem; width: max-content;">
            <div
              :for={i <- 1..12}
              style="min-width: 8rem; padding: 1rem; background: var(--exo-muted); border-radius: var(--exo-radius); text-align: center;"
            >
              Column {i}
            </div>
          </div>
        </ExoUI.Components.scroll_area>
      </section>
    </div>
    """
  end
end
