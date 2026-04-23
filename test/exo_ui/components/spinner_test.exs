defmodule ExoUI.Components.SpinnerTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders spinner with default size" do
    assigns = %{}
    html = rendered_to_string(~H"<.spinner />")
    assert html =~ ~s(data-exo="spinner")
    assert html =~ ~s(data-size="md")
    assert html =~ ~s(role="status")
  end

  test "renders spinner with custom size" do
    assigns = %{}
    html = rendered_to_string(~H|<.spinner size="lg" />|)
    assert html =~ ~s(data-size="lg")
  end
end
