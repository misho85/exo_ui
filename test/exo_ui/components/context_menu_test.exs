defmodule ExoUI.Components.ContextMenuTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components.Overlay

  test "renders context menu" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.context_menu id="ctx">
        <:trigger>Right-click here</:trigger>
        <:item label="Copy" />
        <:item label="Paste" />
      </.context_menu>
      """)

    assert html =~ ~s(data-exo="context-menu")
    assert html =~ ~s(phx-hook="ExoContextMenu")
    assert html =~ ~s(data-exo="context-menu-trigger")
    assert html =~ ~s(tabindex="0")
    assert html =~ ~s(role="button")
    assert html =~ ~s(aria-haspopup="menu")
    assert html =~ ~s(aria-controls="ctx-content")
    assert html =~ ~s(aria-expanded="false")
    assert html =~ ~s(id="ctx-content")
    assert html =~ ~s(aria-label="Context menu")
    assert html =~ "Copy"
    assert html =~ "Paste"
  end

  test "renders real menu items instead of inert templates" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.context_menu id="ctx">
        <:trigger>Right-click here</:trigger>
        <:item label="Copy" />
        <:item label="" separator />
        <:item label="Delete" disabled />
      </.context_menu>
      """)

    {:ok, tree} = Floki.parse_fragment(html)

    assert Floki.find(tree, "template") == []
    assert length(Floki.find(tree, ~s([data-exo="context-menu-item"]))) == 2
    assert length(Floki.find(tree, ~s([data-exo="context-menu-separator"]))) == 1
    assert Floki.find(tree, ~s([data-exo="context-menu-item"][disabled])) != []
    assert Floki.find(tree, ~s([data-exo="context-menu-item"][type="button"])) != []

    assert Floki.find(
             tree,
             ~s([data-exo="context-menu-item"][aria-disabled="true"][tabindex="-1"])
           ) != []
  end

  test "accepts an accessible menu label" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.context_menu id="ctx" label="Editor actions">
        <:trigger>Right-click here</:trigger>
        <:item label="Copy" />
      </.context_menu>
      """)

    assert html =~ ~s(aria-label="Editor actions")
  end
end
