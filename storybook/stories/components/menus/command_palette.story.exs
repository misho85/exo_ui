defmodule Storybook.Components.CommandPalette do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.command_palette/1

  def template do
    """
    <div style="padding: 1rem; min-height: 520px; display: flex; flex-direction: column; gap: 1rem;" psb-code-hidden>
      <ExoUI.Components.button phx-click={ExoUI.Components.Overlay.show_command_palette(":variation_id")}>
        Open command palette
      </ExoUI.Components.button>
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
      },
      %Variation{
        id: :custom_shortcut,
        attributes: %{
          placeholder: "Jump to...",
          shortcut: "ctrl+j"
        },
        slots: [
          ~s|<:item label="Jump to dashboard" value="dashboard" shortcut="D" />|,
          ~s|<:item label="Jump to projects" value="projects" shortcut="P" />|,
          ~s|<:item label="Jump to settings" value="settings" shortcut="S" />|
        ]
      },
      %Variation{
        id: :manual_only,
        attributes: %{
          placeholder: "Manual commands...",
          shortcut: nil
        },
        slots: [
          ~s|<:item label="Run import" value="import" shortcut="I" />|,
          ~s|<:item label="Run export" value="export" shortcut="E" />|
        ]
      }
    ]
  end
end
