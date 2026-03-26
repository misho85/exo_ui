defmodule Storybook.Components.Carousel do
  use PhoenixStorybook.Story, :page

  def doc, do: "Scrollable carousel of items with prev/next navigation."

  def render(assigns) do
    ~H"""
    <div style="padding: 2rem 3rem; max-width: 500px;">
      <ExoUI.Components.carousel id="demo-carousel">
        <:item>
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 4rem; text-align: center; font-weight: 600;">
            Slide 1
          </div>
        </:item>
        <:item>
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 4rem; text-align: center; font-weight: 600;">
            Slide 2
          </div>
        </:item>
        <:item>
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 4rem; text-align: center; font-weight: 600;">
            Slide 3
          </div>
        </:item>
      </ExoUI.Components.carousel>
    </div>
    """
  end
end
