defmodule Storybook.Components.Charts.TrendBadge do
  use PhoenixStorybook.Story, :page

  def doc, do: "Trend badge for positive, negative, and flat metric deltas."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <ExoUI.Charts.trend_badge current={112} previous={98} />
      <ExoUI.Charts.trend_badge current={84} previous={98} />
      <ExoUI.Charts.trend_badge current={98} previous={98} />
      <ExoUI.Charts.trend_badge current={12} previous={0} />
    </div>
    """
  end
end
