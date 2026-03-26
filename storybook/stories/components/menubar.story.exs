defmodule Storybook.Components.Menubar do
  use PhoenixStorybook.Story, :page

  def doc, do: "Horizontal menu bar with dropdown sub-menus."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem;">
      <ExoUI.Components.menubar>
        <:menu label="File">
          <button
            style="display: flex; width: 100%; padding: 0.375rem 0.75rem; border: none; background: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; text-align: left;"
            onmouseover="this.style.background='var(--exo-accent)'"
            onmouseout="this.style.background='none'"
          >
            New File
          </button>
          <button
            style="display: flex; width: 100%; padding: 0.375rem 0.75rem; border: none; background: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; text-align: left;"
            onmouseover="this.style.background='var(--exo-accent)'"
            onmouseout="this.style.background='none'"
          >
            Save
          </button>
        </:menu>
        <:menu label="Edit">
          <button
            style="display: flex; width: 100%; padding: 0.375rem 0.75rem; border: none; background: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; text-align: left;"
            onmouseover="this.style.background='var(--exo-accent)'"
            onmouseout="this.style.background='none'"
          >
            Undo
          </button>
          <button
            style="display: flex; width: 100%; padding: 0.375rem 0.75rem; border: none; background: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; text-align: left;"
            onmouseover="this.style.background='var(--exo-accent)'"
            onmouseout="this.style.background='none'"
          >
            Redo
          </button>
        </:menu>
        <:menu label="View">
          <button
            style="display: flex; width: 100%; padding: 0.375rem 0.75rem; border: none; background: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; text-align: left;"
            onmouseover="this.style.background='var(--exo-accent)'"
            onmouseout="this.style.background='none'"
          >
            Toggle sidebar
          </button>
        </:menu>
      </ExoUI.Components.menubar>
    </div>
    """
  end
end
