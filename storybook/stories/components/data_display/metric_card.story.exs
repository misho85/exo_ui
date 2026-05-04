defmodule Storybook.Components.MetricCard do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.metric_card/1

  def template do
    """
    <div style="padding: 1rem; min-width: 16rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :default,
        attributes: %{
          title: "Conversion rate",
          value: "3.6%",
          subtitle: "From 1,240 sessions"
        }
      },
      %Variation{
        id: :with_trailing,
        attributes: %{
          title: "Average order value",
          value: "$87.50",
          subtitle: "Last 30 days"
        },
        slots: [
          ~s|<:trailing><span data-exo="badge" data-variant="success">+5%</span></:trailing>|
        ]
      }
    ]
  end
end
