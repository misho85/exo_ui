defmodule Storybook.Components.Charts.StackedBarChart do
  use PhoenixStorybook.Story, :page

  def doc, do: "Stacked bar chart with legend keys and custom series colors."

  def render(assigns) do
    assigns =
      assigns
      |> assign(:data, [
        {"January", %{"Desktop" => 186, "Mobile" => 80}},
        {"February", %{"Desktop" => 305, "Mobile" => 200}},
        {"March", %{"Desktop" => 237, "Mobile" => 120}},
        {"April", %{"Desktop" => 73, "Mobile" => 190}},
        {"May", %{"Desktop" => 209, "Mobile" => 130}},
        {"June", %{"Desktop" => 214, "Mobile" => 140}}
      ])
      |> assign(:colors, %{
        "Desktop" => "var(--exo-primary)",
        "Mobile" => "color-mix(in oklch, var(--exo-primary) 50%, transparent)"
      })

    ~H"""
    <div style="padding: 1rem; max-width: 700px;">
      <div data-exo="card">
        <div data-exo="card-header">
          <h3 data-exo="card-title">Stacked bar chart</h3>
          <p style="margin: 0; color: var(--exo-muted-foreground); font-size: 0.875rem;">
            Desktop and mobile split
          </p>
        </div>
        <div data-exo="card-body">
          <ExoUI.Charts.stacked_bar_chart
            data={@data}
            colors={@colors}
            legend_keys={["Desktop", "Mobile"]}
            height={280}
          />
        </div>
      </div>
    </div>
    """
  end
end
