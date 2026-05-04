defmodule Storybook.Components.Feedback do
  use PhoenixStorybook.Index

  def folder_name, do: "Feedback"
  def folder_open?, do: false
  def folder_index, do: 60

  def entry("alert"), do: [name: "Alert", index: 0]
  def entry("badge"), do: [name: "Badge", index: 1]
  def entry("empty_state"), do: [name: "Empty State", index: 2]
  def entry("flash"), do: [name: "Flash", index: 3]
  def entry("flash_group"), do: [name: "Flash Group", index: 4]
  def entry("indicator"), do: [name: "Indicator", index: 5]
  def entry("progress"), do: [name: "Progress", index: 6]
  def entry("radial_progress"), do: [name: "Radial Progress", index: 7]
  def entry("skeleton"), do: [name: "Skeleton", index: 8]
  def entry("spinner"), do: [name: "Spinner", index: 9]
  def entry("toast_container"), do: [name: "Toast Container", index: 10]
end
