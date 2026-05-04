defmodule ExoUI.Components.FileInputTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders file input" do
    assigns = %{}
    html = rendered_to_string(~H|<.file_input name="avatar" />|)
    assert html =~ ~s(data-exo="file-input")
    assert html =~ ~s(type="file")
    assert html =~ ~s(name="avatar")
  end

  test "renders with label" do
    assigns = %{}
    html = rendered_to_string(~H|<.file_input name="f" label="Upload" />|)
    assert html =~ "Upload"
    assert html =~ ~s(data-exo="label")
  end

  test "renders with accept and multiple" do
    assigns = %{}
    html = rendered_to_string(~H|<.file_input name="f" accept="image/*" multiple />|)
    assert html =~ ~s(accept="image/*")
    assert html =~ "multiple"
  end

  test "connects description and errors with aria-describedby" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.file_input name="avatar" label="Avatar" description="PNG or JPG" errors={["is required"]} />|
      )

    assert html =~ ~s(id="avatar")
    assert html =~ ~s(for="avatar")
    assert html =~ ~s(id="avatar-description")
    assert html =~ ~s(id="avatar-error")
    assert html =~ ~s(aria-describedby="avatar-description avatar-error")
    assert html =~ ~s(aria-invalid="true")
    assert html =~ ~s(data-invalid)
    assert html =~ ~s(role="alert")
  end
end
