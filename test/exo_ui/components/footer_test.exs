defmodule ExoUI.Components.FooterTest do
  use ExoUI.ComponentCase, async: true

  test "renders footer with data-exo attribute" do
    assigns = %{}

    ~H"""
    <.footer>
      <:column title="Links">Link 1</:column>
    </.footer>
    """
    |> parse_component()
    |> assert_attribute("data-exo", "footer")
  end

  test "renders footer as footer element" do
    assigns = %{}

    ~H"""
    <.footer>
      <:column title="Links">Link 1</:column>
    </.footer>
    """
    |> parse_component()
    |> assert_component("footer")
  end

  test "renders column slots with titles" do
    assigns = %{}

    ~H"""
    <.footer>
      <:column title="Company">About Us</:column>
      <:column title="Resources">Documentation</:column>
    </.footer>
    """
    |> parse_component()
    |> assert_component("[data-exo='footer-columns']")
    |> assert_component("[data-exo='footer-column']")
    |> assert_component("[data-exo='footer-column-title']")
    |> assert_text("Company")
    |> assert_text("Resources")
    |> assert_text("About Us")
    |> assert_text("Documentation")
  end

  test "renders multiple columns" do
    assigns = %{}

    ~H"""
    <.footer>
      <:column title="One">A</:column>
      <:column title="Two">B</:column>
      <:column title="Three">C</:column>
    </.footer>
    """
    |> parse_component()
    |> assert_count("[data-exo='footer-column']", 3)
  end

  test "renders bottom slot" do
    assigns = %{}

    ~H"""
    <.footer>
      <:column title="Links">Link 1</:column>
      <:bottom>Copyright 2026</:bottom>
    </.footer>
    """
    |> parse_component()
    |> assert_component("[data-exo='footer-bottom']")
    |> assert_text("Copyright 2026")
  end

  test "omits bottom section when slot not provided" do
    assigns = %{}

    ~H"""
    <.footer>
      <:column title="Links">Link 1</:column>
    </.footer>
    """
    |> parse_component()
    |> refute_element("[data-exo='footer-bottom']")
  end

  test "omits columns section when no columns provided" do
    assigns = %{}

    ~H"""
    <.footer>
      <:bottom>Footer only</:bottom>
    </.footer>
    """
    |> parse_component()
    |> refute_element("[data-exo='footer-columns']")
  end

  test "renders footer with class" do
    assigns = %{}

    ~H"""
    <.footer class="my-footer">
      <:column title="Links">Link 1</:column>
    </.footer>
    """
    |> parse_component()
    |> assert_class("my-footer")
  end
end
