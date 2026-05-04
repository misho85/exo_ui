defmodule ExoUI.Components.ScrollAreaTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders scroll area" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.scroll_area id="activity" aria_label="Recent activity">
        <p>Content</p>
      </.scroll_area>
      """)

    assert html =~ ~s(data-exo="scroll-area")
    assert html =~ ~s(id="activity")
    assert html =~ ~s(role="region")
    assert html =~ ~s(aria-label="Recent activity")
    assert html =~ ~s(data-exo="scroll-area-viewport")
    assert html =~ ~s(id="activity-viewport")
    assert html =~ ~s(tabindex="0")
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

  test "renders custom viewport id, class, and tabindex" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.scroll_area viewport_id="custom-viewport" viewport_class="padded" tabindex="-1">
        <p>Content</p>
      </.scroll_area>
      """)

    assert html =~ ~s(id="custom-viewport")
    assert html =~ ~s(class="padded")
    assert html =~ ~s(tabindex="-1")
  end
end
