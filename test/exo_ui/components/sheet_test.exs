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
    assert html =~ ~s(data-state="closed")
    assert html =~ ~s(aria-hidden="true")
    assert html =~ ~s(inert)
    assert html =~ ~s(phx-hook="ExoOverlay")
    assert html =~ ~s(role="dialog")
    assert html =~ ~s(aria-modal="true")
    assert html =~ ~s(aria-label="Sheet")
    assert html =~ ~s(aria-describedby="test-sheet-body")
    assert html =~ ~s(id="test-sheet-body")
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
    assert html =~ ~s(data-exo="sheet-title")
    assert html =~ ~s(id="s-title")
    assert html =~ ~s(aria-labelledby="s-title")
    refute html =~ ~s(aria-label="Sheet")
    assert html =~ "Title"
    assert html =~ ~s(data-exo="sheet-footer")
    assert html =~ ~s(type="button")
    assert html =~ "Footer"
  end

  test "renders sheet with custom accessible label when title is omitted" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sheet id="s" label="Filters">
        <p>Body</p>
      </.sheet>
      """)

    assert html =~ ~s(aria-label="Filters")
  end

  test "renders sheet open when show is true" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sheet id="s" show>
        <p>Open</p>
      </.sheet>
      """)

    {:ok, tree} = Floki.parse_fragment(html)

    assert html =~ ~s(data-state="open")
    assert html =~ ~s(aria-hidden="false")
    assert html =~ ~s(class="open")
    assert Floki.find(tree, "#s[inert]") == []
  end
end
