defmodule Storybook.Components.HoverCard do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.hover_card/1

  def template do
    """
    <div style="padding: 4rem 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :default,
        slots: [
          ~s|<:trigger><a href="#" style="text-decoration: underline; font-weight: 500;">Hover me</a></:trigger>|,
          ~s|<p style="font-weight: 600; margin-bottom: 0.5rem;">Hover Card</p>|,
          ~s|<p style="color: var(--exo-muted-foreground);">This content appears when you hover over the trigger element.</p>|
        ]
      }
    ]
  end
end
