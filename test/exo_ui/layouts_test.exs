defmodule ExoUI.LayoutsTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Layouts

  # ── sidebar_layout/1 ──────────────────────────────────────────────

  test "renders sidebar layout with required slots" do
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
    assert html =~ ~s(data-exo="sidebar-main")
    assert html =~ ~s(data-exo="sidebar-nav")
    assert html =~ ~s(data-exo="sidebar-aside")
    assert html =~ ~s(phx-hook="ExoSidebar")
    assert html =~ "Nav content"
    assert html =~ "Main content"
  end

  test "renders sidebar layout with default id" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    assert html =~ ~s(id="sidebar-layout")
    assert html =~ ~s(id="sidebar-layout-toggle")
  end

  test "renders sidebar layout with custom id" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout id="my-sidebar">
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    assert html =~ ~s(id="my-sidebar")
    assert html =~ ~s(id="my-sidebar-toggle")
  end

  test "renders sidebar layout with custom class" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout class="custom-class">
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    assert html =~ "custom-class"
  end

  test "renders sidebar layout with content_class" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout content_class="max-w-4xl">
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    assert html =~ "max-w-4xl"
  end

  test "renders sidebar layout with brand slot" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:brand>My App Logo</:brand>
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    assert html =~ ~s(data-exo="sidebar-brand")
    assert html =~ "My App Logo"
  end

  test "renders sidebar layout without brand slot" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    refute html =~ ~s(data-exo="sidebar-brand")
  end

  test "renders sidebar layout with topbar_start slot" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:topbar_start>Breadcrumbs here</:topbar_start>
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    assert html =~ ~s(data-exo="topbar-start")
    assert html =~ "Breadcrumbs here"
  end

  test "renders sidebar layout with topbar_end slot" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:topbar_end>User menu</:topbar_end>
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    assert html =~ ~s(data-exo="topbar-end")
    assert html =~ "User menu"
  end

  test "renders sidebar layout with footer slot" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:nav>Nav</:nav>
        <:footer>Footer info</:footer>
        Body
      </.sidebar_layout>
      """)

    assert html =~ ~s(data-exo="sidebar-footer")
    assert html =~ "Footer info"
  end

  test "renders sidebar layout without footer slot" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    refute html =~ ~s(data-exo="sidebar-footer")
  end

  test "renders sidebar layout with all slots populated" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout id="full-sidebar" class="app-shell" content_class="container">
        <:brand>Acme Corp</:brand>
        <:topbar_start>Search bar</:topbar_start>
        <:topbar_end>Notifications</:topbar_end>
        <:nav>Navigation links</:nav>
        <:footer>Logged in as admin</:footer>
        Page content here
      </.sidebar_layout>
      """)

    assert html =~ ~s(data-exo="sidebar")
    assert html =~ ~s(data-exo="sidebar-brand")
    assert html =~ ~s(data-exo="topbar-start")
    assert html =~ ~s(data-exo="topbar-end")
    assert html =~ ~s(data-exo="sidebar-nav")
    assert html =~ ~s(data-exo="sidebar-footer")
    assert html =~ ~s(data-exo="sidebar-main")
    assert html =~ "Acme Corp"
    assert html =~ "Search bar"
    assert html =~ "Notifications"
    assert html =~ "Navigation links"
    assert html =~ "Logged in as admin"
    assert html =~ "Page content here"
  end

  test "renders sidebar toggle checkbox" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    assert html =~ ~s(data-exo="sidebar-toggle")
    assert html =~ ~s(type="checkbox")
    assert html =~ "checked"
    assert html =~ ~s(phx-update="ignore")
  end

  test "renders sidebar hamburger label" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    assert html =~ ~s(data-exo="sidebar-hamburger")
    assert html =~ ~s(aria-label="Toggle sidebar")
  end

  test "renders sidebar overlay label" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.sidebar_layout>
        <:nav>Nav</:nav>
        Body
      </.sidebar_layout>
      """)

    assert html =~ ~s(data-exo="sidebar-overlay")
    assert html =~ ~s(aria-label="Close sidebar")
  end

  # ── sidebar_item/1 ────────────────────────────────────────────────

  test "renders sidebar item with required attrs" do
    assigns = %{}
    html = rendered_to_string(~H|<.sidebar_item href="/dashboard" label="Dashboard" />|)

    assert html =~ ~s(data-exo="sidebar-item")
    assert html =~ ~s(data-exo="sidebar-label")
    assert html =~ "Dashboard"
    assert html =~ ~s(/dashboard)
  end

  test "renders sidebar item as a list item with a link" do
    assigns = %{}
    html = rendered_to_string(~H|<.sidebar_item href="/home" label="Home" />|)

    assert html =~ "<li"
    assert html =~ "<a"
    assert html =~ ~s(href="/home")
    assert html =~ ~s(data-phx-link="redirect")
  end

  test "renders sidebar item with active state" do
    assigns = %{}
    html = rendered_to_string(~H|<.sidebar_item href="/page" label="Page" active={true} />|)

    assert html =~ ~s(data-active)
    assert html =~ ~s(data-exo="sidebar-item")
  end

  test "renders sidebar item without active state by default" do
    assigns = %{}
    html = rendered_to_string(~H|<.sidebar_item href="/page" label="Page" />|)

    refute html =~ ~s(data-active)
  end

  test "renders sidebar item with badge" do
    assigns = %{}
    html = rendered_to_string(~H|<.sidebar_item href="/inbox" label="Inbox" badge={5} />|)

    assert html =~ ~s(data-exo="sidebar-badge")
    assert html =~ "5"
  end

  test "does not render badge when badge is nil" do
    assigns = %{}
    html = rendered_to_string(~H|<.sidebar_item href="/inbox" label="Inbox" />|)

    refute html =~ ~s(data-exo="sidebar-badge")
  end

  test "does not render badge when badge is zero" do
    assigns = %{}
    html = rendered_to_string(~H|<.sidebar_item href="/inbox" label="Inbox" badge={0} />|)

    refute html =~ ~s(data-exo="sidebar-badge")
  end

  test "renders sidebar item with icon" do
    assigns = %{}
    html = rendered_to_string(~H|<.sidebar_item href="/settings" label="Settings" icon="gear" />|)

    assert html =~ ~s(data-exo="sidebar-icon")
    assert html =~ "gear"
  end

  test "does not render icon when icon is nil" do
    assigns = %{}
    html = rendered_to_string(~H|<.sidebar_item href="/settings" label="Settings" />|)

    refute html =~ ~s(data-exo="sidebar-icon")
  end

  test "renders sidebar item with custom class" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.sidebar_item href="/page" label="Page" class="highlighted" />|)

    assert html =~ "highlighted"
  end

  test "renders sidebar item with global attrs" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.sidebar_item href="/page" label="Page" data-testid="nav-item" />|)

    assert html =~ ~s(data-testid="nav-item")
  end

  test "renders sidebar item with icon, badge, and active state together" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.sidebar_item
  href="/messages"
  label="Messages"
  icon="mail"
  badge={12}
  active={true}
  class="special"
/>|)

    assert html =~ ~s(data-exo="sidebar-item")
    assert html =~ ~s(data-exo="sidebar-icon")
    assert html =~ ~s(data-exo="sidebar-label")
    assert html =~ ~s(data-exo="sidebar-badge")
    assert html =~ ~s(data-active)
    assert html =~ "mail"
    assert html =~ "Messages"
    assert html =~ "12"
    assert html =~ "special"
  end
end
