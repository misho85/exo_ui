defmodule ExoUI.Charts do
  @moduledoc """
  SVG chart components styled after shadcn/ui conventions.

  Follows the exact shadcn/ui Recharts patterns:
  - CartesianGrid vertical={false} — subtle horizontal grid lines only
  - No y-axis labels anywhere
  - No axis lines
  - X-axis labels abbreviated to 3 characters
  - Grid lines at ~10% opacity
  - Smooth catmull-rom curves for area charts
  """

  use Phoenix.Component

  defp to_number(n) when is_float(n), do: n
  defp to_number(n) when is_integer(n), do: n * 1.0
  defp to_number(%{__struct__: Decimal} = d), do: apply(Decimal, :to_float, [d])
  defp to_number(_), do: 0.0

  defp format_tooltip(value) when is_float(value),
    do: :erlang.float_to_binary(value, decimals: 2)

  defp format_tooltip(value) when is_integer(value) do
    cond do
      value >= 1_000_000 -> "#{:erlang.float_to_binary(value / 1_000_000, decimals: 1)}M"
      value >= 1_000 -> "#{:erlang.float_to_binary(value / 1_000, decimals: 1)}K"
      true -> to_string(value)
    end
  end

  defp format_tooltip(value), do: to_string(value)

  defp format_pct(pct) when pct == trunc(pct), do: "#{trunc(pct)}"
  defp format_pct(pct), do: :erlang.float_to_binary(pct, decimals: 1)

  defp r(v), do: Float.round(v * 1.0, 1)

  # --- Catmull-Rom to Cubic Bezier conversion ---
  # Recharts "natural" interpolation uses catmull-rom splines (alpha=0, uniform).
  # This converts a list of {x, y} points into an SVG path string using
  # cubic bezier curves (C commands) that produce smooth organic curves.

  defp catmull_rom_to_bezier_path(points) when length(points) < 2, do: ""

  defp catmull_rom_to_bezier_path([{x, y}]) do
    "M#{r(x)},#{r(y)}"
  end

  defp catmull_rom_to_bezier_path(points) do
    # Catmull-Rom with tension 0 (uniform), matching Recharts "natural"
    # For n points, we generate n-1 cubic bezier segments.
    # Each segment needs 4 control points from the catmull-rom sequence.
    # We pad the start and end by duplicating first/last points.
    n = length(points)
    pts = List.to_tuple(points)

    {x0, y0} = elem(pts, 0)
    start = "M#{r(x0)},#{r(y0)}"

    segments =
      Enum.map(0..(n - 2), fn i ->
        # p0, p1, p2, p3 are the four catmull-rom control points
        # p1..p2 is the segment we're drawing
        p0 = elem(pts, max(i - 1, 0))
        p1 = elem(pts, i)
        p2 = elem(pts, min(i + 1, n - 1))
        p3 = elem(pts, min(i + 2, n - 1))

        catmull_rom_segment_to_bezier(p0, p1, p2, p3)
      end)

    start <> Enum.join(segments)
  end

  defp catmull_rom_segment_to_bezier({x0, y0}, {x1, y1}, {x2, y2}, {x3, y3}) do
    # Convert catmull-rom segment (p1 to p2) to cubic bezier control points.
    # Using the standard conversion with alpha = 1/6 of the tangent:
    #   tangent at p1 = (p2 - p0) / 2
    #   tangent at p2 = (p3 - p1) / 2
    #   cp1 = p1 + tangent_at_p1 / 3
    #   cp2 = p2 - tangent_at_p2 / 3

    # Tangent at p1
    t1x = (x2 - x0) / 2.0
    t1y = (y2 - y0) / 2.0

    # Tangent at p2
    t2x = (x3 - x1) / 2.0
    t2y = (y3 - y1) / 2.0

    # Bezier control points
    cp1x = x1 + t1x / 3.0
    cp1y = y1 + t1y / 3.0

    cp2x = x2 - t2x / 3.0
    cp2y = y2 - t2y / 3.0

    "C#{r(cp1x)},#{r(cp1y)} #{r(cp2x)},#{r(cp2y)} #{r(x2)},#{r(y2)}"
  end

  # Build the closed area path for the fill beneath the curve
  defp catmull_rom_area_path(points, baseline_y, left_x, right_x) do
    curve = catmull_rom_to_bezier_path(points)
    # Close the area: line down to baseline at last point, line across to first x, close
    "#{curve}L#{r(right_x)},#{r(baseline_y)}L#{r(left_x)},#{r(baseline_y)}Z"
  end

  # --- Rounded rect path helpers for stacked bars ---
  # SVG <rect> rx/ry applies to ALL corners. For stacked bars, shadcn rounds only
  # specific corners. We generate a <path> instead.

  # Rounded bottom corners only: radius on bottom-left and bottom-right
  defp rounded_bottom_rect_path(x, y, w, h, radius) do
    r = min(radius, min(w / 2, h / 2))

    if r <= 0 do
      "M#{r(x)},#{r(y)}h#{r(w)}v#{r(h)}h#{r(-w)}Z"
    else
      # Start at top-left, go right (sharp top corners), round bottom corners
      "M#{r(x)},#{r(y)}" <>
        "h#{r(w)}" <>
        "v#{r(h - r)}" <>
        "a#{r(r)},#{r(r)} 0 0 1 #{r(-r)},#{r(r)}" <>
        "h#{r(-(w - 2 * r))}" <>
        "a#{r(r)},#{r(r)} 0 0 1 #{r(-r)},#{r(-r)}" <>
        "Z"
    end
  end

  # Rounded top corners only: radius on top-left and top-right
  defp rounded_top_rect_path(x, y, w, h, radius) do
    r = min(radius, min(w / 2, h / 2))

    if r <= 0 do
      "M#{r(x)},#{r(y)}h#{r(w)}v#{r(h)}h#{r(-w)}Z"
    else
      # Start at bottom-left, go up, round top corners, down right side
      "M#{r(x)},#{r(y + h)}" <>
        "v#{r(-(h - r))}" <>
        "a#{r(r)},#{r(r)} 0 0 1 #{r(r)},#{r(-r)}" <>
        "h#{r(w - 2 * r)}" <>
        "a#{r(r)},#{r(r)} 0 0 1 #{r(r)},#{r(r)}" <>
        "v#{r(h - r)}" <>
        "Z"
    end
  end

  # Fully rounded rect (all 4 corners)
  defp fully_rounded_rect_path(x, y, w, h, radius) do
    r = min(radius, min(w / 2, h / 2))

    if r <= 0 do
      "M#{r(x)},#{r(y)}h#{r(w)}v#{r(h)}h#{r(-w)}Z"
    else
      "M#{r(x + r)},#{r(y)}" <>
        "h#{r(w - 2 * r)}" <>
        "a#{r(r)},#{r(r)} 0 0 1 #{r(r)},#{r(r)}" <>
        "v#{r(h - 2 * r)}" <>
        "a#{r(r)},#{r(r)} 0 0 1 #{r(-r)},#{r(r)}" <>
        "h#{r(-(w - 2 * r))}" <>
        "a#{r(r)},#{r(r)} 0 0 1 #{r(-r)},#{r(-r)}" <>
        "v#{r(-(h - 2 * r))}" <>
        "a#{r(r)},#{r(r)} 0 0 1 #{r(r)},#{r(-r)}" <>
        "Z"
    end
  end

  # --- Horizontal grid lines helper (CartesianGrid vertical={false}) ---
  defp horizontal_grid_lines(pt, ch, pl, svg_width, pr, count \\ 4) do
    Enum.map(1..count, fn i ->
      frac = i / count
      r(pt + ch * (1 - frac))
    end)
    |> Enum.map(fn gy ->
      {gy, pl, svg_width - pr}
    end)
  end

  # --- trend_badge ---

  attr :current, :any, required: true
  attr :previous, :any, required: true

  def trend_badge(assigns) do
    current = to_number(assigns.current)
    previous = to_number(assigns.previous)

    {pct, direction} =
      cond do
        previous == 0 and current > 0 -> {100.0, :up}
        previous == 0 -> {0.0, :flat}
        true ->
          change = (current - previous) / previous * 100
          dir = cond do
            change > 0 -> :up
            change < 0 -> :down
            true -> :flat
          end
          {abs(Float.round(change, 1)), dir}
      end

    assigns = assign(assigns, pct: pct, direction: direction)

    ~H"""
    <span :if={@direction == :up} data-exo="trend-badge" data-direction="up">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2l4 5H2z"/></svg>
      {format_pct(@pct)}%
    </span>
    <span :if={@direction == :down} data-exo="trend-badge" data-direction="down">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 10l4-5H2z"/></svg>
      {format_pct(@pct)}%
    </span>
    <span :if={@direction == :flat} data-exo="trend-badge" data-direction="flat">&mdash;</span>
    """
  end

  # --- sparkline ---

  attr :data, :list, required: true
  attr :width, :integer, default: 80
  attr :height, :integer, default: 24
  attr :color, :string, default: "var(--exo-primary)"

  def sparkline(assigns) do
    if length(assigns.data) < 2 do
      ~H|<span></span>|
    else
      values = Enum.map(assigns.data, &to_number/1)
      max_val = Enum.max(values)
      min_val = Enum.min(values)
      range = if max_val == min_val, do: 1, else: max_val - min_val
      count = length(values)
      pad = 2
      w = assigns.width - pad * 2
      h = assigns.height - pad * 2

      points =
        values
        |> Enum.with_index()
        |> Enum.map(fn {v, i} ->
          x = pad + i / max(count - 1, 1) * w
          y = pad + h - (v - min_val) / range * h
          {r(x), r(y)}
        end)

      line_points = Enum.map_join(points, " ", fn {x, y} -> "#{x},#{y}" end)
      {fx, _} = List.first(points)
      area_points = line_points <> " #{r(pad + w)},#{r(pad + h)} #{r(fx)},#{r(pad + h)}"
      id = "spark-#{System.unique_integer([:positive])}"

      assigns = assign(assigns, id: id, line_points: line_points, area_points: area_points)

      ~H"""
      <svg data-exo="sparkline" viewBox={"0 0 #{@width} #{@height}"} width={@width} height={@height} style="display:inline-block;">
        <defs>
          <linearGradient id={"#{@id}-g"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stop-color={@color} stop-opacity="0.4" />
            <stop offset="95%" stop-color={@color} stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={@area_points} fill={"url(##{@id}-g)"} />
        <polyline points={@line_points} fill="none" stroke={@color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      """
    end
  end

  # --- progress_bar ---

  attr :label, :string, required: true
  attr :count, :integer, required: true
  attr :max, :integer, required: true
  attr :color, :string, default: "var(--exo-primary)"

  def progress_bar(assigns) do
    pct = if assigns.max > 0, do: assigns.count / assigns.max * 100, else: 0
    pct_label = if pct == trunc(pct), do: "#{trunc(pct)}%", else: "#{Float.round(pct, 1)}%"
    assigns = assign(assigns, pct: pct, pct_label: pct_label)

    ~H"""
    <div data-exo="progress-bar">
      <div data-exo="progress-bar-header">
        <span>{@label}</span>
        <span data-exo="progress-bar-count">{@pct_label}</span>
      </div>
      <div data-exo="progress-bar-track">
        <div data-exo="progress-bar-fill" style={"width: #{@pct}%; background: #{@color};"} />
      </div>
    </div>
    """
  end

  # --- bar_chart ---
  # shadcn: CartesianGrid vertical={false}, no y-axis, no axis lines,
  # XAxis tickLine={false} tickMargin={10} axisLine={false}
  # tickFormatter={(value) => value.slice(0, 3)}
  # Bar radius={8} — fully rounded bars

  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No data"

  def bar_chart(assigns) do
    if Enum.empty?(assigns.data) do
      ~H|<div data-exo="chart-empty">{@empty_text}</div>|
    else
      data = assigns.data
      height = assigns.height
      max_val = data |> Enum.map(&elem(&1, 1)) |> Enum.map(&to_number/1) |> Enum.max(fn -> 1 end)
      max_val = if max_val == 0, do: 1, else: max_val
      bar_count = length(data)
      width = 600
      pl = 12
      pr = 12
      pb = 28
      pt = 8
      cw = width - pl - pr
      ch = height - pb - pt
      bw = max(cw / bar_count * 0.65, 4)
      gap = cw / bar_count

      # Horizontal grid lines (CartesianGrid vertical={false})
      grid = horizontal_grid_lines(pt, ch, pl, width, pr)

      bars =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, value}, i} ->
          v = to_number(value)
          bar_h = if max_val > 0, do: v / max_val * ch, else: 0
          x = pl + i * gap + (gap - bw) / 2
          y = pt + ch - bar_h
          # 3-char abbreviated label (shadcn tickFormatter: value.slice(0, 3))
          short_label = label |> to_string() |> String.slice(0, 3)
          %{label: label, short_label: short_label, value: value, x: x, y: y, height: bar_h, width: bw}
        end)

      label_step = max(div(bar_count, 12), 1)

      assigns =
        assign(assigns,
          bars: bars,
          svg_width: width,
          chart_height: ch,
          pl: pl,
          pr: pr,
          pt: pt,
          grid: grid,
          label_step: label_step,
          bar_count: bar_count,
          bw: bw
        )

      ~H"""
      <svg data-exo="bar-chart" viewBox={"0 0 #{@svg_width} #{@height}"} preserveAspectRatio="xMidYMid meet" style="width:100%;">
        <%!-- Horizontal grid only (CartesianGrid vertical={false}) --%>
        <%= for {gy, x1, x2} <- @grid do %>
          <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
        <% end %>
        <%!-- Bars with radius={8} --%>
        <%= for {bar, idx} <- Enum.with_index(@bars) do %>
          <rect x={bar.x} y={bar.y} width={bar.width} height={max(bar.height, 0)} fill={@color} rx="8" ry="8">
            <title>{bar.label}: {format_tooltip(bar.value)}</title>
          </rect>
          <%!-- tickLine={false} axisLine={false} tickMargin={10} tickFormatter=slice(0,3) --%>
          <text :if={rem(idx, @label_step) == 0 or idx == @bar_count - 1} x={bar.x + @bw / 2} y={@pt + @chart_height + 18} text-anchor="middle" fill="currentColor" fill-opacity="0.45" font-size="12">{bar.short_label}</text>
        <% end %>
      </svg>
      """
    end
  end

  # --- horizontal_bar_chart ---
  # shadcn: NO CartesianGrid at all
  # X-axis hidden entirely
  # Y-axis shows 3-char abbreviated labels
  # Bar radius={5}
  # layout="vertical" orientation

  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No data"

  def horizontal_bar_chart(assigns) do
    if Enum.empty?(assigns.data) do
      ~H|<div data-exo="chart-empty">{@empty_text}</div>|
    else
      data = assigns.data
      max_val = data |> Enum.map(&elem(&1, 1)) |> Enum.map(&to_number/1) |> Enum.max(fn -> 1 end)
      max_val = if max_val == 0, do: 1, else: max_val
      row_height = 36
      label_width = 80
      width = 600
      chart_width = width - label_width - 12

      rows =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, value}, i} ->
          v = to_number(value)
          bw = if max_val > 0, do: v / max_val * chart_width, else: 0
          # 3-char abbreviated label
          short_label = label |> to_string() |> String.slice(0, 3)
          %{label: label, short_label: short_label, value: value, y: i * row_height, bar_width: bw}
        end)

      total_height = length(data) * row_height

      assigns =
        assign(assigns,
          rows: rows,
          svg_width: width,
          total_height: total_height,
          label_width: label_width
        )

      # NO grid lines at all (shadcn horizontal bar has no CartesianGrid)
      ~H"""
      <svg data-exo="h-bar-chart" viewBox={"0 0 #{@svg_width} #{@total_height}"} preserveAspectRatio="xMidYMid meet" style="width:100%;">
        <%= for row <- @rows do %>
          <%!-- 3-char abbreviated category labels on left (Y-axis) --%>
          <text x={@label_width - 12} y={row.y + 23} text-anchor="end" fill="currentColor" fill-opacity="0.45" font-size="12">{row.short_label}</text>
          <%!-- Bar radius={5} --%>
          <rect x={@label_width} y={row.y + 8} width={max(row.bar_width, 0)} height="20" fill={@color} rx="5" ry="5">
            <title>{row.label}: {format_tooltip(row.value)}</title>
          </rect>
        <% end %>
      </svg>
      """
    end
  end

  # --- area_chart ---
  # shadcn: CartesianGrid vertical={false}
  # Area type="natural" — smooth catmull-rom spline curves (NOT straight lines)
  # fillOpacity={0.4} with gradient from stopOpacity={0.8} at top to stopOpacity={0.1} at bottom
  # XAxis same as bar chart (3 chars, no tick/axis lines)

  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :id, :string, default: nil
  attr :empty_text, :string, default: "No data"

  def area_chart(assigns) do
    id = assigns[:id] || "area-#{System.unique_integer([:positive])}"
    assigns = assign(assigns, :id, id)

    if Enum.empty?(assigns.data) do
      ~H|<div data-exo="chart-empty">{@empty_text}</div>|
    else
      data = assigns.data
      height = assigns.height
      values = Enum.map(data, fn {_l, v} -> to_number(v) end)
      max_val = Enum.max(values)
      max_val = if max_val == 0, do: 1, else: max_val
      count = length(values)
      width = 600
      pl = 12
      pr = 12
      pt = 8
      pb = 28
      cw = width - pl - pr
      ch = height - pt - pb

      # Horizontal grid lines (CartesianGrid vertical={false})
      grid = horizontal_grid_lines(pt, ch, pl, width, pr)

      points =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{_label, value}, i} ->
          x = pl + i / max(count - 1, 1) * cw
          y = pt + ch - to_number(value) / max_val * ch
          {r(x), r(y)}
        end)

      # Generate smooth catmull-rom bezier path (type="natural")
      curve_path = catmull_rom_to_bezier_path(points)
      # Generate area fill path (closed shape under the curve)
      {last_x, _} = List.last(points)
      {first_x, _} = List.first(points)
      baseline_y = r(pt + ch)
      area_path = catmull_rom_area_path(points, baseline_y, first_x, last_x)

      label_step = max(div(count, 12), 1)

      labels =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, _}, i} ->
          x = pl + i / max(count - 1, 1) * cw
          # 3-char abbreviated label
          short_label = label |> to_string() |> String.slice(0, 3)
          %{label: short_label, x: r(x), show: rem(i, label_step) == 0 or i == count - 1}
        end)

      assigns =
        assign(assigns,
          svg_width: width,
          chart_height: ch,
          pt: pt,
          grid: grid,
          curve_path: curve_path,
          area_path: area_path,
          labels: labels
        )

      ~H"""
      <svg data-exo="area-chart" viewBox={"0 0 #{@svg_width} #{@height}"} preserveAspectRatio="xMidYMid meet" style="width:100%;">
        <defs>
          <%!-- Gradient: stopOpacity={0.8} at top to stopOpacity={0.1} at bottom --%>
          <linearGradient id={"#{@id}-grad"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stop-color={@color} stop-opacity="0.8" />
            <stop offset="95%" stop-color={@color} stop-opacity="0.1" />
          </linearGradient>
        </defs>
        <%!-- Horizontal grid only (CartesianGrid vertical={false}) --%>
        <%= for {gy, x1, x2} <- @grid do %>
          <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
        <% end %>
        <%!-- Area fill: fillOpacity={0.4} with gradient --%>
        <path d={@area_path} fill={"url(##{@id}-grad)"} fill-opacity="0.4" />
        <%!-- Smooth curve line (catmull-rom / type="natural") --%>
        <path d={@curve_path} fill="none" stroke={@color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <%!-- X-axis labels: 3-char, no tick lines, no axis line --%>
        <%= for lbl <- @labels do %>
          <text :if={lbl.show} x={lbl.x} y={@pt + @chart_height + 18} text-anchor="middle" fill="currentColor" fill-opacity="0.45" font-size="12">{lbl.label}</text>
        <% end %>
      </svg>
      """
    end
  end

  # --- stacked_bar_chart ---
  # shadcn: CartesianGrid vertical={false}
  # Bottom bar: radius={[0, 0, 4, 4]} — rounded bottom corners only
  # Top bar: radius={[4, 4, 0, 0]} — rounded top corners only
  # No y-axis, 3-char x-axis labels, legend below

  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :colors, :map, required: true
  attr :legend_keys, :list, default: []
  attr :empty_text, :string, default: "No data"

  def stacked_bar_chart(assigns) do
    if Enum.empty?(assigns.data) do
      ~H|<div data-exo="chart-empty">{@empty_text}</div>|
    else
      data = assigns.data
      height = assigns.height
      colors = assigns.colors
      keys = if assigns.legend_keys != [], do: assigns.legend_keys, else: Map.keys(colors)

      totals =
        Enum.map(data, fn {_label, vals} ->
          Enum.reduce(keys, 0, fn k, acc -> acc + (Map.get(vals, k, 0) |> to_number()) end)
        end)

      max_val = Enum.max(totals)
      max_val = if max_val == 0, do: 1, else: max_val
      count = length(data)
      width = 600
      pl = 12
      pr = 12
      pb = 52
      pt = 8
      cw = width - pl - pr
      ch = height - pb - pt
      bw = max(cw / count * 0.65, 4)
      gap = cw / count

      # Horizontal grid lines (CartesianGrid vertical={false})
      grid = horizontal_grid_lines(pt, ch, pl, width, pr)

      key_count = length(keys)

      bars =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, vals}, i} ->
          x = pl + i * gap + (gap - bw) / 2
          # 3-char abbreviated label
          short_label = label |> to_string() |> String.slice(0, 3)

          segments =
            keys
            |> Enum.with_index()
            |> Enum.reduce({[], pt + ch}, fn {k, ki}, {segs, y_cursor} ->
              v = to_number(Map.get(vals, k, 0))
              seg_h = if max_val > 0, do: v / max_val * ch, else: 0

              # Determine rounding based on position in stack:
              # keys are ordered bottom-to-top in the stack
              # ki == 0 is the bottom segment, ki == key_count - 1 is the top
              rounding =
                cond do
                  # Single key: fully rounded
                  key_count == 1 -> :all
                  # Bottom segment: round bottom corners only [0,0,4,4]
                  ki == 0 -> :bottom
                  # Top segment: round top corners only [4,4,0,0]
                  ki == key_count - 1 -> :top
                  # Middle segments: no rounding
                  true -> :none
                end

              seg = %{
                key: k,
                x: x,
                y: y_cursor - seg_h,
                width: bw,
                height: seg_h,
                color: Map.get(colors, k, "#999"),
                rounding: rounding
              }

              {[seg | segs], y_cursor - seg_h}
            end)

          %{label: label, short_label: short_label, x: x, segments: Enum.reverse(elem(segments, 0))}
        end)

      label_step = max(div(count, 12), 1)

      legend =
        Enum.map(keys, fn k ->
          %{key: k, color: Map.get(colors, k, "#999"), label: to_string(k)}
        end)

      # Center legend
      legend_total_width = length(legend) * 100
      legend_start = (width - legend_total_width) / 2

      assigns =
        assign(assigns,
          bars: bars,
          svg_width: width,
          chart_height: ch,
          pt: pt,
          bw: bw,
          grid: grid,
          label_step: label_step,
          bar_count: count,
          legend: legend,
          legend_start: legend_start
        )

      ~H"""
      <svg data-exo="stacked-bar-chart" viewBox={"0 0 #{@svg_width} #{@height}"} preserveAspectRatio="xMidYMid meet" style="width:100%;">
        <%!-- Horizontal grid only (CartesianGrid vertical={false}) --%>
        <%= for {gy, x1, x2} <- @grid do %>
          <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
        <% end %>
        <%!-- Stacked bars with per-segment corner rounding --%>
        <%= for {bar, idx} <- Enum.with_index(@bars) do %>
          <%= for seg <- bar.segments do %>
            <%= if seg.height > 0 do %>
              <%= case seg.rounding do %>
                <% :all -> %>
                  <path d={fully_rounded_rect_path(seg.x, seg.y, seg.width, seg.height, 4)} fill={seg.color}>
                    <title>{seg.key}: {format_tooltip(seg.height)}</title>
                  </path>
                <% :bottom -> %>
                  <path d={rounded_bottom_rect_path(seg.x, seg.y, seg.width, seg.height, 4)} fill={seg.color}>
                    <title>{seg.key}: {format_tooltip(seg.height)}</title>
                  </path>
                <% :top -> %>
                  <path d={rounded_top_rect_path(seg.x, seg.y, seg.width, seg.height, 4)} fill={seg.color}>
                    <title>{seg.key}: {format_tooltip(seg.height)}</title>
                  </path>
                <% :none -> %>
                  <rect x={seg.x} y={seg.y} width={seg.width} height={seg.height} fill={seg.color}>
                    <title>{seg.key}: {format_tooltip(seg.height)}</title>
                  </rect>
              <% end %>
            <% end %>
          <% end %>
          <%!-- 3-char abbreviated x-axis labels --%>
          <text :if={rem(idx, @label_step) == 0 or idx == @bar_count - 1} x={bar.x + @bw / 2} y={@pt + @chart_height + 18} text-anchor="middle" fill="currentColor" fill-opacity="0.45" font-size="12">{bar.short_label}</text>
        <% end %>
        <%!-- Legend --%>
        <%= for {item, i} <- Enum.with_index(@legend) do %>
          <rect x={@legend_start + i * 100} y={@pt + @chart_height + 32} width="10" height="10" rx="2" fill={item.color} />
          <text x={@legend_start + i * 100 + 16} y={@pt + @chart_height + 41} fill="currentColor" fill-opacity="0.5" font-size="12">{item.label}</text>
        <% end %>
      </svg>
      """
    end
  end
end
