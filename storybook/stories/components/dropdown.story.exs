defmodule Storybook.Components.Dropdown do
  use PhoenixStorybook.Story, :page

  def doc, do: "Dropdown menu triggered by a button."

  def render(assigns) do
    ~H"""
    <div style="padding: 2rem; display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start;">
      <ExoUI.Components.dropdown id="dd-basic">
        <:trigger>
          <ExoUI.Components.button>Options ▾</ExoUI.Components.button>
        </:trigger>
        <:item>Edit</:item>
        <:item>Duplicate</:item>
        <:item>Delete</:item>
      </ExoUI.Components.dropdown>

      <ExoUI.Components.dropdown id="dd-start" position="bottom-start">
        <:trigger>
          <ExoUI.Components.button variant="outline">Actions ▾</ExoUI.Components.button>
        </:trigger>
        <:item>View details</:item>
        <:item>Export</:item>
        <:item>Archive</:item>
      </ExoUI.Components.dropdown>
    </div>
    """
  end
end
