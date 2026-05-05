defmodule Storybook.Components.Charts.Sparkline do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.sparkline/1

  def template do
    """
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1.5rem; max-width: 520px;">
      <div style="display: flex; align-items: baseline; gap: 0.5rem;">
        <span style="font-size: 2rem; font-weight: 700; font-variant-numeric: tabular-nums;">
          $112K
        </span>
        <ExoUI.Charts.trend_badge current={112} previous={98} />
      </div>

      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :revenue,
        attributes: %{
          data: [42, 58, 51, 73, 67, 89, 78, 92, 86, 104, 98, 112],
          width: 420,
          height: 88
        }
      },
      %Variation{
        id: :decline,
        attributes: %{
          data: [80, 72, 66, 70, 62, 54, 49, 46, 42, 38, 34, 30],
          width: 420,
          height: 64,
          color: "var(--exo-danger)"
        }
      }
    ]
  end
end
