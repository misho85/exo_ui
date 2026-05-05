defmodule Storybook.Components.Sheet do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.sheet/1

  def template do
    """
    <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :right,
        template: sheet_template("Open right sheet"),
        slots: [
          ~s|<:title>Sheet title</:title>|,
          ~s|<p>Sheet content goes here.</p>|,
          ~s|<:footer><button data-exo="btn" data-variant="outline" phx-click={ExoUI.Components.Overlay.hide_sheet("sheet-single-right")}>Cancel</button><button data-exo="btn">Save</button></:footer>|
        ]
      },
      %Variation{
        id: :left,
        template: sheet_template("Open left sheet", "outline"),
        attributes: %{side: "left"},
        slots: [
          ~s|<:title>Left sheet</:title>|,
          ~s|<p>Content from the left side.</p>|
        ]
      },
      %Variation{
        id: :top,
        template: sheet_template("Open top sheet", "secondary"),
        attributes: %{side: "top"},
        slots: [
          ~s|<:title>Top sheet</:title>|,
          ~s|<p>Compact sheet for command palettes or global search.</p>|
        ]
      },
      %Variation{
        id: :bottom,
        template: sheet_template("Open bottom sheet", "ghost"),
        attributes: %{side: "bottom", label: "Mobile actions"},
        slots: [
          ~s|<p>Bottom sheet without a visible title uses aria-label.</p>|
        ]
      }
    ]
  end

  defp sheet_template(label, variant \\ nil) do
    variant_attr = if variant, do: ~s| variant="#{variant}"|, else: ""

    """
    <div style="display: flex; flex-direction: column; gap: 1rem;" psb-code-hidden>
      <ExoUI.Components.button#{variant_attr} phx-click={ExoUI.Components.Overlay.show_sheet(":variation_id")}>
        #{label}
      </ExoUI.Components.button>
      <.psb-variation/>
    </div>
    """
  end
end
