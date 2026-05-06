defmodule ExoUI.Components.IconTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders icon" do
    assigns = %{}
    html = rendered_to_string(~H|<.icon name="calendar-days" />|)
    assert html =~ "svg"
    assert html =~ ~s(data-exo="icon")
    assert html =~ ~s(aria-hidden="true")
    assert html =~ ~s(focusable="false")
    assert html =~ "size-4"
    refute html =~ ~s(data-missing-icon=)
  end

  test "renders icon with custom class" do
    assigns = %{}
    html = rendered_to_string(~H|<.icon name="check" class="size-6" />|)
    assert html =~ "size-6"
  end

  test "renders accessible icon when aria attributes are provided" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.icon name="calendar-days" role="img" aria-hidden="false" aria-label="Calendar" />|
      )

    assert html =~ ~s(role="img")
    assert html =~ ~s(aria-hidden="false")
    assert html =~ ~s(aria-label="Calendar")
  end

  test "renders a stable fallback for unknown icon names" do
    assigns = %{}
    html = rendered_to_string(~H|<.icon name="not-a-lucide-icon" class="size-6" />|)

    assert html =~ "svg"
    assert html =~ ~s(data-exo="icon")
    assert html =~ ~s(data-missing-icon="not-a-lucide-icon")
    assert html =~ ~s(class="size-6")
  end

  test "renders theme_toggle" do
    assigns = %{}
    html = rendered_to_string(~H"<.theme_toggle />")
    assert html =~ ~s(data-exo="theme-toggle")
    assert html =~ ~s(role="group")
    assert html =~ ~s(aria-label="Theme")
    assert html =~ ~s(type="button")
    assert html =~ ~s(aria-pressed="false")
    assert html =~ ~s(data-theme-value="light")
    assert html =~ ~s(data-theme-value="dark")
    assert html =~ ~s(data-theme-value="system")
  end
end
