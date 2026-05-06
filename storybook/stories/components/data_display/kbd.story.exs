defmodule Storybook.Components.Kbd do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.kbd/1

  def template do
    """
    <div style="display: flex; gap: 0.5rem; align-items: center; padding: 1rem; font-size: 0.875rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{id: :command, attributes: %{label: "Command"}, slots: ["⌘"]},
      %Variation{id: :letter, slots: ["K"]},
      %Variation{id: :modifier, attributes: %{label: "Control"}, slots: ["Ctrl"]},
      %Variation{id: :escape, attributes: %{label: "Escape"}, slots: ["Esc"]}
    ]
  end
end
