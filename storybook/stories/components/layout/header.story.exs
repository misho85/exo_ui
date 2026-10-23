defmodule Storybook.Components.Header do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.header/1

  def template do
    """
    <div style="padding: 1rem; max-width: 48rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :title_only, slots: ["Dashboard"]},
      %Variation{
        id: :with_subtitle,
        slots: [
          "Users",
          ~s|<:subtitle>Manage your team members and their permissions.</:subtitle>|
        ]
      },
      %Variation{
        id: :with_actions,
        slots: [
          "Projects",
          ~s|<:subtitle>All active projects.</:subtitle>|,
          ~s|<:actions><ExoUI.Components.button variant="primary">New Project</ExoUI.Components.button></:actions>|
        ]
      },
      %Variation{
        id: :record,
        attributes: %{
          id: "header-record",
          prev: "/components/layout/header?record=1001",
          next: "/components/layout/header?record=1003",
          prev_label: "Previous order",
          next_label: "Next order",
          pager_label: "Orders"
        },
        slots: [
          "#1002",
          ~s|<:badges><ExoUI.Components.badge variant="warning">Unfulfilled</ExoUI.Components.badge></:badges>|,
          ~s|<:secondary icon="printer" href="#invoice">Invoice</:secondary>|,
          ~s|<:more icon="pencil" href="#edit">Edit</:more>|,
          ~s|<:more danger icon="x">Cancel order</:more>|,
          ~s|<:primary icon="truck">Mark as shipped</:primary>|
        ]
      }
    ]
  end
end
