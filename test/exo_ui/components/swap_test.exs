defmodule ExoUI.Components.SwapTest do
  use ExoUI.ComponentCase, async: true

  test "renders swap with data-exo attribute" do
    assigns = %{}

    ~H"""
    <.swap id="s1">
      <:on>ON</:on>
      <:off>OFF</:off>
    </.swap>
    """
    |> parse_component()
    |> assert_attribute("data-exo", "swap")
  end

  test "renders swap with id" do
    assigns = %{}

    ~H"""
    <.swap id="my-swap">
      <:on>ON</:on>
      <:off>OFF</:off>
    </.swap>
    """
    |> parse_component()
    |> assert_attribute("id", "my-swap")
  end

  test "renders as label element" do
    assigns = %{}

    ~H"""
    <.swap id="s1">
      <:on>ON</:on>
      <:off>OFF</:off>
    </.swap>
    """
    |> parse_component()
    |> assert_component("label")
  end

  test "renders hidden checkbox for state" do
    assigns = %{}

    ~H"""
    <.swap id="s1">
      <:on>ON</:on>
      <:off>OFF</:off>
    </.swap>
    """
    |> parse_component()
    |> assert_component("[data-exo='swap-state']")
    |> assert_attribute("type", "checkbox", "input")
    |> assert_attribute("aria-hidden", "true", "input")
    |> assert_attribute("tabindex", "-1", "input")
  end

  test "renders on slot" do
    assigns = %{}

    ~H"""
    <.swap id="s1">
      <:on>Sun</:on>
      <:off>Moon</:off>
    </.swap>
    """
    |> parse_component()
    |> assert_component("[data-exo='swap-on']")
    |> assert_text("Sun")
  end

  test "renders off slot" do
    assigns = %{}

    ~H"""
    <.swap id="s1">
      <:on>Sun</:on>
      <:off>Moon</:off>
    </.swap>
    """
    |> parse_component()
    |> assert_component("[data-exo='swap-off']")
    |> assert_text("Moon")
  end

  test "renders unchecked by default" do
    assigns = %{}

    ~H"""
    <.swap id="s1">
      <:on>ON</:on>
      <:off>OFF</:off>
    </.swap>
    """
    |> parse_component()
    |> refute_attribute("checked", "", "[data-exo=\"swap-state\"]")
  end

  test "renders checked when active is true" do
    assigns = %{}

    ~H"""
    <.swap id="s1" active={true}>
      <:on>ON</:on>
      <:off>OFF</:off>
    </.swap>
    """
    |> parse_component()
    |> assert_attribute("checked", "checked", "[data-exo=\"swap-state\"]")
  end

  test "renders swap with class" do
    assigns = %{}

    ~H"""
    <.swap id="s1" class="my-swap">
      <:on>ON</:on>
      <:off>OFF</:off>
    </.swap>
    """
    |> parse_component()
    |> assert_class("my-swap")
  end
end
