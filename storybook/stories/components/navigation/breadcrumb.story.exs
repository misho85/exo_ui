defmodule Storybook.Components.Breadcrumb do
  use PhoenixStorybook.Story, :page

  def doc, do: "Breadcrumb navigation trail."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem;">
      <ExoUI.Components.breadcrumb aria_label="Catalog breadcrumb">
        <:item href="#">Home</:item>
        <:item href="#">Products</:item>
        <:item>Current Page</:item>
      </ExoUI.Components.breadcrumb>

      <ExoUI.Components.breadcrumb separator="›">
        <:item href="#">Dashboard</:item>
        <:item href="#">Settings</:item>
        <:item href="#">Team</:item>
        <:item>Members</:item>
      </ExoUI.Components.breadcrumb>

      <ExoUI.Components.breadcrumb aria_label="Docs breadcrumb" separator="→">
        <:item href="#">Home</:item>
        <:item href="#" current>About</:item>
      </ExoUI.Components.breadcrumb>
    </div>
    """
  end
end
