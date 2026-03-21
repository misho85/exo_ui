defmodule ExoUI.Components.ButtonTest do
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders button with data-exo attribute" do
    assigns = %{}
    html = rendered_to_string(~H"<.button>Click</.button>")
    assert html =~ ~s(data-exo="btn")
    assert html =~ "Click"
  end

  test "renders button with variant" do
    assigns = %{}
    html = rendered_to_string(~H|<.button variant="primary">Click</.button>|)
    assert html =~ ~s(data-variant="primary")
  end

  test "renders button with size" do
    assigns = %{}
    html = rendered_to_string(~H|<.button size="sm">Click</.button>|)
    assert html =~ ~s(data-size="sm")
  end
end
