defmodule Storybook.Components.BottomNav do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.bottom_nav/1

  def template do
    """
    <div style="padding: 1rem; max-width: 25rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :basic, slots: basic_items()},
      %Variation{id: :with_icons, slots: icon_items()},
      %Variation{
        id: :app_nav,
        attributes: %{"aria-label" => "Main app navigation"},
        slots: app_items()
      }
    ]
  end

  defp basic_items do
    [
      ~s|<:item label="Home" href="#" active>Home</:item>|,
      ~s|<:item label="Search" href="#">Search</:item>|,
      ~s|<:item label="Profile" href="#">Profile</:item>|
    ]
  end

  defp icon_items do
    [
      ~s|<:item label="Home" icon="house" href="#" active>Home</:item>|,
      ~s|<:item label="Explore" icon="search" href="#">Explore</:item>|,
      ~s|<:item label="Inbox" icon="inbox" href="#">Inbox</:item>|,
      ~s|<:item label="Account" icon="user" href="#">Account</:item>|
    ]
  end

  defp app_items do
    [
      ~s|<:item label="Home" icon="house" href="#" active>Home</:item>|,
      ~s|<:item label="Search" icon="search" href="#">Search</:item>|,
      ~s|<:item label="Create" icon="circle-plus" href="#">Create</:item>|,
      ~s|<:item label="Activity" icon="bell" href="#">Activity</:item>|,
      ~s|<:item label="Profile" icon="user" href="#">Profile</:item>|
    ]
  end
end
