defmodule Storybook.Components.Badge do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.badge/1

  def variations do
    [
      %VariationGroup{
        id: :variants,
        variations: for variant <- ~w(primary secondary danger warning success info) do
          %Variation{
            id: String.to_atom(variant),
            attributes: %{variant: variant},
            slots: [String.capitalize(variant)]
          }
        end
      }
    ]
  end
end
