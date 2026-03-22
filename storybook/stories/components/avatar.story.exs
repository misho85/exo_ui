defmodule Storybook.Components.Avatar do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.avatar/1

  def template do
    """
    <div style="padding: 1rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :xs, attributes: %{name: "Alice Smith", size: "xs"}},
      %Variation{id: :sm, attributes: %{name: "Bob Jones", size: "sm"}},
      %Variation{id: :md, attributes: %{name: "Charlie Brown", size: "md"}},
      %Variation{id: :lg, attributes: %{name: "Diana Prince", size: "lg"}},
      %Variation{id: :xl, attributes: %{name: "Eve Adams", size: "xl"}},
      %Variation{
        id: :with_image,
        attributes: %{
          name: "Frank Ocean",
          src: "https://i.pravatar.cc/150?img=3",
          size: "md"
        }
      }
    ]
  end
end
