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
    assert html =~ ~s(data-exo="hover-card-trigger")
    assert html =~ ~s(data-exo="hover-card-content")
    assert html =~ ~s(phx-hook="ExoHoverCard")
    assert html =~ "Trigger"
    assert html =~ "Content"
  end
end
