defmodule Storybook.Components.Layout do
  use PhoenixStorybook.Index

  def folder_name, do: "Layout"
  def folder_open?, do: false
  def folder_index, do: 80

  def entry("accordion"), do: [name: "Accordion", index: 0]
  def entry("card"), do: [name: "Card", index: 1]
  def entry("carousel"), do: [name: "Carousel", index: 2]
  def entry("collapsible"), do: [name: "Collapsible", index: 3]
  def entry("header"), do: [name: "Header", index: 4]
  def entry("footer"), do: [name: "Footer", index: 5]
  def entry("hero"), do: [name: "Hero", index: 6]
  def entry("icon"), do: [name: "Icon", index: 7]
  def entry("scroll_area"), do: [name: "Scroll Area", index: 8]
  def entry("separator"), do: [name: "Separator", index: 9]
end
