defmodule Storybook.Components.List do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.list/1

  def template do
    """
    <div style="padding: 1rem; max-width: 480px;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :profile,
        slots: [
          ~s|<:item title="Full name">Alice Smith</:item>|,
          ~s|<:item title="Email">alice@example.com</:item>|,
          ~s|<:item title="Role">Administrator</:item>|,
          ~s|<:item title="Status">Active</:item>|,
          ~s|<:item title="Created">January 1, 2025</:item>|
        ]
      }
    ]
  end
end
