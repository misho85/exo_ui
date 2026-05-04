defmodule Storybook.Components.ThemeToggle do
  use PhoenixStorybook.Story, :page

  def doc, do: "Three-way theme toggle: light / dark / system. Requires ExoThemeToggle JS hook."

  def render(assigns) do
    ~H"""
    <div style="padding: 2rem; display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
      <ExoUI.Components.theme_toggle id="theme-toggle-demo" />
      <span style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
        Note: requires ExoThemeToggle hook to be wired up in app.js
      </span>
    </div>
    """
  end
end
