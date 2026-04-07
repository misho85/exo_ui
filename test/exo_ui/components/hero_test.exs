defmodule ExoUI.Components.HeroTest do
  use ExoUI.ComponentCase, async: true

  test "renders hero with data-exo attribute" do
    assigns = %{}

    ~H"""
    <.hero>
      <:title>Welcome</:title>
    </.hero>
    """
    |> parse_component()
    |> assert_attribute("data-exo", "hero")
  end

  test "renders hero as section element" do
    assigns = %{}

    ~H"""
    <.hero>
      <:title>Welcome</:title>
    </.hero>
    """
    |> parse_component()
    |> assert_component("section")
  end

  test "renders title slot" do
    assigns = %{}

    ~H"""
    <.hero>
      <:title>Welcome to ExoUI</:title>
    </.hero>
    """
    |> parse_component()
    |> assert_component("[data-exo='hero-title']")
    |> assert_text("Welcome to ExoUI")
  end

  test "renders hero content wrapper" do
    assigns = %{}

    ~H"""
    <.hero>
      <:title>Welcome</:title>
    </.hero>
    """
    |> parse_component()
    |> assert_component("[data-exo='hero-content']")
  end

  test "renders subtitle slot" do
    assigns = %{}

    ~H"""
    <.hero>
      <:title>Welcome</:title>
      <:subtitle>Build amazing things</:subtitle>
    </.hero>
    """
    |> parse_component()
    |> assert_component("[data-exo='hero-subtitle']")
    |> assert_text("Build amazing things")
  end

  test "renders actions slot" do
    assigns = %{}

    ~H"""
    <.hero>
      <:title>Welcome</:title>
      <:actions>
        <button>Get Started</button>
      </:actions>
    </.hero>
    """
    |> parse_component()
    |> assert_component("[data-exo='hero-actions']")
    |> assert_text("Get Started")
  end

  test "omits subtitle when slot not provided" do
    assigns = %{}

    ~H"""
    <.hero>
      <:title>Welcome</:title>
    </.hero>
    """
    |> parse_component()
    |> refute_element("[data-exo='hero-subtitle']")
  end

  test "omits actions when slot not provided" do
    assigns = %{}

    ~H"""
    <.hero>
      <:title>Welcome</:title>
    </.hero>
    """
    |> parse_component()
    |> refute_element("[data-exo='hero-actions']")
  end

  test "renders all slots together" do
    assigns = %{}

    ~H"""
    <.hero>
      <:title>Welcome</:title>
      <:subtitle>A subtitle</:subtitle>
      <:actions>Action</:actions>
    </.hero>
    """
    |> parse_component()
    |> assert_component("[data-exo='hero-title']")
    |> assert_component("[data-exo='hero-subtitle']")
    |> assert_component("[data-exo='hero-actions']")
  end

  test "renders hero with class" do
    assigns = %{}

    ~H"""
    <.hero class="my-hero">
      <:title>Welcome</:title>
    </.hero>
    """
    |> parse_component()
    |> assert_class("my-hero")
  end
end
