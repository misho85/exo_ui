defmodule ExoUI.Storybook.Components.CommandPaletteRecipesDemo do
  @moduledoc """
  Production-style command palette recipes.

  Demonstrates trigger and shortcut opening, keyboard filtering, disabled
  commands, custom empty states, manual-only palettes, non-closing commands,
  and server-owned command routing state.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       active_screen: "overview",
       last_command: "none",
       command_count: 0,
       preview_count: 0,
       export_count: 0,
       last_action: "initial command palette recipe"
     )}
  end

  @impl true
  def handle_event("run-command-palette", %{"command" => command}, socket) do
    command = normalize_command(command)

    {:noreply,
     assign(socket,
       active_screen: command_screen(command),
       last_command: command,
       command_count: socket.assigns.command_count + 1,
       last_action: "ran #{command_label(command)}"
     )}
  end

  def handle_event("preview-command-palette-export", _params, socket) do
    {:noreply,
     assign(socket,
       preview_count: socket.assigns.preview_count + 1,
       last_command: "preview_export",
       last_action: "previewed export without closing"
     )}
  end

  def handle_event("apply-command-palette-export", _params, socket) do
    {:noreply,
     assign(socket,
       active_screen: "exports",
       last_command: "apply_export",
       export_count: socket.assigns.export_count + 1,
       command_count: socket.assigns.command_count + 1,
       last_action: "applied manual export"
     )}
  end

  def handle_event("reset-command-palette-recipes", _params, socket) do
    {:noreply,
     assign(socket,
       active_screen: "overview",
       last_command: "none",
       command_count: 0,
       preview_count: 0,
       export_count: 0,
       last_action: "reset command palette recipe"
     )}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div
      id={@id}
      data-exo="command-palette-recipes-workflow"
      data-active-screen={@active_screen}
      data-last-command={@last_command}
      data-command-count={@command_count}
      data-preview-count={@preview_count}
      data-export-count={@export_count}
      data-last-action={@last_action}
      style="min-height: 760px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Command palette recipes
        <:subtitle>
          Trigger and shortcut opening, filtering, disabled commands, empty states, and manual command surfaces.
        </:subtitle>
        <:actions>
          <.badge variant={if @active_screen == "risk", do: "warning", else: "primary"}>
            {screen_label(@active_screen)}
          </.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Screen" value={screen_label(@active_screen)} subtitle="routed state" />
        <.stat_card title="Commands" value={@command_count} subtitle="selected items" />
        <.stat_card title="Previews" value={@preview_count} subtitle="close=false" />
        <.stat_card title="Exports" value={@export_count} subtitle="manual palette" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Command surfaces">
            <:action>
              <.button
                type="button"
                size="sm"
                variant="ghost"
                disabled={
                  @active_screen == "overview" and @last_command == "none" and
                    @command_count == 0 and @preview_count == 0 and @export_count == 0
                }
                phx-click="reset-command-palette-recipes"
                phx-target={@myself}
              >
                Reset commands
              </.button>
            </:action>

            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              <.button
                id="command-recipe-open-primary"
                type="button"
                phx-click={show_command_palette("command-recipe-primary")}
              >
                <.icon name="search" /> Open command palette
              </.button>
              <.button
                id="command-recipe-open-manual"
                type="button"
                variant="outline"
                phx-click={show_command_palette("command-recipe-manual")}
              >
                <.icon name="terminal" /> Open manual commands
              </.button>
            </div>
          </.content_card>

          <.content_card title="Routed content">
            <section
              id="command-recipe-screen"
              data-screen={@active_screen}
              aria-label="Command recipe routed content"
              style="display: grid; gap: 0.75rem;"
            >
              <.badge variant={screen_variant(@active_screen)}>{screen_label(@active_screen)}</.badge>
              <p style="margin: 0; color: var(--exo-muted-foreground);">
                {screen_description(@active_screen)}
              </p>
            </section>
          </.content_card>
        </div>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Palette checklist">
            <.list>
              <:item title="Shortcut">Ctrl+Shift+K</:item>
              <:item title="Manual">no global shortcut</:item>
              <:item title="Search">data-search text</:item>
              <:item title="Disabled">aria-disabled</:item>
            </.list>
          </.content_card>

          <.alert kind={if @preview_count > 0, do: :warning, else: :info} title="Command state">
            {@last_action}
          </.alert>
        </aside>
      </div>

      <.command_palette
        id="command-recipe-primary"
        label="Recipe command palette"
        placeholder="Search commands..."
        shortcut="ctrl+shift+k"
        empty_label="No recipe commands match."
      >
        <:item
          label="Open risk queue"
          value="risk"
          search="risk queue blocked accounts escalation"
          shortcut="R"
          click={run_command_click("risk", @myself)}
        />
        <:item
          label="Open billing review"
          value="billing"
          search="billing invoices payment review"
          shortcut="B"
          click={run_command_click("billing", @myself)}
        />
        <:item
          label="Open customer health"
          value="health"
          search="customer health accounts score"
          shortcut="H"
          click={run_command_click("health", @myself)}
        />
        <:item
          label="Disabled production deploy"
          value="deploy"
          search="deploy production disabled"
          shortcut="D"
          disabled
          click={run_command_click("deploy", @myself)}
        />
        <:empty>
          No recipe commands match.
        </:empty>
      </.command_palette>

      <.command_palette
        id="command-recipe-manual"
        label="Manual recipe command palette"
        placeholder="Manual commands..."
        shortcut={nil}
        empty_label="No manual commands match."
      >
        <:item
          label="Preview export package"
          value="preview-export"
          search="preview export package"
          shortcut="P"
          close={false}
          click={JS.push("preview-command-palette-export", target: @myself)}
        />
        <:item
          label="Apply manual export"
          value="apply-export"
          search="apply export package"
          shortcut="E"
          click={
            JS.push("apply-command-palette-export", target: @myself)
            |> hide_command_palette("command-recipe-manual")
          }
        />
      </.command_palette>

      <p
        id="command-palette-recipes-state"
        data-exo="command-palette-recipes-state"
        data-active-screen={@active_screen}
        data-last-command={@last_command}
        data-command-count={@command_count}
        data-preview-count={@preview_count}
        data-export-count={@export_count}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Command palette recipe: {@last_action}.
      </p>
    </div>
    """
  end

  defp run_command_click(command, target) do
    JS.push("run-command-palette", value: %{command: command}, target: target)
    |> hide_command_palette("command-recipe-primary")
  end

  defp normalize_command(command)
       when command in ["risk", "billing", "health", "deploy"],
       do: command

  defp normalize_command(_command), do: "overview"

  defp command_screen("risk"), do: "risk"
  defp command_screen("billing"), do: "billing"
  defp command_screen("health"), do: "health"
  defp command_screen(_command), do: "overview"

  defp command_label("risk"), do: "Risk queue"
  defp command_label("billing"), do: "Billing review"
  defp command_label("health"), do: "Customer health"
  defp command_label("deploy"), do: "Disabled production deploy"
  defp command_label(_command), do: "Overview"

  defp screen_label("overview"), do: "Overview"
  defp screen_label("risk"), do: "Risk queue"
  defp screen_label("billing"), do: "Billing review"
  defp screen_label("health"), do: "Customer health"
  defp screen_label("exports"), do: "Exports"
  defp screen_label(screen), do: screen

  defp screen_variant("risk"), do: "warning"
  defp screen_variant("billing"), do: "primary"
  defp screen_variant("health"), do: "success"
  defp screen_variant("exports"), do: "secondary"
  defp screen_variant(_screen), do: "secondary"

  defp screen_description("risk") do
    "The palette routed to blocked accounts and escalation work."
  end

  defp screen_description("billing") do
    "The palette routed to invoice review and payment operations."
  end

  defp screen_description("health") do
    "The palette routed to customer health and account scoring."
  end

  defp screen_description("exports") do
    "The manual palette applied an export command without a global shortcut."
  end

  defp screen_description(_screen) do
    "Use the command palette trigger or Ctrl+Shift+K to route this surface."
  end
end
