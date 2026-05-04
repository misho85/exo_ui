defmodule Storybook.Components.Header do
  use PhoenixStorybook.Story, :page

  def doc, do: "Page header with optional subtitle and actions."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem; max-width: 800px;">
      <ExoUI.Components.header>
        Dashboard
      </ExoUI.Components.header>

      <ExoUI.Components.header>
        Users
        <:subtitle>Manage your team members and their permissions.</:subtitle>
      </ExoUI.Components.header>

      <ExoUI.Components.header>
        Projects
        <:subtitle>All active projects.</:subtitle>
        <:actions>
          <ExoUI.Components.button variant="primary">New Project</ExoUI.Components.button>
        </:actions>
      </ExoUI.Components.header>
    </div>
    """
  end
end
