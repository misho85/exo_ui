defmodule Storybook.Components.Recipes do
  use PhoenixStorybook.Index

  def folder_name, do: "Recipes"
  def folder_open?, do: false
  def folder_index, do: 75

  def entry("component_recipe_matrix"), do: [name: "Component Recipe Matrix", index: 0]
  def entry("bulk_action_workflow"), do: [name: "Bulk Action Workflow", index: 1]
  def entry("bulk_edit_workflow"), do: [name: "Bulk Edit Workflow", index: 2]
  def entry("async_save_workflow"), do: [name: "Async Save Workflow", index: 3]
  def entry("command_routing_workflow"), do: [name: "Command Routing Workflow", index: 4]
  def entry("saved_filters_workflow"), do: [name: "Saved Filters Workflow", index: 5]
end
