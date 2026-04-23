defmodule Storybook.Components.CommandPalette do
  use PhoenixStorybook.Story, :page

  def doc, do: "Command palette dialog shell (Ctrl+K / Cmd+K)."

  def render(assigns) do
    ~H"""
    <style>
      .cmd-item {
        display: flex;
        width: 100%;
        padding: 0.5rem;
        border: none;
        background: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
      }
      .cmd-item:hover { background: var(--exo-accent); }
    </style>
    <div style="padding: 1rem;">
      <p style="font-size: 0.875rem; color: var(--exo-muted-foreground); margin-bottom: 1rem;">
        Press
        <kbd style="padding: 0.125rem 0.375rem; border: 1px solid var(--exo-border); border-radius: 4px; font-size: 0.75rem;">
          ⌘K
        </kbd>
        to open
      </p>

      <ExoUI.Components.command_palette id="cmd-demo">
        <div style="padding: 0.5rem; font-size: 0.875rem;">
          <p style="padding: 0.5rem; color: var(--exo-muted-foreground); font-size: 0.75rem; font-weight: 600;">
            Suggestions
          </p>
          <button class="cmd-item">Search documentation</button>
          <button class="cmd-item">Go to settings</button>
        </div>
      </ExoUI.Components.command_palette>
    </div>
    """
  end
end
