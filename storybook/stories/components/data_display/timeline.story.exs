defmodule Storybook.Components.Timeline do
  use PhoenixStorybook.Story, :page

  def doc, do: "Chronological timeline of events."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; max-width: 500px;">
      <ExoUI.Components.timeline aria_label="Order timeline" ordered>
        <:event title="Order placed" time="March 20, 2026" datetime="2026-03-20" variant="primary">
          Your order #12345 has been confirmed.
        </:event>
        <:event title="Processing" time="March 21, 2026" datetime="2026-03-21" variant="primary" />
        <:event title="Shipped" time="March 23, 2026" datetime="2026-03-23" current />
        <:event title="Delivered" />
      </ExoUI.Components.timeline>
    </div>
    """
  end
end
