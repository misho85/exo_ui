defmodule Storybook.Components.Spinner do
  use PhoenixStorybook.Story, :page

  def doc, do: "Loading spinner indicator."

  def render(assigns) do
    ~H"""
    <div style="display: flex; gap: 2rem; align-items: center; padding: 1rem;">
      <div>
        <p style="margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem;">Small</p>
        <ExoUI.Components.spinner size="sm" />
      </div>
      <div>
        <p style="margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem;">Medium (default)</p>
        <ExoUI.Components.spinner />
      </div>
      <div>
        <p style="margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem;">Large</p>
        <ExoUI.Components.spinner size="lg" />
      </div>
    </div>
    """
  end
end
