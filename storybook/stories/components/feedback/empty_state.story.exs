defmodule Storybook.Components.EmptyState do
  use PhoenixStorybook.Story, :page

  def doc, do: "Empty state for zero-data views."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem;">
      <ExoUI.Components.empty_state
        icon="📭"
        title="No messages"
        subtitle="You don't have any messages yet."
      />

      <ExoUI.Components.empty_state
        icon="🔍"
        title="No results found"
        subtitle="Try adjusting your search or filters."
      >
        <:action>
          <ExoUI.Components.button variant="outline">Clear filters</ExoUI.Components.button>
        </:action>
      </ExoUI.Components.empty_state>

      <ExoUI.Components.empty_state title="No projects yet">
        <:action>
          <ExoUI.Components.button variant="primary">Create project</ExoUI.Components.button>
        </:action>
      </ExoUI.Components.empty_state>
    </div>
    """
  end
end
