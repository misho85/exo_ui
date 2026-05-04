defmodule Storybook.Components.Tabs do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.tabs/1

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "account-tabs", active: "overview", aria_label: "Account sections"},
        slots: [
          ~s|<:tab id="overview" label="Overview" click="switch" panel_id="account-overview-panel" />|,
          ~s|<:tab id="details" label="Details" click="switch" />|,
          ~s|<:tab id="settings" label="Settings" click="switch" />|,
          ~s|<:tab id="audit" label="Audit log" disabled />|
        ]
      }
    ]
  end
end
