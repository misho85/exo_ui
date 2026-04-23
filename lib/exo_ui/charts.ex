defmodule ExoUI.Charts do
  @moduledoc """
  SVG chart components styled after shadcn/ui conventions.

  Follows the exact shadcn/ui Recharts patterns:
  - CartesianGrid vertical={false} — subtle horizontal grid lines only
  - No y-axis labels anywhere
  - No axis lines
  - X-axis labels abbreviated to 3 characters
  - Grid lines at ~10% opacity
  - Smooth catmull-rom curves for area charts
  """

  # Keep `ExoUI.Charts` as the public import surface while implementation lives
  # in smaller chart-family modules.
  defdelegate trend_badge(assigns), to: ExoUI.Charts.Primitives
  defdelegate sparkline(assigns), to: ExoUI.Charts.Primitives
  defdelegate progress_bar(assigns), to: ExoUI.Charts.Primitives

  defdelegate bar_chart(assigns), to: ExoUI.Charts.Cartesian
  defdelegate horizontal_bar_chart(assigns), to: ExoUI.Charts.Cartesian
  defdelegate area_chart(assigns), to: ExoUI.Charts.Cartesian
  defdelegate stacked_bar_chart(assigns), to: ExoUI.Charts.Cartesian
  defdelegate bar_chart_multiple(assigns), to: ExoUI.Charts.Cartesian
  defdelegate bar_chart_label(assigns), to: ExoUI.Charts.Cartesian
  defdelegate bar_chart_negative(assigns), to: ExoUI.Charts.Cartesian
  defdelegate line_chart(assigns), to: ExoUI.Charts.Cartesian
  defdelegate line_chart_multiple(assigns), to: ExoUI.Charts.Cartesian
  defdelegate area_chart_stacked(assigns), to: ExoUI.Charts.Cartesian

  defdelegate pie_chart(assigns), to: ExoUI.Charts.Radial
  defdelegate donut_chart(assigns), to: ExoUI.Charts.Radial
  defdelegate donut_chart_text(assigns), to: ExoUI.Charts.Radial
  defdelegate radar_chart(assigns), to: ExoUI.Charts.Radial
  defdelegate radial_chart(assigns), to: ExoUI.Charts.Radial
end
