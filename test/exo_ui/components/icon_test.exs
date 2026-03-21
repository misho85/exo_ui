defmodule ExoUI.Components.IconTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders icon" do
    assigns = %{}
    html = rendered_to_string(~H|<.icon name="calendar-days" />|)
    assert html =~ "svg"
    assert html =~ "size-4"
  end

  test "renders icon with custom class" do
    assigns = %{}
    html = rendered_to_string(~H|<.icon name="check" class="size-6" />|)
    assert html =~ "size-6"
  end

  test "renders theme_toggle" do
    assigns = %{}
    html = rendered_to_string(~H"<.theme_toggle />")
    assert html =~ ~s(data-exo="theme-toggle")
    assert html =~ ~s(data-theme-value="light")
    assert html =~ ~s(data-theme-value="dark")
    assert html =~ ~s(data-theme-value="system")
  end
end
