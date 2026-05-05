defmodule Storybook.Components.ChatBubble do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.chat_bubble/1

  def template do
    """
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 500px; padding: 1rem;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :incoming,
        slots: [
          ~s|<:header>Alice</:header>|,
          ~s|<:footer>12:30 PM</:footer>|,
          ~s|Hey, how are you?|
        ]
      },
      %Variation{
        id: :outgoing,
        attributes: %{side: "end"},
        slots: [
          ~s|<:header>You</:header>|,
          ~s|<:footer>12:31 PM</:footer>|,
          ~s|I'm doing great, thanks!|
        ]
      },
      %Variation{
        id: :with_avatar,
        slots: [
          ~s|<:avatar><ExoUI.Components.avatar name="Alice Smith" size="sm" /></:avatar>|,
          ~s|<:header>Alice</:header>|,
          ~s|<:footer>12:32 PM</:footer>|,
          ~s|Let's try it out together.|
        ]
      }
    ]
  end
end
