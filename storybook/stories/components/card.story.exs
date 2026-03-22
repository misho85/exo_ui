defmodule Storybook.Components.Card do
  use PhoenixStorybook.Story, :page

  def doc, do: "Card components: content_card, stat_card, metric_card."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem;">
      <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">content_card</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
        <ExoUI.Components.content_card title="Simple Card">
          This is a basic content card with a title and body text.
        </ExoUI.Components.content_card>

        <ExoUI.Components.content_card title="Card with Action">
          Card body content goes here.
          <:action>
            <ExoUI.Components.button size="sm" variant="ghost">View all</ExoUI.Components.button>
          </:action>
        </ExoUI.Components.content_card>

        <ExoUI.Components.content_card>
          Card without a title — just body content.
        </ExoUI.Components.content_card>
      </div>

      <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">stat_card</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
        <ExoUI.Components.stat_card title="Total Users" value="12,481" icon="👥" trend="+12%" trend_direction="up" subtitle="vs last month" />
        <ExoUI.Components.stat_card title="Revenue" value="$48,295" icon="💰" trend="+8.2%" trend_direction="up" subtitle="vs last month" />
        <ExoUI.Components.stat_card title="Bounce Rate" value="24.3%" icon="📉" trend="-3.1%" trend_direction="down" subtitle="vs last month" />
        <ExoUI.Components.stat_card title="Active Sessions" value="1,024" />
      </div>

      <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">metric_card</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
        <ExoUI.Components.metric_card title="Conversion Rate" value="3.6%" subtitle="From 1,240 sessions" />
        <ExoUI.Components.metric_card title="Avg. Order Value" value="$87.50" subtitle="Last 30 days">
          <:trailing><ExoUI.Components.badge variant="success">+5%</ExoUI.Components.badge></:trailing>
        </ExoUI.Components.metric_card>
      </div>
    </div>
    """
  end
end
