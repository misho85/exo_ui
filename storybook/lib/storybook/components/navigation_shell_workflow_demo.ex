defmodule ExoUI.Storybook.Components.NavigationShellWorkflowDemo do
  @moduledoc """
  Production-style navigation shell workflow.

  Demonstrates navbar, breadcrumbs, tabs, wizard sidebar, steps, pagination,
  bottom navigation, and LiveComponent-targeted navigation events in one app
  shell.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  @sections [
    %{id: "overview", label: "Overview", icon: "layout-dashboard"},
    %{id: "plan", label: "Plan", icon: "clipboard-list"},
    %{id: "rollout", label: "Rollout", icon: "rocket"},
    %{id: "report", label: "Report", icon: "chart-column"}
  ]

  @tabs [
    %{id: "summary", label: "Summary", icon: "layout-list"},
    %{id: "teams", label: "Teams", icon: "users"},
    %{id: "risks", label: "Risks", icon: "shield-alert"},
    %{id: "archive", label: "Archive", icon: "archive", disabled: true}
  ]

  @steps [
    %{id: "scope", label: "Scope"},
    %{id: "configure", label: "Configure"},
    %{id: "validate", label: "Validate"},
    %{id: "launch", label: "Launch"}
  ]

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       active_section: "overview",
       active_tab: "summary",
       active_step: "scope",
       page: 1,
       transition_count: 0,
       last_action: "opened navigation shell"
     )}
  end

  @impl true
  def handle_event("change-nav-section", %{"section" => section}, socket) do
    {:noreply, change_section(socket, section, "section navigation")}
  end

  def handle_event("change-nav-section", %{"item" => section}, socket) do
    {:noreply, change_section(socket, section, "bottom navigation")}
  end

  def handle_event("change-navigation-tab", %{"tab" => tab}, socket) do
    if Enum.any?(@tabs, &(&1.id == tab and !Map.get(&1, :disabled, false))) do
      {:noreply,
       assign(socket,
         active_tab: tab,
         last_action: "opened #{tab_label(tab)} tab",
         transition_count: socket.assigns.transition_count + 1
       )}
    else
      {:noreply, socket}
    end
  end

  def handle_event("goto-navigation-step", %{"step" => step}, socket) do
    if Enum.any?(@steps, &(&1.id == step)) do
      {:noreply,
       assign(socket,
         active_step: step,
         last_action: "opened #{step_label(step)} step",
         transition_count: socket.assigns.transition_count + 1
       )}
    else
      {:noreply, socket}
    end
  end

  def handle_event("set-navigation-page", %{"page" => page}, socket) do
    page = page |> parse_page() |> min(total_pages()) |> max(1)

    {:noreply,
     assign(socket,
       page: page,
       last_action: "opened page #{page}",
       transition_count: socket.assigns.transition_count + 1
     )}
  end

  def handle_event("reset-navigation-shell", _params, socket) do
    {:noreply,
     assign(socket,
       active_section: "overview",
       active_tab: "summary",
       active_step: "scope",
       page: 1,
       transition_count: 0,
       last_action: "reset navigation shell"
     )}
  end

  @impl true
  def render(assigns) do
    assigns =
      assign(assigns,
        sections: @sections,
        tabs: @tabs,
        active_section_data: section(assigns.active_section),
        active_tab_data: tab(assigns.active_tab),
        active_step_data: step(assigns.active_step),
        progress_value: progress_value(assigns.active_step),
        section_rows: section_rows(assigns.active_section),
        wizard_steps: wizard_steps(assigns.active_step),
        page_rows: paged_rows(assigns.page),
        total_pages: total_pages()
      )

    ~H"""
    <div
      id={@id}
      data-exo="navigation-shell-workflow"
      data-active-section={@active_section}
      data-active-tab={@active_tab}
      data-active-step={@active_step}
      data-page={@page}
      data-transition-count={@transition_count}
      data-last-action={@last_action}
      style="min-height: 820px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.navbar aria-label="Navigation shell top bar">
        <:brand>
          <span style="font-weight: 700;">Exo Operations</span>
        </:brand>
        <:center>
          <.breadcrumb aria_label="Navigation shell breadcrumb" separator="›">
            <:item href="#">Workspace</:item>
            <:item href="#">Launch Center</:item>
            <:item current>{@active_section_data.label}</:item>
          </.breadcrumb>
        </:center>
        <:end_content>
          <.badge variant="primary">{@transition_count} transitions</.badge>
          <.theme_toggle id="navigation-shell-theme" />
        </:end_content>
      </.navbar>

      <div style="display: grid; grid-template-columns: 17rem minmax(0, 1fr); gap: 1rem; align-items: start;">
        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Sections">
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <.button
                :for={item <- @sections}
                type="button"
                variant={if item.id == @active_section, do: "primary", else: "ghost"}
                phx-click="change-nav-section"
                phx-value-section={item.id}
                phx-target={@myself}
                aria-pressed={if item.id == @active_section, do: "true", else: "false"}
                style="justify-content: flex-start; width: 100%;"
              >
                <.icon name={item.icon} />
                {item.label}
              </.button>
            </div>
          </.content_card>

          <.content_card title="Wizard progress">
            <.wizard_sidebar
              steps={@wizard_steps}
              on_click="goto-navigation-step"
              target={@myself}
              aria_label="Navigation shell setup progress"
            />
          </.content_card>
        </aside>

        <main style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.header>
            {@active_section_data.label}
            <:subtitle>
              Navigation state is owned by a LiveComponent and shared across shell controls.
            </:subtitle>
            <:actions>
              <.button
                type="button"
                size="sm"
                variant="outline"
                phx-click="reset-navigation-shell"
                phx-target={@myself}
              >
                Reset shell
              </.button>
            </:actions>
          </.header>

          <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
            <.stat_card title="Section" value={@active_section_data.label} subtitle="top-level route" />
            <.stat_card title="Tab" value={@active_tab_data.label} subtitle="panel state" />
            <.stat_card title="Step" value={@active_step_data.label} subtitle="wizard state" />
            <.stat_card title="Page" value={@page} subtitle={"of #{@total_pages}"} />
          </div>

          <.content_card title="Shell controls">
            <.tabs
              id="navigation-shell-tabs"
              active={@active_tab}
              aria_label="Navigation shell tabs"
              activation="automatic"
              target={@myself}
            >
              <:tab
                :for={item <- @tabs}
                id={item.id}
                label={item.label}
                icon={item.icon}
                click="change-navigation-tab"
                disabled={Map.get(item, :disabled, false)}
              />
              <:panel tab="summary">
                <.section_summary rows={@section_rows} />
              </:panel>
              <:panel tab="teams">
                <.teams_panel />
              </:panel>
              <:panel tab="risks">
                <.risks_panel />
              </:panel>
            </.tabs>
          </.content_card>

          <div style="display: grid; grid-template-columns: minmax(0, 1fr) 20rem; gap: 1rem; align-items: start;">
            <.content_card title="Route page">
              <:action>
                <.badge variant="secondary">page {@page}</.badge>
              </:action>

              <.table
                id="navigation-shell-page-table"
                rows={@page_rows}
                row_id={&"navigation-shell-row-#{&1.id}"}
                row_label={&"Open #{&1.title}"}
                caption="Navigation shell paged tasks"
              >
                <:col :let={row} label="Task">{row.title}</:col>
                <:col :let={row} label="Owner">{row.owner}</:col>
                <:col :let={row} label="State">
                  <.badge variant={row.variant}>{row.state}</.badge>
                </:col>
              </.table>

              <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                <.pagination
                  page={@page}
                  total_pages={@total_pages}
                  on_click="set-navigation-page"
                  target={@myself}
                  aria_label="Navigation shell pagination"
                  page_label="Open navigation shell page %{page}"
                />
              </div>
            </.content_card>

            <aside style="display: flex; flex-direction: column; gap: 1rem;">
              <.content_card title="Launch readiness">
                <.progress
                  value={@progress_value}
                  label="Setup progress"
                  aria_label="Navigation shell setup progress"
                />
                <.steps aria_label="Navigation shell step summary" style="margin-top: 1rem;">
                  <:step
                    :for={item <- @wizard_steps}
                    title={item.label}
                    status={step_status_string(item.status)}
                    description={step_description(item.id)}
                  />
                </.steps>
              </.content_card>

              <.alert kind={alert_kind(@active_step)} title="Navigation status">
                {@last_action}
              </.alert>
            </aside>
          </div>
        </main>
      </div>

      <.bottom_nav aria-label="Navigation shell mobile navigation" target={@myself}>
        <:item
          :for={item <- @sections}
          label={item.label}
          icon={item.icon}
          click="change-nav-section"
          click_value={item.id}
          active={item.id == @active_section}
        />
      </.bottom_nav>

      <p
        id="navigation-shell-state"
        data-exo="navigation-shell-state"
        data-active-section={@active_section}
        data-active-tab={@active_tab}
        data-active-step={@active_step}
        data-page={@page}
        data-transition-count={@transition_count}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Navigation shell showing {@active_section_data.label}, {@active_tab_data.label}, {@active_step_data.label}, page {@page}.
      </p>
    </div>
    """
  end

  attr :rows, :list, required: true

  defp section_summary(assigns) do
    ~H"""
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem;">
      <.metric_card
        :for={row <- @rows}
        title={row.title}
        value={row.value}
        subtitle={row.subtitle}
      />
    </div>
    """
  end

  defp teams_panel(assigns) do
    ~H"""
    <.list>
      <:item title="Platform">Owns deployment gates and service readiness.</:item>
      <:item title="Support">Owns customer-facing launch communication.</:item>
      <:item title="Security">Owns policy review and exception handling.</:item>
    </.list>
    """
  end

  defp risks_panel(assigns) do
    ~H"""
    <div style="display: grid; gap: 0.75rem;">
      <.alert kind={:warning} title="Capacity risk">
        The support queue needs coverage before launch.
      </.alert>
      <.alert kind={:info} title="Dependency review">
        Integration checks are ready for final validation.
      </.alert>
    </div>
    """
  end

  defp change_section(socket, section, source) do
    if Enum.any?(@sections, &(&1.id == section)) do
      assign(socket,
        active_section: section,
        active_tab: "summary",
        last_action: "#{source}: #{section_label(section)}",
        transition_count: socket.assigns.transition_count + 1
      )
    else
      socket
    end
  end

  defp wizard_steps(active_step) do
    active_index = Enum.find_index(@steps, &(&1.id == active_step)) || 0

    @steps
    |> Enum.with_index()
    |> Enum.map(fn {step, idx} ->
      status =
        cond do
          idx < active_index -> :completed
          idx == active_index -> :current
          true -> :pending
        end

      Map.put(step, :status, status)
    end)
  end

  defp paged_rows(page) do
    page
    |> page_rows()
    |> Enum.with_index(1)
    |> Enum.map(fn {row, idx} -> Map.put(row, :id, "#{page}-#{idx}") end)
  end

  defp page_rows(1) do
    [
      %{title: "Confirm route map", owner: "Mina", state: "Ready", variant: "success"},
      %{title: "Review topbar actions", owner: "Lena", state: "Ready", variant: "success"}
    ]
  end

  defp page_rows(2) do
    [
      %{title: "Validate mobile nav labels", owner: "Omar", state: "Review", variant: "warning"},
      %{title: "Audit wizard targeting", owner: "Sara", state: "Ready", variant: "success"}
    ]
  end

  defp page_rows(_page) do
    [
      %{title: "Capture visual baseline", owner: "Kai", state: "Queued", variant: "secondary"},
      %{title: "Publish navigation recipe", owner: "Nina", state: "Queued", variant: "secondary"}
    ]
  end

  defp section_rows("plan") do
    [
      %{title: "Milestones", value: "4", subtitle: "route checkpoints"},
      %{title: "Owners", value: "6", subtitle: "teams assigned"},
      %{title: "Scope", value: "Ready", subtitle: "approved"}
    ]
  end

  defp section_rows("rollout") do
    [
      %{title: "Windows", value: "3", subtitle: "regional launch slots"},
      %{title: "Progress", value: "67%", subtitle: "validation complete"},
      %{title: "Risks", value: "2", subtitle: "tracked"}
    ]
  end

  defp section_rows("report") do
    [
      %{title: "Exports", value: "8", subtitle: "prepared reports"},
      %{title: "Reviewers", value: "4", subtitle: "signed off"},
      %{title: "Status", value: "Draft", subtitle: "not published"}
    ]
  end

  defp section_rows(_overview) do
    [
      %{title: "Active routes", value: "4", subtitle: "shell sections"},
      %{title: "Tasks", value: "6", subtitle: "paged records"},
      %{title: "Readiness", value: "25%", subtitle: "wizard progress"}
    ]
  end

  defp progress_value("scope"), do: 25
  defp progress_value("configure"), do: 50
  defp progress_value("validate"), do: 75
  defp progress_value("launch"), do: 100
  defp progress_value(_step), do: 0

  defp alert_kind("launch"), do: :success
  defp alert_kind("validate"), do: :warning
  defp alert_kind(_step), do: :info

  defp step_status_string(:completed), do: "complete"
  defp step_status_string(:current), do: "current"
  defp step_status_string(_status), do: "upcoming"

  defp step_description("scope"), do: "Route scope approved"
  defp step_description("configure"), do: "Shell state wired"
  defp step_description("validate"), do: "Browser checks ready"
  defp step_description("launch"), do: "Capture and publish"

  defp parse_page(page) when is_integer(page), do: page

  defp parse_page(page) when is_binary(page) do
    case Integer.parse(page) do
      {number, _rest} -> number
      :error -> 1
    end
  end

  defp total_pages, do: 3

  defp section(id), do: Enum.find(@sections, &(&1.id == id)) || hd(@sections)
  defp section_label(id), do: section(id).label
  defp tab(id), do: Enum.find(@tabs, &(&1.id == id)) || hd(@tabs)
  defp tab_label(id), do: tab(id).label
  defp step(id), do: Enum.find(@steps, &(&1.id == id)) || hd(@steps)
  defp step_label(id), do: step(id).label
end
