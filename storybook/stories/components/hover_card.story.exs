defmodule Storybook.Components.HoverCard do
  use PhoenixStorybook.Story, :page

  def doc, do: "Card that appears on hover."

  def render(assigns) do
    ~H"""
    <div style="padding: 4rem 1rem;">
      <ExoUI.Components.hover_card id="hc-demo">
        <:trigger>
          <a href="#" style="text-decoration: underline; font-weight: 500;">Hover me</a>
        </:trigger>
        <p style="font-weight: 600; margin-bottom: 0.5rem;">Hover Card</p>
        <p style="color: var(--exo-muted-foreground);">
          This content appears when you hover over the trigger element.
        </p>
      </ExoUI.Components.hover_card>
    </div>
    """
  end
end
