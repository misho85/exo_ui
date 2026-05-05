defmodule Storybook.Components.ImportExportWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.ImportExportWorkflowDemo

  def component, do: ImportExportWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "import-export-workflow-demo"}
      }
    ]
  end
end
