defmodule Storybook.Components.Collapsible do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.collapsible/1

  def template do
    """
    <div style="padding: 1rem; max-width: 25rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :open,
        attributes: %{id: "col-1", open: true},
        slots: [
          ~s|<:trigger>Toggle details</:trigger>|,
          ~s|<div style="padding: 0.75rem 0; font-size: 0.875rem; color: var(--exo-muted-foreground);">This content is visible by default and can be toggled.</div>|
        ]
      },
      %Variation{
        id: :closed,
        attributes: %{id: "col-2"},
        slots: [
          ~s|<:trigger>Show advanced options</:trigger>|,
          ~s|<div style="padding: 0.75rem 0; font-size: 0.875rem; color: var(--exo-muted-foreground);">These are hidden by default. Click the button above to reveal.</div>|
        ]
      },
      %Variation{
        id: :code,
        attributes: %{id: "col-3", open: true},
        slots: [
          ~s|<:trigger>API response details</:trigger>|,
          ~s|<pre style="margin: 0; padding: 0.75rem; border-radius: var(--exo-radius); background: var(--exo-muted); overflow: auto; font-size: 0.8125rem;"><code>&#123;"status": "ok", "duration_ms": 128&#125;</code></pre>|
        ]
      }
    ]
  end
end
