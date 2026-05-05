defmodule ExoUI.Storybook.Components.ModalRecipesDemo do
  @moduledoc """
  Production-style modal recipes.

  Demonstrates titled modals, labelled titleless modals, server-owned form state,
  guarded confirm dialogs, close callbacks, and live status text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       workspace_name: "Northstar CRM",
       workspace_owner: "Lena",
       invite_email: "ops@example.com",
       notes: "Review billing permissions before rollout.",
       saved_count: 0,
       invite_count: 0,
       confirm_count: 0,
       cancel_count: 0,
       last_action: "initial modal recipe"
     )}
  end

  @impl true
  def handle_event("change-modal-draft", %{"modal_recipe" => params}, socket) do
    {:noreply,
     assign(socket,
       workspace_name: Map.get(params, "workspace_name", socket.assigns.workspace_name),
       workspace_owner: Map.get(params, "workspace_owner", socket.assigns.workspace_owner),
       invite_email: Map.get(params, "invite_email", socket.assigns.invite_email),
       notes: Map.get(params, "notes", socket.assigns.notes),
       last_action: "edited modal form"
     )}
  end

  def handle_event("save-modal-record", _params, socket) do
    {:noreply,
     assign(socket,
       saved_count: socket.assigns.saved_count + 1,
       last_action: "saved #{socket.assigns.workspace_name}"
     )}
  end

  def handle_event("send-modal-invite", _params, socket) do
    {:noreply,
     assign(socket,
       invite_count: socket.assigns.invite_count + 1,
       last_action: "sent invite to #{socket.assigns.invite_email}"
     )}
  end

  def handle_event("validate-modal-archive", _params, socket) do
    {:noreply,
     assign(socket,
       confirm_count: socket.assigns.confirm_count + 1,
       last_action: "validated archive request"
     )}
  end

  def handle_event("cancel-modal", _params, socket) do
    {:noreply,
     assign(socket,
       cancel_count: socket.assigns.cancel_count + 1,
       last_action: "cancelled modal"
     )}
  end

  def handle_event("reset-modal-recipes", _params, socket) do
    {:noreply,
     assign(socket,
       workspace_name: "Northstar CRM",
       workspace_owner: "Lena",
       invite_email: "ops@example.com",
       notes: "Review billing permissions before rollout.",
       saved_count: 0,
       invite_count: 0,
       confirm_count: 0,
       cancel_count: 0,
       last_action: "reset modal recipe"
     )}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div
      id={@id}
      data-exo="modal-recipes-workflow"
      data-workspace-name={@workspace_name}
      data-workspace-owner={@workspace_owner}
      data-invite-email={@invite_email}
      data-saved-count={@saved_count}
      data-invite-count={@invite_count}
      data-confirm-count={@confirm_count}
      data-cancel-count={@cancel_count}
      data-last-action={@last_action}
      style="min-height: 760px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Modal recipes
        <:subtitle>
          Titled dialogs, labelled titleless dialogs, guarded confirms, close callbacks, and server-owned form state.
        </:subtitle>
        <:actions>
          <.badge variant={if @confirm_count > 0, do: "warning", else: "primary"}>
            {@saved_count + @invite_count + @confirm_count} actions
          </.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Saved" value={@saved_count} subtitle="editor modal" />
        <.stat_card title="Invites" value={@invite_count} subtitle="labelled modal" />
        <.stat_card title="Validations" value={@confirm_count} subtitle="guarded confirm" />
        <.stat_card title="Cancels" value={@cancel_count} subtitle="on_cancel callback" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Modal triggers">
            <:action>
              <.button
                type="button"
                size="sm"
                variant="ghost"
                disabled={
                  @workspace_name == "Northstar CRM" and @workspace_owner == "Lena" and
                    @invite_email == "ops@example.com" and @saved_count == 0 and
                    @invite_count == 0 and @confirm_count == 0 and @cancel_count == 0
                }
                phx-click="reset-modal-recipes"
                phx-target={@myself}
              >
                Reset modals
              </.button>
            </:action>

            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              <.button
                id="modal-recipe-open-editor"
                type="button"
                phx-click={show_modal("modal-recipe-editor")}
              >
                <.icon name="panel-top-open" /> Open editor modal
              </.button>
              <.button
                id="modal-recipe-open-labelled"
                type="button"
                variant="outline"
                phx-click={show_modal("modal-recipe-labelled")}
              >
                <.icon name="mail" /> Open labelled modal
              </.button>
              <.button
                id="modal-recipe-open-confirm"
                type="button"
                variant="danger"
                phx-click={show_modal("modal-recipe-archive-confirm")}
              >
                <.icon name="archive" /> Open guarded confirm
              </.button>
            </div>
          </.content_card>

          <.content_card title="Current modal draft">
            <.list>
              <:item title="Workspace">{@workspace_name}</:item>
              <:item title="Owner">{@workspace_owner}</:item>
              <:item title="Invite">{@invite_email}</:item>
              <:item title="Notes">{@notes}</:item>
            </.list>
          </.content_card>
        </div>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Modal checklist">
            <.list>
              <:item title="Title">aria-labelledby</:item>
              <:item title="No title">aria-label</:item>
              <:item title="Confirm">alertdialog</:item>
              <:item title="Validation">close_on_confirm=false</:item>
            </.list>
          </.content_card>

          <.alert kind={if @confirm_count > 0, do: :warning, else: :info} title="Modal state">
            {@last_action}
          </.alert>
        </aside>
      </div>

      <.modal
        id="modal-recipe-editor"
        on_cancel={JS.push("cancel-modal", target: @myself)}
      >
        <:title>Review workspace access</:title>
        <ExoUI.Components.form
          id="modal-recipe-form"
          for={%{}}
          as={:modal_recipe}
          phx-change="change-modal-draft"
          phx-target={@myself}
          style="display: grid; gap: 0.75rem;"
        >
          <.input
            id="modal-recipe-workspace-name"
            name="modal_recipe[workspace_name]"
            label="Workspace name"
            value={@workspace_name}
            autocomplete="off"
          />
          <.input
            id="modal-recipe-workspace-owner"
            name="modal_recipe[workspace_owner]"
            label="Workspace owner"
            value={@workspace_owner}
            autocomplete="off"
          />
          <.input
            id="modal-recipe-notes"
            name="modal_recipe[notes]"
            label="Review notes"
            type="textarea"
            rows="4"
            value={@notes}
          />
        </ExoUI.Components.form>
        <:actions>
          <.button
            type="button"
            variant="ghost"
            phx-click={JS.push("cancel-modal", target: @myself) |> hide_modal("modal-recipe-editor")}
          >
            Cancel
          </.button>
          <.button
            type="button"
            phx-click={
              JS.push("save-modal-record", target: @myself) |> hide_modal("modal-recipe-editor")
            }
          >
            Save modal changes
          </.button>
        </:actions>
      </.modal>

      <.modal
        id="modal-recipe-labelled"
        label="Invite teammate dialog"
        on_cancel={JS.push("cancel-modal", target: @myself)}
      >
        <ExoUI.Components.form
          id="modal-recipe-invite-form"
          for={%{}}
          as={:modal_recipe}
          phx-change="change-modal-draft"
          phx-target={@myself}
          style="display: grid; gap: 0.75rem;"
        >
          <p style="margin: 0; color: var(--exo-muted-foreground);">
            This modal intentionally omits a visible title and relies on an explicit accessible label.
          </p>
          <.input
            id="modal-recipe-invite-email"
            name="modal_recipe[invite_email]"
            label="Invite email"
            type="email"
            value={@invite_email}
            autocomplete="off"
          />
        </ExoUI.Components.form>
        <:actions>
          <.button
            type="button"
            variant="ghost"
            phx-click={
              JS.push("cancel-modal", target: @myself) |> hide_modal("modal-recipe-labelled")
            }
          >
            Cancel invite
          </.button>
          <.button
            type="button"
            phx-click={
              JS.push("send-modal-invite", target: @myself) |> hide_modal("modal-recipe-labelled")
            }
          >
            Send labelled invite
          </.button>
        </:actions>
      </.modal>

      <.confirm_modal
        id="modal-recipe-archive-confirm"
        title="Archive workspace"
        message="The confirm action stays open while the server validates archive permissions."
        confirm_text="Validate archive"
        cancel_text="Keep workspace"
        variant="danger"
        close_on_confirm={false}
        on_confirm={JS.push("validate-modal-archive", target: @myself)}
        on_cancel={JS.push("cancel-modal", target: @myself)}
      />

      <p
        id="modal-recipes-state"
        data-exo="modal-recipes-state"
        data-workspace-name={@workspace_name}
        data-workspace-owner={@workspace_owner}
        data-invite-email={@invite_email}
        data-saved-count={@saved_count}
        data-invite-count={@invite_count}
        data-confirm-count={@confirm_count}
        data-cancel-count={@cancel_count}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Modal recipe: {@last_action}.
      </p>
    </div>
    """
  end
end
