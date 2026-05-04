defmodule ExoUI.Components.ToggleTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders toggle" do
    assigns = %{}
    html = rendered_to_string(~H"<.toggle />")
    assert html =~ ~s(data-exo="toggle")
    assert html =~ ~s(data-exo="toggle-track")
    assert html =~ ~s(data-exo="toggle-thumb")
    assert html =~ ~s(role="switch")
    assert html =~ ~s(aria-label="Toggle")
  end

  test "renders custom aria label for unlabeled toggle" do
    assigns = %{}
    html = rendered_to_string(~H|<.toggle aria_label="Enable email alerts" />|)
    assert html =~ ~s(aria-label="Enable email alerts")
  end

  test "renders checked toggle" do
    assigns = %{}
    html = rendered_to_string(~H|<.toggle checked={true} />|)
    assert html =~ ~s(data-checked)
  end

  test "does not submit toggle false fallback when disabled" do
    assigns = %{}
    html = rendered_to_string(~H|<.toggle name="active" disabled />|)

    assert html =~ ~s(type="hidden" name="active" value="false" disabled)
  end

  test "renders toggle with label" do
    assigns = %{}
    html = rendered_to_string(~H|<.toggle name="active" label="Active" />|)
    assert html =~ ~s(data-exo="field")
    assert html =~ ~s(role="switch")
    refute html =~ ~s(aria-label="Toggle")
    assert html =~ "Active"
  end

  test "renders toggle with field struct" do
    assigns = %{form: Phoenix.Component.to_form(%{"active" => "true"})}
    html = rendered_to_string(~H|<.toggle field={@form[:active]} />|)
    assert html =~ ~s(name="active")
    assert html =~ ~s(checked)
  end

  test "renders toggle with errors" do
    assigns = %{}
    html = rendered_to_string(~H|<.toggle name="active" errors={["must be accepted"]} />|)
    assert html =~ ~s(data-exo="field-error")
    assert html =~ "must be accepted"
    assert html =~ ~s(id="active-error")
    assert html =~ ~s(aria-describedby="active-error")
    assert html =~ ~s(aria-invalid="true")
  end

  test "renders toggle with description" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.toggle name="active" label="Active" description="Enable notifications" />|
      )

    assert html =~ ~s(data-exo="field-description")
    assert html =~ "Enable notifications"
    assert html =~ ~s(id="active-description")
    assert html =~ ~s(aria-describedby="active-description")
  end

  test "renders toggle without field wrapper when no label or errors" do
    assigns = %{}
    html = rendered_to_string(~H|<.toggle name="active" />|)
    refute html =~ ~s(data-exo="field")
    assert html =~ ~s(data-exo="toggle")
  end
end
