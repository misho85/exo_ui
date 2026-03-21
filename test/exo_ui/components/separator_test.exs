defmodule ExoUI.Components.SeparatorTest do
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders horizontal separator by default" do
    assigns = %{}
    html = rendered_to_string(~H"<.separator />")
    assert html =~ ~s(data-exo="separator")
    assert html =~ ~s(data-orientation="horizontal")
    assert html =~ ~s(role="separator")
  end

  test "renders vertical separator" do
    assigns = %{}
    html = rendered_to_string(~H|<.separator orientation="vertical" />|)
    assert html =~ ~s(data-orientation="vertical")
  end
end
