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
          ~s|<:menu label="File"><button role="menuitem">New File</button><button role="menuitem">Save</button></:menu>|,
          ~s|<:menu label="Edit"><button role="menuitem">Undo</button><button role="menuitem">Redo</button></:menu>|,
          ~s|<:menu label="View"><button role="menuitem">Toggle sidebar</button></:menu>|
        ]
      }
    ]
  end
end
