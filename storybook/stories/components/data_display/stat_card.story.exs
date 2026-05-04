defmodule Storybook.Components.StatCard do
  use PhoenixStorybook.Story, :page

  def doc, do: "Dashboard statistic card with value, optional icon, subtitle, and trend."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1rem; max-width: 960px;">
      <ExoUI.Components.stat_card
        title="Total users"
        value="12,481"
        icon="U"
        trend="+12%"
        trend_direction="up"
        subtitle="vs last month"
      />

      <ExoUI.Components.stat_card
        title="Revenue"
        value="$48,295"
        icon="$"
        trend="+8.2%"
        trend_direction="up"
        subtitle="vs last month"
      />

      <ExoUI.Components.stat_card
        title="Bounce rate"
        value="24.3%"
        icon="%"
        trend="-3.1%"
        trend_direction="down"
        subtitle="vs last month"
      />

      <ExoUI.Components.stat_card title="Active sessions" value="1,024" />
    </div>
    """
  end
end
