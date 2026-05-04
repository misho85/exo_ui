defmodule Storybook.Components.ConfirmModal do
  use PhoenixStorybook.Story, :page

  def doc, do: "Confirmation modal with cancel and confirm actions."

  def render(assigns) do
    ~H"""
    <div style="padding: 2rem; min-height: 420px;">
      <ExoUI.Components.confirm_modal
        id="storybook-confirm-modal"
        show
        title="Delete project"
        message="This action cannot be undone. The project and all related records will be removed."
        cancel_text="Cancel"
        confirm_text="Delete"
        variant="danger"
      />
    </div>
    """
  end
end
