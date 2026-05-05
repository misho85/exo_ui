# Command Routing Workflows

Use this pattern when an app has multiple screens and a command palette that
can route users across those screens without losing server-owned state.

## Structure

```heex
<.button type="button" phx-click={show_command_palette("app-command")}>
  Open commands
</.button>

<.button
  :for={screen <- @screens}
  type="button"
  phx-click="route-screen"
  phx-value-screen={screen.id}
  aria-pressed={if screen.id == @active_screen, do: "true", else: "false"}
>
  {screen.label}
</.button>

<section
  id={"screen-#{@active_screen}"}
  role="region"
  aria-label={"#{active_screen(@active_screen).label} screen"}
>
  {render_active_screen(@active_screen)}
</section>

<.command_palette id="app-command" shortcut="ctrl+shift+g">
  <:item
    :for={screen <- @screens}
    label={"Go to #{screen.label}"}
    value={"go-#{screen.id}"}
    search={"#{screen.label} screen route command"}
    click={route_command(screen.id, @myself)}
  />
</.command_palette>
```

## Command Helper

```elixir
defp route_command(screen, target) do
  JS.push("route-screen", value: %{screen: screen, source: "command palette"}, target: target)
  |> hide_command_palette("app-command")
end
```

## Rules

- Keep the active screen in server state when routed content controls business
  logic, permissions, or selected records.
- Use real buttons for in-app screen navigation and set `aria-pressed` on the
  active destination.
- Give each rendered screen a stable `id`, `role="region"`, and accessible
  label.
- Command items should close the palette after routing so focus and inert state
  return to the active screen.
- Track the route source in state when debugging command routing or analytics.
- Browser coverage should verify manual navigation, command search, Enter
  selection, closed command state, active screen state, and route count/status
  updates.
