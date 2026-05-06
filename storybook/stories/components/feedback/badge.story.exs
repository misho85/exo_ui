defmodule Storybook.Components.Badge do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.badge/1

  def variations do
    [
      %VariationGroup{
        id: :variants,
        variations:
          for variant <- ~w(primary secondary danger warning success info) do
            %Variation{
              id: String.to_atom(variant),
              attributes: %{variant: variant},
              slots: [String.capitalize(variant)]
            }
          end
      },
      %VariationGroup{
        id: :sizes,
        variations:
          for size <- ~w(sm md lg) do
            %Variation{
              id: String.to_atom(size),
              attributes: %{variant: "secondary", size: size},
              slots: [String.upcase(size)]
            }
          end
      },
      %Variation{
        id: :with_icon,
        attributes: %{variant: "success", icon: "circle-check"},
        slots: ["Synced"]
      }
    ]
  end
end
