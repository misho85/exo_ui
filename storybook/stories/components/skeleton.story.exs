defmodule Storybook.Components.Skeleton do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.skeleton/1

  def template do
    """
    <div style="padding: 1rem; max-width: 400px;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :text, attributes: %{type: "text", rows: 3}},
      %Variation{id: :text_5, attributes: %{type: "text", rows: 5}},
      %Variation{id: :card, attributes: %{type: "card"}},
      %Variation{id: :avatar, attributes: %{type: "avatar"}},
      %Variation{id: :table, attributes: %{type: "table", rows: 4}}
    ]
  end
end
