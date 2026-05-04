defmodule ExoUI.Components.InputTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders text input with data-exo attribute" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="text" name="email" value="" />|)
    assert html =~ ~s(data-exo="input")
    assert html =~ ~s(type="text")
    assert html =~ ~s(name="email")
  end

  test "renders input with label" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="text" name="email" value="" label="Email" />|)
    assert html =~ ~s(data-exo="label")
    assert html =~ "Email"
  end

  test "renders textarea" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="textarea" name="bio" value="hello" />|)
    assert html =~ "textarea"
    assert html =~ ~s(data-exo="input")
  end

  test "renders hidden input" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="hidden" name="id" value="123" />|)
    assert html =~ ~s(type="hidden")
    assert html =~ ~s(value="123")
  end

  test "renders checkbox" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.input type="checkbox" name="agree" value="true" label="I agree" />|)

    assert html =~ ~s(type="checkbox")
    assert html =~ "I agree"
  end

  test "does not submit checkbox false fallback when disabled" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="checkbox" name="agree" disabled />|)

    assert html =~ ~s(type="hidden" name="agree" value="false" disabled)
  end

  test "does not render checkbox false fallback without a name" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="checkbox" label="Agree" />|)

    refute html =~ ~s(type="hidden")
  end

  test "shows errors" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="text" name="email" value="" errors={["is required"]} />|
      )

    assert html =~ ~s(data-invalid)
    assert html =~ "is required"
  end

  test "connects description and errors with aria-describedby" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="email" name="email" value="" description="Work email" errors={["is invalid"]} />|
      )

    assert html =~ ~s(id="email")
    assert html =~ ~s(id="email-description")
    assert html =~ ~s(id="email-error")
    assert html =~ ~s(aria-describedby="email-description email-error")
    assert html =~ ~s(aria-invalid="true")
    assert html =~ ~s(role="alert")
  end

  test "connects textarea description and errors with aria" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="textarea" name="bio" value="" description="Short bio" errors={["too short"]} />|
      )

    assert html =~ ~s(id="bio")
    assert html =~ ~s(aria-describedby="bio-description bio-error")
    assert html =~ ~s(aria-invalid="true")
  end

  test "connects checkbox description and errors with aria" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.input
  type="checkbox"
  name="agree"
  label="Agree"
  description="Required for signup"
  errors={["must be accepted"]}
/>|)

    assert html =~ ~s(id="agree")
    assert html =~ ~s(id="agree-description")
    assert html =~ ~s(id="agree-error")
    assert html =~ ~s(aria-describedby="agree-description agree-error")
    assert html =~ ~s(aria-invalid="true")
  end

  test "renders description" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="text" name="email" value="" description="Your work email" />|
      )

    assert html =~ ~s(data-exo="field-description")
    assert html =~ "Your work email"
  end

  test "does not render description when not provided" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="text" name="email" value="" />|)
    refute html =~ "field-description"
  end

  test "renders textarea with description" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="textarea" name="bio" value="" description="Tell us about yourself" />|
      )

    assert html =~ ~s(data-exo="field-description")
    assert html =~ "Tell us about yourself"
  end

  test "renders disabled input" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="text" name="email" value="" disabled />|)
    assert html =~ "disabled"
  end
end
