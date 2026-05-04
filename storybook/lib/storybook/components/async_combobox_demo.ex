defmodule ExoUI.Storybook.Components.AsyncComboboxDemo do
  @moduledoc """
  Async server-filtered combobox backed by a LiveComponent.

  Exercises the targetable `on_filter_target` API, a LiveView-managed loading state, a remote empty state, and keyboard selection after results arrive.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  @delay_ms 600
  @people [
    %{id: "ana", name: "Ana Markovic", team: "Design"},
    %{id: "maria", name: "Maria Ilic", team: "Design"},
    %{id: "nikola", name: "Nikola Petrovic", team: "Engineering"},
    %{id: "marko", name: "Marko Jovanovic", team: "Support"},
    %{id: "sara", name: "Sara Kovacevic", team: "Operations"}
  ]

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       query: "",
       loading: false,
       options: [],
       request_ref: nil
     )}
  end

  @impl true
  def update(%{async_result: {request_ref, query, options}} = assigns, socket) do
    socket = assign(socket, Map.delete(assigns, :async_result))

    if socket.assigns[:request_ref] == request_ref do
      {:ok, assign(socket, query: query, loading: false, options: options)}
    else
      {:ok, socket}
    end
  end

  def update(assigns, socket) do
    {:ok, assign(socket, assigns)}
  end

  @impl true
  def handle_event("async-combobox-filter", %{"query" => query}, socket) do
    query = to_string(query || "")
    request_ref = System.unique_integer([:positive])

    Process.send_after(
      self(),
      {__MODULE__, :results_ready, socket.assigns.id, request_ref, query},
      @delay_ms
    )

    {:noreply, assign(socket, query: query, loading: true, options: [], request_ref: request_ref)}
  end

  def results_for(query) do
    query = query |> to_string() |> String.trim() |> String.downcase()

    if String.length(query) < 2 do
      []
    else
      Enum.filter(@people, fn person ->
        haystack = "#{person.name} #{person.team}" |> String.downcase()
        String.contains?(haystack, query)
      end)
    end
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div id={@id} data-exo="combobox-async-demo">
      <.combobox
        id="cb-async"
        name="async_user"
        label="Async server filter"
        description="Simulates a remote directory lookup with LiveView-managed loading state."
        filter="server"
        on_filter="async-combobox-filter"
        on_filter_target={@myself}
        debounce={120}
        loading={@loading}
        status={combobox_status(@query, @loading, @options)}
        prompt="Search remote users..."
      >
        <:option :for={person <- @options} value={person.id}>
          <span>{person.name}</span>
          <span style="margin-left:auto;color:var(--exo-muted-foreground);font-size:var(--exo-text-xs);">
            {person.team}
          </span>
        </:option>
        <:empty :if={!@loading && @options == []}>{empty_message(@query)}</:empty>
      </.combobox>

      <p
        id="cb-async-state"
        data-exo="combobox-async-state"
        data-query={@query}
        data-loading={to_string(@loading)}
      >
        {state_message(@query, @loading, @options)}
      </p>
    </div>
    """
  end

  defp empty_message(""), do: "Type at least two characters to search remote users."
  defp empty_message(query), do: ~s(No remote users found for "#{query}".)

  defp combobox_status(_query, true, _options), do: "Loading results"
  defp combobox_status("", false, []), do: ""

  defp combobox_status(query, false, []),
    do: ~s(No remote users found for "#{query}".)

  defp combobox_status(_query, false, options),
    do: "#{length(options)} #{pluralize(length(options), "result")} available"

  defp state_message(query, true, _options), do: ~s(Searching "#{query}"...)

  defp state_message("", false, []), do: "Waiting for a remote search query."

  defp state_message(query, false, []), do: ~s(No remote users found for "#{query}".)

  defp state_message(query, false, options),
    do: "#{length(options)} remote #{pluralize(length(options), "user")} found for \"#{query}\"."

  defp pluralize(1, word), do: word
  defp pluralize(_count, word), do: word <> "s"
end
