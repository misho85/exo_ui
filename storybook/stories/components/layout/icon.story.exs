defmodule Storybook.Components.Icon do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.icon/1

  def template do
    """
    <div style="padding: 1rem;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %VariationGroup{
        id: :fallback,
        variations: [
          %Variation{
            id: :missing_icon,
            attributes: %{name: "missing-icon", class: "size-6"}
          }
        ]
      },
      %VariationGroup{
        id: :common,
        variations:
          Enum.map(
            ~w(house search settings user bell calendar check x plus arrow-right),
            fn name ->
              %Variation{id: String.to_atom(name), attributes: %{name: name, class: "size-6"}}
            end
          )
      },
      %VariationGroup{
        id: :status,
        variations:
          Enum.map(~w(circle-check circle-alert triangle-alert info loader refresh-cw), fn name ->
            %Variation{id: String.to_atom(name), attributes: %{name: name, class: "size-6"}}
          end)
      }
    ]
  end
end
