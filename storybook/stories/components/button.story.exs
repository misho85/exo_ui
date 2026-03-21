defmodule Storybook.Components.Button do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.button/1

  def variations do
    [
      %Variation{
        id: :default,
        slots: ["Button"]
      },
      %VariationGroup{
        id: :variants,
        variations: for variant <- ~w(primary secondary ghost danger outline) do
          %Variation{
            id: String.to_atom(variant),
            attributes: %{variant: variant},
            slots: [String.capitalize(variant)]
          }
        end
      },
      %VariationGroup{
        id: :sizes,
        variations: for size <- ~w(xs sm md lg) do
          %Variation{
            id: String.to_atom("size_#{size}"),
            attributes: %{variant: "primary", size: size},
            slots: ["Size #{size}"]
          }
        end
      }
    ]
  end
end
