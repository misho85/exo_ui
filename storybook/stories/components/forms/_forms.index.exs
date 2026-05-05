defmodule Storybook.Components.Forms do
  use PhoenixStorybook.Index

  def folder_name, do: "Forms"
  def folder_open?, do: false
  def folder_index, do: 20

  def entry("form"), do: [name: "Form", index: 0]
  def entry("fieldset"), do: [name: "Fieldset", index: 1]
  def entry("input"), do: [name: "Input", index: 2]
  def entry("select"), do: [name: "Select", index: 3]
  def entry("combobox"), do: [name: "Combobox", index: 4]
  def entry("combobox_async"), do: [name: "Combobox Async", index: 5]
  def entry("date_picker"), do: [name: "Date Picker", index: 6]
  def entry("date_picker_controlled"), do: [name: "Date Picker Controlled", index: 7]
  def entry("file_input"), do: [name: "File Input", index: 8]
  def entry("radio_group"), do: [name: "Radio Group", index: 9]
  def entry("rating"), do: [name: "Rating", index: 10]
  def entry("slider"), do: [name: "Slider", index: 11]
end
