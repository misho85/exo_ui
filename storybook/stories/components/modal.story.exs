defmodule Storybook.Components.Modal do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.modal/1

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{id: "demo-modal", show: true},
        slots: [
          ~s|<:title>Modal Title</:title>|,
          "This is the modal body content.",
          ~s|<:actions><button data-exo="btn" data-variant="primary" data-size="md">Save</button></:actions>|
        ]
      }
    ]
  end
end
