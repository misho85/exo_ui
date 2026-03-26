defmodule ExoUI.Components.ScrollAreaTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders scroll area" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.scroll_area>
        <p>Content</p>
      </.scroll_area>
      """)

    assert html =~ ~s(data-exo="scroll-area")
    assert html =~ ~s(data-exo="scroll-area-viewport")
    assert html =~ ~s(data-orientation="vertical")
  end

  test "renders horizontal scroll area" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.scroll_area orientation="horizontal">
        <p>Content</p>
      </.scroll_area>
      """)

    assert html =~ ~s(data-orientation="horizontal")
  end
end
