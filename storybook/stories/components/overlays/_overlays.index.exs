defmodule Storybook.Components.Overlays do
  use PhoenixStorybook.Index

  def folder_name, do: "Overlays"
  def folder_open?, do: false
  def folder_index, do: 45

  def entry("confirm_modal"), do: [name: "Confirm Modal", index: 0]
  def entry("modal"), do: [name: "Modal", index: 1]
  def entry("sheet"), do: [name: "Sheet", index: 2]
  def entry("drawer"), do: [name: "Drawer", index: 3]
  def entry("overlay_stack"), do: [name: "Overlay Stack", index: 4]
  def entry("popover"), do: [name: "Popover", index: 5]
  def entry("hover_card"), do: [name: "Hover Card", index: 6]
  def entry("tooltip"), do: [name: "Tooltip", index: 7]
end
