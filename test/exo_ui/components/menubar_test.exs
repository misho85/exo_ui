defmodule ExoUI.Components.MenubarTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders menubar" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.menubar id="app-menu">
        <:menu label="File">
          <button>New</button>
        </:menu>
        <:menu label="Edit">
          <button>Undo</button>
        </:menu>
      </.menubar>
      """)

    assert html =~ ~s(data-exo="menubar")
    assert html =~ ~s(id="app-menu")
    assert html =~ ~s(phx-hook="ExoMenubar")
    assert html =~ ~s(role="menubar")
    assert html =~ ~s(data-exo="menubar-trigger")
    assert html =~ ~s(aria-haspopup="menu")
    assert html =~ ~s(aria-controls="app-menu-content-0")
    assert html =~ ~s(hidden)
    assert html =~ "File"
    assert html =~ "Edit"
    assert html =~ "New"
    assert html =~ "Undo"
  end
end
