defmodule Storybook.Components.ContextMenu do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.context_menu/1

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
          ~s|<:trigger><div style="border: 2px dashed var(--exo-border); border-radius: var(--exo-radius); padding: 4rem; text-align: center; color: var(--exo-muted-foreground); font-size: 0.875rem;">Right-click here</div></:trigger>|,
          ~s|<:item label="Copy" />|,
          ~s|<:item label="Cut" />|,
          ~s|<:item label="Paste" />|,
          ~s|<:item label="" separator />|,
          ~s|<:item label="Delete" disabled />|
        ]
      }
    ]
  end
end
