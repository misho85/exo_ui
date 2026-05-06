defmodule ExoUI.Components.RadialProgressTest do
  use ExoUI.ComponentCase, async: true

  test "renders radial_progress with data-exo attribute" do
    assigns = %{}

    ~H|<.radial_progress value={50} />|
    |> parse_component()
    |> assert_attribute("data-exo", "radial-progress")
  end

  test "renders with role progressbar" do
    assigns = %{}

    ~H|<.radial_progress value={50} />|
    |> parse_component()
    |> assert_attribute("role", "progressbar")
  end

  test "renders aria attributes" do
    assigns = %{}

    ~H|<.radial_progress value={30} max={100} />|
    |> parse_component()
    |> assert_attribute("aria-label", "Progress")
    |> assert_attribute("aria-valuenow", "30")
    |> assert_attribute("aria-valuemin", "0")
    |> assert_attribute("aria-valuemax", "100")
    |> assert_attribute("aria-valuetext", "30%")
  end

  test "renders custom aria label" do
    assigns = %{}

    ~H|<.radial_progress value={30} max={100} aria_label="Storage usage" />|
    |> parse_component()
    |> assert_attribute("aria-label", "Storage usage")
  end

  test "renders custom aria value text" do
    assigns = %{}

    ~H|<.radial_progress value={3} max={5} aria_value_text="3 of 5 tasks complete" />|
    |> parse_component()
    |> assert_attribute("aria-valuetext", "3 of 5 tasks complete")
  end

  test "renders SVG with track and fill circles" do
    assigns = %{}

    ~H|<.radial_progress value={50} />|
    |> parse_component()
    |> assert_component("svg")
    |> assert_component("[data-exo='radial-progress-track']")
    |> assert_component("[data-exo='radial-progress-fill']")
  end

  test "renders with default max of 100" do
    assigns = %{}

    ~H|<.radial_progress value={75} />|
    |> parse_component()
    |> assert_attribute("aria-valuemax", "100")
  end

  test "renders with custom max" do
    assigns = %{}

    ~H|<.radial_progress value={5} max={10} />|
    |> parse_component()
    |> assert_attribute("aria-valuemax", "10")
  end

  test "renders with default size" do
    assigns = %{}

    ~H|<.radial_progress value={50} />|
    |> parse_component()
    |> assert_attribute("data-size", "md")
  end

  test "renders with custom size" do
    assigns = %{}

    ~H|<.radial_progress value={50} size="lg" />|
    |> parse_component()
    |> assert_attribute("data-size", "lg")
  end

  test "renders with sm size" do
    assigns = %{}

    ~H|<.radial_progress value={50} size="sm" />|
    |> parse_component()
    |> assert_attribute("data-size", "sm")
  end

  test "shows value label by default" do
    assigns = %{}

    ~H|<.radial_progress value={75} />|
    |> parse_component()
    |> assert_component("[data-exo='radial-progress-label']")
    |> assert_text("75%")
  end

  test "hides value label when show_value is false" do
    assigns = %{}

    ~H|<.radial_progress value={50} show_value={false} />|
    |> parse_component()
    |> refute_element("[data-exo='radial-progress-label']")
  end

  test "renders at 0 percent" do
    assigns = %{}

    ~H|<.radial_progress value={0} />|
    |> parse_component()
    |> assert_attribute("aria-valuenow", "0")
    |> assert_text("0%")
  end

  test "renders at 100 percent" do
    assigns = %{}

    ~H|<.radial_progress value={100} />|
    |> parse_component()
    |> assert_attribute("aria-valuenow", "100")
    |> assert_text("100%")
  end

  test "clamps value above max for visual and aria output" do
    assigns = %{}

    ~H|<.radial_progress value={125} max={100} />|
    |> parse_component()
    |> assert_attribute("aria-valuenow", "100")
    |> assert_attribute("aria-valuetext", "100%")
    |> assert_text("100%")
  end

  test "clamps negative value for visual and aria output" do
    assigns = %{}

    ~H|<.radial_progress value={-5} max={100} />|
    |> parse_component()
    |> assert_attribute("aria-valuenow", "0")
    |> assert_attribute("aria-valuetext", "0%")
    |> assert_text("0%")
  end

  test "renders radial_progress with class" do
    assigns = %{}

    ~H|<.radial_progress value={50} class="my-progress" />|
    |> parse_component()
    |> assert_class("my-progress")
  end

  test "renders with custom inner_block content" do
    assigns = %{}

    ~H"""
    <.radial_progress value={50}>
      Custom
    </.radial_progress>
    """
    |> parse_component()
    |> assert_component("[data-exo='radial-progress-label']")
    |> assert_text("Custom")
  end
end
