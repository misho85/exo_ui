defmodule Storybook.Components.Dropdown do
  use PhoenixStorybook.Story, :page

  def doc, do: "Dropdown menu built on native popover. Uses single :entry slot for ordering."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 2rem;">
      <div>
        <h3>Basic</h3>
        <ExoUI.Components.dropdown_menu id="dd-basic">
          <:trigger>
            <ExoUI.Components.button variant="ghost">Actions</ExoUI.Components.button>
          </:trigger>
          <:entry click="edit" icon="pencil">Edit</:entry>
          <:entry click="duplicate" icon="copy">Duplicate</:entry>
          <:entry type="separator" />
          <:entry click="delete" variant="danger" icon="trash">Delete</:entry>
        </ExoUI.Components.dropdown_menu>
      </div>

      <div>
        <h3>With shortcuts and labels</h3>
        <ExoUI.Components.dropdown_menu id="dd-full">
          <:trigger><ExoUI.Components.button>File</ExoUI.Components.button></:trigger>
          <:entry click="new" icon="file-plus" shortcut="⌘N">New</:entry>
          <:entry click="open" icon="folder-open" shortcut="⌘O">Open</:entry>
          <:entry click="save" icon="save" shortcut="⌘S">Save</:entry>
          <:entry type="separator" />
          <:entry type="label">Export</:entry>
          <:entry click="export-pdf" icon="file-text">Export as PDF</:entry>
          <:entry click="export-csv" icon="table">Export as CSV</:entry>
        </ExoUI.Components.dropdown_menu>
      </div>

      <div>
        <h3>With link items</h3>
        <ExoUI.Components.dropdown_menu id="dd-links">
          <:trigger>
            <ExoUI.Components.button variant="ghost">Navigate</ExoUI.Components.button>
          </:trigger>
          <:entry navigate="/" icon="house">Home</:entry>
          <:entry navigate="/settings" icon="settings">Settings</:entry>
        </ExoUI.Components.dropdown_menu>
      </div>
    </div>
    """
  end
end
