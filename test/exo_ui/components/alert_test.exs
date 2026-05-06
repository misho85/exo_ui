defmodule ExoUI.Components.AlertTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders informative alerts as polite status regions" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.alert id="saved-alert" kind={:success} title="Saved" icon="circle-check">
        Settings were saved.
      </.alert>
      """)

    assert html =~ ~s(id="saved-alert")
    assert html =~ ~s(role="status")
    assert html =~ ~s(aria-live="polite")
    assert html =~ ~s(aria-atomic="true")
    assert html =~ ~s(aria-labelledby="saved-alert-title")
    assert html =~ ~s(aria-describedby="saved-alert-message")
    assert html =~ ~s(id="saved-alert-title")
    assert html =~ ~s(id="saved-alert-message")
    assert html =~ ~s(data-exo="alert-icon")
    assert html =~ ~s(data-exo="icon")
  end

  test "renders warning and error alerts as assertive alert regions" do
    assigns = %{}

    warning =
      rendered_to_string(~H"""
      <.alert kind={:warning} title="Review">
        This action needs review.
      </.alert>
      """)

    error =
      rendered_to_string(~H"""
      <.alert kind={:error} title="Failed">
        Save failed.
      </.alert>
      """)

    assert warning =~ ~s(role="alert")
    assert warning =~ ~s(aria-live="assertive")
    assert error =~ ~s(role="alert")
    assert error =~ ~s(aria-live="assertive")
  end

  test "renders action slot and allows explicit live-region override" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.alert kind={:info} title="Queued" role="note" live="off">
        Export is queued.
        <:action>
          <button type="button">Review</button>
        </:action>
      </.alert>
      """)

    assert html =~ ~s(role="note")
    assert html =~ ~s(aria-live="off")
    assert html =~ ~s(data-exo="alert-action")
    assert html =~ "Review"
  end
end
