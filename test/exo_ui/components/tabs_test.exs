defmodule ExoUI.Components.TabsTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders tabs with active state" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tabs id="profile-tabs" active="tab1" aria_label="Profile sections">
        <:tab id="tab1" label="First" patch="/first" />
        <:tab id="tab2" label="Second" patch="/second" />
      </.tabs>
      """)

    assert html =~ ~s(data-exo="tabs")
    assert html =~ ~s(data-exo="tab")
    assert html =~ ~s(role="tablist")
    assert html =~ ~s(aria-label="Profile sections")
    assert html =~ ~s(phx-hook="ExoTabs")
    assert html =~ ~s(data-orientation="horizontal")
    assert html =~ ~s(data-activation="manual")
    assert html =~ ~s(id="profile-tabs-tab-tab1")
    assert html =~ ~s(aria-controls="profile-tabs-panel-tab1")
    assert html =~ ~s(tabindex="0")
    assert html =~ ~s(tabindex="-1")
    assert html =~ "First"
    assert html =~ "Second"
  end

  test "renders click-based tabs" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tabs active="a" target="#owner">
        <:tab id="a" label="Tab A" click="switch_tab" />
      </.tabs>
      """)

    assert html =~ "phx-click"
    assert html =~ "switch_tab"
    assert html =~ ~s(phx-target="#owner")
    assert html =~ ~s(type="button")
  end

  test "renders disabled tabs without navigation" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tabs id="settings-tabs" active="a">
        <:tab id="a" label="Enabled" click="switch_tab" />
        <:tab id="b" label="Disabled" disabled />
      </.tabs>
      """)

    assert html =~ ~s(data-disabled)
    assert html =~ ~s(aria-disabled="true")
    assert html =~ "Disabled"
    refute html =~ ~s(phx-value-tab="b")
  end

  test "renders icons and tab panels" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tabs id="account-tabs" active="overview">
        <:tab id="overview" label="Overview" icon="layout-dashboard" />
        <:tab id="details" label="Details" icon="user" />
        <:panel tab="overview">Overview content</:panel>
        <:panel tab="details">Details content</:panel>
      </.tabs>
      """)

    assert html =~ ~s(data-exo="tab-icon")
    assert html =~ ~s(id="account-tabs-panel-overview")
    assert html =~ ~s(role="tabpanel")
    assert html =~ ~s(aria-labelledby="account-tabs-tab-overview")
    assert html =~ ~s(tabindex="0")
    assert html =~ "Overview content"
    assert html =~ "Details content"
    assert html =~ ~s(hidden)
  end

  test "renders vertical tabs orientation" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tabs id="vertical-tabs" active="a" orientation="vertical" activation="automatic">
        <:tab id="a" label="A" />
        <:tab id="b" label="B" />
      </.tabs>
      """)

    assert html =~ ~s(data-orientation="vertical")
    assert html =~ ~s(data-activation="automatic")
    assert html =~ ~s(aria-orientation="vertical")
  end
end
