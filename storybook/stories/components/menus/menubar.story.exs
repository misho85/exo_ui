defmodule Storybook.Components.Menubar do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.menubar/1

  def template do
    """
    <div style="padding: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :default,
        slots: [
          ~s|<:menu label="File"><ExoUI.Components.button role="menuitem" variant="ghost" size="sm">New File</ExoUI.Components.button><ExoUI.Components.button role="menuitem" variant="ghost" size="sm">Save</ExoUI.Components.button></:menu>|,
          ~s|<:menu label="Edit"><ExoUI.Components.button role="menuitem" variant="ghost" size="sm">Undo</ExoUI.Components.button><ExoUI.Components.button role="menuitem" variant="ghost" size="sm">Redo</ExoUI.Components.button></:menu>|,
          ~s|<:menu label="View"><ExoUI.Components.button role="menuitem" variant="ghost" size="sm">Toggle sidebar</ExoUI.Components.button></:menu>|
        ]
      }
    ]
  end
end
