defmodule Storybook.Components.Charts.StackedBarChart do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Charts.stacked_bar_chart/1

  def template do
    """
    <div style="padding: 1rem; max-width: 700px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Stacked bar chart</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Desktop and mobile split
          </p>
        </div>
        <div data-exo="card-body">
          <.psb-variation/>
        </div>
      </div>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :devices,
        attributes: %{
          data: device_data(),
          colors: device_colors(),
          legend_keys: ["Desktop", "Mobile"],
          height: 280
        }
      },
      %Variation{
        id: :empty,
        attributes: %{
          data: [],
          colors: device_colors(),
          legend_keys: ["Desktop", "Mobile"],
          height: 280,
          empty_text: "No device data"
        }
      }
    ]
  end

  defp device_data do
    [
      {"January", %{"Desktop" => 186, "Mobile" => 80}},
      {"February", %{"Desktop" => 305, "Mobile" => 200}},
      {"March", %{"Desktop" => 237, "Mobile" => 120}},
      {"April", %{"Desktop" => 73, "Mobile" => 190}},
      {"May", %{"Desktop" => 209, "Mobile" => 130}},
      {"June", %{"Desktop" => 214, "Mobile" => 140}}
    ]
  end

  defp device_colors do
    %{
      "Desktop" => "var(--exo-primary)",
      "Mobile" => "color-mix(in oklch, var(--exo-primary) 50%, transparent)"
    }
  end
end
