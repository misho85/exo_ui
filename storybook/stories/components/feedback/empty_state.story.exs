defmodule Storybook.Components.EmptyState do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.empty_state/1

  def template do
    """
    <div style="padding: 1rem; max-width: 28rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :messages,
        attributes: %{
          icon: "inbox",
          title: "No messages",
          subtitle: "You don't have any messages yet."
        }
      },
      %Variation{
        id: :search_results,
        attributes: %{
          icon: "search",
          title: "No results found",
          subtitle: "Try adjusting your search or filters."
        },
        slots: [
          ~s|<:action><ExoUI.Components.button variant="outline">Clear filters</ExoUI.Components.button></:action>|
        ]
      },
      %Variation{
        id: :call_to_action,
        attributes: %{title: "No projects yet"},
        slots: [
          ~s|<:action><ExoUI.Components.button variant="primary">Create project</ExoUI.Components.button></:action>|
        ]
      }
    ]
  end
end
