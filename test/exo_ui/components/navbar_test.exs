defmodule ExoUI.Components.NavbarTest do
  use ExoUI.ComponentCase, async: true

  test "renders navbar with data-exo attribute" do
    assigns = %{}

    ~H"""
    <.navbar>
      <:brand>Logo</:brand>
    </.navbar>
    """
    |> parse_component()
    |> assert_attribute("data-exo", "navbar")
  end

  test "renders navbar as nav element" do
    assigns = %{}

    ~H"""
    <.navbar>
      <:brand>Logo</:brand>
    </.navbar>
    """
    |> parse_component()
    |> assert_component("nav")
  end

  test "renders brand slot" do
    assigns = %{}

    ~H"""
    <.navbar>
      <:brand>MyApp</:brand>
    </.navbar>
    """
    |> parse_component()
    |> assert_component("[data-exo='navbar-brand']")
    |> assert_text("MyApp")
  end

  test "renders center slot" do
    assigns = %{}

    ~H"""
    <.navbar>
      <:center>Navigation</:center>
    </.navbar>
    """
    |> parse_component()
    |> assert_component("[data-exo='navbar-center']")
    |> assert_text("Navigation")
  end

  test "renders end_content slot" do
    assigns = %{}

    ~H"""
    <.navbar>
      <:end_content>Profile</:end_content>
    </.navbar>
    """
    |> parse_component()
    |> assert_component("[data-exo='navbar-end']")
    |> assert_text("Profile")
  end

  test "renders all slots together" do
    assigns = %{}

    ~H"""
    <.navbar>
      <:brand>Logo</:brand>
      <:center>Nav</:center>
      <:end_content>User</:end_content>
    </.navbar>
    """
    |> parse_component()
    |> assert_component("[data-exo='navbar-brand']")
    |> assert_component("[data-exo='navbar-center']")
    |> assert_component("[data-exo='navbar-end']")
  end

  test "omits brand section when slot not provided" do
    assigns = %{}

    ~H"""
    <.navbar>
      <:center>Nav</:center>
    </.navbar>
    """
    |> parse_component()
    |> refute_element("[data-exo='navbar-brand']")
  end

  test "omits center section when slot not provided" do
    assigns = %{}

    ~H"""
    <.navbar>
      <:brand>Logo</:brand>
    </.navbar>
    """
    |> parse_component()
    |> refute_element("[data-exo='navbar-center']")
  end

  test "omits end section when slot not provided" do
    assigns = %{}

    ~H"""
    <.navbar>
      <:brand>Logo</:brand>
    </.navbar>
    """
    |> parse_component()
    |> refute_element("[data-exo='navbar-end']")
  end

  test "renders navbar with class" do
    assigns = %{}

    ~H"""
    <.navbar class="my-navbar">
      <:brand>Logo</:brand>
    </.navbar>
    """
    |> parse_component()
    |> assert_class("my-navbar")
  end
end
