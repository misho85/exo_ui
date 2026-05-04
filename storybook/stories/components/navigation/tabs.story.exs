defmodule Storybook.Components.Tabs do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.tabs/1

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "account-tabs", active: "overview", aria_label: "Account sections"},
        slots: [
          ~s|<:tab id="overview" label="Overview" icon="layout-dashboard" click="switch" panel_id="account-overview-panel" />|,
          ~s|<:tab id="details" label="Details" icon="user" click="switch" />|,
          ~s|<:tab id="settings" label="Settings" icon="settings" click="switch" />|,
          ~s|<:tab id="audit" label="Audit log" icon="scroll-text" disabled />|,
          ~s|<:panel tab="overview" id="account-overview-panel">Overview metrics and account health.</:panel>|,
          ~s|<:panel tab="details">Profile, contact, and ownership details.</:panel>|,
          ~s|<:panel tab="settings">Notification and access settings.</:panel>|
        ]
      },
      %Variation{
        id: :vertical_automatic,
        attributes: %{
          id: "settings-tabs",
          active: "profile",
          aria_label: "Settings sections",
          orientation: "vertical",
          activation: "automatic"
        },
        slots: [
          ~s|<:tab id="profile" label="Profile" icon="user" click="switch-settings" />|,
          ~s|<:tab id="security" label="Security" icon="shield" click="switch-settings" />|,
          ~s|<:tab id="billing" label="Billing" icon="credit-card" click="switch-settings" />|,
          ~s|<:panel tab="profile">Public profile, avatar, and handle.</:panel>|,
          ~s|<:panel tab="security">Password, sessions, and two-factor settings.</:panel>|,
          ~s|<:panel tab="billing">Payment method and invoice preferences.</:panel>|
        ]
      }
    ]
  end
end
