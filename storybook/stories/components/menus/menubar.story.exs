defmodule Storybook.Components.Menubar do
  use PhoenixStorybook.Story, :page

  def doc, do: "Horizontal menu bar with dropdown sub-menus."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem;">
      <ExoUI.Components.menubar id="demo-menubar">
        <:menu label="File">
          <button>New File</button>
          <button>Save</button>
        </:menu>
        <:menu label="Edit">
          <button>Undo</button>
          <button>Redo</button>
        </:menu>
        <:menu label="View">
          <button>Toggle sidebar</button>
        </:menu>
      </ExoUI.Components.menubar>
    </div>
    """
  end
end
