defmodule ExoUI.Components.SettingsListTest do
  @moduledoc """
  TRG-807. `settings_list/1` is the overview of a settings page: rows of one
  card instead of a grid of cards. A row that goes somewhere is one link with a
  chevron; a row that does not is not a link at all.
  """
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "a row with navigate is one link with title, description, summary and chevron" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.settings_list aria_label="Mejlovi kupcima">
        <:row navigate="/settings/emails/order" icon="mail" title="Potvrda" description="Odmah">
          Izmijenjen
        </:row>
      </.settings_list>
      """)

    assert html =~ ~s(<ul data-exo="settings-list" aria-label="Mejlovi kupcima")
    assert html =~ ~s(href="/settings/emails/order")
    assert html =~ ~s(data-phx-link="redirect")
    assert html =~ ~s(data-exo="settings-row-title">Potvrda<)
    assert html =~ "Odmah"
    assert html =~ "Izmijenjen"
    assert html =~ ~s(data-exo="settings-row-chevron")
    assert html =~ ~s(data-exo="settings-row-icon")
  end

  test "a row without a destination is static: no link, no chevron, no empty summary" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.settings_list>
        <:row title="Adresa za kupce" description="podrska@test.trg24.com" />
      </.settings_list>
      """)

    refute html =~ "<a "
    refute html =~ ~s(data-exo="settings-row-chevron")
    refute html =~ ~s(data-exo="settings-row-value")
    refute html =~ ~s(data-exo="settings-row-icon")
    assert html =~ "Adresa za kupce"
  end

  test "patch and href rows are links of their kind" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.settings_list>
        <:row patch="/settings?tab=a" title="A" />
        <:row href="https://example.com/help" title="B" />
      </.settings_list>
      """)

    assert html =~ ~s(data-phx-link="patch")
    assert html =~ ~s(href="https://example.com/help")
  end
end
