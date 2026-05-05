defmodule Storybook.Components.AsyncSaveWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.AsyncSaveWorkflowDemo

  def component, do: AsyncSaveWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "async-save-workflow-demo"}
      }
    ]
  end

  def handle_info({AsyncSaveWorkflowDemo, :save_complete, id, request_ref, draft}, socket) do
    Phoenix.LiveView.send_update(AsyncSaveWorkflowDemo,
      id: id,
      async_result: {request_ref, AsyncSaveWorkflowDemo.results_for_save(draft)}
    )

    {:noreply, socket}
  end

  def handle_info(_message, socket), do: {:noreply, socket}
end
