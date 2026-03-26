defmodule ExoUI.Components.CommandPaletteTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders command palette" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.command_palette id="cmd">
        <p>Items</p>
      </.command_palette>
      """)

    assert html =~ ~s(data-exo="command-palette")
    assert html =~ ~s(phx-hook="ExoCommandPalette")
    assert html =~ ~s(data-exo="command-palette-input")
    assert html =~ ~s(role="dialog")
    assert html =~ "Items"
  end

  test "renders with custom placeholder" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.command_palette id="cmd" placeholder="Type a command...">
        <p>Items</p>
      </.command_palette>
      """)

    assert html =~ ~s(placeholder="Type a command...")
  end
end
