defmodule Storybook.Components.Sparkline do
  use PhoenixStorybook.Story, :page

  def doc, do: "Compact inline sparkline SVG chart."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 520px;">
      <div style="display: flex; align-items: baseline; gap: 0.5rem;">
        <span style="font-size: 2rem; font-weight: 700; font-variant-numeric: tabular-nums;">
          $112K
        </span>
        <ExoUI.Charts.trend_badge current={112} previous={98} />
      </div>

      <ExoUI.Charts.sparkline
        data={[42, 58, 51, 73, 67, 89, 78, 92, 86, 104, 98, 112]}
        width={420}
        height={88}
      />

      <ExoUI.Charts.sparkline
        data={[80, 72, 66, 70, 62, 54, 49, 46, 42, 38, 34, 30]}
        width={420}
        height={64}
        color="var(--exo-danger)"
      />
    </div>
    """
  end
end
