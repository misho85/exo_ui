defmodule ExoUI.Components.KbdTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders kbd" do
    assigns = %{}
    html = rendered_to_string(~H"<.kbd>K</.kbd>")
    assert html =~ ~s(data-exo="kbd")
    assert html =~ "K"
    assert html =~ "<kbd"
  end
end
