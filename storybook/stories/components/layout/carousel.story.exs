defmodule Storybook.Components.Carousel do
  use PhoenixStorybook.Story, :page

  def doc, do: "Scrollable carousel of items with prev/next navigation."

  def render(assigns) do
    ~H"""
    <div style="padding: 2rem 3rem; display: grid; gap: 2rem; max-width: 560px;">
      <ExoUI.Components.carousel id="demo-carousel" aria_label="Product highlights">
        <:item label="Campaign overview">
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 4rem; text-align: center; font-weight: 600;">
            Slide 1
          </div>
        </:item>
        <:item label="Audience breakdown">
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 4rem; text-align: center; font-weight: 600;">
            Slide 2
          </div>
        </:item>
        <:item label="Revenue forecast">
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 4rem; text-align: center; font-weight: 600;">
            Slide 3
          </div>
        </:item>
      </ExoUI.Components.carousel>

      <ExoUI.Components.carousel id="loop-carousel" aria_label="Looping carousel" loop>
        <:item>
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 2rem; text-align: center; font-weight: 600;">
            Loop A
          </div>
        </:item>
        <:item>
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 2rem; text-align: center; font-weight: 600;">
            Loop B
          </div>
        </:item>
      </ExoUI.Components.carousel>

      <ExoUI.Components.carousel id="single-carousel" aria_label="Single announcement">
        <:item label="Only slide">
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 2rem; text-align: center; font-weight: 600;">
            Single slide
          </div>
        </:item>
      </ExoUI.Components.carousel>

      <ExoUI.Components.carousel
        id="no-controls-carousel"
        aria_label="Static highlights"
        controls={false}
      >
        <:item label="Static highlight one">
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 2rem; text-align: center; font-weight: 600;">
            No controls A
          </div>
        </:item>
        <:item label="Static highlight two">
          <div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 2rem; text-align: center; font-weight: 600;">
            No controls B
          </div>
        </:item>
      </ExoUI.Components.carousel>
    </div>
    """
  end
end
