defmodule ExoUI.Storybook.Components.SelectRecipesDemo do
  @moduledoc """
  Production-style select recipes.

  Demonstrates prompt validation, grouped options, icons, disabled options,
  disabled selects, server-owned state, submit safety, and live status text.
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
       validation_state: "clean",
       submitted_count: 0,
       last_action: "initial select recipe"
     )}
  end

  @impl true
  def handle_event("change-select-recipes", %{"recipe" => params}, socket) do
    draft = merge_record(socket.assigns.draft, params)
    errors = validate_record(draft)

    {:noreply,
     assign(socket,
       draft: draft,
       errors: errors,
       validation_state: validation_state(errors, draft, socket.assigns.saved),
       last_action: if(errors == %{}, do: "changed select recipe", else: "blocked invalid select")
     )}
  end

  def handle_event("submit-select-recipes", %{"recipe" => params}, socket) do
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
         last_action: "submitted select recipe"
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

  def handle_event("clear-select-recipes", _params, socket) do
    draft = %{socket.assigns.draft | status: "", owner: ""}
    errors = validate_record(draft)

    {:noreply,
     assign(socket,
       draft: draft,
       errors: errors,
       validation_state: "invalid",
       last_action: "cleared required selects"
     )}
  end

  def handle_event("reset-select-recipes", _params, socket) do
    {:noreply,
     assign(socket,
       draft: socket.assigns.saved,
       errors: %{},
       validation_state: "clean",
       last_action: "reset select recipe"
     )}
  end

  @impl true
  def render(assigns) do
    assigns =
      assign(assigns,
        owner_label: owner_label(assigns.draft.owner),
        status_label: status_label(assigns.draft.status),
        priority_label: priority_label(assigns.draft.priority)
      )

    ~H"""
    <div
      id={@id}
      data-exo="select-recipes-workflow"
      data-status={@draft.status}
      data-priority={@draft.priority}
      data-owner={@draft.owner}
      data-region={@draft.region}
      data-validation-state={@validation_state}
      data-submitted-count={@submitted_count}
      data-last-action={@last_action}
      style="min-height: 760px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Select recipes
        <:subtitle>
          Grouped options, icons, disabled options, validation, and LiveView-owned select state.
        </:subtitle>
        <:actions>
          <.badge variant={validation_badge_variant(@validation_state)}>
            {@validation_state}
          </.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Status" value={@status_label} subtitle="workflow state" />
        <.stat_card title="Priority" value={@priority_label} subtitle="icon option" />
        <.stat_card title="Owner" value={@owner_label} subtitle="grouped option" />
        <.stat_card title="Submits" value={@submitted_count} subtitle="accepted records" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <.content_card title="Select form">
          <:action>
            <div style="display: flex; gap: 0.5rem;">
              <.button
                type="button"
                size="sm"
                variant="outline"
                phx-click="clear-select-recipes"
                phx-target={@myself}
              >
                Clear required selections
              </.button>
              <.button
                type="button"
                size="sm"
                variant="ghost"
                disabled={@validation_state == "clean"}
                phx-click="reset-select-recipes"
                phx-target={@myself}
              >
                Reset selects
              </.button>
            </div>
          </:action>

          <ExoUI.Components.Form.form
            for={%{}}
            as={:recipe}
            phx-change="change-select-recipes"
            phx-submit="submit-select-recipes"
            phx-target={@myself}
            style="display: grid; gap: 1rem;"
          >
            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;">
              <.select
                id="select-recipe-status"
                name="recipe[status]"
                value={@draft.status}
                label="Workflow status"
                prompt="Choose status"
                description="Required before the record can be saved."
                errors={field_errors(@errors, :status)}
              >
                <:option value="draft" icon="file" group="Visible">Draft</:option>
                <:option value="active" icon="check" group="Visible">Active</:option>
                <:option value="blocked" icon="octagon-alert" group="Needs attention">
                  Blocked
                </:option>
                <:option value="archived" icon="archive" group="Hidden">Archived</:option>
                <:option value="deleted" icon="trash-2" group="Hidden" disabled>
                  Deleted unavailable
                </:option>
              </.select>

              <.select
                id="select-recipe-priority"
                name="recipe[priority]"
                value={@draft.priority}
                label="Priority"
                description="Icon options should still submit a plain hidden value."
              >
                <:option value="low" icon="arrow-down">Low</:option>
                <:option value="medium" icon="minus">Medium</:option>
                <:option value="high" icon="arrow-up">High</:option>
                <:option value="critical" icon="siren" disabled>Critical locked</:option>
              </.select>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;">
              <.select
                id="select-recipe-owner"
                name="recipe[owner]"
                value={@draft.owner}
                label="Owner queue"
                prompt="Choose owner"
                description="Grouped options keep longer lists scannable."
                errors={field_errors(@errors, :owner)}
              >
                <:option value="ops" group="Internal">Operations queue</:option>
                <:option value="success" group="Internal">Customer success</:option>
                <:option value="support" group="Customer-facing">Support queue</:option>
                <:option value="partner" group="Customer-facing">Partner desk</:option>
              </.select>

              <.select
                id="select-recipe-region"
                name="recipe[region]"
                value={@draft.region}
                label="Locked region"
                description="Disabled selects communicate state but should not be interactive."
                disabled
              >
                <:option value="emea">EMEA</:option>
                <:option value="amer">AMER</:option>
                <:option value="apac">APAC</:option>
              </.select>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
              <.button
                id="select-recipe-submit"
                type="submit"
                disabled={@errors != %{}}
                aria-disabled={if @errors != %{}, do: "true", else: "false"}
              >
                <.icon name="save" /> Save select record
              </.button>
            </div>
          </ExoUI.Components.Form.form>
        </.content_card>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Select state">
            <.list>
              <:item title="Saved status">{status_label(@saved.status)}</:item>
              <:item title="Current status">{@status_label}</:item>
              <:item title="Current owner">{@owner_label}</:item>
              <:item title="Errors">{map_size(@errors)}</:item>
            </.list>
          </.content_card>

          <.alert
            kind={if @errors == %{}, do: :success, else: :warning}
            title="Select validation status"
          >
            {@last_action}
          </.alert>
        </aside>
      </div>

      <p
        id="select-recipes-state"
        data-exo="select-recipes-state"
        data-status={@draft.status}
        data-priority={@draft.priority}
        data-owner={@draft.owner}
        data-region={@draft.region}
        data-validation-state={@validation_state}
        data-submitted-count={@submitted_count}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Select recipe: {@validation_state}; {@last_action}.
      </p>
    </div>
    """
  end

  defp initial_record do
    %{
      status: "active",
      priority: "medium",
      owner: "ops",
      region: "emea"
    }
  end

  defp merge_record(draft, params) do
    %{
      draft
      | status: string_param(params, "status", draft.status),
        priority: string_param(params, "priority", draft.priority),
        owner: string_param(params, "owner", draft.owner),
        region: string_param(params, "region", draft.region)
    }
  end

  defp validate_record(record) do
    %{}
    |> maybe_error(:status, record.status == "", "choose a workflow status")
    |> maybe_error(:owner, record.owner == "", "choose an owner queue")
  end

  defp validation_state(errors, draft, saved) when errors == %{} and draft == saved, do: "clean"
  defp validation_state(errors, _draft, _saved) when errors == %{}, do: "ready"
  defp validation_state(_errors, _draft, _saved), do: "invalid"

  defp field_errors(errors, key), do: Map.get(errors, key, [])

  defp maybe_error(errors, _key, false, _message), do: errors
  defp maybe_error(errors, key, true, message), do: Map.put(errors, key, [message])

  defp string_param(params, key, fallback) do
    params
    |> Map.get(key, fallback)
    |> to_string()
  end

  defp status_label("draft"), do: "Draft"
  defp status_label("active"), do: "Active"
  defp status_label("blocked"), do: "Blocked"
  defp status_label("archived"), do: "Archived"
  defp status_label(_status), do: "Not selected"

  defp priority_label("low"), do: "Low"
  defp priority_label("medium"), do: "Medium"
  defp priority_label("high"), do: "High"
  defp priority_label(_priority), do: "Not selected"

  defp owner_label("ops"), do: "Operations queue"
  defp owner_label("success"), do: "Customer success"
  defp owner_label("support"), do: "Support queue"
  defp owner_label("partner"), do: "Partner desk"
  defp owner_label(_owner), do: "Not selected"

  defp validation_badge_variant("clean"), do: "secondary"
  defp validation_badge_variant("ready"), do: "primary"
  defp validation_badge_variant("submitted"), do: "success"
  defp validation_badge_variant("invalid"), do: "warning"
  defp validation_badge_variant("blocked"), do: "danger"
  defp validation_badge_variant(_state), do: "secondary"
end
