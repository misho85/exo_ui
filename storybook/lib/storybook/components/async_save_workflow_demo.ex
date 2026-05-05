defmodule ExoUI.Storybook.Components.AsyncSaveWorkflowDemo do
  @moduledoc """
  Production-style async save workflow.

  Demonstrates validated form state, disabled submit while a save is in flight,
  a polite status region, and a server-confirmed success state.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  @delay_ms 650

  @impl true
  def mount(socket) do
    draft = initial_record()

    {:ok,
     assign(socket,
       draft: draft,
       saved: draft,
       errors: %{},
       save_state: "clean",
       request_ref: nil,
       saved_at: "not saved in this session"
     )}
  end

  @impl true
  def update(%{async_result: {request_ref, saved}} = assigns, socket) do
    socket = assign(socket, Map.delete(assigns, :async_result))

    if socket.assigns[:request_ref] == request_ref do
      {:ok,
       assign(socket,
         draft: saved,
         saved: saved,
         errors: %{},
         save_state: "saved",
         request_ref: nil,
         saved_at: "latest successful save"
       )}
    else
      {:ok, socket}
    end
  end

  def update(assigns, socket) do
    {:ok, assign(socket, assigns)}
  end

  @impl true
  def handle_event("validate-async-save", %{"record" => params}, socket) do
    draft = merge_params(socket.assigns.draft, params)
    errors = validate_draft(draft)

    {:noreply,
     assign(socket,
       draft: draft,
       errors: errors,
       save_state: if(errors == %{}, do: "dirty", else: "invalid")
     )}
  end

  def handle_event("submit-async-save", %{"record" => params}, socket) do
    draft = merge_params(socket.assigns.draft, params)
    errors = validate_draft(draft)

    if errors == %{} do
      request_ref = System.unique_integer([:positive])

      Process.send_after(
        self(),
        {__MODULE__, :save_complete, socket.assigns.id, request_ref, draft},
        @delay_ms
      )

      {:noreply,
       assign(socket,
         draft: draft,
         errors: %{},
         save_state: "saving",
         request_ref: request_ref
       )}
    else
      {:noreply,
       assign(socket,
         draft: draft,
         errors: errors,
         save_state: "blocked"
       )}
    end
  end

  def handle_event("reset-async-save", _params, socket) do
    {:noreply,
     assign(socket,
       draft: socket.assigns.saved,
       errors: %{},
       save_state: "clean"
     )}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div
      id={@id}
      data-exo="async-save-workflow"
      data-save-state={@save_state}
      data-saved-title={@saved.title}
      aria-busy={if @save_state == "saving", do: "true"}
      style="min-height: 680px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Async save workflow
        <:subtitle>
          Validated form state, disabled submit, live status text, and a confirmed success result.
        </:subtitle>
        <:actions>
          <.badge variant={save_state_variant(@save_state)}>{@save_state}</.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Draft title" value={@draft.title} subtitle="client-visible form state" />
        <.stat_card title="Saved title" value={@saved.title} subtitle={@saved_at} />
        <.stat_card title="Save state" value={@save_state} subtitle="server-owned status" />
      </div>

      <.content_card title="Editable release record">
        <ExoUI.Components.Form.form
          for={%{}}
          as={:record}
          phx-change="validate-async-save"
          phx-submit="submit-async-save"
          phx-target={@myself}
          style="display: flex; flex-direction: column; gap: 1rem;"
        >
          <ExoUI.Components.Form.input
            id="async-save-title"
            name="record[title]"
            label="Title"
            value={@draft.title}
            errors={field_errors(@errors, :title)}
          />
          <ExoUI.Components.Form.input
            id="async-save-owner"
            name="record[owner]"
            label="Owner"
            value={@draft.owner}
            description="Required before the async save is queued."
            errors={field_errors(@errors, :owner)}
          />
          <ExoUI.Components.Form.input
            id="async-save-priority"
            name="record[priority]"
            type="select"
            label="Priority"
            value={@draft.priority}
            options={priority_options()}
          />
          <ExoUI.Components.Form.input
            id="async-save-notes"
            name="record[notes]"
            type="textarea"
            rows="5"
            label="Release notes"
            value={@draft.notes}
            errors={field_errors(@errors, :notes)}
          />

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
            <.button
              type="button"
              variant="ghost"
              disabled={@save_state == "saving"}
              phx-click="reset-async-save"
              phx-target={@myself}
            >
              Reset draft
            </.button>
            <.button type="submit" disabled={@save_state == "saving"}>
              <%= if @save_state == "saving" do %>
                Saving...
              <% else %>
                Save changes
              <% end %>
            </.button>
          </div>
        </ExoUI.Components.Form.form>
      </.content_card>

      <p
        id="async-save-state"
        data-exo="async-save-state"
        data-save-state={@save_state}
        data-saved-title={@saved.title}
        role="status"
        aria-live="polite"
      >
        {status_message(@save_state, @draft, @saved)}
      </p>
    </div>
    """
  end

  def results_for_save(draft), do: draft

  defp merge_params(draft, params) do
    %{
      draft
      | title: string_param(params, "title", draft.title),
        owner: string_param(params, "owner", draft.owner),
        priority: string_param(params, "priority", draft.priority),
        notes: string_param(params, "notes", draft.notes)
    }
  end

  defp validate_draft(draft) do
    %{}
    |> maybe_error(:title, draft.title == "", "Title is required.")
    |> maybe_error(:owner, draft.owner == "", "Owner is required before saving.")
    |> maybe_error(
      :notes,
      String.length(draft.notes) < 20,
      "Add at least 20 characters of notes."
    )
  end

  defp maybe_error(errors, _key, false, _message), do: errors
  defp maybe_error(errors, key, true, message), do: Map.put(errors, key, [message])

  defp field_errors(errors, key), do: Map.get(errors, key, [])

  defp string_param(params, key, fallback),
    do: params |> Map.get(key, fallback) |> to_string() |> String.trim()

  defp status_message("clean", _draft, saved), do: "Saved record #{saved.title} is unchanged."
  defp status_message("dirty", draft, _saved), do: "Draft #{draft.title} has unsaved changes."
  defp status_message("invalid", _draft, _saved), do: "Fix validation errors before saving."
  defp status_message("blocked", _draft, _saved), do: "Save blocked by validation errors."
  defp status_message("saving", draft, _saved), do: "Saving #{draft.title}..."
  defp status_message("saved", _draft, saved), do: "Saved #{saved.title} successfully."

  defp save_state_variant("blocked"), do: "danger"
  defp save_state_variant("invalid"), do: "danger"
  defp save_state_variant("saving"), do: "warning"
  defp save_state_variant("saved"), do: "success"
  defp save_state_variant("dirty"), do: "primary"
  defp save_state_variant(_state), do: "secondary"

  defp priority_options do
    [
      {"Low", "low"},
      {"Medium", "medium"},
      {"High", "high"}
    ]
  end

  defp initial_record do
    %{
      title: "Launch checklist",
      owner: "Mina",
      priority: "high",
      notes: "Review rollout checks, customer messaging, and rollback ownership before release."
    }
  end
end
