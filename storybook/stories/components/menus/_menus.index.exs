defmodule Storybook.Components.Menus do
  use PhoenixStorybook.Index

  def folder_name, do: "Menus"
  def folder_open?, do: false
  def folder_index, do: 40

  def entry("command_palette"), do: [name: "Command Palette", index: 0]
  def entry("context_menu"), do: [name: "Context Menu", index: 1]
  def entry("dropdown"), do: [name: "Dropdown", index: 2]
  def entry("dropdown_menu"), do: [name: "Dropdown Menu", index: 3]
  def entry("menubar"), do: [name: "Menubar", index: 4]
end
