defmodule ExoUI.Components.ModalTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components
  alias Phoenix.LiveView.JS

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

  test "modal can leave cancel handling open to the caller" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.modal id="custom-cancel" on_cancel={JS.push("modal-cancelled")} close_on_cancel={false}>
        Content
      </.modal>
      """)

    {:ok, tree} = Floki.parse_fragment(html)
    [close_button] = Floki.find(tree, ~s([data-exo="modal-close"]))
    click = close_button |> Floki.attribute("phx-click") |> List.first()

    assert click =~ "modal-cancelled"
    refute click =~ "data-state"
    refute click =~ "aria-hidden"
    refute click =~ "inert"
  end

  test "confirm modal can keep confirm action open for server validation" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.confirm_modal
        id="confirm"
        message="Validate first?"
        close_on_confirm={false}
        on_confirm={JS.push("validate-delete")}
      />
      """)

    {:ok, tree} = Floki.parse_fragment(html)
    [_cancel, confirm] = Floki.find(tree, ~s([data-exo="btn"]))
    click = confirm |> Floki.attribute("phx-click") |> List.first()

    assert click =~ "validate-delete"
    refute click =~ "data-state"
    refute click =~ "aria-hidden"
    refute click =~ "inert"
  end

  test "modal JS helpers are public and target the modal contract" do
    assert %JS{
             ops: [
               ["set_attr", %{to: "#test-modal", attr: ["data-state", "open"]}],
               ["set_attr", %{to: "#test-modal", attr: ["aria-hidden", "false"]}],
               ["remove_attr", %{to: "#test-modal", attr: "inert"}],
               ["show", %{to: "#test-modal"}],
               ["focus_first", %{to: "#test-modal [data-exo=\"modal-content\"]"}]
             ]
           } = show_modal("test-modal")

    assert %JS{
             ops: [
               ["set_attr", %{to: "#test-modal", attr: ["data-state", "closed"]}],
               ["set_attr", %{to: "#test-modal", attr: ["aria-hidden", "true"]}],
               ["set_attr", %{to: "#test-modal", attr: ["inert", "true"]}],
               ["hide", %{to: "#test-modal"}],
               ["pop_focus", %{}]
             ]
           } = hide_modal("test-modal")
  end

  test "component facade exposes overlay JS helpers" do
    assert %JS{} = ExoUI.Components.show_modal("modal")
    assert %JS{} = ExoUI.Components.hide_modal("modal")
    assert %JS{} = ExoUI.Components.hide_modal(JS.push("closed"), "modal")
    assert %JS{} = ExoUI.Components.show_drawer("drawer")
    assert %JS{} = ExoUI.Components.hide_drawer("drawer")
    assert %JS{} = ExoUI.Components.hide_drawer(JS.push("closed"), "drawer")
    assert %JS{} = ExoUI.Components.show_sheet("sheet")
    assert %JS{} = ExoUI.Components.hide_sheet("sheet")
    assert %JS{} = ExoUI.Components.hide_sheet(JS.push("closed"), "sheet")
    assert %JS{} = ExoUI.Components.show_command_palette("command")
    assert %JS{} = ExoUI.Components.hide_command_palette("command")
    assert %JS{} = ExoUI.Components.hide_command_palette(JS.push("closed"), "command")
  end
end
