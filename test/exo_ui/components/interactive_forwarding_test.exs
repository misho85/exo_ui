defmodule ExoUI.Components.InteractiveForwardingTest do
  use ExoUI.ComponentCase, async: true

  defp assert_forwarding(component, selector, class_name, attr_name, attr_value) do
    component
    |> parse_component()
    |> assert_component(selector)
    |> assert_class(class_name, selector)
    |> assert_attribute(attr_name, attr_value, selector)
  end

  test "modal forwards class and rest attrs to the root container" do
    assigns = %{}

    ~H"""
    <.modal id="modal-forwarding" class="modal-shell" data-track="modal">
      Content
    </.modal>
    """
    |> assert_forwarding(~s([data-exo="modal"]), "modal-shell", "data-track", "modal")
  end

  test "select forwards class and rest attrs to the field wrapper" do
    assigns = %{}

    ~H"""
    <.select id="select-forwarding" name="status" class="field-shell" data-track="select">
      <:option value="active">Active</:option>
    </.select>
    """
    |> assert_forwarding(~s([data-exo="field"]), "field-shell", "data-track", "select")
  end

  test "combobox forwards class and rest attrs to the field wrapper" do
    assigns = %{}

    ~H"""
    <.combobox id="combobox-forwarding" name="country" class="field-shell" data-track="combobox">
      <:option value="rs">Serbia</:option>
    </.combobox>
    """
    |> assert_forwarding(~s([data-exo="field"]), "field-shell", "data-track", "combobox")
  end

  test "popover forwards class and rest attrs to the content element" do
    assigns = %{}

    ~H"""
    <.popover id="popover-forwarding" class="popover-panel" data-track="popover">
      <:trigger>Open</:trigger>
      Content
    </.popover>
    """
    |> assert_forwarding(
      ~s([data-exo="popover-content"]),
      "popover-panel",
      "data-track",
      "popover"
    )
  end

  test "dropdown_menu forwards class and rest attrs to the menu element" do
    assigns = %{}

    ~H"""
    <.dropdown_menu id="dropdown-forwarding" class="menu-shell" data-track="dropdown">
      <:trigger>Open</:trigger>
      <:entry>Edit</:entry>
    </.dropdown_menu>
    """
    |> assert_forwarding(~s([data-exo="dropdown-menu"]), "menu-shell", "data-track", "dropdown")
  end

  test "tooltip forwards class and rest attrs to the tooltip content" do
    assigns = %{}

    ~H"""
    <.tooltip id="tooltip-forwarding" text="Helpful" class="tooltip-panel" data-track="tooltip">
      Hover
    </.tooltip>
    """
    |> assert_forwarding(
      ~s([data-exo="tooltip-content"]),
      "tooltip-panel",
      "data-track",
      "tooltip"
    )
  end

  test "collapsible forwards class and rest attrs to the root container" do
    assigns = %{}

    ~H"""
    <.collapsible id="collapsible-forwarding" class="collapsible-shell" data-track="collapsible">
      <:trigger>Toggle</:trigger>
      Content
    </.collapsible>
    """
    |> assert_forwarding(
      ~s([data-exo="collapsible"]),
      "collapsible-shell",
      "data-track",
      "collapsible"
    )
  end

  test "drawer forwards class and rest attrs to the root container" do
    assigns = %{}

    ~H"""
    <.drawer id="drawer-forwarding" class="drawer-shell" data-track="drawer">
      Content
    </.drawer>
    """
    |> assert_forwarding(~s([data-exo="drawer"]), "drawer-shell", "data-track", "drawer")
  end

  test "sheet forwards class and rest attrs to the root container" do
    assigns = %{}

    ~H"""
    <.sheet id="sheet-forwarding" class="sheet-shell" data-track="sheet">
      Content
    </.sheet>
    """
    |> assert_forwarding(~s([data-exo="sheet"]), "sheet-shell", "data-track", "sheet")
  end

  test "hover_card forwards class and rest attrs to the root container" do
    assigns = %{}

    ~H"""
    <.hover_card id="hover-card-forwarding" class="hover-card-shell" data-track="hover-card">
      <:trigger>Hover</:trigger>
      Content
    </.hover_card>
    """
    |> assert_forwarding(
      ~s([data-exo="hover-card"]),
      "hover-card-shell",
      "data-track",
      "hover-card"
    )
  end

  test "context_menu forwards class and rest attrs to the root container" do
    assigns = %{}

    ~H"""
    <.context_menu id="context-menu-forwarding" class="context-menu-shell" data-track="context-menu">
      <:trigger>Right click</:trigger>
      <:item label="Copy" />
    </.context_menu>
    """
    |> assert_forwarding(
      ~s([data-exo="context-menu"]),
      "context-menu-shell",
      "data-track",
      "context-menu"
    )
  end

  test "command_palette forwards class and rest attrs to the root container" do
    assigns = %{}

    ~H"""
    <.command_palette
      id="command-palette-forwarding"
      class="command-palette-shell"
      data-track="command-palette"
    >
      <p>Items</p>
    </.command_palette>
    """
    |> assert_forwarding(
      ~s([data-exo="command-palette"]),
      "command-palette-shell",
      "data-track",
      "command-palette"
    )
  end

  test "menubar forwards class and rest attrs to the root container" do
    assigns = %{}

    ~H"""
    <.menubar class="menubar-shell" data-track="menubar">
      <:menu label="File">
        <button>New</button>
      </:menu>
    </.menubar>
    """
    |> assert_forwarding(~s([data-exo="menubar"]), "menubar-shell", "data-track", "menubar")
  end
end
