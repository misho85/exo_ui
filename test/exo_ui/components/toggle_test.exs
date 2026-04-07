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
  end

  test "renders checked toggle" do
    assigns = %{}
    html = rendered_to_string(~H|<.toggle checked={true} />|)
    assert html =~ ~s(data-checked)
  end

  test "renders toggle with label" do
    assigns = %{}
    html = rendered_to_string(~H|<.toggle name="active" label="Active" />|)
    assert html =~ ~s(data-exo="field")
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
  end

  test "renders toggle with description" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.toggle name="active" label="Active" description="Enable notifications" />|
      )

    assert html =~ ~s(data-exo="field-description")
    assert html =~ "Enable notifications"
  end

  test "renders toggle without field wrapper when no label or errors" do
    assigns = %{}
    html = rendered_to_string(~H|<.toggle name="active" />|)
    refute html =~ ~s(data-exo="field")
    assert html =~ ~s(data-exo="toggle")
  end
end
