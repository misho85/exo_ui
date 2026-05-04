defmodule ExoUI.Components.FlashTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders flash" do
    assigns = %{}
    html = rendered_to_string(~H|<.flash kind={:info} flash={%{"info" => "Saved!"}} />|)
    assert html =~ ~s(data-exo="flash")
    assert html =~ ~s(data-kind="info")
    assert html =~ ~s(role="status")
    assert html =~ ~s(aria-live="polite")
    assert html =~ ~s(type="button")
    assert html =~ "Saved!"
  end

  test "renders error flash as assertive alert with labelled content" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.flash id="save-error" kind={:error} title="Error" flash={%{"error" => "Try again"}} />|
      )

    assert html =~ ~s(role="alert")
    assert html =~ ~s(aria-live="assertive")
    assert html =~ ~s(aria-labelledby="save-error-title")
    assert html =~ ~s(aria-describedby="save-error-message")
    assert html =~ ~s(id="save-error-message")
  end

  test "supports success and warning flash variants" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.flash kind={:success} flash={%{"success" => "Done"}} />
      <.flash kind={:warning} flash={%{"warning" => "Careful"}} />
      """)

    assert html =~ ~s(data-kind="success")
    assert html =~ ~s(data-kind="warning")
    assert html =~ "Done"
    assert html =~ "Careful"
  end

  test "renders flash_group" do
    assigns = %{}
    html = rendered_to_string(~H|<.flash_group flash={%{}} />|)
    assert html =~ ~s(data-exo="flash-group")
    assert html =~ "client-error"
    assert html =~ "server-error"
  end

  test "renders toast_container" do
    assigns = %{toasts: [{"t1", %{kind: :success, title: "Done", message: "Saved"}}]}
    html = rendered_to_string(~H|<.toast_container toasts={@toasts} />|)
    assert html =~ ~s(data-exo="toast-container")
    assert html =~ ~s(data-exo="toast")
    assert html =~ ~s(id="toast-container")
    assert html =~ ~s(data-placement="bottom-right")
    assert html =~ ~s(role="status")
    assert html =~ ~s(aria-describedby="t1-message")
    assert html =~ "Saved"
  end

  test "renders error toast as assertive alert and custom placement" do
    assigns = %{toasts: [{"t1", %{kind: :error, title: "Failed", message: "Retry"}}]}

    html = rendered_to_string(~H|<.toast_container toasts={@toasts} placement="top-left" />|)

    assert html =~ ~s(data-placement="top-left")
    assert html =~ ~s(role="alert")
    assert html =~ ~s(aria-live="assertive")
    assert html =~ ~s(aria-labelledby="t1-title")
    assert html =~ ~s(type="button")
  end
end
