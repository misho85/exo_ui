defmodule Storybook.Components.ConfirmModal do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.confirm_modal/1

  def template do
    """
    <div style="padding: 2rem; min-height: 420px;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :delete_project,
        attributes: %{
          show: true,
          title: "Delete project",
          message:
            "This action cannot be undone. The project and all related records will be removed.",
          cancel_text: "Cancel",
          confirm_text: "Delete",
          variant: "danger"
        }
      }
    ]
  end
end
