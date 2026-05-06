defmodule ExoUI.Components.CommandPaletteTest do
  use ExUnit.Case, async: true
  alias Phoenix.LiveView.JS
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders command palette" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.command_palette id="cmd">
        <:item label="Search docs" value="docs" shortcut="D" />
        <:item label="Settings" value="settings" />
      </.command_palette>
      """)

    {:ok, tree} = Floki.parse_fragment(html)
    [search_icon] = Floki.find(tree, ~s([data-exo="command-palette-search-icon"]))

    assert html =~ ~s(data-exo="command-palette")
    assert html =~ ~s(phx-hook="ExoCommandPalette")
    assert html =~ ~s(aria-hidden="true")
    assert html =~ ~s(data-shortcut="mod+k")
    assert html =~ ~s(data-exo="command-palette-input")
    assert html =~ ~s(data-exo="command-palette-item")
    assert html =~ ~s(data-value="docs")
    assert html =~ ~s(data-exo="command-palette-shortcut")
    assert html =~ ~s(role="dialog")
    assert Floki.attribute(search_icon, "aria-hidden") == ["true"]
    assert Floki.attribute(search_icon, "focusable") == ["false"]
    assert html =~ "Search docs"
    assert html =~ "Settings"
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

  test "keeps legacy inner content when no item slot is provided" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.command_palette id="cmd">
        <button data-exo="command-palette-item">Legacy item</button>
      </.command_palette>
      """)

    assert html =~ "Legacy item"
  end

  test "supports custom and disabled keyboard shortcuts" do
    assigns = %{}

    custom_html =
      rendered_to_string(~H"""
      <.command_palette id="custom" shortcut="ctrl+j">
        <:item label="Jump" value="jump" />
      </.command_palette>
      """)

    manual_html =
      rendered_to_string(~H"""
      <.command_palette id="manual" shortcut={nil}>
        <:item label="Manual" value="manual" />
      </.command_palette>
      """)

    assert custom_html =~ ~s(data-shortcut="ctrl+j")
    refute manual_html =~ "data-shortcut"
  end

  test "public JS helpers keep state attributes in sync" do
    assert %JS{
             ops: [
               ["set_attr", %{to: "#cmd", attr: ["data-state", "open"]}],
               ["set_attr", %{to: "#cmd", attr: ["aria-hidden", "false"]}],
               ["show", %{to: "#cmd"}],
               ["add_class", %{to: "#cmd", names: ["open"]}],
               ["focus", %{to: "#cmd [data-exo=\"command-palette-input\"]"}]
             ]
           } = show_command_palette("cmd")

    assert %JS{
             ops: [
               ["set_attr", %{to: "#cmd", attr: ["data-state", "closed"]}],
               ["set_attr", %{to: "#cmd", attr: ["aria-hidden", "true"]}],
               ["remove_class", %{to: "#cmd", names: ["open"]}],
               ["hide", %{to: "#cmd"}]
             ]
           } = hide_command_palette("cmd")
  end
end
