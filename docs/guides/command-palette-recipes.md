# Command Palette Recipes

Use this pattern when command search needs a trigger, a scoped shortcut,
keyboard filtering, disabled commands, manual-only command surfaces, and
server-owned routing state.

## Trigger And Shortcut

```heex
<.button type="button" phx-click={show_command_palette("app-command")}>
  Open command palette
</.button>

<.command_palette
  id="app-command"
  label="Application command palette"
  placeholder="Search commands..."
  shortcut="ctrl+shift+k"
  empty_label="No commands match."
>
  <:item
    label="Open risk queue"
    value="risk"
    search="risk queue blocked accounts escalation"
    shortcut="R"
    click={
      JS.push("route-command", value: %{command: "risk"})
      |> hide_command_palette("app-command")
    }
  />
  <:item
    label="Disabled production deploy"
    value="deploy"
    search="deploy production disabled"
    shortcut="D"
    disabled
  />
</.command_palette>
```

## Manual-Only Palette

Set `shortcut={nil}` when a palette should only open from a local trigger. This
prevents multiple command surfaces from competing for the same global shortcut.

```heex
<.button type="button" phx-click={show_command_palette("manual-command")}>
  Open manual commands
</.button>

<.command_palette id="manual-command" label="Manual command palette" shortcut={nil}>
  <:item
    label="Preview export package"
    value="preview-export"
    close={false}
    click={JS.push("preview-export")}
  />
  <:item
    label="Apply export"
    value="apply-export"
    click={JS.push("apply-export") |> hide_command_palette("manual-command")}
  />
</.command_palette>
```

## Rules

- Use `show_command_palette/1` and `hide_command_palette/1` for trigger-driven
  opening and closing.
- Give every palette a specific `label`; it becomes the dialog accessible name.
- Prefer scoped shortcuts such as `ctrl+shift+k` for app-local command surfaces.
- Use `shortcut={nil}` for manual palettes embedded in drawers, sheets, or
  local workflows.
- Put searchable synonyms in `search` so users can find commands by intent.
- Use `disabled` for unavailable commands; browser tests should verify disabled
  commands are skipped by filtering and selection.
- Use `close={false}` for preview commands that should keep the palette open.
- For commands that patch LiveView state, prefer an explicit
  `JS.push(...) |> hide_command_palette(id)` pipeline so the close state is
  deterministic before/alongside the server patch.
- Keep route counters, selected screens, and command effects in LiveView assigns
  instead of relying on client-only state.
- Browser coverage should verify trigger open, shortcut open, focus restore,
  search filtering, `aria-activedescendant`, empty state, disabled items,
  Enter selection, manual-only behavior, and `close={false}` commands.
