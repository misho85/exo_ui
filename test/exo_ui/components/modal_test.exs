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
    assert html =~ ~s(aria-hidden="true")
    assert html =~ ~s(inert)
    assert html =~ ~s(phx-hook="ExoOverlay")
    assert html =~ ~s(data-exo="modal-content")
    assert html =~ ~s(role="dialog")
    assert html =~ ~s(aria-modal="true")
    assert html =~ ~s(aria-label="Dialog")
    assert html =~ ~s(aria-describedby="test-modal-body")
    assert html =~ ~s(id="test-modal-body")
    assert html =~ ~s(type="button")
    assert html =~ ~s(aria-label="Close")
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
    assert html =~ ~s(aria-labelledby="test-modal-title")
    refute html =~ ~s(aria-label="Dialog")
    assert html =~ "My Title"
  end

  test "renders modal with custom accessible label when title is omitted" do
    assigns = %{}

    html = rendered_to_string(~H|<.modal id="test-modal" label="Preferences">Content</.modal>|)

    assert html =~ ~s(aria-label="Preferences")
  end

  test "renders modal with open state" do
    assigns = %{}
    html = rendered_to_string(~H|<.modal id="test-modal" show={true}>Content</.modal>|)
    {:ok, tree} = Floki.parse_fragment(html)

    assert html =~ ~s(data-state="open")
    assert html =~ ~s(aria-hidden="false")
    assert Floki.find(tree, "#test-modal[inert]") == []
  end

  test "renders confirm modal" do
    assigns = %{}
    html = rendered_to_string(~H|<.confirm_modal id="confirm" message="Are you sure?" />|)
    assert html =~ ~s(data-exo="modal")
    assert html =~ ~s(role="alertdialog")
    assert html =~ "Are you sure?"
    assert html =~ "Confirm"
    assert html =~ "Cancel"
  end
end
