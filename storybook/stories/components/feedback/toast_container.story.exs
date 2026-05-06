defmodule Storybook.Components.ToastContainer do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Feedback.toast_container/1

  def template do
    """
    <div style="padding: 1rem; min-height: 520px; display: grid; gap: 1.5rem;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :bottom_right,
        attributes: %{toasts: default_toasts(), placement: "bottom-right"}
      },
      %Variation{
        id: :top_left,
        attributes: %{
          id: "toast-container-top-left",
          toasts: secondary_toasts(),
          placement: "top-left",
          close_label: "Dismiss toast"
        }
      },
      %Variation{
        id: :auto_dismiss,
        attributes: %{
          id: "toast-container-auto",
          label: "Auto dismissing notifications",
          toasts: auto_dismiss_toasts(),
          auto_dismiss: true,
          duration: 60_000
        }
      }
    ]
  end

  defp default_toasts do
    [
      {"toast-1", %{kind: :info, title: "Saved", message: "Profile updated successfully."}},
      {"toast-2", %{kind: :success, title: "Published", message: "The release is now visible."}},
      {"toast-3",
       %{kind: :error, title: "Sync failed", message: "Retry the request in a moment."}}
    ]
  end

  defp secondary_toasts do
    [
      {"toast-4",
       %{kind: :warning, title: "Connection slow", message: "Updates may arrive late."}},
      {"toast-5", %{kind: :info, message: "Draft autosaved."}}
    ]
  end

  defp auto_dismiss_toasts do
    [
      {"toast-auto-1", %{kind: :success, title: "Queued", message: "Export will dismiss itself."}}
    ]
  end
end
