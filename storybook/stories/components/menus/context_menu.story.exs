defmodule Storybook.Components.ContextMenu do
  use PhoenixStorybook.Story, :page

  def doc, do: "Right-click context menu."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem;">
      <ExoUI.Components.context_menu id="ctx-demo">
        <:trigger>
          <div style="border: 2px dashed var(--exo-border); border-radius: var(--exo-radius); padding: 4rem; text-align: center; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Right-click here
          </div>
        </:trigger>
        <:item label="Copy" />
        <:item label="Cut" />
        <:item label="Paste" />
        <:item label="" separator />
        <:item label="Delete" disabled />
      </ExoUI.Components.context_menu>
    </div>
    """
  end
end
