defmodule Storybook.Components.NavigationShellWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.NavigationShellWorkflowDemo

  def component, do: NavigationShellWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "navigation-shell-workflow-demo"}
      }
    ]
  end
end
