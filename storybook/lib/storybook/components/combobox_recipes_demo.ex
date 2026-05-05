defmodule ExoUI.Storybook.Components.ComboboxRecipesDemo do
  @moduledoc """
  Production-style combobox recipes.

  Demonstrates client filtering, input triggers, server filtering, grouped
  options, disabled options, clearable values, creatable rows, disabled
  comboboxes, submit safety, and live status text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  @impl true
  def mount(socket) do
    draft = initial_record()

    {:ok,
     assign(socket,
       draft: draft,
       saved: draft,
       errors: %{},
       remote_query: "",
       remote_options: people(),
       validation_state: "clean",
       submitted_count: 0,
       last_action: "initial combobox recipe"
     )}
  end

  @impl true
  def handle_event("change-combobox-recipes", %{"recipe" => params}, socket) do
    draft = merge_record(socket.assigns.draft, params)
    errors = validate_record(draft)

    {:noreply,
     assign(socket,
       draft: draft,
       errors: errors,
       validation_state: validation_state(errors, draft, socket.assigns.saved),
       last_action:
         if(errors == %{}, do: "changed combobox recipe", else: "blocked invalid combobox")
     )}
  end

  def handle_event("submit-combobox-recipes", %{"recipe" => params}, socket) do
    draft = merge_record(socket.assigns.draft, params)
    errors = validate_record(draft)

    if errors == %{} do
      {:noreply,
       assign(socket,
         draft: draft,
         saved: draft,
         errors: %{},
         validation_state: "submitted",
         submitted_count: socket.assigns.submitted_count + 1,
         last_action: "submitted combobox recipe"
       )}
    else
      {:noreply,
       assign(socket,
         draft: draft,
         errors: errors,
         validation_state: "blocked",
         last_action: "blocked submit"
       )}
    end
  end

  def handle_event("filter-combobox-recipes", %{"query" => query}, socket) do
    query = query |> to_string() |> String.trim()

    {:noreply,
     assign(socket,
       remote_query: query,
       remote_options: remote_results_for(query),
       last_action: if(query == "", do: "cleared remote search", else: "filtered remote users")
     )}
  end

  def handle_event("clear-combobox-recipes", _params, socket) do
    draft = %{socket.assigns.draft | assignee: "", remote_user: ""}
    errors = validate_record(draft)

    {:noreply,
     assign(socket,
       draft: draft,
       errors: errors,
       validation_state: "invalid",
       last_action: "cleared required comboboxes"
     )}
  end

  def handle_event("reset-combobox-recipes", _params, socket) do
    {:noreply,
     assign(socket,
       draft: socket.assigns.saved,
       errors: %{},
       remote_query: "",
       remote_options: people(),
       validation_state: "clean",
       last_action: "reset combobox recipe"
     )}
  end

  @impl true
  def render(assigns) do
    assigns =
      assign(assigns,
        assignee_label: person_label(assigns.draft.assignee),
        city_label: city_label(assigns.draft.city),
        remote_user_label: person_label(assigns.draft.remote_user),
        tag_label: tag_label(assigns.draft.tag),
        remote_status: remote_status(assigns.remote_query, assigns.remote_options)
      )

    ~H"""
    <div
      id={@id}
      data-exo="combobox-recipes-workflow"
      data-assignee={@draft.assignee}
      data-city={@draft.city}
      data-remote-user={@draft.remote_user}
      data-tag={@draft.tag}
      data-locked-team={@draft.locked_team}
      data-remote-query={@remote_query}
      data-remote-count={length(@remote_options)}
      data-validation-state={@validation_state}
      data-submitted-count={@submitted_count}
      data-last-action={@last_action}
      style="min-height: 820px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Combobox recipes
        <:subtitle>
          Client search, input triggers, server filtering, clearable values, and submit-safe state.
        </:subtitle>
        <:actions>
          <.badge variant={validation_badge_variant(@validation_state)}>
            {@validation_state}
          </.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Assignee" value={@assignee_label} subtitle="client filter" />
        <.stat_card title="Remote user" value={@remote_user_label} subtitle={@remote_status} />
        <.stat_card title="City" value={@city_label} subtitle="input trigger" />
        <.stat_card title="Submits" value={@submitted_count} subtitle="accepted records" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <.content_card title="Combobox form">
          <:action>
            <div style="display: flex; gap: 0.5rem;">
              <.button
                type="button"
                size="sm"
                variant="outline"
                phx-click="clear-combobox-recipes"
                phx-target={@myself}
              >
                Clear required comboboxes
              </.button>
              <.button
                type="button"
                size="sm"
                variant="ghost"
                disabled={@validation_state == "clean"}
                phx-click="reset-combobox-recipes"
                phx-target={@myself}
              >
                Reset comboboxes
              </.button>
            </div>
          </:action>

          <ExoUI.Components.Form.form
            for={%{}}
            as={:recipe}
            phx-change="change-combobox-recipes"
            phx-submit="submit-combobox-recipes"
            phx-target={@myself}
            style="display: grid; gap: 1rem;"
          >
            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;">
              <.combobox
                id="combobox-recipe-assignee"
                name="recipe[assignee]"
                value={@draft.assignee}
                label="Assignee"
                prompt="Find a teammate..."
                filter="client"
                description="Required. Client-side filtering is enough for a short static team list."
                errors={field_errors(@errors, :assignee)}
              >
                <:option value="ana" group="Design">Ana Markovic</:option>
                <:option value="maria" group="Design">Maria Ilic</:option>
                <:option value="nikola" group="Engineering">Nikola Petrovic</:option>
                <:option value="stefan" group="Engineering" disabled>Stefan unavailable</:option>
                <:option value="sara" group="Operations">Sara Kovacevic</:option>
                <:empty>No teammates found.</:empty>
              </.combobox>

              <.combobox
                id="combobox-recipe-remote"
                name="recipe[remote_user]"
                value={@draft.remote_user}
                label="Remote user"
                prompt="Search remote directory..."
                filter="server"
                on_filter="filter-combobox-recipes"
                on_filter_target={@myself}
                debounce={100}
                status={@remote_status}
                description="Required. Server filtering keeps large directories out of the initial page."
                errors={field_errors(@errors, :remote_user)}
              >
                <:option :for={person <- @remote_options} value={person.id}>
                  <span>{person.name}</span>
                  <span style="margin-left:auto;color:var(--exo-muted-foreground);font-size:var(--exo-text-xs);">
                    {person.team}
                  </span>
                </:option>
                <:empty>{remote_empty_message(@remote_query)}</:empty>
              </.combobox>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;">
              <.combobox
                id="combobox-recipe-city"
                name="recipe[city]"
                value={@draft.city}
                label="City"
                prompt="Type a city..."
                trigger="input"
                filter="client"
                description="Input-trigger mode works well when typing is the primary action."
              >
                <:option value="bg">Belgrade</:option>
                <:option value="zg">Zagreb</:option>
                <:option value="sa">Sarajevo</:option>
                <:option value="lj">Ljubljana</:option>
                <:empty>No cities found.</:empty>
              </.combobox>

              <.combobox
                id="combobox-recipe-tag"
                name="recipe[tag]"
                value={@draft.tag}
                label="Tag"
                prompt="Search or create tag..."
                filter="client"
                creatable
                description="Creatable rows expose the typed query for app-owned create behavior."
              >
                <:option value="bug">Bug</:option>
                <:option value="feature">Feature</:option>
                <:option value="docs">Docs</:option>
                <:empty>No existing tag found.</:empty>
              </.combobox>
            </div>

            <.combobox
              id="combobox-recipe-locked-team"
              name="recipe[locked_team]"
              value={@draft.locked_team}
              label="Locked team"
              prompt="Team cannot be changed"
              disabled
              description="Disabled comboboxes should keep their submitted hidden value stable."
            >
              <:option value="ops">Operations</:option>
              <:option value="support">Support</:option>
            </.combobox>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
              <.button
                id="combobox-recipe-submit"
                type="submit"
                disabled={@errors != %{}}
                aria-disabled={if @errors != %{}, do: "true", else: "false"}
              >
                <.icon name="save" /> Save combobox record
              </.button>
            </div>
          </ExoUI.Components.Form.form>
        </.content_card>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Combobox state">
            <.list>
              <:item title="Saved assignee">{person_label(@saved.assignee)}</:item>
              <:item title="Current assignee">{@assignee_label}</:item>
              <:item title="Remote query">
                {if @remote_query == "", do: "None", else: @remote_query}
              </:item>
              <:item title="Errors">{map_size(@errors)}</:item>
            </.list>
          </.content_card>

          <.alert
            kind={if @errors == %{}, do: :success, else: :warning}
            title="Combobox validation status"
          >
            {@last_action}
          </.alert>
        </aside>
      </div>

      <p
        id="combobox-recipes-state"
        data-exo="combobox-recipes-state"
        data-assignee={@draft.assignee}
        data-city={@draft.city}
        data-remote-user={@draft.remote_user}
        data-tag={@draft.tag}
        data-locked-team={@draft.locked_team}
        data-remote-query={@remote_query}
        data-remote-count={length(@remote_options)}
        data-validation-state={@validation_state}
        data-submitted-count={@submitted_count}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Combobox recipe: {@validation_state}; {@last_action}.
      </p>
    </div>
    """
  end

  defp initial_record do
    %{
      assignee: "maria",
      city: "",
      remote_user: "ana",
      tag: "bug",
      locked_team: "ops"
    }
  end

  defp merge_record(draft, params) do
    %{
      draft
      | assignee: string_param(params, "assignee", draft.assignee),
        city: string_param(params, "city", draft.city),
        remote_user: string_param(params, "remote_user", draft.remote_user),
        tag: string_param(params, "tag", draft.tag),
        locked_team: string_param(params, "locked_team", draft.locked_team)
    }
  end

  defp validate_record(record) do
    %{}
    |> maybe_error(:assignee, record.assignee == "", "choose an assignee")
    |> maybe_error(:remote_user, record.remote_user == "", "choose a remote user")
  end

  defp validation_state(errors, draft, saved) when errors == %{} and draft == saved, do: "clean"
  defp validation_state(errors, _draft, _saved) when errors == %{}, do: "ready"
  defp validation_state(_errors, _draft, _saved), do: "invalid"

  defp remote_results_for(query) do
    query = query |> to_string() |> String.downcase()

    if String.length(String.trim(query)) < 2 do
      people()
    else
      Enum.filter(people(), fn person ->
        haystack = "#{person.name} #{person.team}" |> String.downcase()
        String.contains?(haystack, query)
      end)
    end
  end

  defp people do
    [
      %{id: "ana", name: "Ana Markovic", team: "Design"},
      %{id: "maria", name: "Maria Ilic", team: "Design"},
      %{id: "nikola", name: "Nikola Petrovic", team: "Engineering"},
      %{id: "marko", name: "Marko Jovanovic", team: "Support"},
      %{id: "sara", name: "Sara Kovacevic", team: "Operations"}
    ]
  end

  defp field_errors(errors, key), do: Map.get(errors, key, [])

  defp maybe_error(errors, _key, false, _message), do: errors
  defp maybe_error(errors, key, true, message), do: Map.put(errors, key, [message])

  defp string_param(params, key, fallback) do
    params
    |> Map.get(key, fallback)
    |> to_string()
  end

  defp remote_status("", options), do: "#{length(options)} remote users available"
  defp remote_status(_query, []), do: "No remote users found"
  defp remote_status(_query, options), do: "#{length(options)} remote users available"

  defp remote_empty_message(""), do: "Type at least two characters to search remote users."
  defp remote_empty_message(query), do: ~s(No remote users found for "#{query}".)

  defp person_label("ana"), do: "Ana Markovic"
  defp person_label("maria"), do: "Maria Ilic"
  defp person_label("nikola"), do: "Nikola Petrovic"
  defp person_label("marko"), do: "Marko Jovanovic"
  defp person_label("sara"), do: "Sara Kovacevic"
  defp person_label(_person), do: "Not selected"

  defp city_label("bg"), do: "Belgrade"
  defp city_label("zg"), do: "Zagreb"
  defp city_label("sa"), do: "Sarajevo"
  defp city_label("lj"), do: "Ljubljana"
  defp city_label(_city), do: "Not selected"

  defp tag_label("bug"), do: "Bug"
  defp tag_label("feature"), do: "Feature"
  defp tag_label("docs"), do: "Docs"
  defp tag_label(_tag), do: "Not selected"

  defp validation_badge_variant("clean"), do: "secondary"
  defp validation_badge_variant("ready"), do: "primary"
  defp validation_badge_variant("submitted"), do: "success"
  defp validation_badge_variant("invalid"), do: "warning"
  defp validation_badge_variant("blocked"), do: "danger"
  defp validation_badge_variant(_state), do: "secondary"
end
