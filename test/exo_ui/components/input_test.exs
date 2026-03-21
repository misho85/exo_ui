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
    html = rendered_to_string(~H|<.input type="checkbox" name="agree" value="true" label="I agree" />|)
    assert html =~ ~s(type="checkbox")
    assert html =~ "I agree"
  end

  test "shows errors" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="text" name="email" value="" errors={["is required"]} />|)
    assert html =~ ~s(data-invalid)
    assert html =~ "is required"
  end
end
