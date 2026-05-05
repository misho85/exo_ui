defmodule ExoUI.Storybook.Components.InputRecipesDemo do
  @moduledoc """
  Production-style input recipes.

  Demonstrates text, email, textarea, checkbox, readonly, disabled, validation,
  described-by wiring, submit safety, and live status text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  @max_notes_length 120

  @impl true
  def mount(socket) do
    profile = initial_profile()

    {:ok,
     assign(socket,
       draft: profile,
       saved: profile,
       errors: %{},
       validation_state: "clean",
       submitted_count: 0,
       last_action: "initial input recipe"
     )}
  end

  @impl true
  def handle_event("validate-input-recipes", %{"profile" => params}, socket) do
    draft = merge_profile(socket.assigns.draft, params)
    errors = validate_profile(draft)

    {:noreply,
     assign(socket,
       draft: draft,
       errors: errors,
       validation_state: validation_state(errors, draft, socket.assigns.saved),
       last_action: if(errors == %{}, do: "validated input recipe", else: "blocked invalid input")
     )}
  end

  def handle_event("submit-input-recipes", %{"profile" => params}, socket) do
    draft = merge_profile(socket.assigns.draft, params)
    errors = validate_profile(draft)

    if errors == %{} do
      {:noreply,
       assign(socket,
         draft: draft,
         saved: draft,
         errors: %{},
         validation_state: "submitted",
         submitted_count: socket.assigns.submitted_count + 1,
         last_action: "submitted input recipe"
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

  def handle_event("reset-input-recipes", _params, socket) do
    {:noreply,
     assign(socket,
       draft: socket.assigns.saved,
       errors: %{},
       validation_state: "clean",
       last_action: "reset input recipe"
     )}
  end

  @impl true
  def render(assigns) do
    assigns =
      assign(assigns,
        name_length: String.length(assigns.draft.name),
        notes_length: String.length(assigns.draft.notes),
        max_notes_length: @max_notes_length
      )

    ~H"""
    <div
      id={@id}
      data-exo="input-recipes-workflow"
      data-validation-state={@validation_state}
      data-submitted-count={@submitted_count}
      data-name-length={@name_length}
      data-notes-length={@notes_length}
      data-terms-accepted={if @draft.terms, do: "true", else: "false"}
      data-last-action={@last_action}
      style="min-height: 760px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Input recipes
        <:subtitle>
          Text, email, textarea, checkbox, disabled, readonly, and validation-safe submit states.
        </:subtitle>
        <:actions>
          <.badge variant={validation_badge_variant(@validation_state)}>
            {@validation_state}
          </.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Validation" value={@validation_state} subtitle="server-owned" />
        <.stat_card title="Submits" value={@submitted_count} subtitle="accepted records" />
        <.stat_card title="Name length" value={@name_length} subtitle="minimum 3" />
        <.stat_card
          title="Notes"
          value={"#{@notes_length}/#{@max_notes_length}"}
          subtitle="textarea guard"
        />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <.content_card title="Profile input form">
          <:action>
            <.button
              type="button"
              size="sm"
              variant="ghost"
              disabled={@validation_state == "clean"}
              phx-click="reset-input-recipes"
              phx-target={@myself}
            >
              Reset inputs
            </.button>
          </:action>

          <ExoUI.Components.Form.form
            for={%{}}
            as={:profile}
            phx-change="validate-input-recipes"
            phx-submit="submit-input-recipes"
            phx-target={@myself}
            style="display: grid; gap: 1rem;"
          >
            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;">
              <ExoUI.Components.Form.input
                id="input-recipe-name"
                name="profile[name]"
                label="Display name"
                value={@draft.name}
                placeholder="Operations owner"
                description="Use at least 3 visible characters."
                errors={field_errors(@errors, :name)}
                required
              />
              <ExoUI.Components.Form.input
                id="input-recipe-email"
                type="email"
                name="profile[email]"
                label="Work email"
                value={@draft.email}
                placeholder="owner@example.com"
                description="Used for assignment notifications."
                errors={field_errors(@errors, :email)}
                autocomplete="email"
                required
              />
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;">
              <ExoUI.Components.Form.input
                id="input-recipe-slug"
                name="profile[slug]"
                label="Read-only slug"
                value={@draft.slug}
                description="Readonly values should still submit with the form."
                readonly
              />
              <ExoUI.Components.Form.input
                id="input-recipe-api-key"
                name="profile[api_key]"
                label="Disabled API key"
                value="not sent"
                description="Disabled controls are displayed but omitted from submit params."
                disabled
              />
            </div>

            <ExoUI.Components.Form.input
              id="input-recipe-notes"
              type="textarea"
              name="profile[notes]"
              label="Reviewer notes"
              value={@draft.notes}
              rows="5"
              description={"#{@notes_length}/#{@max_notes_length} characters. Keep operational notes short."}
              errors={field_errors(@errors, :notes)}
            />

            <ExoUI.Components.Form.input
              id="input-recipe-terms"
              type="checkbox"
              name="profile[terms]"
              label="I confirm that required fields are accurate"
              value={@draft.terms}
              description="Checkbox validation should expose the same description/error pattern as text fields."
              errors={field_errors(@errors, :terms)}
            />

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
              <.button
                id="input-recipe-submit"
                type="submit"
                disabled={@errors != %{}}
                aria-disabled={if @errors != %{}, do: "true", else: "false"}
              >
                <.icon name="save" /> Save input record
              </.button>
            </div>
          </ExoUI.Components.Form.form>
        </.content_card>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Input state">
            <.list>
              <:item title="Saved email">{@saved.email}</:item>
              <:item title="Current email">{@draft.email}</:item>
              <:item title="Terms accepted">{if @draft.terms, do: "Yes", else: "No"}</:item>
              <:item title="Errors">{map_size(@errors)}</:item>
            </.list>
          </.content_card>

          <.alert
            kind={if @errors == %{}, do: :success, else: :warning}
            title="Input validation status"
          >
            {@last_action}
          </.alert>
        </aside>
      </div>

      <p
        id="input-recipes-state"
        data-exo="input-recipes-state"
        data-validation-state={@validation_state}
        data-submitted-count={@submitted_count}
        data-name-length={@name_length}
        data-notes-length={@notes_length}
        data-terms-accepted={if @draft.terms, do: "true", else: "false"}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Input recipe: {@validation_state}; {@last_action}.
      </p>
    </div>
    """
  end

  defp initial_profile do
    %{
      name: "Operations Owner",
      email: "owner@example.com",
      slug: "operations-owner",
      notes: "Ready for review handoff.",
      terms: true
    }
  end

  defp merge_profile(draft, params) do
    %{
      draft
      | name: string_param(params, "name", draft.name),
        email: string_param(params, "email", draft.email),
        slug: string_param(params, "slug", draft.slug),
        notes: string_param(params, "notes", draft.notes),
        terms: boolean_param(Map.get(params, "terms", draft.terms))
    }
  end

  defp validate_profile(profile) do
    %{}
    |> maybe_error(
      :name,
      String.length(String.trim(profile.name)) < 3,
      "must be at least 3 characters"
    )
    |> maybe_error(:email, !valid_email?(profile.email), "must be a valid email address")
    |> maybe_error(
      :notes,
      String.length(profile.notes) > @max_notes_length,
      "must be #{@max_notes_length} characters or fewer"
    )
    |> maybe_error(:terms, !profile.terms, "must be accepted")
  end

  defp validation_state(errors, draft, saved) when errors == %{} and draft == saved, do: "clean"
  defp validation_state(errors, _draft, _saved) when errors == %{}, do: "ready"
  defp validation_state(_errors, _draft, _saved), do: "invalid"

  defp field_errors(errors, key), do: Map.get(errors, key, [])

  defp maybe_error(errors, _key, false, _message), do: errors
  defp maybe_error(errors, key, true, message), do: Map.put(errors, key, [message])

  defp valid_email?(email) do
    email = String.trim(email)
    String.contains?(email, "@") and String.contains?(email, ".")
  end

  defp string_param(params, key, fallback) do
    params
    |> Map.get(key, fallback)
    |> to_string()
  end

  defp boolean_param(value) when value in [true, "true", "1", 1, "on"], do: true
  defp boolean_param(_value), do: false

  defp validation_badge_variant("clean"), do: "secondary"
  defp validation_badge_variant("ready"), do: "primary"
  defp validation_badge_variant("submitted"), do: "success"
  defp validation_badge_variant("invalid"), do: "warning"
  defp validation_badge_variant("blocked"), do: "danger"
  defp validation_badge_variant(_state), do: "secondary"
end
