defmodule Storybook.Components.DataDisplay do
  use PhoenixStorybook.Index

  def folder_name, do: "Data Display"
  def folder_open?, do: false
  def folder_index, do: 70

  def entry("avatar"), do: [name: "Avatar", index: 0]
  def entry("chat_bubble"), do: [name: "Chat Bubble", index: 1]
  def entry("content_card"), do: [name: "Content Card", index: 2]
  def entry("editable_record_workflow"), do: [name: "Editable Record Workflow", index: 3]
  def entry("kbd"), do: [name: "Keyboard Key", index: 4]
  def entry("list"), do: [name: "List", index: 5]
  def entry("metric_card"), do: [name: "Metric Card", index: 6]
  def entry("stat_card"), do: [name: "Stat Card", index: 7]
  def entry("table"), do: [name: "Table", index: 8]
  def entry("timeline"), do: [name: "Timeline", index: 9]
end
