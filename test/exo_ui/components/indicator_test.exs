defmodule ExoUI.Components.IndicatorTest do
  use ExoUI.ComponentCase, async: true

  test "renders indicator with data-exo attribute" do
    assigns = %{}

    ~H"""
    <.indicator>
      Content
    </.indicator>
    """
    |> parse_component()
    |> assert_attribute("data-exo", "indicator")
  end

  test "renders inner_block content" do
    assigns = %{}

    ~H"""
    <.indicator>
      <span>Inbox</span>
    </.indicator>
    """
    |> parse_component()
    |> assert_text("Inbox")
  end

  test "renders badge slot" do
    assigns = %{}

    ~H"""
    <.indicator>
      <:badge>5</:badge>
      Inbox
    </.indicator>
    """
    |> parse_component()
    |> assert_component("[data-exo='indicator-badge']")
    |> assert_text("5")
  end

  test "omits badge when slot not provided" do
    assigns = %{}

    ~H"""
    <.indicator>
      Content
    </.indicator>
    """
    |> parse_component()
    |> refute_element("[data-exo='indicator-badge']")
  end

  test "renders with default top-right position" do
    assigns = %{}

    ~H"""
    <.indicator>
      <:badge>3</:badge>
      Content
    </.indicator>
    """
    |> parse_component()
    |> assert_attribute("data-position", "top-right")
  end

  test "renders with custom position" do
    assigns = %{}

    ~H"""
    <.indicator position="bottom-left">
      <:badge>3</:badge>
      Content
    </.indicator>
    """
    |> parse_component()
    |> assert_attribute("data-position", "bottom-left")
  end

  test "renders with top-left position" do
    assigns = %{}

    ~H"""
    <.indicator position="top-left">
      <:badge>1</:badge>
      Content
    </.indicator>
    """
    |> parse_component()
    |> assert_attribute("data-position", "top-left")
  end

  test "renders with bottom-right position" do
    assigns = %{}

    ~H"""
    <.indicator position="bottom-right">
      <:badge>1</:badge>
      Content
    </.indicator>
    """
    |> parse_component()
    |> assert_attribute("data-position", "bottom-right")
  end

  test "renders with top-center position" do
    assigns = %{}

    ~H"""
    <.indicator position="top-center">
      <:badge>1</:badge>
      Content
    </.indicator>
    """
    |> parse_component()
    |> assert_attribute("data-position", "top-center")
  end

  test "renders with bottom-center position" do
    assigns = %{}

    ~H"""
    <.indicator position="bottom-center">
      <:badge>1</:badge>
      Content
    </.indicator>
    """
    |> parse_component()
    |> assert_attribute("data-position", "bottom-center")
  end

  test "renders indicator with class" do
    assigns = %{}

    ~H"""
    <.indicator class="my-indicator">
      Content
    </.indicator>
    """
    |> parse_component()
    |> assert_class("my-indicator")
  end
end
