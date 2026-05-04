defmodule ExoUI.Components.DrawerTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders drawer with data-exo attribute" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1">Content</.drawer>|)
    assert html =~ ~s(data-exo="drawer")
    assert html =~ ~s(id="d1")
    assert html =~ ~s(aria-hidden="true")
    assert html =~ ~s(phx-hook="ExoOverlay")
    assert html =~ ~s(role="dialog")
    assert html =~ ~s(aria-modal="true")
    assert html =~ ~s(aria-label="Drawer")
    assert html =~ ~s(aria-describedby="d1-body")
    assert html =~ ~s(id="d1-body")
    assert html =~ "Content"
  end

  test "renders drawer closed by default" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1">Content</.drawer>|)
    assert html =~ ~s(data-state="closed")
  end

  test "renders drawer open when show is true" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1" show={true}>Content</.drawer>|)
    assert html =~ ~s(data-state="open")
  end

  test "renders drawer with right side by default" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1">Content</.drawer>|)
    assert html =~ ~s(data-side="right")
  end

  test "renders drawer with left side" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1" side="left">Content</.drawer>|)
    assert html =~ ~s(data-side="left")
  end

  test "renders drawer with title slot" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.drawer id="d1">
        <:title>Drawer Title</:title>
        Body
      </.drawer>
      """)

    assert html =~ ~s(data-exo="drawer-title")
    assert html =~ ~s(id="d1-title")
    assert html =~ ~s(aria-labelledby="d1-title")
    refute html =~ ~s(aria-label="Drawer")
    assert html =~ "Drawer Title"
  end

  test "renders drawer with custom accessible label when title is omitted" do
    assigns = %{}

    html = rendered_to_string(~H|<.drawer id="d1" label="Navigation drawer">Content</.drawer>|)

    assert html =~ ~s(aria-label="Navigation drawer")
  end

  test "renders drawer backdrop" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1">Content</.drawer>|)
    assert html =~ ~s(data-exo="drawer-backdrop")
  end

  test "renders drawer content area" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1">Content</.drawer>|)
    assert html =~ ~s(data-exo="drawer-content")
    assert html =~ ~s(data-exo="drawer-body")
  end

  test "renders drawer close button" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1">Content</.drawer>|)
    assert html =~ ~s(data-exo="drawer-close")
    assert html =~ ~s(type="button")
    assert html =~ ~s(aria-label="Close")
  end

  test "renders drawer header" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1">Content</.drawer>|)
    assert html =~ ~s(data-exo="drawer-header")
  end

  test "renders drawer with class" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1" class="my-drawer">Content</.drawer>|)
    assert html =~ ~s(class="my-drawer")
  end

  test "renders drawer with inert when closed" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1">Content</.drawer>|)
    assert html =~ "inert"
  end

  test "renders drawer without inert when open" do
    assigns = %{}
    html = rendered_to_string(~H|<.drawer id="d1" show={true}>Content</.drawer>|)
    {:ok, tree} = Floki.parse_fragment(html)

    # When show is true, inert should not be set
    # The opening div should not have inert
    assert html =~ ~s(data-state="open")
    assert html =~ ~s(aria-hidden="false")
    assert Floki.find(tree, "#d1[inert]") == []
  end
end
