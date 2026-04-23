defmodule ExoUI.Components.PopoverTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders popover with trigger and content" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="test-pop">
        <:trigger>Open</:trigger>
        Content here
      </.popover>
      """)

    assert html =~ ~s(data-exo="popover")
    assert html =~ ~s(popovertarget="test-pop")
    assert html =~ ~s(data-exo="popover-trigger")
    assert html =~ ~s(data-exo="popover-content")
    assert html =~ ~s(popover="auto")
    assert html =~ ~s(id="test-pop")
    assert html =~ "Open"
    assert html =~ "Content here"
  end

  test "renders with side and align" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="pos" side="top" align="end">
        <:trigger>Open</:trigger>
        Content
      </.popover>
      """)

    assert html =~ ~s(data-side="top")
    assert html =~ ~s(data-align="end")
  end

  test "renders with manual mode" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="man" mode="manual">
        <:trigger>Open</:trigger>
        Content
      </.popover>
      """)

    assert html =~ ~s(popover="manual")
  end

  test "renders without trigger for sub-menu pattern" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="sub">
        Sub content
      </.popover>
      """)

    refute html =~ ~s(data-exo="popover-trigger")
    assert html =~ ~s(id="sub")
  end

  test "generates unique inline anchor names from id" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="anc">
        <:trigger>Open</:trigger>
        Content
      </.popover>
      """)

    assert html =~ ~s(anchor-name: --popover-anc)
    assert html =~ ~s(position-anchor: --popover-anc)
  end

  test "sets type=button, aria-haspopup, and collapsed aria-expanded on trigger" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="aria">
        <:trigger>Open</:trigger>
        Content
      </.popover>
      """)

    assert html =~ ~s(type="button")
    assert html =~ ~s(aria-haspopup="true")
    assert html =~ ~s(aria-expanded="false")
  end

  test "allows haspopup override" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="hp" haspopup="menu">
        <:trigger>Open</:trigger>
        Content
      </.popover>
      """)

    assert html =~ ~s(aria-haspopup="menu")
  end

  test "applies class to content div" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="cls" class="custom">
        <:trigger>Open</:trigger>
        Content
      </.popover>
      """)

    assert html =~ ~s(class="custom")
  end

  test "defaults to bottom/center" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="def">
        <:trigger>Open</:trigger>
        Content
      </.popover>
      """)

    assert html =~ ~s(data-side="bottom")
    assert html =~ ~s(data-align="center")
  end

  test "two popovers have different anchor names" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="one">
        <:trigger>One</:trigger>
        First
      </.popover>
      <.popover id="two">
        <:trigger>Two</:trigger>
        Second
      </.popover>
      """)

    assert html =~ ~s(anchor-name: --popover-one)
    assert html =~ ~s(anchor-name: --popover-two)
    assert html =~ ~s(position-anchor: --popover-one)
    assert html =~ ~s(position-anchor: --popover-two)
  end

  test "forwards rest attrs to content div" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.popover id="rest" data-testid="my-pop">
        <:trigger>Open</:trigger>
        Content
      </.popover>
      """)

    assert html =~ ~s(data-testid="my-pop")
  end
end
