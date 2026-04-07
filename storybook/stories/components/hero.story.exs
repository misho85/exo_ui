defmodule Storybook.Components.Hero do
  use PhoenixStorybook.Story, :page

  def doc, do: "Hero section with title, subtitle, and action slots."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Title only</h3>
        <ExoUI.Components.hero>
          <:title>Welcome to ExoUI</:title>
        </ExoUI.Components.hero>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">With subtitle</h3>
        <ExoUI.Components.hero>
          <:title>Build faster with ExoUI</:title>
          <:subtitle>
            Headless components for Phoenix LiveView. Zero CSS opinions, full accessibility.
          </:subtitle>
        </ExoUI.Components.hero>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Full hero with actions</h3>
        <ExoUI.Components.hero>
          <:title>Ship your next project faster</:title>
          <:subtitle>Production-ready components that work with any CSS framework.</:subtitle>
          <:actions>
            <ExoUI.Components.button variant="primary">Get Started</ExoUI.Components.button>
            <ExoUI.Components.button variant="outline">Learn More</ExoUI.Components.button>
          </:actions>
        </ExoUI.Components.hero>
      </section>
    </div>
    """
  end
end
