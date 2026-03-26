defmodule Storybook.Components.CommandPalette do
  use PhoenixStorybook.Story, :page

  def doc, do: "Searchable command palette dialog (Ctrl+K / Cmd+K)."

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
        <div style="padding: 0.5rem; font-size: 0.875rem;">
          <p style="padding: 0.5rem; color: var(--exo-muted-foreground); font-size: 0.75rem; font-weight: 600;">
            Suggestions
          </p>
          <button
            style="display: flex; width: 100%; padding: 0.5rem; border: none; background: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;"
            onmouseover="this.style.background='var(--exo-accent)'"
            onmouseout="this.style.background='none'"
          >
            Search documentation
          </button>
          <button
            style="display: flex; width: 100%; padding: 0.5rem; border: none; background: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;"
            onmouseover="this.style.background='var(--exo-accent)'"
            onmouseout="this.style.background='none'"
          >
            Go to settings
          </button>
        </div>
      </ExoUI.Components.command_palette>
    </div>
    """
  end
end
