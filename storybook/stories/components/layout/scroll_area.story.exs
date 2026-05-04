defmodule Storybook.Components.ScrollArea do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.scroll_area/1

  def template do
    """
    <div style="padding: 1rem; max-width: 35rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :vertical,
        attributes: %{
          id: "vertical-scroll",
          aria_label: "Scrollable item list",
          style:
            "height: 200px; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); padding: 1rem;"
        },
        slots: [vertical_items()]
      },
      %Variation{
        id: :horizontal,
        attributes: %{
          id: "horizontal-scroll",
          aria_label: "Scrollable columns",
          orientation: "horizontal",
          style:
            "border: 1px solid var(--exo-border); border-radius: var(--exo-radius); padding: 1rem;"
        },
        slots: [horizontal_items()]
      }
    ]
  end

  defp vertical_items do
    1..20
    |> Enum.map_join("", fn index ->
      ~s|<p style="padding: 0.25rem 0; font-size: 0.875rem;">Item #{index}</p>|
    end)
  end

  defp horizontal_items do
    columns =
      1..12
      |> Enum.map_join("", fn index ->
        ~s|<div style="min-width: 8rem; padding: 1rem; background: var(--exo-muted); border-radius: var(--exo-radius); text-align: center;">Column #{index}</div>|
      end)

    ~s|<div style="display: flex; gap: 0.75rem; width: max-content;">#{columns}</div>|
  end
end
