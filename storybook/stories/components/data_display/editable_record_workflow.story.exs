defmodule Storybook.Components.EditableRecordWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.EditableRecordWorkflowDemo

  def component, do: EditableRecordWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "editable-record-workflow-demo"}
      }
    ]
  end
end
