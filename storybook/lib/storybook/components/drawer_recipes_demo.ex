defmodule ExoUI.Storybook.Components.DrawerRecipesDemo do
  @moduledoc """
  Production-style drawer recipes.

  Demonstrates right and left drawers, titleless labelled drawers, drawer-hosted
  forms, server validation that keeps the drawer open, long body scrolling,
  close callbacks, and live status text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       selected_section: "accounts",
       owner: "Lena",
       priority: "high",
       note: "Follow up before contract renewal.",
       segment: "all",
       include_archived: false,
       validation_attempted: false,
       saved_count: 0,
       validation_count: 0,
       navigation_count: 0,
       filter_count: 0,
       cancel_count: 0,
       last_action: "initial drawer recipe"
     )}
  end

  @impl true
  def handle_event("change-drawer-detail", %{"drawer_recipe" => params}, socket) do
    {:noreply,
     assign(socket,
       owner: Map.get(params, "owner", socket.assigns.owner),
       priority: normalize_priority(Map.get(params, "priority", socket.assigns.priority)),
       note: Map.get(params, "note", socket.assigns.note),
       validation_attempted: false,
       last_action: "edited drawer detail"
     )}
  end

  def handle_event("change-drawer-filters", %{"drawer_recipe" => params}, socket) do
    {:noreply,
     assign(socket,
       segment: normalize_segment(Map.get(params, "segment", socket.assigns.segment)),
       include_archived: Map.get(params, "include_archived", "false") == "true",
       last_action: "edited drawer filters"
     )}
  end

  def handle_event("save-drawer-review", _params, socket) do
    if drawer_owner_valid?(socket.assigns.owner) do
      {:noreply,
       assign(socket,
         saved_count: socket.assigns.saved_count + 1,
         validation_attempted: false,
         last_action: "saved drawer review for #{socket.assigns.owner}"
       )}
    else
      {:noreply,
       assign(socket,
         validation_count: socket.assigns.validation_count + 1,
         validation_attempted: true,
         last_action: "blocked drawer save"
       )}
    end
  end

  def handle_event("select-drawer-section", %{"section" => section}, socket) do
    section = normalize_section(section)

    {:noreply,
     assign(socket,
       selected_section: section,
       navigation_count: socket.assigns.navigation_count + 1,
       last_action: "selected #{section_label(section)}"
     )}
  end

  def handle_event("apply-drawer-filters", _params, socket) do
    {:noreply,
     assign(socket,
       filter_count: socket.assigns.filter_count + 1,
       last_action: "applied #{segment_label(socket.assigns.segment)} filters"
     )}
  end

  def handle_event("cancel-drawer", _params, socket) do
    {:noreply,
     assign(socket,
       cancel_count: socket.assigns.cancel_count + 1,
       last_action: "cancelled drawer"
     )}
  end

  def handle_event("reset-drawer-recipes", _params, socket) do
    {:noreply,
     assign(socket,
       selected_section: "accounts",
       owner: "Lena",
       priority: "high",
       note: "Follow up before contract renewal.",
       segment: "all",
       include_archived: false,
       validation_attempted: false,
       saved_count: 0,
       validation_count: 0,
       navigation_count: 0,
       filter_count: 0,
       cancel_count: 0,
       last_action: "reset drawer recipe"
     )}
  end

  @impl true
  def render(assigns) do
    owner_errors = owner_errors(assigns.owner, assigns.validation_attempted)

    assigns =
      assign(assigns,
        owner_errors: owner_errors,
        owner_valid?: drawer_owner_valid?(assigns.owner),
        archived_label: if(assigns.include_archived, do: "Yes", else: "No")
      )

    ~H"""
    <div
      id={@id}
      data-exo="drawer-recipes-workflow"
      data-selected-section={@selected_section}
      data-owner={@owner}
      data-priority={@priority}
      data-segment={@segment}
      data-include-archived={if @include_archived, do: "true", else: "false"}
      data-saved-count={@saved_count}
      data-validation-count={@validation_count}
      data-navigation-count={@navigation_count}
      data-filter-count={@filter_count}
      data-cancel-count={@cancel_count}
      data-last-action={@last_action}
      style="min-height: 780px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Drawer recipes
        <:subtitle>
          Right and left drawers, labelled titleless panels, long forms, validation, and focus-safe closing.
        </:subtitle>
        <:actions>
          <.badge variant={if @validation_count > 0, do: "warning", else: "primary"}>
            {section_label(@selected_section)}
          </.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Saved" value={@saved_count} subtitle="right drawer" />
        <.stat_card title="Validation" value={@validation_count} subtitle="keeps open" />
        <.stat_card title="Navigation" value={@navigation_count} subtitle="left drawer" />
        <.stat_card title="Filters" value={@filter_count} subtitle="labelled drawer" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Drawer triggers">
            <:action>
              <.button
                type="button"
                size="sm"
                variant="ghost"
                disabled={
                  @selected_section == "accounts" and @owner == "Lena" and @priority == "high" and
                    @segment == "all" and !@include_archived and @saved_count == 0 and
                    @validation_count == 0 and @navigation_count == 0 and @filter_count == 0 and
                    @cancel_count == 0
                }
                phx-click="reset-drawer-recipes"
                phx-target={@myself}
              >
                Reset drawers
              </.button>
            </:action>

            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              <.button
                id="drawer-recipe-open-detail"
                type="button"
                phx-click={show_drawer("drawer-recipe-detail")}
              >
                <.icon name="panel-right-open" /> Open review drawer
              </.button>
              <.button
                id="drawer-recipe-open-navigation"
                type="button"
                variant="outline"
                phx-click={show_drawer("drawer-recipe-navigation")}
              >
                <.icon name="panel-left-open" /> Open navigation drawer
              </.button>
              <.button
                id="drawer-recipe-open-filters"
                type="button"
                variant="secondary"
                phx-click={show_drawer("drawer-recipe-filters")}
              >
                <.icon name="sliders-horizontal" /> Open filter drawer
              </.button>
            </div>
          </.content_card>

          <.content_card title="Drawer state">
            <.list>
              <:item title="Section">{section_label(@selected_section)}</:item>
              <:item title="Owner">{owner_label(@owner)}</:item>
              <:item title="Priority">{priority_label(@priority)}</:item>
              <:item title="Segment">{segment_label(@segment)}</:item>
              <:item title="Archived">{@archived_label}</:item>
            </.list>
          </.content_card>
        </div>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Drawer checklist">
            <.list>
              <:item title="Right">form-heavy task panel</:item>
              <:item title="Left">navigation panel</:item>
              <:item title="No title">aria-label fallback</:item>
              <:item title="Long body">internal scrolling</:item>
            </.list>
          </.content_card>

          <.alert kind={if @validation_count > 0, do: :warning, else: :info} title="Drawer state">
            {@last_action}
          </.alert>
        </aside>
      </div>

      <.drawer
        id="drawer-recipe-detail"
        side="right"
        on_cancel={JS.push("cancel-drawer", target: @myself)}
      >
        <:title>Review account drawer</:title>
        <div style="display: grid; gap: 1rem;">
          <ExoUI.Components.form
            id="drawer-recipe-detail-form"
            for={%{}}
            as={:drawer_recipe}
            phx-change="change-drawer-detail"
            phx-target={@myself}
            style="display: grid; gap: 0.75rem;"
          >
            <.input
              id="drawer-recipe-owner"
              name="drawer_recipe[owner]"
              label="Account owner"
              value={@owner}
              errors={@owner_errors}
              autocomplete="off"
            />
            <.select
              id="drawer-recipe-priority"
              name="drawer_recipe[priority]"
              label="Priority"
              value={@priority}
              options={priority_options()}
            />
            <.input
              id="drawer-recipe-note"
              name="drawer_recipe[note]"
              type="textarea"
              label="Review note"
              rows="5"
              value={@note}
            />
          </ExoUI.Components.form>

          <section aria-label="Drawer review checklist" style="display: grid; gap: 0.5rem;">
            <ExoUI.Components.Form.input
              :for={item <- drawer_checklist()}
              id={"drawer-recipe-check-#{String.replace(item.label, ~r/[^a-z0-9]+/i, "-")}"}
              type="checkbox"
              label={item.label}
              checked={item.checked}
              disabled
            />
          </section>

          <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
            <.button
              type="button"
              variant="ghost"
              phx-click={
                JS.push("cancel-drawer", target: @myself) |> hide_drawer("drawer-recipe-detail")
              }
            >
              Close review drawer
            </.button>
            <.button type="button" phx-click={drawer_save_click(@owner, @myself)}>
              Save drawer review
            </.button>
          </div>
        </div>
      </.drawer>

      <.drawer
        id="drawer-recipe-navigation"
        side="left"
        on_cancel={JS.push("cancel-drawer", target: @myself)}
      >
        <:title>Navigation drawer</:title>
        <nav aria-label="Drawer recipe navigation" style="display: grid; gap: 0.5rem;">
          <.button
            :for={{section, label} <- section_options()}
            type="button"
            variant={if section == @selected_section, do: "primary", else: "outline"}
            phx-click={select_section_click(section, @myself)}
            aria-current={if section == @selected_section, do: "page"}
          >
            {label}
          </.button>
        </nav>
      </.drawer>

      <.drawer
        id="drawer-recipe-filters"
        side="right"
        label="Segment filters drawer"
        on_cancel={JS.push("cancel-drawer", target: @myself)}
      >
        <ExoUI.Components.form
          id="drawer-recipe-filter-form"
          for={%{}}
          as={:drawer_recipe}
          phx-change="change-drawer-filters"
          phx-target={@myself}
          style="display: grid; gap: 0.75rem;"
        >
          <p style="margin: 0; color: var(--exo-muted-foreground);">
            This drawer intentionally omits a title and relies on the explicit drawer label.
          </p>
          <.select
            id="drawer-recipe-segment"
            name="drawer_recipe[segment]"
            label="Account segment"
            value={@segment}
            options={segment_options()}
          />
          <.input
            id="drawer-recipe-include-archived"
            name="drawer_recipe[include_archived]"
            type="checkbox"
            label="Include archived accounts"
            checked={@include_archived}
          />
        </ExoUI.Components.form>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <.button
            type="button"
            variant="ghost"
            phx-click={
              JS.push("cancel-drawer", target: @myself) |> hide_drawer("drawer-recipe-filters")
            }
          >
            Cancel filters
          </.button>
          <.button
            type="button"
            phx-click={
              JS.push("apply-drawer-filters", target: @myself) |> hide_drawer("drawer-recipe-filters")
            }
          >
            Apply drawer filters
          </.button>
        </div>
      </.drawer>

      <p
        id="drawer-recipes-state"
        data-exo="drawer-recipes-state"
        data-selected-section={@selected_section}
        data-owner={@owner}
        data-priority={@priority}
        data-segment={@segment}
        data-include-archived={if @include_archived, do: "true", else: "false"}
        data-saved-count={@saved_count}
        data-validation-count={@validation_count}
        data-navigation-count={@navigation_count}
        data-filter-count={@filter_count}
        data-cancel-count={@cancel_count}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Drawer recipe: {@last_action}.
      </p>
    </div>
    """
  end

  defp drawer_save_click(owner, target) do
    js = JS.push("save-drawer-review", target: target)

    if drawer_owner_valid?(owner) do
      hide_drawer(js, "drawer-recipe-detail")
    else
      js
    end
  end

  defp select_section_click(section, target) do
    JS.push("select-drawer-section", value: %{section: section}, target: target)
    |> hide_drawer("drawer-recipe-navigation")
  end

  defp drawer_owner_valid?(owner), do: String.trim(to_string(owner)) != ""

  defp owner_errors(owner, true) do
    if drawer_owner_valid?(owner), do: [], else: ["Owner is required before saving drawer."]
  end

  defp owner_errors(_owner, _validation_attempted), do: []

  defp normalize_priority(priority) when priority in ["low", "medium", "high"], do: priority
  defp normalize_priority(_priority), do: "medium"

  defp normalize_segment(segment) when segment in ["all", "enterprise", "growth"], do: segment
  defp normalize_segment(_segment), do: "all"

  defp normalize_section(section) when section in ["accounts", "billing", "security"], do: section
  defp normalize_section(_section), do: "accounts"

  defp priority_options do
    [
      {"Low", "low"},
      {"Medium", "medium"},
      {"High", "high"}
    ]
  end

  defp segment_options do
    [
      {"All segments", "all"},
      {"Enterprise", "enterprise"},
      {"Growth", "growth"}
    ]
  end

  defp section_options do
    [
      {"accounts", "Open account queue"},
      {"billing", "Open billing queue"},
      {"security", "Open security queue"}
    ]
  end

  defp drawer_checklist do
    [
      %{label: "Identity verified", checked: true},
      %{label: "Renewal risk checked", checked: true},
      %{label: "Billing owner confirmed", checked: false},
      %{label: "Security review attached", checked: false},
      %{label: "Support notes scanned", checked: true},
      %{label: "Executive sponsor mapped", checked: false},
      %{label: "Implementation milestone current", checked: true},
      %{label: "Usage anomaly reviewed", checked: false},
      %{label: "Contract terms linked", checked: true},
      %{label: "Next action scheduled", checked: false},
      %{label: "Escalation path documented", checked: true},
      %{label: "Final approval ready", checked: false}
    ]
  end

  defp owner_label(""), do: "Missing"
  defp owner_label(owner), do: owner

  defp priority_label("low"), do: "Low"
  defp priority_label("medium"), do: "Medium"
  defp priority_label("high"), do: "High"
  defp priority_label(priority), do: priority

  defp segment_label("all"), do: "All segments"
  defp segment_label("enterprise"), do: "Enterprise"
  defp segment_label("growth"), do: "Growth"
  defp segment_label(segment), do: segment

  defp section_label("accounts"), do: "Accounts"
  defp section_label("billing"), do: "Billing"
  defp section_label("security"), do: "Security"
  defp section_label(section), do: section
end
