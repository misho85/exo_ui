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
    assert html =~ "Copy"
    assert html =~ "Paste"
  end
end
