defmodule Storybook.Components.ContentCard do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.content_card/1

  def template do
    """
    <div style="padding: 1rem; max-width: 22rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :overview,
        attributes: %{title: "Overview"},
        slots: [
          ~s|<p style="margin: 0; color: var(--exo-muted-foreground); line-height: 1.5;">A simple card for grouping related text or controls.</p>|
        ]
      },
      %Variation{
        id: :with_action,
        attributes: %{title: "With action"},
        slots: [
          ~s|<:action><ExoUI.Components.button variant="ghost" size="sm">View</ExoUI.Components.button></:action>|,
          ~s|<p style="margin: 0; color: var(--exo-muted-foreground); line-height: 1.5;">The action slot is rendered in the card header.</p>|
        ]
      },
      %Variation{
        id: :body_only,
        slots: [
          ~s|<p style="margin: 0; color: var(--exo-muted-foreground); line-height: 1.5;">A compact body-only card without a header.</p>|
        ]
      }
    ]
  end
end
