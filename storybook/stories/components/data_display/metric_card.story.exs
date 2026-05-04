defmodule Storybook.Components.MetricCard do
  use PhoenixStorybook.Story, :page

  def doc, do: "Metric card with headline value, subtitle, and trailing slot."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; max-width: 760px;">
      <ExoUI.Components.metric_card
        title="Conversion rate"
        value="3.6%"
        subtitle="From 1,240 sessions"
      />

      <ExoUI.Components.metric_card
        title="Average order value"
        value="$87.50"
        subtitle="Last 30 days"
      >
        <:trailing>
          <ExoUI.Components.badge variant="success">+5%</ExoUI.Components.badge>
        </:trailing>
      </ExoUI.Components.metric_card>
    </div>
    """
  end
end
