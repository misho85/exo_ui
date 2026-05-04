defmodule Storybook.Components.ToastContainer do
  use PhoenixStorybook.Story, :page

  def doc, do: "Toast container for stream-style notifications."

  def render(assigns) do
    assigns =
      assign(assigns, :toasts, [
        {"toast-1", %{kind: :info, title: "Saved", message: "Profile updated successfully."}},
        {"toast-2",
         %{kind: :success, title: "Published", message: "The release is now visible."}},
        {"toast-3",
         %{kind: :error, title: "Sync failed", message: "Retry the request in a moment."}}
      ])

    ~H"""
    <div style="padding: 1rem; min-height: 260px;">
      <ExoUI.Components.toast_container toasts={@toasts} placement="bottom-right" />
    </div>
    """
  end
end
