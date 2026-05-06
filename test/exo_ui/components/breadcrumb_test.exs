defmodule ExoUI.Components.BreadcrumbTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders breadcrumb with data-exo attribute" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb>
        <:item>Home</:item>
      </.breadcrumb>
      """)

    assert html =~ ~s(data-exo="breadcrumb")
    assert html =~ ~s(aria-label="Breadcrumb")
    assert html =~ ~s(data-exo="breadcrumb-current")
    assert html =~ "Home"
  end

  test "renders breadcrumb items" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb>
        <:item href="/">Home</:item>
        <:item href="/products">Products</:item>
        <:item>Current</:item>
      </.breadcrumb>
      """)

    assert html =~ ~s(data-exo="breadcrumb-item")
    assert html =~ "Home"
    assert html =~ "Products"
    assert html =~ "Current"
  end

  test "renders breadcrumb separators between items" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb>
        <:item href="/">Home</:item>
        <:item>Page</:item>
      </.breadcrumb>
      """)

    {:ok, tree} = Floki.parse_fragment(html)

    assert html =~ ~s(data-exo="breadcrumb-separator")
    assert html =~ ~s(aria-hidden="true")
    assert Floki.find(tree, ~s([data-exo="breadcrumb-separator"] [data-exo="icon"])) != []
  end

  test "does not render separator before first item" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb>
        <:item href="/">Home</:item>
      </.breadcrumb>
      """)

    refute html =~ ~s(data-exo="breadcrumb-separator")
  end

  test "renders breadcrumb item with navigate" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb>
        <:item navigate="/dashboard">Dashboard</:item>
      </.breadcrumb>
      """)

    assert html =~ "Dashboard"
    assert html =~ "/dashboard"
  end

  test "renders breadcrumb item with patch" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb>
        <:item patch="/settings">Settings</:item>
      </.breadcrumb>
      """)

    assert html =~ "Settings"
    assert html =~ "/settings"
  end

  test "renders last item as current page when no link" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb>
        <:item href="/">Home</:item>
        <:item>Current</:item>
      </.breadcrumb>
      """)

    assert html =~ ~s(aria-current="page")
    assert html =~ "Current"
  end

  test "renders custom separator and explicit current item" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb aria_label="Project path" separator="|">
        <:item href="/">Home</:item>
        <:item href="/docs" current>Docs</:item>
      </.breadcrumb>
      """)

    {:ok, tree} = Floki.parse_fragment(html)
    [separator] = Floki.find(tree, ~s([data-exo="breadcrumb-separator"]))

    assert html =~ ~s(aria-label="Project path")
    assert Floki.text(separator) == "|"
    assert Floki.find(separator, ~s([data-exo="icon"])) == []
    assert html =~ ~s(data-exo="breadcrumb-current")
    assert html =~ ~s(aria-current="page")
    refute html =~ ~s(href="/docs")
  end

  test "supports a custom separator icon" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb separator_icon="arrow-right">
        <:item href="/">Home</:item>
        <:item>Page</:item>
      </.breadcrumb>
      """)

    {:ok, tree} = Floki.parse_fragment(html)

    assert Floki.find(tree, ~s([data-exo="breadcrumb-separator"] [data-exo="icon"])) != []
  end

  test "renders breadcrumb with class" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb class="my-breadcrumb">
        <:item>Home</:item>
      </.breadcrumb>
      """)

    assert html =~ ~s(class="my-breadcrumb")
  end

  test "renders breadcrumb as nav element with ol" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.breadcrumb>
        <:item>Home</:item>
      </.breadcrumb>
      """)

    assert html =~ "<nav"
    assert html =~ "<ol>"
    assert html =~ "<li"
  end
end
