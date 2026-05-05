defmodule Storybook.Components.Carousel do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.carousel/1

  def template do
    """
    <div style="padding: 2rem 3rem; display: grid; gap: 2rem; max-width: 560px;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :product_highlights,
        attributes: %{id: "demo-carousel", aria_label: "Product highlights"},
        slots: [
          ~s|<:item label="Campaign overview"><div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 4rem; text-align: center; font-weight: 600;">Slide 1</div></:item>|,
          ~s|<:item label="Audience breakdown"><div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 4rem; text-align: center; font-weight: 600;">Slide 2</div></:item>|,
          ~s|<:item label="Revenue forecast"><div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 4rem; text-align: center; font-weight: 600;">Slide 3</div></:item>|
        ]
      },
      %Variation{
        id: :looping,
        attributes: %{id: "loop-carousel", aria_label: "Looping carousel", loop: true},
        slots: [
          ~s|<:item><div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 2rem; text-align: center; font-weight: 600;">Loop A</div></:item>|,
          ~s|<:item><div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 2rem; text-align: center; font-weight: 600;">Loop B</div></:item>|
        ]
      },
      %Variation{
        id: :single_slide,
        attributes: %{id: "single-carousel", aria_label: "Single announcement"},
        slots: [
          ~s|<:item label="Only slide"><div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 2rem; text-align: center; font-weight: 600;">Single slide</div></:item>|
        ]
      },
      %Variation{
        id: :without_controls,
        attributes: %{
          id: "no-controls-carousel",
          aria_label: "Static highlights",
          controls: false
        },
        slots: [
          ~s|<:item label="Static highlight one"><div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 2rem; text-align: center; font-weight: 600;">No controls A</div></:item>|,
          ~s|<:item label="Static highlight two"><div style="background: var(--exo-muted); border-radius: var(--exo-radius); padding: 2rem; text-align: center; font-weight: 600;">No controls B</div></:item>|
        ]
      }
    ]
  end
end
