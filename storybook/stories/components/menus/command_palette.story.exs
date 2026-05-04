defmodule Storybook.Components.CommandPalette do
  use PhoenixStorybook.Story, :page

  def doc, do: "Command palette dialog with filtering and keyboard selection (Ctrl+K / Cmd+K)."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem;">
      <p style="font-size: 0.875rem; color: var(--exo-muted-foreground); margin-bottom: 1rem;">
        Press
        <kbd style="padding: 0.125rem 0.375rem; border: 1px solid var(--exo-border); border-radius: 4px; font-size: 0.75rem;">
          ⌘K
        </kbd>
        to open
      </p>

      <ExoUI.Components.command_palette id="cmd-demo">
        <:item label="Search documentation" value="docs" shortcut="D" />
        <:item label="Go to settings" value="settings" shortcut="S" />
        <:item label="Open command reference" value="reference" shortcut="R" />
        <:item label="Disabled command" value="disabled" disabled />
      </ExoUI.Components.command_palette>
    </div>
    """
  end
end
