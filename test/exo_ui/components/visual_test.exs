defmodule ExoUI.Components.VisualTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders avatar with initials" do
    assigns = %{}
    html = rendered_to_string(~H|<.avatar name="John Doe" />|)
    assert html =~ ~s(data-exo="avatar")
    assert html =~ "JD"
  end

  test "renders avatar with image" do
    assigns = %{}
    html = rendered_to_string(~H|<.avatar name="John" src="/img.jpg" />|)
    assert html =~ ~s(src="/img.jpg")
  end

  test "renders skeleton" do
    assigns = %{}
    html = rendered_to_string(~H|<.skeleton type="text" rows={3} />|)
    assert html =~ ~s(data-exo="skeleton")
    assert html =~ ~s(data-type="text")
  end

  test "renders empty_state" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.empty_state icon="search" title="No results" subtitle="Try a different search" />|
      )

    assert html =~ ~s(data-exo="empty-state")
    assert html =~ ~s(data-exo="empty-state-icon")
    assert html =~ ~s(data-exo="icon")
    assert html =~ ~s(aria-hidden="true")
    assert html =~ "No results"
    assert html =~ "Try a different search"
  end

  test "renders alert" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.alert kind={:success} title="Done">
        Operation completed.
      </.alert>
      """)

    assert html =~ ~s(data-exo="alert")
    assert html =~ ~s(data-kind="success")
    assert html =~ "Done"
    assert html =~ "Operation completed."
  end
end
