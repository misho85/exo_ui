defmodule Storybook.Components.DropdownMenu do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.dropdown_menu/1

  def template do
    """
    <div style="padding: 2rem; display: flex; flex-wrap: wrap; gap: 3rem; align-items: flex-start;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :actions,
        attributes: %{align: "end"},
        slots: [
          ~s|<:trigger><ExoUI.Components.button variant="outline">Actions</ExoUI.Components.button></:trigger>|,
          ~s|<:entry click="edit" icon="pencil">Edit</:entry>|,
          ~s|<:entry click="duplicate" icon="copy">Duplicate</:entry>|,
          ~s|<:entry type="separator" />|,
          ~s|<:entry click="delete" variant="danger" icon="trash">Delete</:entry>|
        ]
      },
      %Variation{
        id: :shortcuts,
        attributes: %{align: "start"},
        slots: [
          ~s|<:trigger><ExoUI.Components.button>File</ExoUI.Components.button></:trigger>|,
          ~s|<:entry type="label">Create</:entry>|,
          ~s|<:entry click="new" icon="file-plus" shortcut="N">New</:entry>|,
          ~s|<:entry click="open" icon="folder-open" shortcut="O">Open</:entry>|,
          ~s|<:entry click="save" icon="save" shortcut="S">Save</:entry>|,
          ~s|<:entry type="separator" />|,
          ~s|<:entry click="export" icon="file-text">Export</:entry>|
        ]
      },
      %Variation{
        id: :links,
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
