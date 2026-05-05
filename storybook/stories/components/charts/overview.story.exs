defmodule Storybook.Components.Charts.Overview do
  use PhoenixStorybook.Story, :example

  def doc, do: "SVG chart components styled after shadcn/ui."

  @impl true
  def render(assigns) do
    monthly = [
      {"January", 4200},
      {"February", 5800},
      {"March", 5100},
      {"April", 7300},
      {"May", 6700},
      {"June", 8900}
    ]

    monthly_multiple = [
      {"January", 4200, 2400},
      {"February", 5800, 3200},
      {"March", 5100, 2900},
      {"April", 7300, 4100},
      {"May", 6700, 3800},
      {"June", 8900, 4800}
    ]

    monthly_negative = [
      {"January", 4200},
      {"February", -3800},
      {"March", 5100},
      {"April", -2300},
      {"May", 6700},
      {"June", -1900}
    ]

    horizontal = [
      {"Chrome", 275},
      {"Safari", 200},
      {"Firefox", 187},
      {"Edge", 173},
      {"Other", 90}
    ]

    stacked = [
      {"January", %{"Desktop" => 186, "Mobile" => 80}},
      {"February", %{"Desktop" => 305, "Mobile" => 200}},
      {"March", %{"Desktop" => 237, "Mobile" => 120}},
      {"April", %{"Desktop" => 73, "Mobile" => 190}},
      {"May", %{"Desktop" => 209, "Mobile" => 130}},
      {"June", %{"Desktop" => 214, "Mobile" => 140}}
    ]

    colors = %{
      "Desktop" => "var(--exo-primary)",
      "Mobile" => "color-mix(in oklch, var(--exo-primary) 50%, transparent)"
    }

    pie_data = [
      {"Chrome", 275, "hsl(220, 70%, 50%)"},
      {"Safari", 200, "hsl(160, 60%, 45%)"},
      {"Firefox", 187, "hsl(30, 80%, 55%)"},
      {"Edge", 173, "hsl(280, 65%, 60%)"},
      {"Other", 90, "hsl(340, 75%, 55%)"}
    ]

    radar_data = [
      {"January", 186},
      {"February", 305},
      {"March", 237},
      {"April", 273},
      {"May", 209},
      {"June", 214}
    ]

    radial_data = [
      {"Chrome", 275, "hsl(220, 70%, 50%)"},
      {"Safari", 200, "hsl(160, 60%, 45%)"},
      {"Firefox", 187, "hsl(30, 80%, 55%)"}
    ]

    assigns =
      assigns
      |> assign(:monthly, monthly)
      |> assign(:monthly_multiple, monthly_multiple)
      |> assign(:monthly_negative, monthly_negative)
      |> assign(:horizontal, horizontal)
      |> assign(:stacked, stacked)
      |> assign(:colors, colors)
      |> assign(:pie_data, pie_data)
      |> assign(:radar_data, radar_data)
      |> assign(:radial_data, radial_data)

    ~H"""
    <div style="padding: 1rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; max-width: 1200px;">
      <%!-- Bar Chart --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Bar Chart</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.bar_chart data={@monthly} height={200} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Bar Chart - Multiple --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Bar Chart - Multiple</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.bar_chart_multiple data={@monthly_multiple} height={200} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Bar Chart - Label --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Bar Chart - Label</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.bar_chart_label data={@monthly} height={200} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Bar Chart - Horizontal --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Bar Chart - Horizontal</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.horizontal_bar_chart data={@horizontal} height={180} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Bar Chart - Negative --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Bar Chart - Negative</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.bar_chart_negative data={@monthly_negative} height={200} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Bar Chart - Stacked + Legend --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Bar Chart - Stacked + Legend</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.stacked_bar_chart
            data={@stacked}
            colors={@colors}
            legend_keys={["Desktop", "Mobile"]}
            height={220}
          />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Area Chart --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Area Chart</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.area_chart data={@monthly} height={200} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
      </div>

      <%!-- Area Chart - Stacked --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Area Chart - Stacked</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.area_chart_stacked data={@monthly_multiple} height={200} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
      </div>

      <%!-- Line Chart --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Line Chart</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.line_chart data={@monthly} height={200} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Line Chart - Multiple --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Line Chart - Multiple</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.line_chart_multiple data={@monthly_multiple} height={200} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Pie Chart --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Pie Chart</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div
          data-exo="card-body"
          style="flex: 1; display: flex; align-items: center; justify-content: center;"
        >
          <ExoUI.Charts.pie_chart data={@pie_data} size={200} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Donut Chart --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Donut Chart</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div
          data-exo="card-body"
          style="flex: 1; display: flex; align-items: center; justify-content: center;"
        >
          <ExoUI.Charts.donut_chart data={@pie_data} size={200} inner_radius={60} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Donut Chart with Text --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Donut Chart - Text</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div
          data-exo="card-body"
          style="flex: 1; display: flex; align-items: center; justify-content: center;"
        >
          <ExoUI.Charts.donut_chart_text
            data={@pie_data}
            size={200}
            inner_radius={60}
            center_value="925"
            center_label="Visitors"
          />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Radar Chart --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Radar Chart</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div
          data-exo="card-body"
          style="flex: 1; display: flex; align-items: center; justify-content: center;"
        >
          <ExoUI.Charts.radar_chart data={@radar_data} size={220} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Radial Chart --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Radial Chart</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div
          data-exo="card-body"
          style="flex: 1; display: flex; align-items: center; justify-content: center;"
        >
          <ExoUI.Charts.radial_chart data={@radial_data} size={220} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 5.2% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </div>

      <%!-- Sparkline + KPI --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Sparkline</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">Revenue overview</p>
        </div>
        <div data-exo="card-body" style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; align-items: baseline; gap: 0.5rem;">
            <span style="font-size: 1.75rem; font-weight: 700; color: var(--exo-foreground); font-variant-numeric: tabular-nums;">
              $112K
            </span>
            <ExoUI.Charts.trend_badge current={112} previous={98} />
          </div>
          <ExoUI.Charts.sparkline
            data={[42, 58, 51, 73, 67, 89, 78, 92, 86, 104, 98, 112]}
            width={300}
            height={64}
          />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">
            Trending up by 14.3% this month <span style="color: var(--exo-success);">&#8599;</span>
          </p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">Last 12 months</p>
        </div>
      </div>
    </div>
    """
  end
end
