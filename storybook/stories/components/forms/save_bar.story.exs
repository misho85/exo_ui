defmodule Storybook.Components.SaveBar do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.save_bar/1

  def template do
    """
    <div style="padding: 1rem; max-width: 720px;" psb-code-hidden>
      <form id="save-bar-demo-form" onsubmit="return false"></form>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :unsaved,
        attributes: %{
          id: "save-bar-unsaved",
          form: "save-bar-demo-form",
          show: true,
          on_discard: "discard",
          saving_label: "Saving..."
        }
      }
    ]
  end
end
