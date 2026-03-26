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

  defp catmull_rom_to_bezier_path([]), do: ""
  defp catmull_rom_to_bezier_path([{x, y}]), do: "M#{r(x)},#{r(y)}"

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
        "v#{r(-(h - r))}" <>
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
        previous == 0 and current > 0 ->
          {100.0, :up}

        previous == 0 ->
          {0.0, :flat}

        true ->
          change = (current - previous) / previous * 100

          dir =
            cond do
              change > 0 -> :up
              change < 0 -> :down
              true -> :flat
            end

          {abs(Float.round(change, 1)), dir}
      end

    assigns = assign(assigns, pct: pct, direction: direction)

    ~H"""
    <span :if={@direction == :up} data-exo="trend-badge" data-direction="up">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 2l4 5H2z" />
      </svg>
      {format_pct(@pct)}%
    </span>
    <span :if={@direction == :down} data-exo="trend-badge" data-direction="down">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 10l4-5H2z" />
      </svg>
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
      <svg
        data-exo="sparkline"
        viewBox={"0 0 #{@width} #{@height}"}
        width={@width}
        height={@height}
        style="display:inline-block;"
      >
        <defs>
          <linearGradient id={"#{@id}-g"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stop-color={@color} stop-opacity="0.4" />
            <stop offset="95%" stop-color={@color} stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={@area_points} fill={"url(##{@id}-g)"} />
        <polyline
          points={@line_points}
          fill="none"
          stroke={@color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
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

          %{
            label: label,
            short_label: short_label,
            value: value,
            x: x,
            y: y,
            height: bar_h,
            width: bw
          }
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
      <svg
        data-exo="bar-chart"
        viewBox={"0 0 #{@svg_width} #{@height}"}
        preserveAspectRatio="xMidYMid meet"
        style="width:100%;"
      >
        <%!-- Horizontal grid only (CartesianGrid vertical={false}) --%>
        <%= for {gy, x1, x2} <- @grid do %>
          <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
        <% end %>
        <%!-- Bars with radius={8} --%>
        <%= for {bar, idx} <- Enum.with_index(@bars) do %>
          <rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={max(bar.height, 0)}
            fill={@color}
            rx="8"
            ry="8"
          >
            <title>{bar.label}: {format_tooltip(bar.value)}</title>
          </rect>
          <%!-- tickLine={false} axisLine={false} tickMargin={10} tickFormatter=slice(0,3) --%>
          <text
            :if={rem(idx, @label_step) == 0 or idx == @bar_count - 1}
            x={bar.x + @bw / 2}
            y={@pt + @chart_height + 18}
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.45"
            font-size="12"
          >
            {bar.short_label}
          </text>
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

          %{
            label: label,
            short_label: short_label,
            value: value,
            y: i * row_height,
            bar_width: bw
          }
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
      <svg
        data-exo="h-bar-chart"
        viewBox={"0 0 #{@svg_width} #{@total_height}"}
        preserveAspectRatio="xMidYMid meet"
        style="width:100%;"
      >
        <%= for row <- @rows do %>
          <%!-- 3-char abbreviated category labels on left (Y-axis) --%>
          <text
            x={@label_width - 12}
            y={row.y + 23}
            text-anchor="end"
            fill="currentColor"
            fill-opacity="0.45"
            font-size="12"
          >
            {row.short_label}
          </text>
          <%!-- Bar radius={5} --%>
          <rect
            x={@label_width}
            y={row.y + 8}
            width={max(row.bar_width, 0)}
            height="20"
            fill={@color}
            rx="5"
            ry="5"
          >
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
      min_val = Enum.min(values)
      max_val = Enum.max(values)
      range = max_val - min_val
      range = if range == 0, do: 1.0, else: range
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
          y = pt + ch - (to_number(value) - min_val) / range * ch
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
      <svg
        data-exo="area-chart"
        viewBox={"0 0 #{@svg_width} #{@height}"}
        preserveAspectRatio="xMidYMid meet"
        style="width:100%;"
      >
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
        <path
          d={@curve_path}
          fill="none"
          stroke={@color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <%!-- X-axis labels: 3-char, no tick lines, no axis line --%>
        <%= for lbl <- @labels do %>
          <text
            :if={lbl.show}
            x={lbl.x}
            y={@pt + @chart_height + 18}
            text-anchor="middle"
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
                value: Map.get(vals, k, 0),
                color: Map.get(colors, k, "#999"),
                rounding: rounding
              }

              {[seg | segs], y_cursor - seg_h}
            end)

          %{
            label: label,
            short_label: short_label,
            x: x,
            segments: Enum.reverse(elem(segments, 0))
          }
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
      <svg
        data-exo="stacked-bar-chart"
        viewBox={"0 0 #{@svg_width} #{@height}"}
        preserveAspectRatio="xMidYMid meet"
        style="width:100%;"
      >
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
                  <path
                    d={fully_rounded_rect_path(seg.x, seg.y, seg.width, seg.height, 4)}
                    fill={seg.color}
                  >
                    <title>{seg.key}: {format_tooltip(seg.value)}</title>
                  </path>
                <% :bottom -> %>
                  <path
                    d={rounded_bottom_rect_path(seg.x, seg.y, seg.width, seg.height, 4)}
                    fill={seg.color}
                  >
                    <title>{seg.key}: {format_tooltip(seg.value)}</title>
                  </path>
                <% :top -> %>
                  <path
                    d={rounded_top_rect_path(seg.x, seg.y, seg.width, seg.height, 4)}
                    fill={seg.color}
                  >
                    <title>{seg.key}: {format_tooltip(seg.value)}</title>
                  </path>
                <% :none -> %>
                  <rect x={seg.x} y={seg.y} width={seg.width} height={seg.height} fill={seg.color}>
                    <title>{seg.key}: {format_tooltip(seg.value)}</title>
                  </rect>
              <% end %>
            <% end %>
          <% end %>
          <%!-- 3-char abbreviated x-axis labels --%>
          <text
            :if={rem(idx, @label_step) == 0 or idx == @bar_count - 1}
            x={bar.x + @bw / 2}
            y={@pt + @chart_height + 18}
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.45"
            font-size="12"
          >
            {bar.short_label}
          </text>
        <% end %>
        <%!-- Legend --%>
        <%= for {item, i} <- Enum.with_index(@legend) do %>
          <rect
            x={@legend_start + i * 100}
            y={@pt + @chart_height + 32}
            width="10"
            height="10"
            rx="2"
            fill={item.color}
          />
          <text
            x={@legend_start + i * 100 + 16}
            y={@pt + @chart_height + 41}
            fill="currentColor"
            fill-opacity="0.5"
            font-size="12"
          >
            {item.label}
          </text>
        <% end %>
      </svg>
      """
    end
  end

  # --- bar_chart_multiple ---
  # Two bars side by side per group, radius=4, horizontal grid, 3-char x labels

  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color1, :string, default: "var(--exo-primary)"
  attr :color2, :string, default: "color-mix(in oklch, var(--exo-primary) 50%, transparent)"

  def bar_chart_multiple(assigns) do
    if Enum.empty?(assigns.data) do
      assigns = assign_new(assigns, :empty_text, fn -> "No data" end)
      ~H|<div data-exo="chart-empty">{@empty_text}</div>|
    else
      data = assigns.data
      height = assigns.height
      values = Enum.flat_map(data, fn {_l, v1, v2} -> [to_number(v1), to_number(v2)] end)
      max_val = Enum.max(values, fn -> 1 end)
      max_val = if max_val == 0, do: 1, else: max_val
      count = length(data)
      width = 600
      pl = 12
      pr = 12
      pb = 28
      pt = 8
      cw = width - pl - pr
      ch = height - pb - pt
      gap = cw / count
      bw = max(gap * 0.3, 4)

      grid = horizontal_grid_lines(pt, ch, pl, width, pr)

      bars =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, v1, v2}, i} ->
          nv1 = to_number(v1)
          nv2 = to_number(v2)
          h1 = nv1 / max_val * ch
          h2 = nv2 / max_val * ch
          center = pl + i * gap + gap / 2
          x1 = center - bw - 1
          x2 = center + 1
          short_label = label |> to_string() |> String.slice(0, 3)

          %{
            label: label,
            short_label: short_label,
            v1: v1,
            v2: v2,
            x1: x1,
            x2: x2,
            y1: pt + ch - h1,
            y2: pt + ch - h2,
            h1: h1,
            h2: h2,
            center: center
          }
        end)

      label_step = max(div(count, 12), 1)

      assigns =
        assign(assigns,
          bars: bars,
          svg_width: width,
          chart_height: ch,
          pt: pt,
          bw: bw,
          grid: grid,
          label_step: label_step,
          bar_count: count
        )

      ~H"""
      <svg
        data-exo="bar-chart-multiple"
        viewBox={"0 0 #{@svg_width} #{@height}"}
        preserveAspectRatio="xMidYMid meet"
        style="width:100%;"
      >
        <%= for {gy, x1, x2} <- @grid do %>
          <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
        <% end %>
        <%= for {bar, idx} <- Enum.with_index(@bars) do %>
          <rect x={bar.x1} y={bar.y1} width={@bw} height={max(bar.h1, 0)} fill={@color1} rx="4" ry="4">
            <title>{bar.label}: {format_tooltip(bar.v1)}</title>
          </rect>
          <rect x={bar.x2} y={bar.y2} width={@bw} height={max(bar.h2, 0)} fill={@color2} rx="4" ry="4">
            <title>{bar.label}: {format_tooltip(bar.v2)}</title>
          </rect>
          <text
            :if={rem(idx, @label_step) == 0 or idx == @bar_count - 1}
            x={bar.center}
            y={@pt + @chart_height + 18}
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.45"
            font-size="12"
          >
            {bar.short_label}
          </text>
        <% end %>
      </svg>
      """
    end
  end

  # --- bar_chart_label ---
  # Same as bar_chart but with value labels ABOVE each bar (LabelList position="top" offset=12)

  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No data"

  def bar_chart_label(assigns) do
    if Enum.empty?(assigns.data) do
      ~H|<div data-exo="chart-empty">{@empty_text}</div>|
    else
      data = assigns.data
      height = assigns.height
      max_val = data |> Enum.map(&elem(&1, 1)) |> Enum.map(&to_number/1) |> Enum.max(fn -> 1 end)
      max_val = if max_val == 0, do: 1, else: max_val
      count = length(data)
      width = 600
      pl = 12
      pr = 12
      pb = 28
      pt = 24
      cw = width - pl - pr
      ch = height - pb - pt
      bw = max(cw / count * 0.65, 4)
      gap = cw / count

      grid = horizontal_grid_lines(pt, ch, pl, width, pr)

      bars =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, value}, i} ->
          v = to_number(value)
          bar_h = if max_val > 0, do: v / max_val * ch, else: 0
          x = pl + i * gap + (gap - bw) / 2
          y = pt + ch - bar_h
          short_label = label |> to_string() |> String.slice(0, 3)

          %{
            label: label,
            short_label: short_label,
            value: value,
            x: x,
            y: y,
            height: bar_h,
            width: bw
          }
        end)

      label_step = max(div(count, 12), 1)

      assigns =
        assign(assigns,
          bars: bars,
          svg_width: width,
          chart_height: ch,
          pl: pl,
          pt: pt,
          grid: grid,
          label_step: label_step,
          bar_count: count,
          bw: bw
        )

      ~H"""
      <svg
        data-exo="bar-chart-label"
        viewBox={"0 0 #{@svg_width} #{@height}"}
        preserveAspectRatio="xMidYMid meet"
        style="width:100%;"
      >
        <%= for {gy, x1, x2} <- @grid do %>
          <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
        <% end %>
        <%= for {bar, idx} <- Enum.with_index(@bars) do %>
          <rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={max(bar.height, 0)}
            fill={@color}
            rx="8"
            ry="8"
          >
            <title>{bar.label}: {format_tooltip(bar.value)}</title>
          </rect>
          <%!-- Value label above bar (LabelList position="top" offset=12) --%>
          <text
            x={bar.x + @bw / 2}
            y={bar.y - 6}
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.7"
            font-size="11"
          >
            {format_tooltip(bar.value)}
          </text>
          <text
            :if={rem(idx, @label_step) == 0 or idx == @bar_count - 1}
            x={bar.x + @bw / 2}
            y={@pt + @chart_height + 18}
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.45"
            font-size="12"
          >
            {bar.short_label}
          </text>
        <% end %>
      </svg>
      """
    end
  end

  # --- bar_chart_negative ---
  # Bars go up AND down from a zero baseline, month name labels above each bar

  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color_positive, :string, default: "var(--exo-primary)"
  attr :color_negative, :string, default: "var(--exo-destructive, #ef4444)"
  attr :empty_text, :string, default: "No data"

  def bar_chart_negative(assigns) do
    if Enum.empty?(assigns.data) do
      ~H|<div data-exo="chart-empty">{@empty_text}</div>|
    else
      data = assigns.data
      height = assigns.height
      values = Enum.map(data, fn {_l, v} -> to_number(v) end)
      max_abs = values |> Enum.map(&abs/1) |> Enum.max(fn -> 1 end)
      max_abs = if max_abs == 0, do: 1, else: max_abs
      count = length(data)
      width = 600
      pl = 12
      pr = 12
      pb = 8
      pt = 24
      cw = width - pl - pr
      ch = height - pb - pt
      half_ch = ch / 2
      zero_y = pt + half_ch
      bw = max(cw / count * 0.65, 4)
      gap = cw / count

      grid = horizontal_grid_lines(pt, ch, pl, width, pr)

      bars =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, value}, i} ->
          v = to_number(value)
          bar_h = abs(v) / max_abs * half_ch
          x = pl + i * gap + (gap - bw) / 2
          short_label = label |> to_string() |> String.slice(0, 3)

          {y, color} =
            if v >= 0 do
              {zero_y - bar_h, assigns.color_positive}
            else
              {zero_y, assigns.color_negative}
            end

          %{
            label: label,
            short_label: short_label,
            value: value,
            x: x,
            y: y,
            height: bar_h,
            width: bw,
            color: color
          }
        end)

      assigns =
        assign(assigns,
          bars: bars,
          svg_width: width,
          chart_height: ch,
          pt: pt,
          pl: pl,
          pr: pr,
          zero_y: zero_y,
          grid: grid,
          bw: bw
        )

      ~H"""
      <svg
        data-exo="bar-chart-negative"
        viewBox={"0 0 #{@svg_width} #{@height}"}
        preserveAspectRatio="xMidYMid meet"
        style="width:100%;"
      >
        <%= for {gy, x1, x2} <- @grid do %>
          <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
        <% end %>
        <%!-- Zero baseline --%>
        <line
          x1={@pl}
          y1={@zero_y}
          x2={@svg_width - @pr}
          y2={@zero_y}
          stroke="currentColor"
          stroke-opacity="0.2"
        />
        <%= for bar <- @bars do %>
          <rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={max(bar.height, 0)}
            fill={bar.color}
            rx="4"
            ry="4"
          >
            <title>{bar.label}: {format_tooltip(bar.value)}</title>
          </rect>
          <%!-- Month label above bar --%>
          <text
            x={bar.x + @bw / 2}
            y={@pt - 6}
            text-anchor="middle"
            fill="currentColor"
            fill-opacity="0.45"
            font-size="12"
          >
            {bar.short_label}
          </text>
        <% end %>
      </svg>
      """
    end
  end

  # --- line_chart ---
  # Smooth catmull-rom curve, no dots, strokeWidth=2, horizontal grid, 3-char labels

  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"

  def line_chart(assigns) do
    data = assigns.data
    height = assigns.height
    values = Enum.map(data, fn {_l, v} -> to_number(v) end)
    min_val = Enum.min(values, fn -> 0 end)
    max_val = Enum.max(values, fn -> 1 end)
    range = max_val - min_val
    range = if range == 0, do: 1.0, else: range
    count = length(values)
    width = 600
    pl = 12
    pr = 12
    pt = 8
    pb = 28
    cw = width - pl - pr
    ch = height - pt - pb

    grid = horizontal_grid_lines(pt, ch, pl, width, pr)

    points =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{_label, value}, i} ->
        x = pl + i / max(count - 1, 1) * cw
        y = pt + ch - (to_number(value) - min_val) / range * ch
        {r(x), r(y)}
      end)

    curve_path = catmull_rom_to_bezier_path(points)

    label_step = max(div(count, 12), 1)

    labels =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{label, _}, i} ->
        x = pl + i / max(count - 1, 1) * cw
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
        labels: labels
      )

    ~H"""
    <svg
      data-exo="line-chart"
      viewBox={"0 0 #{@svg_width} #{@height}"}
      preserveAspectRatio="xMidYMid meet"
      style="width:100%;"
    >
      <%= for {gy, x1, x2} <- @grid do %>
        <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
      <% end %>
      <path
        d={@curve_path}
        fill="none"
        stroke={@color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <%= for lbl <- @labels do %>
        <text
          :if={lbl.show}
          x={lbl.x}
          y={@pt + @chart_height + 18}
          text-anchor="middle"
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

  # --- line_chart_multiple ---
  # Two smooth lines

  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color1, :string, default: "var(--exo-primary)"
  attr :color2, :string, default: "color-mix(in oklch, var(--exo-primary) 50%, transparent)"

  def line_chart_multiple(assigns) do
    data = assigns.data
    height = assigns.height
    values = Enum.flat_map(data, fn {_l, v1, v2} -> [to_number(v1), to_number(v2)] end)
    min_val = Enum.min(values, fn -> 0 end)
    max_val = Enum.max(values, fn -> 1 end)
    range = max_val - min_val
    range = if range == 0, do: 1.0, else: range
    count = length(data)
    width = 600
    pl = 12
    pr = 12
    pt = 8
    pb = 28
    cw = width - pl - pr
    ch = height - pt - pb

    grid = horizontal_grid_lines(pt, ch, pl, width, pr)

    points1 =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{_label, v1, _v2}, i} ->
        x = pl + i / max(count - 1, 1) * cw
        y = pt + ch - (to_number(v1) - min_val) / range * ch
        {r(x), r(y)}
      end)

    points2 =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{_label, _v1, v2}, i} ->
        x = pl + i / max(count - 1, 1) * cw
        y = pt + ch - (to_number(v2) - min_val) / range * ch
        {r(x), r(y)}
      end)

    curve1 = catmull_rom_to_bezier_path(points1)
    curve2 = catmull_rom_to_bezier_path(points2)

    label_step = max(div(count, 12), 1)

    labels =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{label, _, _}, i} ->
        x = pl + i / max(count - 1, 1) * cw
        short_label = label |> to_string() |> String.slice(0, 3)
        %{label: short_label, x: r(x), show: rem(i, label_step) == 0 or i == count - 1}
      end)

    assigns =
      assign(assigns,
        svg_width: width,
        chart_height: ch,
        pt: pt,
        grid: grid,
        curve1: curve1,
        curve2: curve2,
        labels: labels
      )

    ~H"""
    <svg
      data-exo="line-chart-multiple"
      viewBox={"0 0 #{@svg_width} #{@height}"}
      preserveAspectRatio="xMidYMid meet"
      style="width:100%;"
    >
      <%= for {gy, x1, x2} <- @grid do %>
        <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
      <% end %>
      <path
        d={@curve1}
        fill="none"
        stroke={@color1}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d={@curve2}
        fill="none"
        stroke={@color2}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <%= for lbl <- @labels do %>
        <text
          :if={lbl.show}
          x={lbl.x}
          y={@pt + @chart_height + 18}
          text-anchor="middle"
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

  # --- pie_chart ---
  # SVG pie chart using arc paths

  attr :data, :list, required: true
  attr :size, :integer, default: 250

  def pie_chart(assigns) do
    data = assigns.data
    size = assigns.size
    total = Enum.reduce(data, 0, fn {_l, v, _c}, acc -> acc + to_number(v) end)
    total = if total == 0, do: 1, else: total
    cx = size / 2
    cy = size / 2
    radius = size / 2 - 4

    slices = build_pie_slices(data, total, cx, cy, radius, radius)

    assigns = assign(assigns, slices: slices)

    ~H"""
    <svg
      data-exo="pie-chart"
      viewBox={"0 0 #{@size} #{@size}"}
      width={@size}
      height={@size}
      style="display:block; margin:auto;"
    >
      <%= for slice <- @slices do %>
        <path d={slice.path} fill={slice.color}>
          <title>{slice.label}: {format_tooltip(slice.value)}</title>
        </path>
      <% end %>
    </svg>
    """
  end

  # --- donut_chart ---
  # Donut with hole in center

  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :inner_radius, :integer, default: 60

  def donut_chart(assigns) do
    data = assigns.data
    size = assigns.size
    total = Enum.reduce(data, 0, fn {_l, v, _c}, acc -> acc + to_number(v) end)
    total = if total == 0, do: 1, else: total
    cx = size / 2
    cy = size / 2
    outer_r = size / 2 - 4
    inner_r = assigns.inner_radius * 1.0

    slices = build_donut_slices(data, total, cx, cy, outer_r, inner_r)

    assigns = assign(assigns, slices: slices)

    ~H"""
    <svg
      data-exo="donut-chart"
      viewBox={"0 0 #{@size} #{@size}"}
      width={@size}
      height={@size}
      style="display:block; margin:auto;"
    >
      <%= for slice <- @slices do %>
        <path d={slice.path} fill={slice.color}>
          <title>{slice.label}: {format_tooltip(slice.value)}</title>
        </path>
      <% end %>
    </svg>
    """
  end

  # --- donut_chart_text ---
  # Donut with centered text (big number + small label)

  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :inner_radius, :integer, default: 60
  attr :center_value, :string, default: ""
  attr :center_label, :string, default: ""

  def donut_chart_text(assigns) do
    data = assigns.data
    size = assigns.size
    total = Enum.reduce(data, 0, fn {_l, v, _c}, acc -> acc + to_number(v) end)
    total = if total == 0, do: 1, else: total
    cx = size / 2
    cy = size / 2
    outer_r = size / 2 - 4
    inner_r = assigns.inner_radius * 1.0

    slices = build_donut_slices(data, total, cx, cy, outer_r, inner_r)

    assigns = assign(assigns, slices: slices, cx: cx, cy: cy)

    ~H"""
    <svg
      data-exo="donut-chart-text"
      viewBox={"0 0 #{@size} #{@size}"}
      width={@size}
      height={@size}
      style="display:block; margin:auto;"
    >
      <%= for slice <- @slices do %>
        <path d={slice.path} fill={slice.color}>
          <title>{slice.label}: {format_tooltip(slice.value)}</title>
        </path>
      <% end %>
      <%!-- Center text --%>
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

  # --- radar_chart ---
  # Radar/spider chart with polar grid

  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :color, :string, default: "var(--exo-primary)"

  def radar_chart(assigns) do
    data = assigns.data
    size = assigns.size
    cx = size / 2
    cy = size / 2
    max_radius = size / 2 - 28
    count = length(data)
    max_val = data |> Enum.map(fn {_l, v} -> to_number(v) end) |> Enum.max(fn -> 1 end)
    max_val = if max_val == 0, do: 1, else: max_val

    # Concentric grid polygons at 20%, 40%, 60%, 80%, 100%
    grid_levels = [0.2, 0.4, 0.6, 0.8, 1.0]

    grid_polygons =
      Enum.map(grid_levels, fn level ->
        polygon_points(count, cx, cy, max_radius * level)
      end)

    # Axis lines from center to each vertex
    axes =
      Enum.map(0..(count - 1), fn i ->
        angle = -:math.pi() / 2 + 2 * :math.pi() * i / count
        ex = cx + max_radius * :math.cos(angle)
        ey = cy + max_radius * :math.sin(angle)
        {r(ex), r(ey)}
      end)

    # Data polygon
    data_points =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{_label, value}, i} ->
        v = to_number(value)
        frac = v / max_val
        angle = -:math.pi() / 2 + 2 * :math.pi() * i / count
        x = cx + max_radius * frac * :math.cos(angle)
        y = cy + max_radius * frac * :math.sin(angle)
        {r(x), r(y)}
      end)

    data_polygon = Enum.map_join(data_points, " ", fn {x, y} -> "#{x},#{y}" end)

    # Labels positioned outside the outermost polygon
    labels =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{label, _v}, i} ->
        angle = -:math.pi() / 2 + 2 * :math.pi() * i / count
        lx = cx + (max_radius + 16) * :math.cos(angle)
        ly = cy + (max_radius + 16) * :math.sin(angle)
        short_label = label |> to_string() |> String.slice(0, 3)
        %{label: short_label, x: r(lx), y: r(ly)}
      end)

    assigns =
      assign(assigns,
        cx: cx,
        cy: cy,
        grid_polygons: grid_polygons,
        axes: axes,
        data_polygon: data_polygon,
        labels: labels
      )

    ~H"""
    <svg
      data-exo="radar-chart"
      viewBox={"0 0 #{@size} #{@size}"}
      width={@size}
      height={@size}
      style="display:block; margin:auto;"
    >
      <%!-- Grid polygons --%>
      <%= for poly <- @grid_polygons do %>
        <polygon points={poly} fill="none" stroke="currentColor" stroke-opacity="0.1" />
      <% end %>
      <%!-- Axis lines --%>
      <%= for {ex, ey} <- @axes do %>
        <line x1={@cx} y1={@cy} x2={ex} y2={ey} stroke="currentColor" stroke-opacity="0.1" />
      <% end %>
      <%!-- Data area --%>
      <polygon
        points={@data_polygon}
        fill={@color}
        fill-opacity="0.6"
        stroke={@color}
        stroke-width="2"
      />
      <%!-- Labels --%>
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

  # --- radial_chart ---
  # Concentric arc bars, each proportional to value

  attr :data, :list, required: true
  attr :size, :integer, default: 250
  attr :inner_radius, :integer, default: 40
  attr :outer_radius, :integer, default: 110

  def radial_chart(assigns) do
    data = assigns.data
    size = assigns.size
    cx = size / 2
    cy = size / 2
    count = length(data)
    max_val = data |> Enum.map(fn {_l, v, _c} -> to_number(v) end) |> Enum.max(fn -> 1 end)
    max_val = if max_val == 0, do: 1, else: max_val
    inner_r = assigns.inner_radius * 1.0
    outer_r = assigns.outer_radius * 1.0
    band = if count > 0, do: (outer_r - inner_r) / count, else: 0
    bar_width = band * 0.7
    start_angle = -:math.pi() / 2

    arcs =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{label, value, color}, i} ->
        v = to_number(value)
        frac = v / max_val
        r_center = inner_r + band * i + band / 2
        r_inner = r_center - bar_width / 2
        r_outer = r_center + bar_width / 2
        sweep = frac * 2 * :math.pi() * 0.85
        end_angle = start_angle + sweep
        bg_sweep = 2 * :math.pi() * 0.85
        bg_end = start_angle + bg_sweep

        bg_path = arc_path(cx, cy, r_inner, r_outer, start_angle, bg_end)
        fg_path = arc_path(cx, cy, r_inner, r_outer, start_angle, end_angle)

        %{label: label, value: value, color: color, bg_path: bg_path, fg_path: fg_path}
      end)

    assigns = assign(assigns, arcs: arcs)

    ~H"""
    <svg
      data-exo="radial-chart"
      viewBox={"0 0 #{@size} #{@size}"}
      width={@size}
      height={@size}
      style="display:block; margin:auto;"
    >
      <%= for arc <- @arcs do %>
        <%!-- Background track --%>
        <path d={arc.bg_path} fill="currentColor" fill-opacity="0.08" />
        <%!-- Foreground bar --%>
        <path d={arc.fg_path} fill={arc.color}>
          <title>{arc.label}: {format_tooltip(arc.value)}</title>
        </path>
      <% end %>
    </svg>
    """
  end

  # --- area_chart_stacked ---
  # Two stacked areas using catmull-rom curves

  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color1, :string, default: "var(--exo-primary)"
  attr :color2, :string, default: "color-mix(in oklch, var(--exo-primary) 50%, transparent)"
  attr :id, :string, default: nil

  def area_chart_stacked(assigns) do
    id = assigns[:id] || "area-stacked-#{System.unique_integer([:positive])}"
    assigns = assign(assigns, :id, id)

    data = assigns.data
    height = assigns.height
    # Stacked: total = v1 + v2 at each point
    stacked_vals = Enum.map(data, fn {_l, v1, v2} -> to_number(v1) + to_number(v2) end)
    max_val = Enum.max(stacked_vals, fn -> 1 end)
    max_val = if max_val == 0, do: 1, else: max_val
    count = length(data)
    width = 600
    pl = 12
    pr = 12
    pt = 8
    pb = 28
    cw = width - pl - pr
    ch = height - pt - pb
    baseline_y = r(pt + ch)

    grid = horizontal_grid_lines(pt, ch, pl, width, pr)

    # Bottom area: value1 (from baseline up to v1)
    points1 =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{_label, v1, _v2}, i} ->
        x = pl + i / max(count - 1, 1) * cw
        y = pt + ch - to_number(v1) / max_val * ch
        {r(x), r(y)}
      end)

    # Top area: stacked (from v1 up to v1+v2)
    points2 =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{_label, v1, v2}, i} ->
        x = pl + i / max(count - 1, 1) * cw
        y = pt + ch - (to_number(v1) + to_number(v2)) / max_val * ch
        {r(x), r(y)}
      end)

    {first_x, _} = List.first(points1)
    {last_x, _} = List.last(points1)

    # Area 1: bottom layer (v1 from baseline)
    area1_path = catmull_rom_area_path(points1, baseline_y, first_x, last_x)
    curve1_path = catmull_rom_to_bezier_path(points1)

    # Area 2: top layer (v1+v2 from baseline)
    area2_path = catmull_rom_area_path(points2, baseline_y, first_x, last_x)
    curve2_path = catmull_rom_to_bezier_path(points2)

    label_step = max(div(count, 12), 1)

    labels =
      data
      |> Enum.with_index()
      |> Enum.map(fn {{label, _, _}, i} ->
        x = pl + i / max(count - 1, 1) * cw
        short_label = label |> to_string() |> String.slice(0, 3)
        %{label: short_label, x: r(x), show: rem(i, label_step) == 0 or i == count - 1}
      end)

    assigns =
      assign(assigns,
        svg_width: width,
        chart_height: ch,
        pt: pt,
        grid: grid,
        area1_path: area1_path,
        curve1_path: curve1_path,
        area2_path: area2_path,
        curve2_path: curve2_path,
        labels: labels
      )

    ~H"""
    <svg
      data-exo="area-chart-stacked"
      viewBox={"0 0 #{@svg_width} #{@height}"}
      preserveAspectRatio="xMidYMid meet"
      style="width:100%;"
    >
      <defs>
        <linearGradient id={"#{@id}-grad1"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stop-color={@color1} stop-opacity="0.8" />
          <stop offset="95%" stop-color={@color1} stop-opacity="0.1" />
        </linearGradient>
        <linearGradient id={"#{@id}-grad2"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stop-color={@color2} stop-opacity="0.8" />
          <stop offset="95%" stop-color={@color2} stop-opacity="0.1" />
        </linearGradient>
      </defs>
      <%= for {gy, x1, x2} <- @grid do %>
        <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
      <% end %>
      <%!-- Top stacked area rendered first (behind) --%>
      <path d={@area2_path} fill={"url(##{@id}-grad2)"} fill-opacity="0.4" />
      <path
        d={@curve2_path}
        fill="none"
        stroke={@color2}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <%!-- Bottom area rendered on top --%>
      <path d={@area1_path} fill={"url(##{@id}-grad1)"} fill-opacity="0.4" />
      <path
        d={@curve1_path}
        fill="none"
        stroke={@color1}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <%= for lbl <- @labels do %>
        <text
          :if={lbl.show}
          x={lbl.x}
          y={@pt + @chart_height + 18}
          text-anchor="middle"
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

  # --- Private helpers for pie/donut/radar/radial ---

  defp build_pie_slices(data, total, cx, cy, outer_r, _inner_r) do
    {slices, _} =
      Enum.reduce(data, {[], -:math.pi() / 2}, fn {label, value, color}, {acc, start_angle} ->
        v = to_number(value)
        sweep = v / total * 2 * :math.pi()
        end_angle = start_angle + sweep

        path =
          if sweep >= 2 * :math.pi() - 0.001 do
            # Full circle
            "M#{r(cx)},#{r(cy - outer_r)}" <>
              "A#{r(outer_r)},#{r(outer_r)} 0 1 1 #{r(cx - 0.001)},#{r(cy - outer_r)}" <>
              "Z"
          else
            x1 = cx + outer_r * :math.cos(start_angle)
            y1 = cy + outer_r * :math.sin(start_angle)
            x2 = cx + outer_r * :math.cos(end_angle)
            y2 = cy + outer_r * :math.sin(end_angle)
            large_arc = if sweep > :math.pi(), do: 1, else: 0

            "M#{r(cx)},#{r(cy)}" <>
              "L#{r(x1)},#{r(y1)}" <>
              "A#{r(outer_r)},#{r(outer_r)} 0 #{large_arc} 1 #{r(x2)},#{r(y2)}" <>
              "Z"
          end

        slice = %{label: label, value: value, color: color, path: path}
        {[slice | acc], end_angle}
      end)

    Enum.reverse(slices)
  end

  defp build_donut_slices(data, total, cx, cy, outer_r, inner_r) do
    {slices, _} =
      Enum.reduce(data, {[], -:math.pi() / 2}, fn {label, value, color}, {acc, start_angle} ->
        v = to_number(value)
        sweep = v / total * 2 * :math.pi()
        end_angle = start_angle + sweep

        path =
          if sweep >= 2 * :math.pi() - 0.001 do
            # Full donut ring
            "M#{r(cx)},#{r(cy - outer_r)}" <>
              "A#{r(outer_r)},#{r(outer_r)} 0 1 1 #{r(cx - 0.001)},#{r(cy - outer_r)}" <>
              "M#{r(cx)},#{r(cy - inner_r)}" <>
              "A#{r(inner_r)},#{r(inner_r)} 0 1 0 #{r(cx - 0.001)},#{r(cy - inner_r)}" <>
              "Z"
          else
            ox1 = cx + outer_r * :math.cos(start_angle)
            oy1 = cy + outer_r * :math.sin(start_angle)
            ox2 = cx + outer_r * :math.cos(end_angle)
            oy2 = cy + outer_r * :math.sin(end_angle)
            ix1 = cx + inner_r * :math.cos(start_angle)
            iy1 = cy + inner_r * :math.sin(start_angle)
            ix2 = cx + inner_r * :math.cos(end_angle)
            iy2 = cy + inner_r * :math.sin(end_angle)
            large_arc = if sweep > :math.pi(), do: 1, else: 0

            "M#{r(ox1)},#{r(oy1)}" <>
              "A#{r(outer_r)},#{r(outer_r)} 0 #{large_arc} 1 #{r(ox2)},#{r(oy2)}" <>
              "L#{r(ix2)},#{r(iy2)}" <>
              "A#{r(inner_r)},#{r(inner_r)} 0 #{large_arc} 0 #{r(ix1)},#{r(iy1)}" <>
              "Z"
          end

        slice = %{label: label, value: value, color: color, path: path}
        {[slice | acc], end_angle}
      end)

    Enum.reverse(slices)
  end

  defp polygon_points(n, cx, cy, radius) do
    Enum.map(0..(n - 1), fn i ->
      angle = -:math.pi() / 2 + 2 * :math.pi() * i / n
      x = cx + radius * :math.cos(angle)
      y = cy + radius * :math.sin(angle)
      "#{r(x)},#{r(y)}"
    end)
    |> Enum.join(" ")
  end

  defp arc_path(cx, cy, r_inner, r_outer, start_angle, end_angle) do
    # Outer arc start/end
    ox1 = cx + r_outer * :math.cos(start_angle)
    oy1 = cy + r_outer * :math.sin(start_angle)
    ox2 = cx + r_outer * :math.cos(end_angle)
    oy2 = cy + r_outer * :math.sin(end_angle)
    # Inner arc start/end
    ix1 = cx + r_inner * :math.cos(start_angle)
    iy1 = cy + r_inner * :math.sin(start_angle)
    ix2 = cx + r_inner * :math.cos(end_angle)
    iy2 = cy + r_inner * :math.sin(end_angle)
    sweep = end_angle - start_angle
    large_arc = if sweep > :math.pi(), do: 1, else: 0

    "M#{r(ox1)},#{r(oy1)}" <>
      "A#{r(r_outer)},#{r(r_outer)} 0 #{large_arc} 1 #{r(ox2)},#{r(oy2)}" <>
      "L#{r(ix2)},#{r(iy2)}" <>
      "A#{r(r_inner)},#{r(r_inner)} 0 #{large_arc} 0 #{r(ix1)},#{r(iy1)}" <>
      "Z"
  end
end
