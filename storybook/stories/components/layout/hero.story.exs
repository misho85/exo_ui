defmodule Storybook.Components.Hero do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.hero/1

  def template do
    """
    <div style="padding: 1rem; max-width: 54rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :title_only, slots: [~s|<:title>Welcome to ExoUI</:title>|]},
      %Variation{
        id: :with_subtitle,
        slots: [
          ~s|<:title>Build faster with ExoUI</:title>|,
          ~s|<:subtitle>Headless components for Phoenix LiveView. Zero CSS opinions, full accessibility.</:subtitle>|
        ]
      },
      %Variation{
        id: :with_actions,
        slots: [
          ~s|<:title>Ship your next project faster</:title>|,
          ~s|<:subtitle>Production-ready components that work with any CSS framework.</:subtitle>|,
          ~s|<:actions><ExoUI.Components.button variant="primary">Get Started</ExoUI.Components.button><ExoUI.Components.button variant="outline">Learn More</ExoUI.Components.button></:actions>|
        ]
      }
    ]
  end
end
