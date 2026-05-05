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

  use Phoenix.Component

  @doc "Renders a badge showing percentage change between current and previous values."
  attr :current, :any, required: true
  attr :previous, :any, required: true
  attr :aria_label, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def trend_badge(assigns), do: ExoUI.Charts.Primitives.trend_badge(assigns)

  @doc "Renders a compact inline sparkline SVG chart."
  attr :data, :list, required: true
  attr :width, :integer, default: 80
  attr :height, :integer, default: 24
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No trend data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def sparkline(assigns), do: ExoUI.Charts.Primitives.sparkline(assigns)

  @doc "Renders a labeled horizontal progress bar."
  attr :label, :string, required: true
  attr :count, :integer, required: true
  attr :max, :integer, required: true
  attr :color, :string, default: "var(--exo-primary)"
  attr :aria_label, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def progress_bar(assigns), do: ExoUI.Charts.Primitives.progress_bar(assigns)

  @doc "Renders a vertical bar chart with x-axis labels and hover tooltips."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def bar_chart(assigns), do: ExoUI.Charts.Cartesian.bar_chart(assigns)

  @doc "Renders a horizontal bar chart with labels on the y-axis."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def horizontal_bar_chart(assigns), do: ExoUI.Charts.Cartesian.horizontal_bar_chart(assigns)

  @doc "Renders a smooth area chart with catmull-rom curves and gradient fill."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :id, :string, default: nil
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def area_chart(assigns), do: ExoUI.Charts.Cartesian.area_chart(assigns)

  @doc "Renders a stacked bar chart with multiple series and legend."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :colors, :map, required: true
  attr :legend_keys, :list, default: []
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def stacked_bar_chart(assigns), do: ExoUI.Charts.Cartesian.stacked_bar_chart(assigns)

  @doc "Renders a grouped bar chart with two series side by side."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color1, :string, default: "var(--exo-primary)"
  attr :color2, :string, default: "color-mix(in oklch, var(--exo-primary) 50%, transparent)"
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def bar_chart_multiple(assigns), do: ExoUI.Charts.Cartesian.bar_chart_multiple(assigns)

  @doc "Renders a bar chart with value labels displayed on each bar."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def bar_chart_label(assigns), do: ExoUI.Charts.Cartesian.bar_chart_label(assigns)

  @doc "Renders a bar chart with distinct colors for positive and negative values."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color_positive, :string, default: "var(--exo-primary)"
  attr :color_negative, :string, default: "var(--exo-destructive, #ef4444)"
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def bar_chart_negative(assigns), do: ExoUI.Charts.Cartesian.bar_chart_negative(assigns)

  @doc "Renders a single-series line chart with catmull-rom smoothing."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def line_chart(assigns), do: ExoUI.Charts.Cartesian.line_chart(assigns)

  @doc "Renders a two-series line chart with catmull-rom smoothing."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color1, :string, default: "var(--exo-primary)"
  attr :color2, :string, default: "color-mix(in oklch, var(--exo-primary) 50%, transparent)"
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def line_chart_multiple(assigns), do: ExoUI.Charts.Cartesian.line_chart_multiple(assigns)

  @doc "Renders a stacked area chart with two series and catmull-rom curves."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color1, :string, default: "var(--exo-primary)"
  attr :color2, :string, default: "color-mix(in oklch, var(--exo-primary) 50%, transparent)"
  attr :id, :string, default: nil
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def area_chart_stacked(assigns), do: ExoUI.Charts.Cartesian.area_chart_stacked(assigns)

  @doc "Renders a pie chart with colored slices and hover tooltips."
  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def pie_chart(assigns), do: ExoUI.Charts.Radial.pie_chart(assigns)

  @doc "Renders a donut chart (pie chart with hollow center)."
  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :inner_radius, :integer, default: 60
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def donut_chart(assigns), do: ExoUI.Charts.Radial.donut_chart(assigns)

  @doc "Renders a donut chart with centered text (value and label)."
  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :inner_radius, :integer, default: 60
  attr :center_value, :string, default: ""
  attr :center_label, :string, default: ""
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def donut_chart_text(assigns), do: ExoUI.Charts.Radial.donut_chart_text(assigns)

  @doc "Renders a radar/spider chart with polygon grid and data overlay."
  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def radar_chart(assigns), do: ExoUI.Charts.Radial.radar_chart(assigns)

  @doc "Renders a radial/gauge chart with arc segments."
  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :inner_radius, :integer, default: 40
  attr :outer_radius, :integer, default: 110
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def radial_chart(assigns), do: ExoUI.Charts.Radial.radial_chart(assigns)
end
