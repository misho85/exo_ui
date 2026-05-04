defmodule Storybook.Components.DropdownMenu do
  use PhoenixStorybook.Story, :page

  def doc,
    do:
      "Dropdown menu built on native popover with items, labels, separators, links, and shortcuts."

  def render(assigns) do
    ~H"""
    <div style="padding: 2rem; display: flex; flex-wrap: wrap; gap: 3rem; align-items: flex-start;">
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <h3 style="margin: 0; font-size: 0.875rem; color: var(--exo-muted-foreground);">Actions</h3>
        <ExoUI.Components.dropdown_menu id="dropdown-menu-actions">
          <:trigger>
            <ExoUI.Components.button variant="outline">Actions</ExoUI.Components.button>
          </:trigger>
          <:entry click="edit" icon="pencil">Edit</:entry>
          <:entry click="duplicate" icon="copy">Duplicate</:entry>
          <:entry type="separator" />
          <:entry click="delete" variant="danger" icon="trash">Delete</:entry>
        </ExoUI.Components.dropdown_menu>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <h3 style="margin: 0; font-size: 0.875rem; color: var(--exo-muted-foreground);">Shortcuts</h3>
        <ExoUI.Components.dropdown_menu id="dropdown-menu-file" align="start">
          <:trigger>
            <ExoUI.Components.button>File</ExoUI.Components.button>
          </:trigger>
          <:entry type="label">Create</:entry>
          <:entry click="new" icon="file-plus" shortcut="N">New</:entry>
          <:entry click="open" icon="folder-open" shortcut="O">Open</:entry>
          <:entry click="save" icon="save" shortcut="S">Save</:entry>
          <:entry type="separator" />
          <:entry click="export" icon="file-text">Export</:entry>
        </ExoUI.Components.dropdown_menu>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <h3 style="margin: 0; font-size: 0.875rem; color: var(--exo-muted-foreground);">Links</h3>
        <ExoUI.Components.dropdown_menu id="dropdown-menu-links">
          <:trigger>
            <ExoUI.Components.button variant="ghost">Navigate</ExoUI.Components.button>
          </:trigger>
          <:entry href="#" icon="house">Home</:entry>
          <:entry href="#" icon="settings">Settings</:entry>
          <:entry href="#" disabled icon="lock">Billing</:entry>
        </ExoUI.Components.dropdown_menu>
      </div>
    </div>
    """
  end
end
