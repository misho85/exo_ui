defmodule Storybook.Components.ProgressBar do
  use PhoenixStorybook.Story, :page

  def doc, do: "Chart-style labeled horizontal progress bars."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem; max-width: 520px;">
      <ExoUI.Charts.progress_bar label="Desktop" count={186} max={305} />
      <ExoUI.Charts.progress_bar label="Mobile" count={200} max={305} color="var(--exo-success)" />
      <ExoUI.Charts.progress_bar label="Tablet" count={73} max={305} color="var(--exo-warning)" />
    </div>
    """
  end
end
