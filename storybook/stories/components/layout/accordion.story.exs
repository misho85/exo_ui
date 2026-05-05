defmodule Storybook.Components.Accordion do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.accordion/1

  def template do
    """
    <div style="padding: 1rem; max-width: 38rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :default, attributes: %{id: "default"}, slots: default_items()},
      %Variation{
        id: :multiple,
        attributes: %{id: "multiple", type: "multiple"},
        slots: multiple_items()
      },
      %Variation{
        id: :plus,
        attributes: %{id: "plus", variant: "plus"},
        slots: default_items()
      },
      %Variation{
        id: :joined,
        attributes: %{id: "joined", joined: true},
        slots: default_items()
      },
      %Variation{
        id: :disabled_items,
        attributes: %{id: "disabled"},
        slots: disabled_items()
      },
      %Variation{
        id: :non_collapsible,
        attributes: %{id: "non-collapsible", collapsible: false},
        slots: non_collapsible_items()
      }
    ]
  end

  defp default_items do
    [
      ~s|<:item title="What is ExoUI?" open>ExoUI is a headless component library for Phoenix LiveView. All components emit semantic HTML with data-exo attributes.</:item>|,
      ~s|<:item title="How do I style components?">Import the exo.css theme file, or write your own CSS targeting the data-exo attributes.</:item>|,
      ~s|<:item title="Does it support dark mode?">Yes. The default theme includes dark mode via the data-theme attribute.</:item>|
    ]
  end

  defp multiple_items do
    [
      ~s|<:item title="What is ExoUI?" open>ExoUI is a headless component library for Phoenix LiveView. All components emit semantic HTML with data-exo attributes.</:item>|,
      ~s|<:item title="How do I style components?" open>Import the exo.css theme file, or write your own CSS targeting the data-exo attributes.</:item>|,
      ~s|<:item title="Does it support dark mode?">Yes. The default theme includes dark mode via the data-theme attribute.</:item>|
    ]
  end

  defp disabled_items do
    [
      ~s|<:item title="This item works normally" open>You can open and close this item.</:item>|,
      ~s|<:item title="This item is disabled" disabled>You should not be able to see this.</:item>|,
      ~s|<:item title="This also works">Another normal item.</:item>|
    ]
  end

  defp non_collapsible_items do
    [
      ~s|<:item title="Always one open" open>Once opened, you can't close this; only switch to another item.</:item>|,
      ~s|<:item title="Click me to switch">Now the previous item closed and this one opened.</:item>|,
      ~s|<:item title="Or click me">Same behavior: always exactly one open.</:item>|
    ]
  end
end
