defmodule Storybook.Components.Layout do
  use PhoenixStorybook.Index

  def folder_name, do: "Layout"
  def folder_open?, do: false
  def folder_index, do: 80

  def entry("accordion"), do: [name: "Accordion", index: 0]
  def entry("app_shell_workflow"), do: [name: "App Shell Workflow", index: 1]
  def entry("card"), do: [name: "Card", index: 2]
  def entry("carousel"), do: [name: "Carousel", index: 3]
  def entry("collapsible"), do: [name: "Collapsible", index: 4]
  def entry("header"), do: [name: "Header", index: 5]
  def entry("footer"), do: [name: "Footer", index: 6]
  def entry("hero"), do: [name: "Hero", index: 7]
  def entry("icon"), do: [name: "Icon", index: 8]
  def entry("scroll_area"), do: [name: "Scroll Area", index: 9]
  def entry("separator"), do: [name: "Separator", index: 10]
end
