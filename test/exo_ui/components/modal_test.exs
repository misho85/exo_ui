defmodule ExoUI.Components.ModalTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders modal with data-exo attributes" do
    assigns = %{}
    html = rendered_to_string(~H|<.modal id="test-modal">Content</.modal>|)
    assert html =~ ~s(data-exo="modal")
    assert html =~ ~s(data-state="closed")
    assert html =~ ~s(data-exo="modal-content")
    assert html =~ ~s(role="dialog")
    assert html =~ ~s(aria-modal="true")
    assert html =~ "Content"
  end

  test "renders modal with title slot" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.modal id="test-modal">
        <:title>My Title</:title>
        Body
      </.modal>
      """)

    assert html =~ ~s(data-exo="modal-title")
    assert html =~ "My Title"
  end

  test "renders modal with open state" do
    assigns = %{}
    html = rendered_to_string(~H|<.modal id="test-modal" show={true}>Content</.modal>|)
    assert html =~ ~s(data-state="open")
  end

  test "renders confirm modal" do
    assigns = %{}
    html = rendered_to_string(~H|<.confirm_modal id="confirm" message="Are you sure?" />|)
    assert html =~ ~s(data-exo="modal")
    assert html =~ "Are you sure?"
    assert html =~ "Confirm"
    assert html =~ "Cancel"
  end
end
