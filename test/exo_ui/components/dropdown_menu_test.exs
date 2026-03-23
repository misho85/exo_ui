defmodule ExoUI.Components.DropdownMenuTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders dropdown_menu with trigger and items" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd">
      <:trigger>Menu</:trigger>
      <:entry>Edit</:entry>
      <:entry>Delete</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(data-exo="popover")
    assert html =~ ~s(popovertarget="dd")
    assert html =~ ~s(role="menu")
    assert html =~ ~s(role="menuitem")
    assert html =~ ~s(popover="auto")
    assert html =~ "Menu"
    assert html =~ "Edit"
    assert html =~ "Delete"
  end

  test "renders item with icon and shortcut" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd2">
      <:trigger>Menu</:trigger>
      <:entry icon="pencil" shortcut="⌘E">Edit</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(data-exo="dropdown-item-icon")
    assert html =~ ~s(data-exo="dropdown-item-shortcut")
    assert html =~ "⌘E"
  end

  test "renders separator" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd3">
      <:trigger>Menu</:trigger>
      <:entry>Edit</:entry>
      <:entry type="separator" />
      <:entry>Delete</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(data-exo="dropdown-separator")
    assert html =~ ~s(role="separator")
  end

  test "renders label" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd4">
      <:trigger>Menu</:trigger>
      <:entry type="label">Actions</:entry>
      <:entry>Edit</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(data-exo="dropdown-label")
    assert html =~ "Actions"
  end

  test "renders item with click and popovertargetaction=hide" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd5">
      <:trigger>Menu</:trigger>
      <:entry click="do-edit">Edit</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(popovertarget="dd5")
    assert html =~ ~s(popovertargetaction="hide")
    assert html =~ ~s(phx-click="do-edit")
  end

  test "renders item with navigate as link" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd6">
      <:trigger>Menu</:trigger>
      <:entry navigate="/items/1">View</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(href="/items/1")
    refute html =~ ~s(popovertargetaction)
  end

  test "renders item with variant=danger" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd7">
      <:trigger>Menu</:trigger>
      <:entry variant="danger">Delete</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(data-variant="danger")
  end

  test "renders sub_trigger for sub-menu" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd8">
      <:trigger>Menu</:trigger>
      <:entry type="sub_trigger" target="sub-menu">Share</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(popovertarget="sub-menu")
    refute html =~ ~s(popovertargetaction="hide")
  end

  test "renders without trigger" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="sub">
      <:entry>Sub item</:entry>
    </.dropdown_menu>
    """)
    refute html =~ ~s(data-exo="popover-trigger")
    assert html =~ ~s(role="menu")
  end

  test "sets aria-haspopup=menu on trigger" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd9">
      <:trigger>Menu</:trigger>
      <:entry>Edit</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(aria-haspopup="menu")
  end
end
