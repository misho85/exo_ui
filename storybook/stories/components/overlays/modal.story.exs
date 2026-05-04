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
      },
      %Variation{
        id: :labelled_without_title,
        attributes: %{id: "labelled-modal", show: false, label: "Invite teammate dialog"},
        slots: [
          "Use aria-label when the modal has no visible title.",
          ~s|<:actions><button data-exo="btn" data-variant="outline" data-size="md">Cancel</button><button data-exo="btn" data-variant="primary" data-size="md">Send invite</button></:actions>|
        ]
      },
      %Variation{
        id: :closed,
        attributes: %{id: "closed-modal", show: false},
        slots: [
          ~s|<:title>Closed by default</:title>|,
          "Closed modals remain inert until a LiveView command opens them."
        ]
      }
    ]
  end
end
