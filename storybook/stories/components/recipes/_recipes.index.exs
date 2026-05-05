defmodule Storybook.Components.Recipes do
  use PhoenixStorybook.Index

  def folder_name, do: "Recipes"
  def folder_open?, do: false
  def folder_index, do: 75

  def entry("button_recipes"), do: [name: "Button Recipes", index: 0]
  def entry("input_recipes"), do: [name: "Input Recipes", index: 1]
  def entry("select_recipes"), do: [name: "Select Recipes", index: 2]
  def entry("combobox_recipes"), do: [name: "Combobox Recipes", index: 3]
  def entry("table_recipes"), do: [name: "Table Recipes", index: 4]
  def entry("modal_recipes"), do: [name: "Modal Recipes", index: 5]
  def entry("drawer_recipes"), do: [name: "Drawer Recipes", index: 6]
  def entry("command_palette_recipes"), do: [name: "Command Palette Recipes", index: 7]
  def entry("date_picker_recipes"), do: [name: "Date Picker Recipes", index: 8]
  def entry("access_review_workflow"), do: [name: "Access Review Workflow", index: 9]
  def entry("incident_response_workflow"), do: [name: "Incident Response Workflow", index: 10]
  def entry("component_recipe_matrix"), do: [name: "Component Recipe Matrix", index: 11]
  def entry("bulk_action_workflow"), do: [name: "Bulk Action Workflow", index: 12]
  def entry("bulk_edit_workflow"), do: [name: "Bulk Edit Workflow", index: 13]
  def entry("dashboard_drilldown_workflow"), do: [name: "Dashboard Drilldown Workflow", index: 14]
  def entry("data_table_workflow"), do: [name: "Data Table Workflow", index: 15]
  def entry("import_export_workflow"), do: [name: "Import Export Workflow", index: 16]
  def entry("async_save_workflow"), do: [name: "Async Save Workflow", index: 17]
  def entry("command_routing_workflow"), do: [name: "Command Routing Workflow", index: 18]
  def entry("role_operations_workflow"), do: [name: "Role Operations Workflow", index: 19]
  def entry("saved_filters_workflow"), do: [name: "Saved Filters Workflow", index: 20]
end
