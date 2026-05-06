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

  test "renders selected-file summary output" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.file_input name="documents" label="Documents" show_selected empty_label="Nothing attached" />
      """)

    assert html =~ ~s(id="documents-file-field")
    assert html =~ ~s(phx-hook="ExoFileInput")
    assert html =~ ~s(data-exo-file-input="input")
    assert html =~ ~s(id="documents-selected")
    assert html =~ ~s(data-exo="file-input-selected")
    assert html =~ ~s(for="documents")
    assert html =~ ~s(role="status")
    assert html =~ ~s(aria-describedby="documents-selected")
    assert html =~ "Nothing attached"
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

  test "connects selected-file summary with description and errors" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.file_input
        name="avatar"
        label="Avatar"
        show_selected
        description="PNG or JPG"
        errors={["is required"]}
      />
      """)

    assert html =~ ~s(id="avatar-selected")
    assert html =~ ~s(aria-describedby="avatar-description avatar-selected avatar-error")
  end

  test "renders file input with field struct" do
    assigns = %{form: Phoenix.Component.to_form(%{"avatar" => ""})}

    html = rendered_to_string(~H|<.file_input field={@form[:avatar]} />|)

    assert html =~ ~s(id="avatar")
    assert html =~ ~s(name="avatar")
    assert html =~ ~s(type="file")
  end
end
