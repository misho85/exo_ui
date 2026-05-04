defmodule Storybook.Components.DataDisplay do
  use PhoenixStorybook.Index

  def folder_name, do: "Data Display"
  def folder_open?, do: false
  def folder_index, do: 70

  def entry("avatar"), do: [name: "Avatar", index: 0]
  def entry("chat_bubble"), do: [name: "Chat Bubble", index: 1]
  def entry("content_card"), do: [name: "Content Card", index: 2]
  def entry("kbd"), do: [name: "Keyboard Key", index: 3]
  def entry("list"), do: [name: "List", index: 4]
  def entry("metric_card"), do: [name: "Metric Card", index: 5]
  def entry("stat_card"), do: [name: "Stat Card", index: 6]
  def entry("table"), do: [name: "Table", index: 7]
  def entry("timeline"), do: [name: "Timeline", index: 8]
end
