defmodule Storybook.Components.DashboardDrilldownWorkflow do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.DashboardDrilldownWorkflowDemo

  def component, do: DashboardDrilldownWorkflowDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "dashboard-drilldown-workflow-demo"}
      }
    ]
  end
end
