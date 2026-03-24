defmodule ExoUI.Components.DropdownTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders dropdown with trigger and items" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.dropdown id="dd">
        <:trigger>Menu</:trigger>
        <:item>Edit</:item>
        <:item>Delete</:item>
      </.dropdown>
      """)

    assert html =~ ~s(data-exo="dropdown")
    assert html =~ ~s(data-exo="dropdown-trigger")
    assert html =~ ~s(data-exo="dropdown-menu")
    assert html =~ "Menu"
    assert html =~ "Edit"
    assert html =~ "Delete"
  end
end
