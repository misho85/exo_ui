defmodule Storybook.Components.Timeline do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.timeline/1

  def template do
    """
    <div style="padding: 1rem; max-width: 31rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :ordered,
        attributes: %{aria_label: "Order timeline", ordered: true},
        slots: order_events()
      },
      %Variation{
        id: :unordered,
        attributes: %{aria_label: "Release timeline"},
        slots: release_events()
      }
    ]
  end

  defp order_events do
    [
      ~s|<:event title="Order placed" time="March 20, 2026" datetime="2026-03-20" variant="primary">Your order #12345 has been confirmed.</:event>|,
      ~s|<:event title="Processing" time="March 21, 2026" datetime="2026-03-21" variant="primary" />|,
      ~s|<:event title="Shipped" time="March 23, 2026" datetime="2026-03-23" current />|,
      ~s|<:event title="Delivered" />|
    ]
  end

  defp release_events do
    [
      ~s|<:event title="Planned" time="April 1, 2026" datetime="2026-04-01" variant="primary" />|,
      ~s|<:event title="In progress" time="April 8, 2026" datetime="2026-04-08" current>Implementation is active.</:event>|,
      ~s|<:event title="Released" />|
    ]
  end
end
