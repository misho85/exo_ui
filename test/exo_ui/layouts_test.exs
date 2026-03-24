defmodule ExoUI.LayoutsTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Layouts

  test "renders sidebar layout" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:nav>Nav content</:nav>
        Main content
      </.sidebar_layout>
      """)

    assert html =~ ~s(data-exo="sidebar")
    assert html =~ ~s(data-exo="sidebar-content")
    assert html =~ ~s(data-exo="sidebar-panel")
    assert html =~ ~s(data-exo="sidebar-topbar")
    assert html =~ ~s(phx-hook="ExoSidebar")
    assert html =~ "Nav content"
    assert html =~ "Main content"
  end

  test "renders sidebar item" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.sidebar_item href="/dashboard" label="Dashboard" active={true} />|)

    assert html =~ ~s(data-exo="sidebar-item")
    assert html =~ ~s(data-active)
    assert html =~ "Dashboard"
  end

  test "renders sidebar item with badge" do
    assigns = %{}
    html = rendered_to_string(~H|<.sidebar_item href="/inbox" label="Inbox" badge={5} />|)
    assert html =~ ~s(data-exo="sidebar-badge")
    assert html =~ "5"
  end
end
