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
    assert html =~ "Saved!"
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
    assert html =~ "Saved"
  end
end
