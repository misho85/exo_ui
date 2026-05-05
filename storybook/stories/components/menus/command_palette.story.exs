defmodule Storybook.Components.CommandPalette do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.command_palette/1

  def template do
    """
    <div style="padding: 1rem;" psb-code-hidden>
      <p style="font-size: 0.875rem; color: var(--exo-muted-foreground); margin-bottom: 1rem;">
        Press <kbd style="padding: 0.125rem 0.375rem; border: 1px solid var(--exo-border); border-radius: 4px; font-size: 0.75rem;">Cmd+K</kbd> to open
      </p>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :default,
        slots: [
          ~s|<:item label="Search documentation" value="docs" shortcut="D" />|,
          ~s|<:item label="Go to settings" value="settings" shortcut="S" />|,
          ~s|<:item label="Open command reference" value="reference" shortcut="R" />|,
          ~s|<:item label="Disabled command" value="disabled" disabled />|
        ]
      }
    ]
  end
end
