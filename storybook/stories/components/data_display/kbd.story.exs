defmodule Storybook.Components.Kbd do
  use PhoenixStorybook.Story, :page

  def doc, do: "Keyboard shortcut indicator."

  def render(assigns) do
    ~H"""
    <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem; font-size: 0.875rem;">
      <span>
        Press
        <ExoUI.Components.kbd>⌘</ExoUI.Components.kbd>

        <ExoUI.Components.kbd>K</ExoUI.Components.kbd>
        to search
      </span>
      <span>
        <ExoUI.Components.kbd>Ctrl</ExoUI.Components.kbd>
        +
        <ExoUI.Components.kbd>C</ExoUI.Components.kbd>
        to copy
      </span>
      <span>
        <ExoUI.Components.kbd>Esc</ExoUI.Components.kbd>
        to close
      </span>
    </div>
    """
  end
end
