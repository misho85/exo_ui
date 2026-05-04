defmodule ExoUI.Components.TimelineTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components.DataDisplay

  test "renders timeline" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.timeline aria_label="Order updates">
        <:event title="Event 1" time="Jan 1" datetime="2026-01-01">Details</:event>
        <:event title="Event 2" />
      </.timeline>
      """)

    assert html =~ ~s(data-exo="timeline")
    assert html =~ "<ul"
    assert html =~ ~s(aria-label="Order updates")
    assert html =~ ~s(data-exo="timeline-event")
    assert html =~ "Event 1"
    assert html =~ "Jan 1"
    assert html =~ ~s(datetime="2026-01-01")
    assert html =~ "Details"
  end

  test "renders timeline with variant" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.timeline>
        <:event title="E" variant="primary" />
      </.timeline>
      """)

    assert html =~ ~s(data-variant="primary")
  end

  test "renders ordered timeline and current event" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.timeline ordered>
        <:event title="Started" />
        <:event title="Running" current />
      </.timeline>
      """)

    assert html =~ "<ol"
    assert html =~ ~s(aria-current="step")
  end
end
