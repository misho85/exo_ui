defmodule Storybook.Components.Drawer do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.drawer/1

  def template do
    """
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :right,
        template: drawer_template("Open Right Drawer"),
        slots: [
          ~s|<:title>Settings</:title>|,
          ~s|<p>Drawer content goes here. This is a right-side drawer panel.</p>|
        ]
      },
      %Variation{
        id: :left,
        template: drawer_template("Open Left Drawer", "outline"),
        attributes: %{side: "left"},
        slots: [
          ~s|<:title>Navigation</:title>|,
          ~s|<p>Left-side navigation drawer.</p>|
        ]
      },
      %Variation{
        id: :labelled,
        template: drawer_template("Open labelled drawer", "secondary"),
        attributes: %{side: "right", label: "Filters drawer"},
        slots: [
          ~s|<p>Drawer without a visible title uses aria-label.</p>|
        ]
      }
    ]
  end

  defp drawer_template(label, variant \\ nil) do
    variant_attr = if variant, do: ~s| variant="#{variant}"|, else: ""

    """
    <div style="display: flex; flex-direction: column; gap: 1rem;" psb-code-hidden>
      <ExoUI.Components.button#{variant_attr} phx-click={ExoUI.Components.Overlay.show_drawer(":variation_id")}>
        #{label}
      </ExoUI.Components.button>
      <.psb-variation/>
    </div>
    """
  end
end
