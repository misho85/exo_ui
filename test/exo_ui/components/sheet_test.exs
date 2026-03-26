defmodule ExoUI.Components.SheetTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components.Overlay

  test "renders sheet" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sheet id="test-sheet">
        <p>Content</p>
      </.sheet>
      """)

    assert html =~ ~s(data-exo="sheet")
    assert html =~ ~s(data-side="right")
    assert html =~ ~s(id="test-sheet")
    assert html =~ "Content"
  end

  test "renders sheet with side" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sheet id="s" side="left">
        <p>Left</p>
      </.sheet>
      """)

    assert html =~ ~s(data-side="left")
  end

  test "renders sheet with title and footer" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sheet id="s">
        <:title>Title</:title>
        <p>Body</p>
        <:footer>Footer</:footer>
      </.sheet>
      """)

    assert html =~ ~s(data-exo="sheet-header")
    assert html =~ "Title"
    assert html =~ ~s(data-exo="sheet-footer")
    assert html =~ "Footer"
  end
end
