defmodule Storybook.Components.Rating do
  use PhoenixStorybook.Story, :page

  def doc, do: "Star rating input."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem;">
      <div>
        <p style="margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem;">Interactive (3/5)</p>
        <ExoUI.Components.rating name="score" value={3} />
      </div>
      <div>
        <p style="margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem;">Read-only (4/5)</p>
        <ExoUI.Components.rating name="display" value={4} readonly />
      </div>
      <div>
        <p style="margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem;">Large</p>
        <ExoUI.Components.rating name="large" value={2} size="lg" />
      </div>
    </div>
    """
  end
end
