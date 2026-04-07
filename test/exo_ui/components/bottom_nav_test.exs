defmodule ExoUI.Components.BottomNavTest do
  use ExoUI.ComponentCase, async: true

  test "renders bottom_nav with data-exo attribute" do
    assigns = %{}

    ~H"""
    <.bottom_nav>
      <:item label="Home" href="/">Home</:item>
    </.bottom_nav>
    """
    |> parse_component()
    |> assert_attribute("data-exo", "bottom-nav")
  end

  test "renders bottom_nav as nav element" do
    assigns = %{}

    ~H"""
    <.bottom_nav>
      <:item label="Home" href="/">Home</:item>
    </.bottom_nav>
    """
    |> parse_component()
    |> assert_component("nav")
  end

  test "renders items with labels" do
    assigns = %{}

    ~H"""
    <.bottom_nav>
      <:item label="Home" href="/">Home</:item>
      <:item label="Search" href="/search">Search</:item>
    </.bottom_nav>
    """
    |> parse_component()
    |> assert_count("[data-exo='bottom-nav-item']", 2)
    |> assert_text("Home")
    |> assert_text("Search")
  end

  test "renders item labels in dedicated element" do
    assigns = %{}

    ~H"""
    <.bottom_nav>
      <:item label="Home" href="/">Home</:item>
    </.bottom_nav>
    """
    |> parse_component()
    |> assert_component("[data-exo='bottom-nav-label']")
    |> assert_text("Home")
  end

  test "renders item with icon" do
    assigns = %{}

    ~H"""
    <.bottom_nav>
      <:item label="Home" icon="H" href="/">Home</:item>
    </.bottom_nav>
    """
    |> parse_component()
    |> assert_component("[data-exo='bottom-nav-icon']")
  end

  test "renders active item with data-active attribute" do
    assigns = %{}

    ~H"""
    <.bottom_nav>
      <:item label="Home" href="/" active={true}>Home</:item>
      <:item label="About" href="/about">About</:item>
    </.bottom_nav>
    """
    |> parse_component()
    |> assert_attribute("data-active", "", "[data-exo='bottom-nav-item']")
  end

  test "renders active item with aria-current page" do
    assigns = %{}

    ~H"""
    <.bottom_nav>
      <:item label="Home" href="/" active={true}>Home</:item>
    </.bottom_nav>
    """
    |> parse_component()
    |> assert_attribute("aria-current", "page", "[data-exo='bottom-nav-item']")
  end

  test "renders item with href" do
    assigns = %{}

    ~H"""
    <.bottom_nav>
      <:item label="Home" href="/">Home</:item>
    </.bottom_nav>
    """
    |> parse_component()
    |> assert_attribute("href", "/", "[data-exo='bottom-nav-item']")
  end

  test "renders bottom_nav with class" do
    assigns = %{}

    ~H"""
    <.bottom_nav class="my-nav">
      <:item label="Home" href="/">Home</:item>
    </.bottom_nav>
    """
    |> parse_component()
    |> assert_class("my-nav")
  end
end
