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

  test "renders trend_badge with accessible label and pass-through attributes" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.trend_badge
  current={98}
  previous={98}
  aria_label="Revenue unchanged"
  class="metric-trend"
  data-testid="trend"
/>|)

    assert html =~ ~s(aria-label="Revenue unchanged")
    assert html =~ ~s(class="metric-trend")
    assert html =~ ~s(data-testid="trend")
  end

  test "renders sparkline" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.sparkline
  data={[10, 20, 15, 25, 18]}
  aria_label="Revenue trend"
  description="Revenue increased over five periods."
/>|)

    assert html =~ ~s(data-exo="sparkline")
    assert html =~ ~s(role="img")
    assert html =~ ~s(aria-label="Revenue trend")
    assert html =~ "<title>Revenue trend</title>"
    assert html =~ "<desc>Revenue increased over five periods.</desc>"
    assert html =~ "polyline"
  end

  test "renders sparkline empty state for insufficient data" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.sparkline data={[10]} empty_text="Need more points" />|)

    assert html =~ ~s(data-exo="sparkline-empty")
    assert html =~ ~s(role="img")
    assert html =~ ~s(aria-label="Need more points")
    assert html =~ "Need more points"
  end

  test "renders progress_bar" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress_bar label="Done" count={8} max={12} />|)
    assert html =~ ~s(data-exo="progress-bar")
    assert html =~ ~s(role="progressbar")
    assert html =~ ~s(aria-valuenow="8")
    assert html =~ ~s(aria-valuemax="12")
    assert html =~ "Done"
    assert html =~ "66.7%"
  end

  test "renders progress_bar with clamped values" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress_bar label="Done" count={18} max={12} />|)

    assert html =~ ~s(aria-valuenow="12")
    assert html =~ ~s(aria-valuetext="100%")
    assert html =~ ~s(width: 100%)
  end

  test "renders bar_chart" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.bar_chart
  data={[{"Jan", 10}, {"Feb", 25}]}
  aria_label="Monthly visitors"
  description="Visitors for January and February."
