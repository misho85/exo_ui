defmodule Storybook.Components.Charts do
  use PhoenixStorybook.Story, :page

  def doc, do: "SVG chart components styled after shadcn/ui."

  def render(assigns) do
    monthly = [
      {"January", 4200}, {"February", 5800}, {"March", 5100},
      {"April", 7300}, {"May", 6700}, {"June", 8900}
    ]

    monthly_multi = [
      {"January", 4200, 2400}, {"February", 5800, 3100},
      {"March", 5100, 2800}, {"April", 7300, 4200},
      {"May", 6700, 3800}, {"June", 8900, 5100}
    ]

    horizontal = [
      {"Chrome", 275}, {"Safari", 200}, {"Firefox", 187},
      {"Edge", 173}, {"Other", 90}
    ]

    stacked = [
      {"January", %{"Desktop" => 186, "Mobile" => 80}},
      {"February", %{"Desktop" => 305, "Mobile" => 200}},
      {"March", %{"Desktop" => 237, "Mobile" => 120}},
      {"April", %{"Desktop" => 73, "Mobile" => 190}},
      {"May", %{"Desktop" => 209, "Mobile" => 130}},
      {"June", %{"Desktop" => 214, "Mobile" => 140}}
    ]

    colors = %{"Desktop" => "var(--exo-primary)", "Mobile" => "color-mix(in oklch, var(--exo-primary) 50%, transparent)"}

    assigns =
      assigns
      |> assign(:monthly, monthly)
      |> assign(:horizontal, horizontal)
      |> assign(:stacked, stacked)
      |> assign(:colors, colors)

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
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">Trending up by 5.2% this month <span style="color: var(--exo-success);">↗</span></p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">Showing total visitors for the last 6 months</p>
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
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">Trending up by 5.2% this month <span style="color: var(--exo-success);">↗</span></p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">Showing total visitors for the last 6 months</p>
        </div>
      </div>

      <%!-- Bar Chart - Stacked + Legend --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Bar Chart - Stacked + Legend</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.stacked_bar_chart data={@stacked} colors={@colors} legend_keys={["Desktop", "Mobile"]} height={220} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">Trending up by 5.2% this month <span style="color: var(--exo-success);">↗</span></p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">Showing total visitors for the last 6 months</p>
        </div>
      </div>

      <%!-- Area Chart --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Area Chart</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">Showing total visitors for the last 6 months</p>
        </div>
        <div data-exo="card-body" style="flex: 1;">
          <ExoUI.Charts.area_chart data={@monthly} height={200} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">Trending up by 5.2% this month <span style="color: var(--exo-success);">↗</span></p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">January - June 2024</p>
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
            <span style="font-size: 1.75rem; font-weight: 700; color: var(--exo-foreground); font-variant-numeric: tabular-nums;">$112K</span>
            <ExoUI.Charts.trend_badge current={112} previous={98} />
          </div>
          <ExoUI.Charts.sparkline data={[42, 58, 51, 73, 67, 89, 78, 92, 86, 104, 98, 112]} width={300} height={64} />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground); display: flex; align-items: center; gap: 0.25rem;">Trending up by 14.3% this month <span style="color: var(--exo-success);">↗</span></p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">Last 12 months</p>
        </div>
      </div>

      <%!-- Progress bars --%>
      <div data-exo="card" style="display: flex; flex-direction: column;">
        <div data-exo="card-header" style="padding-bottom: 0;">
          <h3 data-exo="card-title">Progress</h3>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">System resource usage</p>
        </div>
        <div data-exo="card-body" style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">
          <ExoUI.Charts.progress_bar count={75} max={100} label="Disk" />
          <ExoUI.Charts.progress_bar count={42} max={100} label="Memory" color="var(--exo-warning)" />
          <ExoUI.Charts.progress_bar count={12} max={100} label="CPU" color="var(--exo-success)" />
        </div>
        <div style="padding: 0 var(--exo-space-6) var(--exo-space-6); display: flex; flex-direction: column; gap: 0.25rem;">
          <p style="font-size: 0.875rem; font-weight: 500; color: var(--exo-foreground);">All systems operational</p>
          <p style="font-size: 0.875rem; color: var(--exo-muted-foreground);">Last updated 2 minutes ago</p>
        </div>
      </div>

    </div>
    """
  end
end
