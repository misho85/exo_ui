defmodule Storybook.Components.ConfirmModal do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.confirm_modal/1

  def template do
    """
    <div style="padding: 2rem; min-height: 420px; display: flex; flex-direction: column; gap: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :delete_project,
        template: confirm_template("Open confirm modal"),
        attributes: %{
          show: false,
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

  defp confirm_template(label) do
    """
    <div style="display: flex; flex-direction: column; gap: 1rem;" psb-code-hidden>
      <ExoUI.Components.button variant="danger" phx-click={ExoUI.Components.Overlay.show_modal(":variation_id")}>
        #{label}
      </ExoUI.Components.button>
      <.psb-variation/>
    </div>
    """
  end
end
