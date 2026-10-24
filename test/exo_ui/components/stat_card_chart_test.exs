defmodule ExoUI.Components.StatCardChartTest do
  @moduledoc "TRG-807. The `chart` slot of `stat_card/1` puts a small chart under the value."
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "the chart slot renders between the value and the footer" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.stat_card title="Ovaj mjesec" value="35,00 €" subtitle="1 narudžbina">
        <:chart><svg data-test="spark"></svg></:chart>
      </.stat_card>
      """)

    [before_footer, _] = String.split(html, ~s(data-exo="stat-card-bottom"), parts: 2)
    assert before_footer =~ ~s(data-exo="stat-card-chart")
    assert before_footer =~ ~s(data-test="spark")
  end

  test "without the slot there is no chart wrapper" do
    assigns = %{}

    html = rendered_to_string(~H|<.stat_card title="Danas" value="0 €" />|)

    refute html =~ "stat-card-chart"
  end
end
