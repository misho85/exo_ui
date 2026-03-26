defmodule ExoUI.Components.RadioGroupTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders radio group with data-exo attribute" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.radio_group name="color" options={[{"Red", "red"}, {"Blue", "blue"}]} />|
      )

    assert html =~ ~s(data-exo="radio-group")
    assert html =~ ~s(data-exo="radio-item")
    assert html =~ ~s(data-exo="radio")
    assert html =~ ~s(type="radio")
  end

  test "renders radio group options with labels" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.radio_group name="size" options={[{"Small", "sm"}, {"Large", "lg"}]} />|
      )

    assert html =~ "Small"
    assert html =~ "Large"
    assert html =~ ~s(value="sm")
    assert html =~ ~s(value="lg")
  end

  test "renders radio group with selected value" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.radio_group name="color" value="blue" options={[{"Red", "red"}, {"Blue", "blue"}]} />|
      )

    assert html =~ "checked"
  end

  test "renders radio group with label" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.radio_group name="color" label="Pick a color" options={[{"Red", "red"}]} />|
      )

    assert html =~ ~s(data-exo="label")
    assert html =~ "Pick a color"
  end

  test "renders radio group without label when not provided" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.radio_group name="color" options={[{"Red", "red"}]} />|)

    refute html =~ "legend"
  end

  test "renders radio group with correct name on all inputs" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.radio_group name="fruit" options={[{"Apple", "a"}, {"Banana", "b"}]} />|
      )

    assert html =~ ~s(name="fruit")
  end

  test "renders radio group with errors" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.radio_group name="color" options={[{"Red", "red"}]} errors={["is required"]} />|
      )

    assert html =~ ~s(data-exo="field-error")
    assert html =~ "is required"
  end

  test "renders radio group with class" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.radio_group name="color" options={[{"Red", "red"}]} class="my-group" />|
      )

    assert html =~ ~s(class="my-group")
  end

  test "renders radio group as fieldset" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.radio_group name="color" options={[{"Red", "red"}]} />|)

    assert html =~ "<fieldset"
    assert html =~ "</fieldset>"
  end
end
