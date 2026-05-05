defmodule ExoUI.Storybook.Components.ButtonRecipesDemo do
  @moduledoc """
  Production-style button recipes.

  Demonstrates button variants, sizes, icon composition, disabled link safety,
  submit/loading states, destructive confirmation, and live status text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @variants [
    %{id: "primary", label: "Primary"},
    %{id: "secondary", label: "Secondary"},
    %{id: "outline", label: "Outline"},
    %{id: "ghost", label: "Ghost"},
    %{id: "danger", label: "Danger"}
  ]

  @sizes ~w(xs sm md lg)

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       selected_variant: "primary",
       saving: false,
       saved_count: 0,
       destructive_count: 0,
       action_count: 0,
       last_action: "initial button recipe"
     )}
  end

  @impl true
  def handle_event("select-button-variant", %{"variant" => variant}, socket) do
    variant = normalize_variant(variant)

    {:noreply,
     assign(socket,
       selected_variant: variant,
       action_count: socket.assigns.action_count + 1,
       last_action: "selected #{variant} variant"
     )}
  end

  def handle_event("start-button-save", _params, socket) do
    {:noreply,
     assign(socket,
       saving: true,
       action_count: socket.assigns.action_count + 1,
       last_action: "started save"
     )}
  end

  def handle_event("finish-button-save", _params, socket) do
    {:noreply,
     assign(socket,
       saving: false,
       saved_count: socket.assigns.saved_count + 1,
       action_count: socket.assigns.action_count + 1,
       last_action: "finished save"
     )}
  end

  def handle_event("queue-button-delete", _params, socket) do
    {:noreply,
     assign(socket,
       action_count: socket.assigns.action_count + 1,
       last_action: "queued destructive action"
     )}
  end

  def handle_event("confirm-button-delete", _params, socket) do
    {:noreply,
     assign(socket,
       destructive_count: socket.assigns.destructive_count + 1,
       action_count: socket.assigns.action_count + 1,
       last_action: "confirmed destructive action"
     )}
  end

  def handle_event("reset-button-recipes", _params, socket) do
    {:noreply,
     assign(socket,
       selected_variant: "primary",
       saving: false,
       saved_count: 0,
       destructive_count: 0,
       action_count: 0,
       last_action: "reset button recipe"
     )}
  end

  @impl true
  def render(assigns) do
    assigns =
      assign(assigns,
        variants: @variants,
        sizes: @sizes
      )

    ~H"""
    <div
      id={@id}
      data-exo="button-recipes-workflow"
      data-selected-variant={@selected_variant}
      data-saving={if @saving, do: "true", else: "false"}
      data-saved-count={@saved_count}
      data-destructive-count={@destructive_count}
      data-action-count={@action_count}
      data-last-action={@last_action}
      style="min-height: 720px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Button recipes
        <:subtitle>
          Production button states: variants, sizes, disabled links, loading, and destructive confirms.
        </:subtitle>
        <:actions>
          <.badge variant={@selected_variant}>{variant_label(@selected_variant)}</.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card
          title="Selected variant"
          value={variant_label(@selected_variant)}
          subtitle="active CTA"
        />
        <.stat_card title="Saved" value={@saved_count} subtitle="successful submits" />
        <.stat_card title="Destructive" value={@destructive_count} subtitle="confirmed actions" />
        <.stat_card title="Actions" value={@action_count} subtitle="this session" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Variant controls">
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              <.button
                :for={variant <- @variants}
                id={"button-recipe-variant-#{variant.id}"}
                type="button"
                size="sm"
                variant={if variant.id == @selected_variant, do: variant.id, else: "outline"}
                phx-click="select-button-variant"
                phx-value-variant={variant.id}
                phx-target={@myself}
                aria-pressed={if variant.id == @selected_variant, do: "true", else: "false"}
              >
                Use {variant.label}
              </.button>
            </div>
          </.content_card>

          <.content_card title="Primary action pattern">
            <:action>
              <.button
                type="button"
                size="sm"
                variant="ghost"
                disabled={
                  @selected_variant == "primary" and !@saving and @saved_count == 0 and
                    @destructive_count == 0
                }
                phx-click="reset-button-recipes"
                phx-target={@myself}
              >
                Reset buttons
              </.button>
            </:action>

            <div style="display: grid; gap: 1rem;">
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;">
                <.button
                  id="button-recipe-save"
                  type="button"
                  variant={@selected_variant}
                  disabled={@saving}
                  aria-busy={if @saving, do: "true", else: "false"}
                  phx-click="start-button-save"
                  phx-target={@myself}
                >
                  <.spinner :if={@saving} size="sm" label="Saving draft" />
                  <.icon :if={!@saving} name="save" />
                  <%= if @saving do %>
                    Saving draft
                  <% else %>
                    Save draft
                  <% end %>
                </.button>

                <.button
                  id="button-recipe-finish-save"
                  type="button"
                  variant="outline"
                  disabled={!@saving}
                  phx-click="finish-button-save"
                  phx-target={@myself}
                >
                  Finish save
                </.button>

                <.button
                  id="button-recipe-delete"
                  type="button"
                  variant="danger"
                  phx-click={queue_delete(@myself)}
                >
                  <.icon name="trash-2" /> Delete draft
                </.button>
              </div>

              <p style="margin: 0; color: var(--exo-muted-foreground); font-size: var(--exo-text-sm);">
                The save button defaults to <code>type="button"</code>, disables while saving, and uses
                an inline spinner with an accessible label.
              </p>
            </div>
          </.content_card>

          <.content_card title="Size and composition">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;">
              <.button :for={size <- @sizes} type="button" size={size} variant="outline">
                Size {size}
              </.button>
              <.button type="button" variant="secondary">
                <.icon name="plus" /> Icon action
              </.button>
              <.button
                id="button-recipe-disabled-link"
                href="/billing"
                disabled
                variant="outline"
              >
                Billing unavailable
              </.button>
            </div>
          </.content_card>
        </div>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Button state">
            <.list>
              <:item title="Variant">{variant_label(@selected_variant)}</:item>
              <:item title="Saving">{if @saving, do: "Yes", else: "No"}</:item>
              <:item title="Saved">{@saved_count}</:item>
              <:item title="Destructive">{@destructive_count}</:item>
            </.list>
          </.content_card>

          <.alert kind={if @saving, do: :info, else: :success} title="Stateful button recipe">
            {@last_action}
          </.alert>
        </aside>
      </div>

      <.confirm_modal
        id="button-delete-confirm"
        title="Delete draft"
        message="Use a danger button for destructive actions and keep confirmation text explicit."
        confirm_text="Confirm delete"
        cancel_text="Keep draft"
        variant="danger"
        on_confirm={JS.push("confirm-button-delete", target: @myself)}
      />

      <p
        id="button-recipes-state"
        data-exo="button-recipes-state"
        data-selected-variant={@selected_variant}
        data-saving={if @saving, do: "true", else: "false"}
        data-saved-count={@saved_count}
        data-destructive-count={@destructive_count}
        data-action-count={@action_count}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Button recipe: {variant_label(@selected_variant)} variant; {@last_action}.
      </p>
    </div>
    """
  end

  defp queue_delete(target) do
    JS.push("queue-button-delete", target: target)
    |> show_modal_js("button-delete-confirm")
  end

  defp show_modal_js(js, id) do
    js
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> JS.remove_attribute("inert", to: "##{id}")
    |> JS.show(to: "##{id}")
    |> JS.focus_first(to: "##{id} [data-exo=\"modal-content\"]")
  end

  defp normalize_variant(variant)
       when variant in ["primary", "secondary", "outline", "ghost", "danger"],
       do: variant

  defp normalize_variant(_variant), do: "primary"

  defp variant_label("primary"), do: "Primary"
  defp variant_label("secondary"), do: "Secondary"
  defp variant_label("outline"), do: "Outline"
  defp variant_label("ghost"), do: "Ghost"
  defp variant_label("danger"), do: "Danger"
  defp variant_label(_variant), do: "Default"
end
