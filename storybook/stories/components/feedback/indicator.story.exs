defmodule Storybook.Components.Indicator do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.indicator/1

  def template do
    """
    <div style="display: flex; gap: 2rem; align-items: center; padding: 1.5rem; flex-wrap: wrap;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :count,
        slots: [
          ~s|<:badge>5</:badge>|,
          ~s|<ExoUI.Components.button variant="primary">Inbox</ExoUI.Components.button>|
        ]
      },
      %Variation{
        id: :large_count,
        slots: [
          ~s|<:badge>99+</:badge>|,
          ~s|<ExoUI.Components.button variant="outline">Notifications</ExoUI.Components.button>|
        ]
      },
      %VariationGroup{
        id: :positions,
        variations:
          Enum.map(
            ~w(top-right top-left bottom-right bottom-left top-center bottom-center),
            fn position ->
              %Variation{
                id: String.to_atom(position),
                attributes: %{position: position},
                slots: [
                  ~s|<:badge>#{position_label(position)}</:badge>|,
                  ~s|<span data-exo="badge" data-variant="secondary">Item</span>|
                ]
              }
            end
          )
      },
      %Variation{
        id: :without_badge,
        slots: [~s|<span data-exo="avatar" data-size="md">JD</span>|]
      }
    ]
  end

  defp position_label(position) do
    position
    |> String.split("-")
    |> Enum.map_join("", &String.first/1)
    |> String.upcase()
  end
end
