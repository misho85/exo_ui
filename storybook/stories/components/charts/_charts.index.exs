defmodule Storybook.Components.Charts do
  use PhoenixStorybook.Index

  def folder_name, do: "Charts"
  def folder_open?, do: false

  def entry("overview"), do: [name: "Overview", index: 0]
  def entry("area_chart"), do: [name: "Area", index: 10]
  def entry("area_chart_stacked"), do: [name: "Stacked Area", index: 11]
  def entry("line_chart"), do: [name: "Line", index: 20]
  def entry("line_chart_multiple"), do: [name: "Multiple Lines", index: 21]
  def entry("pie_chart"), do: [name: "Pie", index: 30]
  def entry("donut_chart"), do: [name: "Donut", index: 31]
  def entry("donut_chart_text"), do: [name: "Donut With Text", index: 32]
  def entry("radar_chart"), do: [name: "Radar", index: 40]
  def entry("radial_chart"), do: [name: "Radial", index: 41]
  def entry("sparkline"), do: [name: "Sparkline", index: 50]
  def entry("trend_badge"), do: [name: "Trend Badge", index: 51]
  def entry("progress_bar"), do: [name: "Progress Bars", index: 52]
end
