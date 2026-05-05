defmodule ExoUI.Storybook.Components.CommandRoutingWorkflowDemo do
  @moduledoc """
  Production-style multi-screen command routing workflow.

  Demonstrates app-level navigation state, command palette routing across
  screens, focus-safe command closing, and route status announcements.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @screens [
    %{id: "overview", label: "Overview", icon: "layout-dashboard"},
    %{id: "accounts", label: "Accounts", icon: "building-2"},
    %{id: "risk", label: "Risk queue", icon: "shield-alert"}
  ]

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       active_screen: "overview",
       last_command: "manual navigation",
       route_count: 0
     )}
  end

  @impl true
  def handle_event("route-screen", %{"screen" => screen, "source" => source}, socket) do
    {:noreply, route_screen(socket, screen, source)}
  end

  def handle_event("route-screen", %{"screen" => screen}, socket) do
    {:noreply, route_screen(socket, screen, "navigation")}
  end

  @impl true
  def render(assigns) do
    assigns =
      assign(assigns,
        active: screen(assigns.active_screen),
        screens: @screens
      )

    ~H"""
    <div
      id={@id}
      data-exo="command-routing-workflow"
      data-active-screen={@active_screen}
      data-last-command={@last_command}
      data-route-count={@route_count}
      style="min-height: 700px; padding: 1rem; display: grid; grid-template-columns: 15rem minmax(0, 1fr); gap: 1rem;"
    >
      <aside
        aria-label="Workflow screens"
        style="display: flex; flex-direction: column; gap: 0.75rem;"
      >
        <.content_card title="Screens">
          <div role="list" style="display: flex; flex-direction: column; gap: 0.375rem;">
            <.button
              :for={item <- @screens}
              type="button"
              variant={if item.id == @active_screen, do: nil, else: "ghost"}
              phx-click="route-screen"
              phx-value-screen={item.id}
              phx-value-source="navigation"
              phx-target={@myself}
              aria-pressed={if item.id == @active_screen, do: "true", else: "false"}
              style="justify-content: flex-start; width: 100%;"
            >
              <.icon name={item.icon} />
              {item.label}
            </.button>
          </div>
        </.content_card>

        <.content_card title="Command center">
          <div style="display: flex; flex-direction: column; gap: 0.625rem;">
            <.button
              type="button"
              variant="outline"
              phx-click={show_command_palette("routing-command")}
            >
              Open routing commands
            </.button>
            <p style="margin: 0; color: var(--exo-muted-foreground); font-size: var(--exo-text-sm);">
              Shortcut: Ctrl Shift G
            </p>
          </div>
        </.content_card>
      </aside>

      <main style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
        <.header>
          {@active.label}
          <:subtitle>
            Multi-screen state is owned by LiveComponent events and can be changed by navigation or commands.
          </:subtitle>
          <:actions>
            <.badge variant="primary">{@last_command}</.badge>
          </:actions>
        </.header>

        <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem;">
          <.stat_card title="Active screen" value={@active.label} subtitle="current route" />
          <.stat_card title="Route changes" value={@route_count} subtitle="this session" />
          <.stat_card title="Command source" value={@last_command} subtitle="last transition" />
        </div>

        <section
          id={"routing-screen-#{@active_screen}"}
          data-exo="routing-screen"
          data-screen={@active_screen}
          role="region"
          aria-label={"#{@active.label} screen"}
        >
          <%= case @active_screen do %>
            <% "overview" -> %>
              <.overview_screen myself={@myself} />
            <% "accounts" -> %>
              <.accounts_screen myself={@myself} />
            <% "risk" -> %>
              <.risk_screen myself={@myself} />
          <% end %>
        </section>

        <p
          id="command-routing-state"
          data-exo="command-routing-state"
          data-active-screen={@active_screen}
          data-last-command={@last_command}
          data-route-count={@route_count}
          role="status"
          aria-live="polite"
        >
          Showing {@active.label} from {@last_command}.
        </p>
      </main>

      <.command_palette
        id="routing-command"
        label="Workflow command router"
        placeholder="Search screens and actions..."
        shortcut="ctrl+shift+g"
      >
        <:item
          :for={item <- @screens}
          label={"Go to #{item.label}"}
          value={"go-#{item.id}"}
          search={"#{item.label} screen route command navigation"}
          shortcut={String.first(item.label)}
          click={route_command(item.id, @myself)}
        />
      </.command_palette>
    </div>
    """
  end

  attr :myself, :any, required: true

  defp overview_screen(assigns) do
    ~H"""
    <.content_card title="Executive overview">
      <div style="display: grid; gap: 0.875rem;">
        <p style="margin: 0;">
          Overview combines summary cards and fast routing into the operational screens.
        </p>
        <div style="display: flex; gap: 0.5rem;">
          <.button
            type="button"
            variant="outline"
            phx-click="route-screen"
            phx-value-screen="accounts"
            phx-value-source="overview quick link"
            phx-target={@myself}
          >
            Review accounts
          </.button>
          <.button
            type="button"
            variant="outline"
            phx-click="route-screen"
            phx-value-screen="risk"
            phx-value-source="overview quick link"
            phx-target={@myself}
          >
            Open risk queue
          </.button>
        </div>
      </div>
    </.content_card>
    """
  end

  attr :myself, :any, required: true

  defp accounts_screen(assigns) do
    assigns = assign(assigns, :accounts, accounts())

    ~H"""
    <.content_card title="Accounts requiring attention">
      <:action>
        <.button
          type="button"
          size="sm"
          variant="ghost"
          phx-click="route-screen"
          phx-value-screen="risk"
          phx-value-source="accounts escalation"
          phx-target={@myself}
        >
          Escalate to risk
        </.button>
      </:action>

      <.table
        id="routing-accounts-table"
        rows={@accounts}
        row_id={&account_row_id/1}
        row_label={&account_row_label/1}
        caption="Routed account records"
      >
        <:col :let={account} label="Account">{account.name}</:col>
        <:col :let={account} label="Owner">{account.owner}</:col>
        <:col :let={account} label="Status">
          <.badge variant={account.variant}>{account.status}</.badge>
        </:col>
      </.table>
    </.content_card>
    """
  end

  attr :myself, :any, required: true

  defp risk_screen(assigns) do
    ~H"""
    <.content_card title="Risk queue">
      <:action>
        <.button
          type="button"
          size="sm"
          variant="ghost"
          phx-click="route-screen"
          phx-value-screen="accounts"
          phx-value-source="risk drilldown"
          phx-target={@myself}
        >
          Back to accounts
        </.button>
      </:action>

      <div style="display: grid; gap: 0.75rem;">
        <.alert kind={:warning} title="Review blocked account">
          Northstar needs ownership before renewal automation can continue.
        </.alert>
        <.alert kind={:error} title="Policy escalation">
          Helio Bank requires manual approval before export.
        </.alert>
      </div>
    </.content_card>
    """
  end

  defp route_command(screen, target) do
    JS.push("route-screen", value: %{screen: screen, source: "command palette"}, target: target)
    |> hide_command_palette("routing-command")
  end

  defp route_screen(socket, screen, source) do
    if Enum.any?(@screens, &(&1.id == screen)) do
      assign(socket,
        active_screen: screen,
        last_command: source,
        route_count: socket.assigns.route_count + 1
      )
    else
      socket
    end
  end

  defp screen(id), do: Enum.find(@screens, &(&1.id == id))

  defp account_row_id(account), do: "routing-account-#{account.id}"
  defp account_row_label(account), do: "Open account #{account.name}"

  defp accounts do
    [
      %{id: "acme", name: "Acme Corp", owner: "Mina", status: "Ready", variant: "success"},
      %{
        id: "northstar",
        name: "Northstar",
        owner: "Unassigned",
        status: "Blocked",
        variant: "danger"
      },
      %{
        id: "helio",
        name: "Helio Bank",
        owner: "Sara",
        status: "Manual review",
        variant: "warning"
      }
    ]
  end
end
