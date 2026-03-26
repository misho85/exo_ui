defmodule ExoUI.Components.TimelineTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components.DataDisplay

  test "renders timeline" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.timeline>
        <:event title="Event 1" time="Jan 1">Details</:event>
        <:event title="Event 2" />
      </.timeline>
      """)

    assert html =~ ~s(data-exo="timeline")
    assert html =~ ~s(data-exo="timeline-event")
    assert html =~ "Event 1"
    assert html =~ "Jan 1"
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
end
