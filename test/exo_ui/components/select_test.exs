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
    assert html =~ ~s(aria-labelledby)
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
      <.select id="s17" name="x" disabled>
        <:option value="a">A</:option>
      </.select>
      """)

    assert html =~ ~s(disabled)
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
end
