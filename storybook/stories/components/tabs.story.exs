defmodule Storybook.Components.Tabs do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.tabs/1

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{active: "overview"},
        slots: [
          ~s|<:tab id="overview" label="Overview" click="switch" />|,
          ~s|<:tab id="details" label="Details" click="switch" />|,
          ~s|<:tab id="settings" label="Settings" click="switch" />|
        ]
      }
    ]
  end
end
