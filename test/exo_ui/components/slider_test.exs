defmodule ExoUI.Components.SliderTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders slider with data-exo attribute" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="vol" />|)
    assert html =~ ~s(data-exo="slider")
    assert html =~ ~s(data-exo="slider-field")
    assert html =~ ~s(type="range")
  end

  test "renders slider with name" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="volume" />|)
    assert html =~ ~s(name="volume")
  end

  test "renders slider with default value" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="vol" />|)
    assert html =~ ~s(value="50")
  end

  test "renders slider with custom value" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="vol" value={75} />|)
    assert html =~ ~s(value="75")
  end

  test "renders slider with min and max" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="vol" min={10} max={200} />|)
    assert html =~ ~s(min="10")
    assert html =~ ~s(max="200")
  end

  test "renders slider with default min and max" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="vol" />|)
    assert html =~ ~s(min="0")
    assert html =~ ~s(max="100")
  end

  test "renders slider with step" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="vol" step={5} />|)
    assert html =~ ~s(step="5")
  end

  test "renders slider with label" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="vol" label="Volume" />|)
    assert html =~ ~s(data-exo="label")
    assert html =~ "Volume"
  end

  test "renders slider without label when not provided" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="vol" />|)
    refute html =~ ~s(data-exo="label")
  end

  test "renders slider with class" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="vol" class="my-slider" />|)
    assert html =~ ~s(class="my-slider")
  end

  test "renders slider with disabled" do
    assigns = %{}
    html = rendered_to_string(~H|<.slider name="vol" disabled />|)
    assert html =~ "disabled"
  end

  test "connects label, description and errors with aria" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.slider name="volume" label="Volume" description="Set volume" errors={["out of range"]} />|
      )

    assert html =~ ~s(id="volume")
    assert html =~ ~s(for="volume")
    assert html =~ ~s(id="volume-description")
    assert html =~ ~s(id="volume-error")
    assert html =~ ~s(aria-describedby="volume-description volume-error")
    assert html =~ ~s(aria-invalid="true")
    assert html =~ ~s(data-invalid)
  end

  test "renders slider with field struct" do
    assigns = %{form: Phoenix.Component.to_form(%{"volume" => "35"})}

    html = rendered_to_string(~H|<.slider field={@form[:volume]} />|)

    assert html =~ ~s(id="volume")
    assert html =~ ~s(name="volume")
    assert html =~ ~s(value="35")
  end
end
