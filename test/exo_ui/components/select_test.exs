defmodule ExoUI.Components.SelectTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders select with options" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s1" name="status" value="active" prompt="Choose...">
        <:option value="active">Active</:option>
        <:option value="inactive">Inactive</:option>
      </.select>
      """)

    assert html =~ ~s(data-exo="popover")
    assert html =~ ~s(popovertarget="s1")
    assert html =~ ~s(role="listbox")
    assert html =~ ~s(role="option")
    assert html =~ ~s(popover="auto")
    assert html =~ "Active"
    assert html =~ "Inactive"
  end

  test "renders trigger indicator through ExoUI icon" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s-icon" name="status">
        <:option value="active">Active</:option>
      </.select>
      """)

    assert html =~ ~s(data-exo="select-icon")
    assert html =~ ~s(data-exo="icon")
    assert html =~ ~s(aria-hidden="true")
    assert html =~ ~s(focusable="false")
  end

  test "renders select from options attr" do
    assigns = %{roles: [{"Admin", "admin"}, {"Editor", "editor"}]}

    html =
      rendered_to_string(~H"""
      <.select id="s-options" name="role" value="editor" label="Role" options={@roles} />
      """)

    assert html =~ ~s(data-exo="select-option")
    assert html =~ ~s(data-value="admin")
    assert html =~ ~s(data-value="editor")
    assert html =~ ~s(value="editor")

    [trigger_part | _] = String.split(html, ~s(popover="auto"))
    assert trigger_part =~ "Editor"
  end

  test "renders grouped and disabled option maps from options attr" do
    assigns = %{
      roles: [
        {"Admin", [%{label: "Owner", value: "owner", disabled: true}]},
        {"Team", [%{label: "Member", value: "member"}]}
      ]
    }

    html =
      rendered_to_string(~H"""
      <.select id="s-grouped-options" name="role" options={@roles} />
      """)

    assert html =~ ~s(role="group")
    assert html =~ ~s(aria-label="Admin")
    assert html =~ ~s(data-value="owner")
    assert html =~ ~s(data-disabled)
    assert html =~ ~s(aria-disabled="true")
    assert html =~ "Member"
  end

  test "renders hidden input for form" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s2" name="status" value="active">
        <:option value="active">Active</:option>
      </.select>
      """)

    assert html =~ ~s(type="hidden")
    assert html =~ ~s(name="status")
    assert html =~ ~s(value="active")
  end

  test "renders aria-selected on options" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s3" name="x" value="a">
        <:option value="a">A</:option>
        <:option value="b">B</:option>
      </.select>
      """)

    assert html =~ ~s(aria-selected="true")
    assert html =~ ~s(aria-selected="false")
  end

  test "renders prompt when no value" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s4" name="x" prompt="Pick one">
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ "Pick one"
  end

  test "renders label and aria-labelledby" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s5" name="x" label="Role">
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(data-exo="label")
    assert html =~ "Role"
    assert html =~ ~s(id="s5-label")
    assert html =~ ~s(id="s5-value")
    assert html =~ ~s(aria-labelledby="s5-label s5-value")
  end

  test "button trigger accessible name includes label and selected value" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s5-value-name" name="x" value="admin" label="Role">
        <:option value="admin">Admin</:option>
        <:option value="editor">Editor</:option>
      </.select>
      """)

    assert html =~ ~s(id="s5-value-name-label")
    assert html =~ ~s(id="s5-value-name-value")
    assert html =~ ~s(aria-labelledby="s5-value-name-label s5-value-name-value")

    [trigger_part | _] = String.split(html, ~s(popover="auto"))
    assert trigger_part =~ "Role"
    assert trigger_part =~ "Admin"
  end

  test "renders option with icon" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s6" name="x">
        <:option value="a" icon="star">A</:option>
      </.select>
      """)

    assert html =~ ~s(data-exo="select-option-icon")
  end

  test "renders disabled option" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s7" name="x">
        <:option value="a" disabled>A</:option>
      </.select>
      """)

    assert html =~ ~s(data-disabled)
    assert html =~ ~s(aria-disabled="true")
  end

  test "renders grouped options" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s8" name="x">
        <:option value="a" group="G1">A</:option>
        <:option value="b" group="G1">B</:option>
        <:option value="c" group="G2">C</:option>
      </.select>
      """)

    assert html =~ ~s(role="group")
    assert html =~ "G1"
    assert html =~ "G2"
  end

  test "renders errors" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s9" name="x" errors={["required"]}>
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(data-invalid)
    assert html =~ ~s(data-exo="field-error")
    assert html =~ "required"
  end

  test "connects description and errors to trigger with aria-describedby" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s-aria" name="role" description="Choose one role" errors={["required"]}>
        <:option value="admin">Admin</:option>
      </.select>
      """)

    assert html =~ ~s(id="s-aria-description")
    assert html =~ ~s(id="s-aria-error")
    assert html =~ ~s(aria-describedby="s-aria-description s-aria-error")
    assert html =~ ~s(aria-invalid="true")
    assert html =~ ~s(role="alert")
  end

  test "renders with field struct" do
    assigns = %{form: Phoenix.Component.to_form(%{"role" => "admin"})}

    html =
      rendered_to_string(~H"""
      <.select id="s10" field={@form[:role]}>
        <:option value="admin">Admin</:option>
      </.select>
      """)

    assert html =~ ~s(name="role")
    assert html =~ ~s(value="admin")
  end

  test "renders anchor positioning styles" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s11" name="x">
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(anchor-name: --select-s11)
    assert html =~ ~s(position-anchor: --select-s11)
  end

  test "sets aria-haspopup=listbox" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s12" name="x">
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(aria-haspopup="listbox")
    assert html =~ ~s(aria-expanded="false")
    assert html =~ ~s(aria-controls="s12-listbox")
    assert html =~ ~s(id="s12-listbox")
  end

  test "shows selected option label in trigger" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s13" name="x" value="b">
        <:option value="a">Alpha</:option>
        <:option value="b">Beta</:option>
      </.select>
      """)

    assert html =~ ~s(data-exo="select-value")
    # The trigger should show "Beta" since value="b"
  end

  test "renders checkmark on ALL options (CSS controls visibility)" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s14" name="x" value="a">
        <:option value="a">A</:option>
        <:option value="b">B</:option>
      </.select>
      """)

    assert html =~ ~s(data-selected)
    # Checkmark span exists on every option, not just selected
    check_count = html |> String.split(~s(data-exo="select-check")) |> length()
    # 2 options + 1 for the part before first match = 3
    assert check_count == 3
  end

  test "shows selected option text in trigger" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s15" name="x" value="b">
        <:option value="a">Alpha</:option>
        <:option value="b">Beta</:option>
      </.select>
      """)

    [trigger_part | _] = String.split(html, ~s(popover="auto"))
    assert trigger_part =~ "Beta"
  end

  test "shows prompt when value matches no option" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s16" name="x" value="nonexistent" prompt="Select...">
        <:option value="a">A</:option>
      </.select>
      """)

    [trigger_part | _] = String.split(html, ~s(popover="auto"))
    assert trigger_part =~ "Select..."
  end

  test "renders disabled trigger" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s17" name="x" value="a" disabled>
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(disabled)

    {:ok, doc} = Floki.parse_document(html)
    [hidden] = Floki.find(doc, ~s(input[type="hidden"][name="x"]))
    assert Floki.attribute(hidden, "disabled") == ["disabled"]
    assert Floki.attribute(hidden, "value") == ["a"]
  end

  test "defaults to bottom/start alignment" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s18" name="x">
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(data-side="bottom")
    assert html =~ ~s(data-align="start")
  end

  test "ungrouped options have no group wrapper" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s19" name="x">
        <:option value="a">A</:option>
        <:option value="b">B</:option>
      </.select>
      """)

    refute html =~ ~s(role="group")
  end

  test "hidden input has empty value when no value set" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s20" name="status">
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(name="status")
    assert html =~ ~s(value="")
  end

  test "renders with custom side and align" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s21" name="x" side="top" align="end">
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(data-side="top")
    assert html =~ ~s(data-align="end")
  end

  test "renders description" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s22" name="x" description="Choose your role">
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(data-exo="field-description")
    assert html =~ "Choose your role"
  end

  test "does not render description when not provided" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s23" name="x">
        <:option value="a">A</:option>
      </.select>
      """)

    refute html =~ "field-description"
  end

  test "forwards class and rest attrs to field wrapper" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.select id="s24" name="x" class="field-shell" data-track="select">
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(class="field-shell")
    assert html =~ ~s(data-track="select")
  end
end
