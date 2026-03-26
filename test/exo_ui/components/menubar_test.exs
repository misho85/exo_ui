defmodule ExoUI.Components.MenubarTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders menubar" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.menubar>
        <:menu label="File">
          <button>New</button>
        </:menu>
        <:menu label="Edit">
          <button>Undo</button>
        </:menu>
      </.menubar>
      """)

    assert html =~ ~s(data-exo="menubar")
    assert html =~ ~s(role="menubar")
    assert html =~ ~s(data-exo="menubar-trigger")
    assert html =~ "File"
    assert html =~ "Edit"
    assert html =~ "New"
    assert html =~ "Undo"
  end
end
