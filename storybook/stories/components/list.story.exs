defmodule Storybook.Components.List do
  use PhoenixStorybook.Story, :page

  def doc, do: "Definition-style list with label/value rows."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; max-width: 480px;">
      <ExoUI.Components.list>
        <:item title="Full name">Alice Smith</:item>
        <:item title="Email">alice@example.com</:item>
        <:item title="Role">Administrator</:item>
        <:item title="Status">Active</:item>
        <:item title="Created">January 1, 2025</:item>
      </ExoUI.Components.list>
    </div>
    """
  end
end
