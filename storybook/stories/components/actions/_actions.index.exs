defmodule Storybook.Components.Actions do
  use PhoenixStorybook.Index

  def folder_name, do: "Actions"
  def folder_open?, do: false
  def folder_index, do: 10

  def entry("button"), do: [name: "Button", index: 0]
  def entry("toggle"), do: [name: "Toggle", index: 1]
  def entry("swap"), do: [name: "Swap", index: 2]
  def entry("theme_toggle"), do: [name: "Theme Toggle", index: 3]
end
