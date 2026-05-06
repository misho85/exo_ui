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
      }
    ]
  end
end
