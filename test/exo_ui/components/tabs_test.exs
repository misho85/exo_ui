defmodule ExoUI.Components.TabsTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders tabs with active state" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tabs active="tab1">
      <:tab id="tab1" label="First" patch="/first" />
      <:tab id="tab2" label="Second" patch="/second" />
    </.tabs>
    """)
    assert html =~ ~s(data-exo="tabs")
    assert html =~ ~s(data-exo="tab")
    assert html =~ ~s(role="tablist")
    assert html =~ "First"
    assert html =~ "Second"
  end

  test "renders click-based tabs" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tabs active="a">
      <:tab id="a" label="Tab A" click="switch_tab" />
    </.tabs>
    """)
    assert html =~ "phx-click"
    assert html =~ "switch_tab"
  end
end
