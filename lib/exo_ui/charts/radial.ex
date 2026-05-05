defmodule ExoUI.Charts.Radial do
  @moduledoc false

  use Phoenix.Component

  alias ExoUI.Charts.Helpers, as: H

  use ExoUI.Charts.Shared

  attr :empty_text, :string, required: true
  attr :aria_label, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  defp chart_empty(assigns) do
    assigns =
      assign(assigns, :computed_label, chart_label(assigns.aria_label, assigns.empty_text))

    ~H"""
    <div data-exo="chart-empty" role="status" aria-label={@computed_label} class={@class} {@rest}>
      {@empty_text}
    </div>
    """
  end

  @doc "Renders a pie chart with colored slices and hover tooltips."
  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def pie_chart(assigns) do
    if Enum.empty?(assigns.data) do
      ~H|<.chart_empty empty_text={@empty_text} aria_label={@aria_label} class={@class} {@rest} />|
    else
      data = assigns.data
      size = assigns.size
      total = Enum.reduce(data, 0, fn {_label, value, _color}, acc -> acc + to_number(value) end)
      total = if total == 0, do: 1, else: total
      cx = size / 2
      cy = size / 2
      radius = size / 2 - 4
      slices = build_pie_slices(data, total, cx, cy, radius, radius)
      chart_title = chart_label(assigns.aria_label, "Pie chart")
      chart_description = chart_description(assigns.description, data)

      assigns =
        assign(assigns,
          slices: slices,
          chart_title: chart_title,
          chart_description: chart_description
        )

      ~H"""
      <svg
        data-exo="pie-chart"
        role="img"
        aria-label={@chart_title}
        viewBox={"0 0 #{@size} #{@size}"}
        width={@size}
        height={@size}
        class={@class}
        style="display:block; margin:auto;"
        {@rest}
      >
        <title>{@chart_title}</title>
        <desc :if={@chart_description}>{@chart_description}</desc>
        <%= for slice <- @slices do %>
          <path d={slice.path} fill={slice.color}>
            <title>{slice.label}: {format_tooltip(slice.value)}</title>
          </path>
        <% end %>
      </svg>
      """
    end
  end

  @doc "Renders a donut chart (pie chart with hollow center)."
  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :inner_radius, :integer, default: 60
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def donut_chart(assigns) do
    if Enum.empty?(assigns.data) do
      ~H|<.chart_empty empty_text={@empty_text} aria_label={@aria_label} class={@class} {@rest} />|
    else
      data = assigns.data
      size = assigns.size
      total = Enum.reduce(data, 0, fn {_label, value, _color}, acc -> acc + to_number(value) end)
      total = if total == 0, do: 1, else: total
      cx = size / 2
      cy = size / 2
      outer_r = size / 2 - 4
      inner_r = assigns.inner_radius * 1.0
      slices = build_donut_slices(data, total, cx, cy, outer_r, inner_r)
      chart_title = chart_label(assigns.aria_label, "Donut chart")
      chart_description = chart_description(assigns.description, data)

      assigns =
        assign(assigns,
          slices: slices,
          chart_title: chart_title,
          chart_description: chart_description
        )

      ~H"""
      <svg
        data-exo="donut-chart"
        role="img"
        aria-label={@chart_title}
        viewBox={"0 0 #{@size} #{@size}"}
        width={@size}
        height={@size}
        class={@class}
        style="display:block; margin:auto;"
        {@rest}
      >
        <title>{@chart_title}</title>
        <desc :if={@chart_description}>{@chart_description}</desc>
        <%= for slice <- @slices do %>
          <path d={slice.path} fill={slice.color}>
            <title>{slice.label}: {format_tooltip(slice.value)}</title>
          </path>
        <% end %>
      </svg>
      """
    end
  end

  @doc "Renders a donut chart with centered text (value and label)."
  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :inner_radius, :integer, default: 60
  attr :center_value, :string, default: ""
  attr :center_label, :string, default: ""
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def donut_chart_text(assigns) do
    if Enum.empty?(assigns.data) do
      ~H|<.chart_empty empty_text={@empty_text} aria_label={@aria_label} class={@class} {@rest} />|
    else
      data = assigns.data
      size = assigns.size
      total = Enum.reduce(data, 0, fn {_label, value, _color}, acc -> acc + to_number(value) end)
      total = if total == 0, do: 1, else: total
      cx = size / 2
      cy = size / 2
      outer_r = size / 2 - 4
      inner_r = assigns.inner_radius * 1.0
      slices = build_donut_slices(data, total, cx, cy, outer_r, inner_r)
      chart_title = chart_label(assigns.aria_label, "Donut chart with summary")
      chart_description = chart_description(assigns.description, data)

      assigns =
        assign(assigns,
          slices: slices,
          cx: cx,
          cy: cy,
          chart_title: chart_title,
          chart_description: chart_description
        )

      ~H"""
      <svg
        data-exo="donut-chart-text"
        role="img"
        aria-label={@chart_title}
        viewBox={"0 0 #{@size} #{@size}"}
        width={@size}
        height={@size}
        class={@class}
        style="display:block; margin:auto;"
        {@rest}
      >
        <title>{@chart_title}</title>
        <desc :if={@chart_description}>{@chart_description}</desc>
        <%= for slice <- @slices do %>
          <path d={slice.path} fill={slice.color}>
            <title>{slice.label}: {format_tooltip(slice.value)}</title>
          </path>
        <% end %>
        <text
          x={@cx}
          y={@cy - 6}
          text-anchor="middle"
          fill="currentColor"
          font-size="24"
          font-weight="700"
        >
          {@center_value}
        </text>
        <text
          x={@cx}
          y={@cy + 14}
          text-anchor="middle"
          fill="currentColor"
          fill-opacity="0.45"
          font-size="12"
        >
          {@center_label}
        </text>
      </svg>
      """
    end
  end

  @doc "Renders a radar/spider chart with polygon grid and data overlay."
  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def radar_chart(assigns) do
    if Enum.empty?(assigns.data) do
      ~H|<.chart_empty empty_text={@empty_text} aria_label={@aria_label} class={@class} {@rest} />|
    else
      data = assigns.data
      size = assigns.size
      cx = size / 2
      cy = size / 2
      max_radius = size / 2 - 28
      count = length(data)

      max_val =
        data
        |> Enum.map(fn {_label, value} -> to_number(value) end)
        |> Enum.max(fn -> 1 end)
        |> H.safe_max()

      grid_levels = [0.2, 0.4, 0.6, 0.8, 1.0]

      grid_polygons =
        Enum.map(grid_levels, fn level -> polygon_points(count, cx, cy, max_radius * level) end)

      axes =
        Enum.map(0..(count - 1), fn index ->
          angle = -:math.pi() / 2 + 2 * :math.pi() * index / count
          ex = cx + max_radius * :math.cos(angle)
          ey = cy + max_radius * :math.sin(angle)
          {r(ex), r(ey)}
        end)

      data_points =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{_label, value}, index} ->
          fraction = to_number(value) / max_val
          angle = -:math.pi() / 2 + 2 * :math.pi() * index / count
          x = cx + max_radius * fraction * :math.cos(angle)
          y = cy + max_radius * fraction * :math.sin(angle)
          {r(x), r(y)}
        end)

      data_polygon = Enum.map_join(data_points, " ", fn {x, y} -> "#{x},#{y}" end)

      labels =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, _value}, index} ->
          angle = -:math.pi() / 2 + 2 * :math.pi() * index / count
          lx = cx + (max_radius + 16) * :math.cos(angle)
          ly = cy + (max_radius + 16) * :math.sin(angle)
          %{label: H.short_label(label), x: r(lx), y: r(ly)}
        end)

      chart_title = chart_label(assigns.aria_label, "Radar chart")
      chart_description = chart_description(assigns.description, data)

      assigns =
        assign(assigns,
          cx: cx,
          cy: cy,
          grid_polygons: grid_polygons,
          axes: axes,
          data_polygon: data_polygon,
          labels: labels,
          chart_title: chart_title,
          chart_description: chart_description
        )

      ~H"""
      <svg
        data-exo="radar-chart"
        role="img"
        aria-label={@chart_title}
        viewBox={"0 0 #{@size} #{@size}"}
        width={@size}
        height={@size}
        class={@class}
        style="display:block; margin:auto;"
        {@rest}
      >
        <title>{@chart_title}</title>
        <desc :if={@chart_description}>{@chart_description}</desc>
        <%= for poly <- @grid_polygons do %>
          <polygon points={poly} fill="none" stroke="currentColor" stroke-opacity="0.1" />
        <% end %>
        <%= for {ex, ey} <- @axes do %>
          <line x1={@cx} y1={@cy} x2={ex} y2={ey} stroke="currentColor" stroke-opacity="0.1" />
        <% end %>
        <polygon
          points={@data_polygon}
          fill={@color}
          fill-opacity="0.6"
          stroke={@color}
          stroke-width="2"
        />
        <%= for lbl <- @labels do %>
          <text
            x={lbl.x}
            y={lbl.y}
            text-anchor="middle"
            dominant-baseline="central"
            fill="currentColor"
            fill-opacity="0.45"
            font-size="12"
          >
            {lbl.label}
          </text>
        <% end %>
      </svg>
      """
    end
  end

  @doc "Renders a radial/gauge chart with arc segments."
  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :inner_radius, :integer, default: 40
  attr :outer_radius, :integer, default: 110
  attr :empty_text, :string, default: "No data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def radial_chart(assigns) do
    if Enum.empty?(assigns.data) do
      ~H|<.chart_empty empty_text={@empty_text} aria_label={@aria_label} class={@class} {@rest} />|
    else
      data = assigns.data
      size = assigns.size
      cx = size / 2
      cy = size / 2
      count = length(data)

      max_val =
        data
        |> Enum.map(fn {_label, value, _color} -> to_number(value) end)
        |> Enum.max(fn -> 1 end)

      max_val = if max_val == 0, do: 1, else: max_val
      inner_r = assigns.inner_radius * 1.0
      outer_r = assigns.outer_radius * 1.0
      band = if count > 0, do: (outer_r - inner_r) / count, else: 0
      bar_width = band * 0.7
      start_angle = -:math.pi() / 2

      arcs =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, value, color}, index} ->
          fraction = to_number(value) / max_val
          radius_center = inner_r + band * index + band / 2
          radius_inner = radius_center - bar_width / 2
          radius_outer = radius_center + bar_width / 2
          sweep = fraction * 2 * :math.pi() * 0.85
          end_angle = start_angle + sweep
          bg_end = start_angle + 2 * :math.pi() * 0.85
          bg_path = arc_path(cx, cy, radius_inner, radius_outer, start_angle, bg_end)
          fg_path = arc_path(cx, cy, radius_inner, radius_outer, start_angle, end_angle)

          %{label: label, value: value, color: color, bg_path: bg_path, fg_path: fg_path}
        end)

      chart_title = chart_label(assigns.aria_label, "Radial chart")
      chart_description = chart_description(assigns.description, data)

      assigns =
        assign(assigns,
          arcs: arcs,
          chart_title: chart_title,
          chart_description: chart_description
        )

      ~H"""
      <svg
        data-exo="radial-chart"
        role="img"
        aria-label={@chart_title}
        viewBox={"0 0 #{@size} #{@size}"}
        width={@size}
        height={@size}
        class={@class}
        style="display:block; margin:auto;"
        {@rest}
      >
        <title>{@chart_title}</title>
        <desc :if={@chart_description}>{@chart_description}</desc>
        <%= for arc <- @arcs do %>
          <path d={arc.bg_path} fill="currentColor" fill-opacity="0.08" />
          <path d={arc.fg_path} fill={arc.color}>
            <title>{arc.label}: {format_tooltip(arc.value)}</title>
          </path>
        <% end %>
      </svg>
      """
    end
  end
end
