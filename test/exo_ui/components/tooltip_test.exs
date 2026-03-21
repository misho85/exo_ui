defmodule ExoUI.Components.TooltipTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders tooltip" do
    assigns = %{}
    html = rendered_to_string(~H|<.tooltip text="Help text">Hover me</.tooltip>|)
    assert html =~ ~s(data-exo="tooltip")
    assert html =~ ~s(data-exo="tooltip-text")
    assert html =~ "Help text"
    assert html =~ "Hover me"
  end

  test "renders tooltip with position" do
    assigns = %{}
    html = rendered_to_string(~H|<.tooltip text="tip" position="bottom">X</.tooltip>|)
    assert html =~ ~s(data-position="bottom")
  end
end
