defmodule ExoUI.Components.ToggleTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders toggle" do
    assigns = %{}
    html = rendered_to_string(~H"<.toggle />")
    assert html =~ ~s(data-exo="toggle")
    assert html =~ ~s(data-exo="toggle-track")
    assert html =~ ~s(data-exo="toggle-thumb")
  end

  test "renders checked toggle" do
    assigns = %{}
    html = rendered_to_string(~H|<.toggle checked={true} />|)
    assert html =~ ~s(data-checked)
  end
end
