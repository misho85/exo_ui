defmodule Storybook.Components.Flash do
  use PhoenixStorybook.Story, :page

  def doc, do: "Flash notifications shown at top of page."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem; max-width: 600px;">
      <ExoUI.Components.flash kind={:info} title="Info" flash={%{}}>
        Your profile has been updated.
      </ExoUI.Components.flash>

      <ExoUI.Components.flash kind={:success} title="Success" flash={%{}}>
        Payment method saved.
      </ExoUI.Components.flash>

      <ExoUI.Components.flash kind={:warning} title="Warning" flash={%{}}>
        The next sync may take a few minutes.
      </ExoUI.Components.flash>

      <ExoUI.Components.flash kind={:error} title="Error" flash={%{}}>
        Something went wrong. Please try again.
      </ExoUI.Components.flash>
    </div>
    """
  end
end
