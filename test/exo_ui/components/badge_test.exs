defmodule ExoUI.Components.BadgeTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders badge with default variant" do
    assigns = %{}
    html = rendered_to_string(~H"<.badge>New</.badge>")
    assert html =~ ~s(data-exo="badge")
    assert html =~ ~s(data-variant="primary")
    assert html =~ "New"
  end

  test "renders badge with custom variant" do
    assigns = %{}
    html = rendered_to_string(~H|<.badge variant="success">Done</.badge>|)
    assert html =~ ~s(data-variant="success")
  end
end
