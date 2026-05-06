defmodule ExoUI.Components.SeparatorTest do
  use ExoUI.ComponentCase, async: true

  test "renders a decorative horizontal separator by default" do
    assigns = %{}

    ~H"<.separator />"
    |> parse_component()
    |> assert_component(~s([data-exo="separator"]))
    |> assert_attribute("data-orientation", "horizontal")
    |> assert_attribute("data-decorative", "true")
    |> assert_attribute("aria-hidden", "true")
    |> refute_attribute("role", "separator")
    |> refute_attribute("aria-orientation", "horizontal")
  end

  test "renders vertical separator" do
    assigns = %{}

    ~H|<.separator orientation="vertical" />|
    |> parse_component()
    |> assert_attribute("data-orientation", "vertical")
    |> assert_attribute("aria-hidden", "true")
  end

  test "renders semantic separator when decorative is false" do
    assigns = %{}

    ~H|<.separator decorative={false} orientation="vertical" label="Panel sections" />|
    |> parse_component()
    |> assert_attribute("data-decorative", "false")
    |> assert_attribute("role", "separator")
    |> assert_attribute("aria-orientation", "vertical")
    |> assert_attribute("aria-label", "Panel sections")
    |> refute_attribute("aria-hidden", "true")
  end
end
