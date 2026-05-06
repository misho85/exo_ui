defmodule ExoUI.Components.HoverCardTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components.Overlay

  test "renders hover card" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.hover_card id="hc">
        <:trigger>Trigger</:trigger>
        Content
      </.hover_card>
      """)

    assert html =~ ~s(data-exo="hover-card")
    assert html =~ ~s(data-open-delay="300")
    assert html =~ ~s(data-close-delay="150")
    assert html =~ ~s(data-exo="hover-card-trigger")
    assert html =~ ~s(aria-haspopup="dialog")
    assert html =~ ~s(aria-controls="hc-content")
    assert html =~ ~s(aria-expanded="false")
    assert html =~ ~s(id="hc-content")
    assert html =~ ~s(data-exo="hover-card-content")
    assert html =~ ~s(data-side="bottom")
    assert html =~ ~s(data-align="center")
    assert html =~ ~s(role="dialog")
    assert html =~ ~s(aria-label="Hover card")
    refute html =~ ~s(aria-describedby="hc-content")
    assert html =~ ~s(hidden)
    assert html =~ ~s(phx-hook="ExoHoverCard")
    assert html =~ "Trigger"
    assert html =~ "Content"
  end
end
