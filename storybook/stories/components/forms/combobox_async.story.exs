defmodule Storybook.Components.ComboboxAsync do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.AsyncComboboxDemo

  def component, do: AsyncComboboxDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :remote_search,
        attributes: %{id: "cb-async-demo"}
      }
    ]
  end

  def handle_info({AsyncComboboxDemo, :results_ready, id, request_ref, query}, socket) do
    Phoenix.LiveView.send_update(AsyncComboboxDemo,
      id: id,
      async_result: {request_ref, query, AsyncComboboxDemo.results_for(query)}
    )

    {:noreply, socket}
  end

  def handle_info(_message, socket), do: {:noreply, socket}
end
