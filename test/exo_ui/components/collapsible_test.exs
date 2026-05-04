defmodule ExoUI.Components.CollapsibleTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders collapsible with data-exo attribute" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1">
        <:trigger>Toggle</:trigger>
        Content
      </.collapsible>
      """)

    assert html =~ ~s(data-exo="collapsible")
    assert html =~ ~s(id="c1")
  end

  test "renders collapsible trigger" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1">
        <:trigger>Click me</:trigger>
        Body
      </.collapsible>
      """)

    assert html =~ ~s(data-exo="collapsible-trigger")
    assert html =~ "Click me"
  end

  test "renders collapsible content" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1">
        <:trigger>Toggle</:trigger>
        Hidden content
      </.collapsible>
      """)

    assert html =~ ~s(data-exo="collapsible-content")
    assert html =~ ~s(data-exo="collapsible-body")
    assert html =~ "Hidden content"
  end

  test "renders collapsible closed by default" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1">
        <:trigger>Toggle</:trigger>
        Content
      </.collapsible>
      """)

    assert html =~ ~s(aria-expanded="false")
    refute html =~ "checked"
  end

  test "renders collapsible open when open is true" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1" open={true}>
        <:trigger>Toggle</:trigger>
        Content
      </.collapsible>
      """)

    assert html =~ ~s(aria-expanded="true")
    assert html =~ "checked"
  end

  test "renders collapsible with aria-controls" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="my-section">
        <:trigger>Toggle</:trigger>
        Content
      </.collapsible>
      """)

    assert html =~ ~s(aria-controls="my-section-content")
    assert html =~ ~s(id="my-section-trigger")
    assert html =~ ~s(aria-labelledby="my-section-trigger")
    assert html =~ ~s(id="my-section-content")
  end

  test "closed content is hidden from assistive tech and focus" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1">
        <:trigger>Toggle</:trigger>
        Content
      </.collapsible>
      """)

    assert html =~ ~s(aria-hidden="true")
    assert html =~ ~s(inert)
  end

  test "open content is exposed to assistive tech" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1" open>
        <:trigger>Toggle</:trigger>
        Content
      </.collapsible>
      """)

    assert html =~ ~s(aria-hidden="false")
    refute html =~ ~s(inert)
  end

  test "renders collapsible with class" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1" class="my-collapsible">
        <:trigger>Toggle</:trigger>
        Content
      </.collapsible>
      """)

    assert html =~ ~s(class="my-collapsible")
  end

  test "renders hidden checkbox for CSS state" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1">
        <:trigger>Toggle</:trigger>
        Content
      </.collapsible>
      """)

    assert html =~ ~s(data-exo="collapsible-state")
    assert html =~ ~s(id="c1-state")
    assert html =~ ~s(type="checkbox")
    assert html =~ ~s(aria-hidden="true")
    assert html =~ ~s(tabindex="-1")
  end

  test "renders phx-hook for ExoCollapsible" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1">
        <:trigger>Toggle</:trigger>
        Content
      </.collapsible>
      """)

    assert html =~ ~s(phx-hook="ExoCollapsible")
  end

  test "renders content with role region" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.collapsible id="c1">
        <:trigger>Toggle</:trigger>
        Content
      </.collapsible>
      """)

    assert html =~ ~s(role="region")
  end
end
