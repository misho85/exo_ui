defmodule Storybook.Components.Steps do
  use PhoenixStorybook.Story, :page

  def doc, do: "Multi-step progress indicator."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 1rem; max-width: 600px;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Horizontal</h3>
        <ExoUI.Components.steps>
          <:step title="Account" status="complete" />
          <:step title="Profile" status="current" />
          <:step title="Review" status="upcoming" />
        </ExoUI.Components.steps>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Vertical</h3>
        <ExoUI.Components.steps orientation="vertical">
          <:step title="Order placed" status="complete" />
          <:step title="Processing" status="complete" />
          <:step title="Shipped" status="current" />
          <:step title="Delivered" status="upcoming" />
        </ExoUI.Components.steps>
      </section>
    </div>
    """
  end
end
