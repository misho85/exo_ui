defmodule Storybook.Components.Steps do
  use PhoenixStorybook.Story, :page

  def doc, do: "Multi-step progress indicator."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 1rem; max-width: 600px;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Horizontal</h3>
        <ExoUI.Components.steps>
          <:step title="Account" status="complete" description="Login details saved" />
          <:step title="Profile" status="current" description="Add public profile data" />
          <:step title="Review" status="upcoming" description="Confirm and submit" />
        </ExoUI.Components.steps>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Vertical</h3>
        <ExoUI.Components.steps orientation="vertical" aria_label="Shipping progress">
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