/>|)

    assert html =~ ~s(data-exo="bar-chart")
    assert html =~ ~s(role="img")
    assert html =~ ~s(aria-label="Monthly visitors")
    assert html =~ "<title>Monthly visitors</title>"
    assert html =~ "<desc>Visitors for January and February.</desc>"
    assert html =~ "rect"
    assert html =~ "Jan"
  end

  test "renders horizontal_bar_chart" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.horizontal_bar_chart data={[{"Kayaking", 45}, {"Hiking", 30}]} />|)

    assert html =~ ~s(data-exo="h-bar-chart")
    assert html =~ "Kayaking"
  end

  test "renders area_chart" do
    assigns = %{}
    html = rendered_to_string(~H|<.area_chart data={[{"Jan", 100}, {"Feb", 150}]} id="test" />|)
    assert html =~ ~s(data-exo="area-chart")
    assert html =~ ~s(<path d=)
    assert html =~ "fill-opacity"
  end

  test "renders stacked_bar_chart" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.stacked_bar_chart data={[{"Mon", %{a: 5, b: 3}}]} colors={%{a: "#10b981", b: "#ef4444"}} />|
      )

    assert html =~ ~s(data-exo="stacked-bar-chart")
    assert html =~ "rect"
  end

  test "renders empty chart" do
    assigns = %{}
    html = rendered_to_string(~H|<.bar_chart data={[]} aria_label="Empty monthly chart" />|)
    assert html =~ ~s(data-exo="chart-empty")
    assert html =~ ~s(role="status")
    assert html =~ ~s(aria-label="Empty monthly chart")
    assert html =~ "No data"
  end

  # --- bar_chart_multiple ---

  test "renders bar_chart_multiple with data" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.bar_chart_multiple data={[{"Jan", 10, 20}, {"Feb", 25, 15}]} />|)

    assert html =~ ~s(data-exo="bar-chart-multiple")
    assert html =~ "rect"
    assert html =~ "Jan"
  end

  test "renders bar_chart_multiple empty" do
    assigns = %{}
    html = rendered_to_string(~H|<.bar_chart_multiple data={[]} />|)
    assert html =~ "No data"
  end

  # --- bar_chart_label ---

  test "renders bar_chart_label with data" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.bar_chart_label data={[{"Jan", 10}, {"Feb", 25}]} />|)

    assert html =~ ~s(data-exo="bar-chart-label")
    assert html =~ "rect"
    assert html =~ "Jan"
    # Value labels are rendered above bars
    assert html =~ "10"
  end

  test "renders bar_chart_label empty" do
    assigns = %{}
    html = rendered_to_string(~H|<.bar_chart_label data={[]} />|)
    assert html =~ "No data"
  end

  # --- bar_chart_negative ---

  test "renders bar_chart_negative with data" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.bar_chart_negative data={[{"Jan", 10}, {"Feb", -15}, {"Mar", 5}]} />|
      )

    assert html =~ ~s(data-exo="bar-chart-negative")
    assert html =~ "rect"
    assert html =~ "Jan"
  end

  test "renders bar_chart_negative empty" do
    assigns = %{}
    html = rendered_to_string(~H|<.bar_chart_negative data={[]} />|)
    assert html =~ "No data"
  end

  # --- line_chart ---

  test "renders line_chart with data" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.line_chart data={[{"Jan", 100}, {"Feb", 150}, {"Mar", 120}]} />|)

    assert html =~ ~s(data-exo="line-chart")
    assert html =~ ~s(<path d=)
    assert html =~ "Jan"
  end

  # --- line_chart_multiple ---

  test "renders line_chart_multiple with data" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.line_chart_multiple data={[{"Jan", 100, 80}, {"Feb", 150, 90}, {"Mar", 120, 110}]} />|
      )

    assert html =~ ~s(data-exo="line-chart-multiple")
    # Two path elements for two series
    assert html =~ ~s(<path d=)
    assert html =~ "Jan"
  end

  # --- pie_chart ---

  test "renders pie_chart with data" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.pie_chart data={[{"Chrome", 60, "#4285f4"}, {"Firefox", 25, "#ff7139"}, {"Safari", 15, "#000"}]} />|
      )

    assert html =~ ~s(data-exo="pie-chart")
    assert html =~ ~s(<path d=)
    assert html =~ "Chrome"
  end

  test "renders radial chart empty states without crashing" do
    assigns = %{}

    pie = rendered_to_string(~H|<.pie_chart data={[]} empty_text="No segments" />|)
    donut = rendered_to_string(~H|<.donut_chart data={[]} />|)
    radar = rendered_to_string(~H|<.radar_chart data={[]} />|)
    radial = rendered_to_string(~H|<.radial_chart data={[]} />|)

    assert pie =~ ~s(data-exo="chart-empty")
    assert pie =~ "No segments"
    assert donut =~ ~s(role="status")
    assert radar =~ ~s(role="status")
    assert radial =~ ~s(role="status")
  end

  # --- donut_chart ---

  test "renders donut_chart with data" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.donut_chart data={[
  {"Chrome", 60, "#4285f4"},
  {"Firefox", 25, "#ff7139"},
  {"Safari", 15, "#000"}
]} />|)

    assert html =~ ~s(data-exo="donut-chart")
    assert html =~ ~s(<path d=)
    assert html =~ "Chrome"
  end

  # --- donut_chart_text ---

  test "renders donut_chart_text with data and center text" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.donut_chart_text
  data={[{"Chrome", 60, "#4285f4"}, {"Firefox", 25, "#ff7139"}]}
  center_value="85"
  center_label="Visitors"
/>|)

    assert html =~ ~s(data-exo="donut-chart-text")
    assert html =~ ~s(<path d=)
    assert html =~ "85"
    assert html =~ "Visitors"
  end

  # --- radar_chart ---

  test "renders radar_chart with data" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.radar_chart data={[
  {"Speed", 80},
  {"Power", 60},
  {"Range", 90},
  {"Endurance", 70},
  {"Agility", 85}
]} />|)

    assert html =~ ~s(data-exo="radar-chart")
    assert html =~ "polygon"
    assert html =~ "Spe"
  end

  # --- radial_chart ---

  test "renders radial_chart with data" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.radial_chart data={[
  {"Safari", 70, "#000"},
  {"Chrome", 90, "#4285f4"},
  {"Firefox", 50, "#ff7139"}
]} />|)

    assert html =~ ~s(data-exo="radial-chart")
    assert html =~ ~s(<path d=)
    assert html =~ "Safari"
  end

  # --- area_chart_stacked ---

  test "renders area_chart_stacked with data" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.area_chart_stacked
  data={[{"Jan", 100, 50}, {"Feb", 150, 60}, {"Mar", 120, 70}]}
  id="test-stacked"
/>|)

    assert html =~ ~s(data-exo="area-chart-stacked")
    assert html =~ ~s(<path d=)
    assert html =~ "fill-opacity"
    assert html =~ "Jan"
  end

  test "renders area_chart_stacked empty state without crashing" do
    assigns = %{}
    html = rendered_to_string(~H|<.area_chart_stacked data={[]} id="empty-stacked" />|)

    assert html =~ ~s(data-exo="chart-empty")
    assert html =~ ~s(role="status")
    assert html =~ "No data"
  end
end
