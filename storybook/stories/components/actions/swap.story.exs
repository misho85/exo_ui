defmodule Storybook.Components.Swap do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.swap/1

  def template do
    """
    <div style="padding: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :inactive,
        attributes: %{id: "swap-1", label: "Enable notifications"},
        slots: [~s|<:on>ON</:on>|, ~s|<:off>OFF</:off>|]
      },
      %Variation{
        id: :active,
        attributes: %{id: "swap-2", active: true, label: "Enable sync"},
        slots: [~s|<:on>ON</:on>|, ~s|<:off>OFF</:off>|]
      },
      %Variation{
        id: :theme_toggle,
        attributes: %{id: "swap-theme", label: "Toggle dark mode"},
        slots: [~s|<:on>Dark Mode</:on>|, ~s|<:off>Light Mode</:off>|]
      }
    ]
  end
end
