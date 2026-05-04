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
    <div style="padding: 1rem; min-height: 520px; display: grid; gap: 1.5rem;">
      <section>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          Bottom right
        </p>
        <ExoUI.Components.toast_container toasts={@toasts} placement="bottom-right" />
      </section>

      <section>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          Top left
        </p>
        <ExoUI.Components.toast_container
          id="toast-container-top-left"
          toasts={[
            {"toast-4",
             %{kind: :warning, title: "Connection slow", message: "Updates may arrive late."}},
            {"toast-5", %{kind: :info, message: "Draft autosaved."}}
          ]}
          placement="top-left"
          close_label="Dismiss toast"
        />
      </section>
    </div>
    """
  end
end
