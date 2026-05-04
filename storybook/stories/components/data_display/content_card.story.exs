defmodule Storybook.Components.ContentCard do
  use PhoenixStorybook.Story, :page

  def doc, do: "Content card with optional title and action slot."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; max-width: 900px;">
      <ExoUI.Components.content_card title="Overview">
        <p style="margin: 0; color: var(--exo-muted-foreground); line-height: 1.5;">
          A simple card for grouping related text or controls.
        </p>
      </ExoUI.Components.content_card>

      <ExoUI.Components.content_card title="With action">
        <:action>
          <ExoUI.Components.button size="sm" variant="ghost">View</ExoUI.Components.button>
        </:action>

        <p style="margin: 0; color: var(--exo-muted-foreground); line-height: 1.5;">
          The action slot is rendered in the card header.
        </p>
      </ExoUI.Components.content_card>

      <ExoUI.Components.content_card>
        <p style="margin: 0; color: var(--exo-muted-foreground); line-height: 1.5;">
          A compact body-only card without a header.
        </p>
      </ExoUI.Components.content_card>
    </div>
    """
  end
end
