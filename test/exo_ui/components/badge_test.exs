defmodule ExoUI.Components.BadgeTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders daisyUI's plain badge without a variant" do
    assigns = %{}
    html = rendered_to_string(~H"<.badge>New</.badge>")
    assert html =~ ~s(data-exo="badge")
    refute html =~ "data-variant"
    assert html =~ ~s(data-size="md")
    assert html =~ "New"
  end

  test "renders badge with custom variant" do
    assigns = %{}
    html = rendered_to_string(~H|<.badge variant="success">Done</.badge>|)
    assert html =~ ~s(data-variant="success")
  end

  test "renders badge size and optional icon" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.badge variant="success" size="lg" icon="circle-check">Done</.badge>|
      )

    assert html =~ ~s(data-size="lg")
    assert html =~ ~s(data-exo="icon")
    assert html =~ ~s(aria-hidden="true")
  end
end
