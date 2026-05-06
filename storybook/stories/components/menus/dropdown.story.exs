defmodule Storybook.Components.Dropdown do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.dropdown_menu/1

  def template do
    """
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 2rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :basic,
        attributes: %{label: "Row actions"},
        slots: [
          ~s|<:trigger><ExoUI.Components.button variant="ghost">Actions</ExoUI.Components.button></:trigger>|,
          ~s|<:entry click="edit" icon="pencil">Edit</:entry>|,
          ~s|<:entry click="duplicate" icon="copy">Duplicate</:entry>|,
          ~s|<:entry type="separator" />|,
          ~s|<:entry click="delete" variant="danger" icon="trash">Delete</:entry>|
        ]
      },
      %Variation{
        id: :shortcuts_and_labels,
        attributes: %{label: "File actions"},
        slots: [
          ~s|<:trigger><ExoUI.Components.button>File</ExoUI.Components.button></:trigger>|,
          ~s|<:entry click="new" icon="file-plus" shortcut="N">New</:entry>|,
          ~s|<:entry click="open" icon="folder-open" shortcut="O">Open</:entry>|,
          ~s|<:entry click="save" icon="save" shortcut="S">Save</:entry>|,
          ~s|<:entry type="separator" />|,
          ~s|<:entry type="label">Export</:entry>|,
          ~s|<:entry click="export-pdf" icon="file-text">Export as PDF</:entry>|,
          ~s|<:entry click="export-csv" icon="table">Export as CSV</:entry>|
        ]
      },
      %Variation{
        id: :link_items,
        attributes: %{label: "Navigation actions"},
        slots: [
          ~s|<:trigger><ExoUI.Components.button variant="ghost">Navigate</ExoUI.Components.button></:trigger>|,
          ~s|<:entry href="#" icon="house">Home</:entry>|,
          ~s|<:entry href="#" icon="settings">Settings</:entry>|,
          ~s|<:entry href="#" disabled icon="lock">Billing</:entry>|
        ]
      }
    ]
  end
end
