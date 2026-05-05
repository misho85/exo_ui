defmodule Storybook.Components.Navbar do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.navbar/1

  def template do
    """
    <div style="padding: 1rem; max-width: 48rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :basic, slots: [~s|<:brand>MyApp</:brand>|]},
      %Variation{
        id: :with_center,
        slots: [
          ~s|<:brand>MyApp</:brand>|,
          ~s|<:center><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></:center>|
        ]
      },
      %Variation{
        id: :full,
        slots: [
          ~s|<:brand>MyApp</:brand>|,
          ~s|<:center><a href="#">Dashboard</a><a href="#">Projects</a><a href="#">Team</a></:center>|,
          ~s|<:end_content><span data-exo="avatar" data-size="sm">JD</span></:end_content>|
        ]
      }
    ]
  end
end
