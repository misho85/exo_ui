defmodule Storybook.Components.Recipes do
  use PhoenixStorybook.Index

  def folder_name, do: "Recipes"
  def folder_open?, do: false
  def folder_index, do: 75

  def entry("component_recipe_matrix"), do: [name: "Component Recipe Matrix", index: 0]
  def entry("bulk_action_workflow"), do: [name: "Bulk Action Workflow", index: 1]
end
