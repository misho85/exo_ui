defmodule ExoUI.ChartsTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Charts

  test "renders trend_badge up" do
    assigns = %{}
    html = rendered_to_string(~H|<.trend_badge current={42} previous={38} />|)
    assert html =~ ~s(data-exo="trend-badge")
    assert html =~ ~s(data-direction="up")
    assert html =~ "%"
  end

  test "renders trend_badge down" do
    assigns = %{}
    html = rendered_to_string(~H|<.trend_badge current={30} previous={42} />|)
    assert html =~ ~s(data-direction="down")
  end

  test "renders sparkline" do
    assigns = %{}
    html = rendered_to_string(~H|<.sparkline data={[10, 20, 15, 25, 18]} />|)
    assert html =~ ~s(data-exo="sparkline")
    assert html =~ "polyline"
  end

  test "renders progress_bar" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress_bar label="Done" count={8} max={12} />|)
    assert html =~ ~s(data-exo="progress-bar")
    assert html =~ "Done"
    assert html =~ "8"
  end

  test "renders bar_chart" do
    assigns = %{}
    html = rendered_to_string(~H|<.bar_chart data={[{"Jan", 10}, {"Feb", 25}]} />|)
    assert html =~ ~s(data-exo="bar-chart")
    assert html =~ "rect"
    assert html =~ "Jan"
  end

  test "renders horizontal_bar_chart" do
    assigns = %{}
    html = rendered_to_string(~H|<.horizontal_bar_chart data={[{"Kayaking", 45}, {"Hiking", 30}]} />|)
    assert html =~ ~s(data-exo="h-bar-chart")
    assert html =~ "Kayaking"
  end

  test "renders area_chart" do
    assigns = %{}
    html = rendered_to_string(~H|<.area_chart data={[{"Jan", 100}, {"Feb", 150}]} id="test" />|)
    assert html =~ ~s(data-exo="area-chart")
    assert html =~ "polyline"
    assert html =~ "polygon"
  end

  test "renders stacked_bar_chart" do
    assigns = %{}
    html = rendered_to_string(~H|<.stacked_bar_chart data={[{"Mon", %{a: 5, b: 3}}]} colors={%{a: "#10b981", b: "#ef4444"}} />|)
    assert html =~ ~s(data-exo="stacked-bar-chart")
    assert html =~ "rect"
  end

  test "renders empty chart" do
    assigns = %{}
    html = rendered_to_string(~H|<.bar_chart data={[]} />|)
    assert html =~ "No data"
  end
end
