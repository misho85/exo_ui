defmodule Storybook.Components.Spinner do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.spinner/1

  def template do
    """
    <div style="display: flex; gap: 2rem; align-items: center; padding: 1rem; flex-wrap: wrap;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :small, attributes: %{size: "sm"}},
      %Variation{id: :medium, attributes: %{size: "md"}},
      %Variation{id: :large, attributes: %{size: "lg"}},
      %Variation{id: :custom_label, attributes: %{size: "md", label: "Loading invoices"}}
    ]
  end
end
