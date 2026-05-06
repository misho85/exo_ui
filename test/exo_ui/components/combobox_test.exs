defmodule ExoUI.Components.ComboboxTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders combobox with button trigger" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
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

  test "renders combobox from options attr" do
    assigns = %{countries: [{"Serbia", "rs"}, {"Croatia", "hr"}]}

    html =
      rendered_to_string(~H"""
      <.combobox
        id="c-options"
        name="country"
        value="hr"
        label="Country"
        prompt="Search countries..."
        options={@countries}
      />
      """)

    assert html =~ ~s(data-exo="combobox-option")
    assert html =~ ~s(data-value="rs")
    assert html =~ ~s(data-value="hr")
    assert html =~ ~s(value="hr")

    [trigger_part | _] = String.split(html, ~s(popover="auto"))
    assert trigger_part =~ "Croatia"
  end

  test "renders grouped and disabled combobox option maps from options attr" do
    assigns = %{
      people: [
        {"Design", [%{label: "Ana Markovic", value: "ana"}]},
        {"Engineering", [%{label: "Stefan unavailable", value: "stefan", disabled: true}]}
      ]
    }

    html =
      rendered_to_string(~H"""
      <.combobox id="c-grouped-options" name="assignee" options={@people} />
      """)

    assert html =~ ~s(role="group")
    assert html =~ ~s(aria-label="Design")
    assert html =~ ~s(data-value="stefan")
    assert html =~ ~s(data-disabled)
    assert html =~ ~s(aria-disabled="true")
    assert html =~ "Ana Markovic"
  end

  test "renders search input with role=combobox inside popover for button trigger" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
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

    html =
      rendered_to_string(~H"""
      <.combobox id="c3" name="x" trigger="input" prompt="Type...">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(popover="manual")
    assert html =~ ~s(data-exo-combobox="input-trigger")
    assert html =~ ~s(role="combobox")
    assert html =~ ~s(aria-expanded="false")
    assert html =~ ~s(aria-controls="c3-listbox")
    refute html =~ ~s(popovertarget)
  end

  test "renders empty slot" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c4" name="x">
        <:option value="a">A</:option>
        <:empty>No results</:empty>
      </.combobox>
      """)

    assert html =~ ~s(data-exo="combobox-empty")
    assert html =~ "No results"
    assert html =~ ~s(data-exo="combobox-status")
    assert html =~ ~s(role="status")
    assert html =~ ~s(aria-live="polite")
  end

  test "renders with client filter data attr" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c5" name="x" filter="client">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(data-filter="client")
  end

  test "renders with server filter" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c6" name="x" filter="server" on_filter="search">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(data-filter="server")
    assert html =~ ~s(data-on-filter="search")
  end

  test "renders server filter target for nested LiveComponents" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c6-target" name="x" filter="server" on_filter_target="#owner">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(phx-target="#owner")
  end

  test "renders loading state" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c7" name="x" loading>
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(data-exo="combobox-loading")
    assert html =~ ~s(aria-busy="true")
    assert html =~ "Loading results"
  end

  test "renders clearable button" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c8" name="x" value="a" clearable>
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(data-exo="combobox-clear")
  end

  test "renders creatable option" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c9" name="x" creatable on_create="create">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(data-exo="combobox-create")
  end

  test "renders anchor positioning styles" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c10" name="x">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(anchor-name: --combobox-c10)
    assert html =~ ~s(position-anchor: --combobox-c10)
  end

  test "renders with field struct" do
    assigns = %{form: Phoenix.Component.to_form(%{"role" => "admin"})}

    html =
      rendered_to_string(~H"""
      <.combobox id="c11" field={@form[:role]}>
        <:option value="admin">Admin</:option>
      </.combobox>
      """)

    assert html =~ ~s(name="role")
    assert html =~ ~s(value="admin")
  end

  test "renders aria-selected on options" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
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

    html =
      rendered_to_string(~H"""
      <.combobox id="c13" name="x" debounce={500}>
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(data-debounce="500")
  end

  test "button trigger starts collapsed" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c13-collapsed" name="x">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(aria-expanded="false")
    assert html =~ ~s(aria-controls="c13-collapsed-listbox")
  end

  test "renders grouped options" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c13-groups" name="x">
        <:option value="a" group="Admin">A</:option>
        <:option value="b" group="Admin">B</:option>
        <:option value="c" group="User">C</:option>
      </.combobox>
      """)

    assert html =~ ~s(role="group")
    assert html =~ "Admin"
    assert html =~ "User"
  end

  test "renders disabled option with aria-disabled" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c-disabled-option" name="x">
        <:option value="a" disabled>A</:option>
      </.combobox>
      """)

    assert html =~ ~s(data-disabled)
    assert html =~ ~s(aria-disabled="true")
  end

  test "renders label" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c14" name="x" label="Country">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(data-exo="label")
    assert html =~ "Country"
    assert html =~ ~s(id="c14-label")
    assert html =~ ~s(id="c14-value")
    assert html =~ ~s(aria-labelledby="c14-label c14-value")
  end

  test "input trigger references the field label" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c-input-label" name="x" trigger="input" label="Country">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(id="c-input-label-label")
    assert html =~ ~s(aria-labelledby="c-input-label-label")
  end

  test "renders errors" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c15" name="x" errors={["required"]}>
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(data-invalid)
    assert html =~ ~s(data-exo="field-error")
    assert html =~ "required"
  end

  test "connects description and errors to button trigger with aria-describedby" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c-aria" name="country" description="Pick one" errors={["required"]}>
        <:option value="rs">Serbia</:option>
      </.combobox>
      """)

    assert html =~ ~s(id="c-aria-description")
    assert html =~ ~s(id="c-aria-error")
    assert html =~ ~s(aria-describedby="c-aria-description c-aria-error")
    assert html =~ ~s(aria-invalid="true")
  end

  test "connects description and errors to input trigger with aria-describedby" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox
        id="c-input-aria"
        name="country"
        trigger="input"
        description="Pick one"
        errors={["required"]}
      >
        <:option value="rs">Serbia</:option>
      </.combobox>
      """)

    assert html =~ ~s(aria-describedby="c-input-aria-description c-input-aria-error")
    assert html =~ ~s(aria-invalid="true")
  end

  test "renders disabled trigger" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c16" name="x" value="a" disabled>
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(disabled)

    {:ok, doc} = Floki.parse_document(html)
    [hidden] = Floki.find(doc, ~s(input[type="hidden"][name="x"]))
    assert Floki.attribute(hidden, "disabled") == ["disabled"]
    assert Floki.attribute(hidden, "value") == ["a"]
  end

  test "input trigger disables hidden input when disabled" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c16-input" name="x" value="a" trigger="input" disabled>
        <:option value="a">A</:option>
      </.combobox>
      """)

    {:ok, doc} = Floki.parse_document(html)
    [hidden] = Floki.find(doc, ~s(input[type="hidden"][name="x"]))
    assert Floki.attribute(hidden, "disabled") == ["disabled"]
  end

  test "button trigger shows selected value in trigger" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c17" name="x" value="b">
        <:option value="a">Alpha</:option>
        <:option value="b">Beta</:option>
      </.combobox>
      """)

    [trigger_part | _] = String.split(html, ~s(popover="auto"))
    assert trigger_part =~ "Beta"
  end

  test "button trigger accessible name includes label and selected value" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c17-labelled" name="x" value="b" label="Language">
        <:option value="a">Alpha</:option>
        <:option value="b">Beta</:option>
      </.combobox>
      """)

    assert html =~ ~s(id="c17-labelled-label")
    assert html =~ ~s(id="c17-labelled-value")
    assert html =~ ~s(aria-labelledby="c17-labelled-label c17-labelled-value")

    [trigger_part | _] = String.split(html, ~s(popover="auto"))
    assert trigger_part =~ "Language"
    assert trigger_part =~ "Beta"
  end

  test "button trigger shows prompt when no value" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c18" name="x" prompt="Pick one">
        <:option value="a">A</:option>
      </.combobox>
      """)

    [trigger_part | _] = String.split(html, ~s(popover="auto"))
    assert trigger_part =~ "Pick one"
  end

  test "input trigger has placeholder from prompt" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c19" name="x" trigger="input" prompt="Type here...">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(placeholder="Type here...")
  end

  test "input trigger has no popovertarget attribute" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c20" name="x" trigger="input">
        <:option value="a">A</:option>
      </.combobox>
      """)

    refute html =~ ~s(popovertarget)
  end

  test "defaults to bottom/start and server filter" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c22" name="x">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(data-side="bottom")
    assert html =~ ~s(data-align="start")
    assert html =~ ~s(data-filter="server")
  end

  test "clearable not shown when no value" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c23" name="x" clearable>
        <:option value="a">A</:option>
      </.combobox>
      """)

    refute html =~ ~s(data-exo="combobox-clear")
  end

  test "hidden input has empty value when no value set" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c24" name="q">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(name="q")
    assert html =~ ~s(value="")
  end

  test "forwards class and rest attrs to field wrapper" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.combobox id="c25" name="x" class="field-shell" data-track="combobox">
        <:option value="a">A</:option>
      </.combobox>
      """)

    assert html =~ ~s(class="field-shell")
    assert html =~ ~s(data-track="combobox")
  end
end
