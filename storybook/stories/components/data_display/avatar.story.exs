defmodule Storybook.Components.Avatar do
  use PhoenixStorybook.Story, :component

  @avatar_src "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%235b5cf6'/%3E%3Ccircle cx='40' cy='30' r='16' fill='white'/%3E%3Cpath d='M16 76c6-20 42-20 48 0' fill='white'/%3E%3C/svg%3E"

  def function, do: &ExoUI.Components.Core.avatar/1

  def template do
    """
    <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %VariationGroup{
        id: :sizes,
        variations:
          Enum.map(~w(xs sm md lg xl), fn size ->
            %Variation{
              id: String.to_atom("size_#{size}"),
              attributes: %{name: "Alice Smith", size: size}
            }
          end)
      },
      %VariationGroup{
        id: :images,
        variations:
          Enum.map(~w(sm md lg), fn size ->
            %Variation{
              id: String.to_atom("image_#{size}"),
              attributes: %{name: "Frank Ocean", src: @avatar_src, size: size}
            }
          end)
      }
    ]
  end
end
