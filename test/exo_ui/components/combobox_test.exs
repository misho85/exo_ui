defmodule ExoUI.Components.ComboboxTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders combobox with button trigger" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c1" name="country" value="rs" prompt="Search...">
      <:option value="rs">Serbia</:option>
      <:option value="hr">Croatia</:option>
    </.combobox>
    """)
    assert html =~ ~s(data-exo="popover")
    assert html =~ ~s(popovertarget="c1")
    assert html =~ ~s(popover="auto")
    assert html =~ ~s(role="listbox")
    assert html =~ ~s(role="option")
    assert html =~ ~s(role="combobox")
    assert html =~ ~s(type="hidden")
    assert html =~ ~s(name="country")
    assert html =~ "Serbia"
    assert html =~ "Croatia"
  end

  test "renders search input with role=combobox inside popover for button trigger" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c2" name="x" prompt="Search...">
      <:option value="a">A</:option>
    </.combobox>
    """)
    assert html =~ ~s(data-exo="combobox-search")
    assert html =~ ~s(role="combobox")
    assert html =~ ~s(autocomplete="off")
  end

  test "renders input trigger with popover=manual" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c3" name="x" trigger="input" prompt="Type...">
      <:option value="a">A</:option>
    </.combobox>
    """)
    assert html =~ ~s(popover="manual")
    assert html =~ ~s(data-exo-combobox="input-trigger")
    assert html =~ ~s(role="combobox")
    refute html =~ ~s(popovertarget)
  end

  test "renders empty slot" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c4" name="x">
      <:option value="a">A</:option>
      <:empty>No results</:empty>
    </.combobox>
    """)
    assert html =~ ~s(data-exo="combobox-empty")
    assert html =~ "No results"
  end

  test "renders with client filter data attr" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c5" name="x" filter="client">
      <:option value="a">A</:option>
    </.combobox>
    """)
    assert html =~ ~s(data-filter="client")
  end

  test "renders with server filter" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c6" name="x" filter="server" on_filter="search">
      <:option value="a">A</:option>
    </.combobox>
    """)
    assert html =~ ~s(data-filter="server")
    assert html =~ ~s(data-on-filter="search")
  end

  test "renders loading state" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c7" name="x" loading>
      <:option value="a">A</:option>
    </.combobox>
    """)
    assert html =~ ~s(data-exo="combobox-loading")
  end

  test "renders clearable button" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c8" name="x" value="a" clearable>
      <:option value="a">A</:option>
    </.combobox>
    """)
    assert html =~ ~s(data-exo="combobox-clear")
  end

  test "renders creatable option" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c9" name="x" creatable on_create="create">
      <:option value="a">A</:option>
    </.combobox>
    """)
    assert html =~ ~s(data-exo="combobox-create")
  end

  test "renders anchor positioning styles" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c10" name="x">
      <:option value="a">A</:option>
    </.combobox>
    """)
    assert html =~ ~s(anchor-name: --combobox-c10)
    assert html =~ ~s(position-anchor: --combobox-c10)
  end

  test "renders with field struct" do
    assigns = %{form: Phoenix.Component.to_form(%{"role" => "admin"})}
    html = rendered_to_string(~H"""
    <.combobox id="c11" field={@form[:role]}>
      <:option value="admin">Admin</:option>
    </.combobox>
    """)
    assert html =~ ~s(name="role")
    assert html =~ ~s(value="admin")
  end

  test "renders aria-selected on options" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c12" name="x" value="a">
      <:option value="a">A</:option>
      <:option value="b">B</:option>
    </.combobox>
    """)
    assert html =~ ~s(aria-selected="true")
    assert html =~ ~s(aria-selected="false")
  end

  test "renders debounce data attribute" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.combobox id="c13" name="x" debounce={500}>
      <:option value="a">A</:option>
    </.combobox>
    """)
    assert html =~ ~s(data-debounce="500")
  end
end
