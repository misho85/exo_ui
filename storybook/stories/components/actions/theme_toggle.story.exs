defmodule Storybook.Components.ThemeToggle do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.theme_toggle/1

  def template do
    """
    <div style="padding: 2rem; display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;" psb-code-hidden>
      <.psb-variation/>
      <span style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
        Requires the ExoThemeToggle hook to be wired up in app.js.
      </span>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :default, attributes: %{id: "theme-toggle-demo"}},
      %Variation{
        id: :custom_label,
        attributes: %{id: "theme-toggle-settings", aria_label: "Appearance"}
      }
    ]
  end
end
