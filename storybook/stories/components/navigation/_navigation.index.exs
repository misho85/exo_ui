defmodule Storybook.Components.Navigation do
  use PhoenixStorybook.Index

  def folder_name, do: "Navigation"
  def folder_open?, do: false
  def folder_index, do: 50

  def entry("bottom_nav"), do: [name: "Bottom Navigation", index: 0]
  def entry("breadcrumb"), do: [name: "Breadcrumb", index: 1]
  def entry("navbar"), do: [name: "Navbar", index: 2]
  def entry("pagination"), do: [name: "Pagination", index: 3]
  def entry("steps"), do: [name: "Steps", index: 4]
  def entry("tabs"), do: [name: "Tabs", index: 5]
  def entry("wizard_sidebar"), do: [name: "Wizard Sidebar", index: 6]
end
