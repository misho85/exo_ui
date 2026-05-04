defmodule Storybook.Components.Charts.BarCharts do
  use PhoenixStorybook.Index

  def folder_name, do: "Bar Charts"
  def folder_open?, do: false
  def folder_index, do: 10

  def entry("bar_chart"), do: [name: "Vertical", index: 0]
  def entry("horizontal_bar_chart"), do: [name: "Horizontal", index: 1]
  def entry("bar_chart_multiple"), do: [name: "Grouped", index: 2]
  def entry("stacked_bar_chart"), do: [name: "Stacked", index: 3]
  def entry("bar_chart_label"), do: [name: "With Labels", index: 4]
  def entry("bar_chart_negative"), do: [name: "Positive / Negative", index: 5]
end
