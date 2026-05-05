defmodule Storybook.Components.Modal do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.modal/1

  def template do
    """
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :default,
        template: modal_template("Open modal"),
        attributes: %{id: "demo-modal"},
        slots: [
          ~s|<:title>Modal Title</:title>|,
          "This is the modal body content.",
          ~s|<:actions><button data-exo="btn" data-variant="primary" data-size="md">Save</button></:actions>|
        ]
      },
      %Variation{
        id: :labelled_without_title,
        template: modal_template("Open labelled modal", "outline"),
        attributes: %{id: "labelled-modal", show: false, label: "Invite teammate dialog"},
        slots: [
          "Use aria-label when the modal has no visible title.",
          ~s|<:actions><button data-exo="btn" data-variant="outline" data-size="md">Cancel</button><button data-exo="btn" data-variant="primary" data-size="md">Send invite</button></:actions>|
        ]
      },
      %Variation{
        id: :closed,
        template: modal_template("Open closed modal", "secondary"),
        attributes: %{id: "closed-modal", show: false},
        slots: [
          ~s|<:title>Closed by default</:title>|,
          "Closed modals remain inert until show_modal/1 opens them."
        ]
      }
    ]
  end

  defp modal_template(label, variant \\ nil) do
    variant_attr = if variant, do: ~s| variant="#{variant}"|, else: ""

    """
    <div style="display: flex; flex-direction: column; gap: 1rem;" psb-code-hidden>
      <ExoUI.Components.button#{variant_attr} phx-click={ExoUI.Components.Overlay.show_modal(":variation_id")}>
        #{label}
      </ExoUI.Components.button>
      <.psb-variation/>
    </div>
    """
  end
end
