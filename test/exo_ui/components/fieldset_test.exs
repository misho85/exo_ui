defmodule ExoUI.Components.FieldsetTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders fieldset with legend" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.fieldset legend="Personal">
        <span>content</span>
      </.fieldset>
      """)

    assert html =~ ~s(data-exo="fieldset")
    assert html =~ "Personal"
    assert html =~ "<legend"
  end

  test "renders fieldset with description" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.fieldset legend="Info" description="Fill in your details">
        <span>content</span>
      </.fieldset>
      """)

    assert html =~ ~s(data-exo="fieldset-description")
    assert html =~ "Fill in your details"
  end

  test "renders disabled fieldset" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.fieldset disabled>
        <span>content</span>
      </.fieldset>
      """)

    assert html =~ "disabled"
  end

  test "connects description and errors with aria-describedby" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.fieldset legend="Billing" description="Payment details" errors={["incomplete"]}>
        <span>content</span>
      </.fieldset>
      """)

    assert html =~ ~s(id="Billing")
    assert html =~ ~s(id="Billing-legend")
    assert html =~ ~s(id="Billing-description")
    assert html =~ ~s(id="Billing-error")
    assert html =~ ~s(aria-describedby="Billing-description Billing-error")
    assert html =~ ~s(aria-invalid="true")
    assert html =~ ~s(role="alert")
  end
end
