defmodule Storybook.Components.Collapsible do
  use PhoenixStorybook.Story, :page

  def doc, do: "Show/hide content with a trigger element."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem; max-width: 400px;">
      <ExoUI.Components.collapsible id="col-1" open>
        <:trigger>
          <ExoUI.Components.button variant="outline" size="sm">Toggle details</ExoUI.Components.button>
        </:trigger>
        <div style="padding: 0.75rem 0; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          This content is visible by default and can be toggled.
        </div>
      </ExoUI.Components.collapsible>

      <ExoUI.Components.collapsible id="col-2">
        <:trigger>
          <ExoUI.Components.button variant="ghost" size="sm">Show advanced options</ExoUI.Components.button>
        </:trigger>
        <div style="padding: 0.75rem 0; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          These are hidden by default. Click the button above to reveal.
        </div>
      </ExoUI.Components.collapsible>
    </div>
    """
  end
end
