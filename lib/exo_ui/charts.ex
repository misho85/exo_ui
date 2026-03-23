defmodule ExoUI.Charts do
  @moduledoc """
  SVG chart components for ExoUI.
  Styled after shadcn/ui chart conventions: rounded bars, minimal axes,
  muted chrome, vivid data colors, gradient fills.
  """

  use Phoenix.Component

  # --- Private helpers ---

  defp to_number(n) when is_float(n), do: n
  defp to_number(n) when is_integer(n), do: n * 1.0

  defp to_number(%{__struct__: Decimal} = d) do
    apply(Decimal, :to_float, [d])
  end

  defp to_number(_), do: 0.0

  defp format_axis(value) when is_float(value) do
    cond do
      value >= 1_000_000 -> "#{:erlang.float_to_binary(value / 1_000_000, decimals: 1)}M"
      value >= 1_000 -> "#{:erlang.float_to_binary(value / 1_000, decimals: 1)}K"
      value >= 10 -> :erlang.float_to_binary(value, decimals: 0)
      true -> :erlang.float_to_binary(value, decimals: 1)
    end
  end

  defp format_axis(value) when is_integer(value) do
    cond do
      value >= 1_000_000 -> "#{div(value, 1_000_000)}M"
      value >= 1_000 -> "#{:erlang.float_to_binary(value / 1_000, decimals: 1)}K"
      true -> to_string(value)
    end
  end

  defp format_axis(value), do: to_string(value)

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

  defp truncate_label(label, max_len) do
    label = to_string(label)

    if String.length(label) > max_len,
      do: String.slice(label, 0, max_len - 1) <> "…",
      else: label
  end

  # Attempt smooth (catmull-rom → SVG cubic bezier) curve through points
  defp r(v), do: Float.round(v * 1.0, 1)

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
          {Float.round(x * 1.0, 1), Float.round(y * 1.0, 1)}
        end)

      line_points = Enum.map_join(points, " ", fn {x, y} -> "#{x},#{y}" end)
      {fx, _fy} = List.first(points)
      area_points = line_points <> " #{r(pad + w)},#{r(pad + h)} #{r(fx)},#{r(pad + h)}"

      id = "spark-#{System.unique_integer([:positive])}"

      assigns =
        assign(assigns,
          id: id,
          line_points: line_points,
          area_points: area_points
        )

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
        <div data-exo="progress-bar-fill" style={"width: max(#{@pct}%, 2rem); background: #{@color};"}>
          <span :if={@pct >= 10} data-exo="progress-bar-fill-label">{@pct_label}</span>
        </div>
      </div>
    </div>
    """
  end

  # --- bar_chart ---
  # shadcn style: rounded bars (rx=8), no axis lines, no tick marks,
  # only subtle horizontal grid, muted labels

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
      pl = 44
      pr = 16
      pb = 32
      pt = 20
      cw = width - pl - pr
      ch = height - pb - pt
      bw = max(cw / bar_count * 0.6, 4)
      gap = cw / bar_count

      grid_lines =
        Enum.map(0..4, fn i ->
          frac = i / 4
          %{y: pt + ch * (1 - frac), label: format_axis(max_val * frac)}
        end)

      bars =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, value}, i} ->
          v = to_number(value)
          bar_h = if max_val > 0, do: v / max_val * ch, else: 0
          x = pl + i * gap + (gap - bw) / 2
          y = pt + ch - bar_h
          %{label: label, value: value, x: x, y: y, height: bar_h, width: bw}
        end)

      label_step = max(div(bar_count, 12), 1)

      assigns =
        assign(assigns,
          bars: bars,
          svg_width: width,
          chart_height: ch,
          pl: pl,
          pt: pt,
          grid_lines: grid_lines,
          label_step: label_step,
          bar_count: bar_count,
          bw: bw
        )

      ~H"""
      <svg data-exo="bar-chart" viewBox={"0 0 #{@svg_width} #{@height}"} preserveAspectRatio="xMidYMid meet" style="width:100%;">
        <%!-- Horizontal grid lines only (no vertical, no axis line) --%>
        <%= for gl <- @grid_lines do %>
          <line x1={@pl} y1={gl.y} x2={@svg_width - @pl + 28} y2={gl.y} stroke="currentColor" stroke-opacity="0.08" />
          <text x={@pl - 8} y={gl.y + 4} text-anchor="end" fill="currentColor" fill-opacity="0.5" font-size="12">{gl.label}</text>
        <% end %>
        <%!-- Bars with full rounding --%>
        <%= for {bar, idx} <- Enum.with_index(@bars) do %>
          <rect x={bar.x} y={bar.y} width={bar.width} height={max(bar.height, 0)} fill={@color} rx="8" ry="8">
            <title>{bar.label}: {format_tooltip(bar.value)}</title>
          </rect>
          <%!-- Bottom labels --%>
          <text :if={rem(idx, @label_step) == 0 or idx == @bar_count - 1} x={bar.x + @bw / 2} y={@pt + @chart_height + 18} text-anchor="middle" fill="currentColor" fill-opacity="0.5" font-size="12">{bar.label}</text>
        <% end %>
      </svg>
      """
    end
  end

  # --- horizontal_bar_chart ---

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
      value_width = 50
      width = 600
      chart_width = width - label_width - value_width

      rows =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, value}, i} ->
          v = to_number(value)
          bw = if max_val > 0, do: v / max_val * chart_width, else: 0
          %{label: label, value: value, y: i * row_height, bar_width: bw}
        end)

      total_height = length(data) * row_height

      assigns =
        assign(assigns,
          rows: rows,
          svg_width: width,
          total_height: total_height,
          label_width: label_width
        )

      ~H"""
      <svg data-exo="h-bar-chart" viewBox={"0 0 #{@svg_width} #{@total_height}"} preserveAspectRatio="xMidYMid meet" style="width:100%;">
        <%= for row <- @rows do %>
          <text x={@label_width - 12} y={row.y + 23} text-anchor="end" fill="currentColor" fill-opacity="0.6" font-size="12">{truncate_label(row.label, 12)}</text>
          <rect x={@label_width} y={row.y + 8} width={max(row.bar_width, 0)} height="20" fill={@color} rx="6" ry="6">
            <title>{row.label}: {format_tooltip(row.value)}</title>
          </rect>
          <text x={@label_width + row.bar_width + 8} y={row.y + 23} fill="currentColor" fill-opacity="0.7" font-size="12" font-weight="500">{format_tooltip(row.value)}</text>
        <% end %>
      </svg>
      """
    end
  end

  # --- area_chart ---
  # shadcn style: smooth natural curves, gradient fill 0.8→0.1,
  # no axis lines, horizontal grid only

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
      pl = 44
      pr = 16
      pt = 10
      pb = 32
      cw = width - pl - pr
      ch = height - pt - pb

      grid_lines =
        Enum.map(0..4, fn i ->
          frac = i / 4
          %{y: pt + ch * (1 - frac), label: format_axis(max_val * frac)}
        end)

      points =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{_label, value}, i} ->
          x = pl + i / max(count - 1, 1) * cw
          y = pt + ch - to_number(value) / max_val * ch
          {Float.round(x * 1.0, 1), Float.round(y * 1.0, 1)}
        end)

      line_points = Enum.map_join(points, " ", fn {x, y} -> "#{x},#{y}" end)
      area_points = line_points <> " #{r(pl + cw)},#{r(pt + ch)} #{r(pl * 1.0)},#{r(pt + ch)}"
      label_step = max(div(count, 12), 1)

      labels =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, _}, i} ->
          x = pl + i / max(count - 1, 1) * cw
          %{label: label, x: Float.round(x * 1.0, 1), show: rem(i, label_step) == 0 or i == count - 1}
        end)

      assigns =
        assign(assigns,
          svg_width: width,
          chart_height: ch,
          pl: pl,
          pt: pt,
          grid_lines: grid_lines,
          line_points: line_points,
          area_points: area_points,
          labels: labels
        )

      ~H"""
      <svg data-exo="area-chart" viewBox={"0 0 #{@svg_width} #{@height}"} preserveAspectRatio="xMidYMid meet" style="width:100%;">
        <defs>
          <linearGradient id={"#{@id}-grad"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stop-color={@color} stop-opacity="0.8" />
            <stop offset="95%" stop-color={@color} stop-opacity="0.05" />
          </linearGradient>
        </defs>
        <%!-- Horizontal grid lines only --%>
        <%= for gl <- @grid_lines do %>
          <line x1={@pl} y1={gl.y} x2={@svg_width - 16} y2={gl.y} stroke="currentColor" stroke-opacity="0.08" />
          <text x={@pl - 8} y={gl.y + 4} text-anchor="end" fill="currentColor" fill-opacity="0.5" font-size="12">{gl.label}</text>
        <% end %>
        <%!-- Gradient fill --%>
        <polygon points={@area_points} fill={"url(##{@id}-grad)"} fill-opacity="0.4" />
        <%!-- Line --%>
        <polyline points={@line_points} fill="none" stroke={@color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <%!-- Bottom labels --%>
        <%= for lbl <- @labels do %>
          <text :if={lbl.show} x={lbl.x} y={@pt + @chart_height + 18} text-anchor="middle" fill="currentColor" fill-opacity="0.5" font-size="12">{lbl.label}</text>
        <% end %>
      </svg>
      """
    end
  end

  # --- stacked_bar_chart ---

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
      pl = 44
      pr = 16
      pb = 56
      pt = 20
      cw = width - pl - pr
      ch = height - pb - pt
      bw = max(cw / count * 0.6, 4)
      gap = cw / count

      grid_lines =
        Enum.map(0..4, fn i ->
          frac = i / 4
          %{y: pt + ch * (1 - frac), label: format_axis(max_val * frac)}
        end)

      bars =
        data
        |> Enum.with_index()
        |> Enum.map(fn {{label, vals}, i} ->
          x = pl + i * gap + (gap - bw) / 2
          key_count = length(keys)

          segments =
            keys
            |> Enum.with_index()
            |> Enum.reduce({[], pt + ch}, fn {k, ki}, {segs, y_cursor} ->
              v = to_number(Map.get(vals, k, 0))
              seg_h = if max_val > 0, do: v / max_val * ch, else: 0
              # Bottom segment gets bottom rounding, top gets top rounding
              {ry_top, ry_bottom} =
                cond do
                  key_count == 1 -> {8, 8}
                  ki == key_count - 1 -> {8, 0}
                  ki == 0 -> {0, 8}
                  true -> {0, 0}
                end
              seg = %{key: k, y: y_cursor - seg_h, height: seg_h, color: Map.get(colors, k, "#999"), ry_top: ry_top, ry_bottom: ry_bottom}
              {[seg | segs], y_cursor - seg_h}
            end)

          %{label: label, x: x, segments: Enum.reverse(elem(segments, 0))}
        end)

      label_step = max(div(count, 12), 1)

      legend =
        Enum.map(keys, fn k ->
          %{key: k, color: Map.get(colors, k, "#999"), label: to_string(k)}
        end)

      assigns =
        assign(assigns,
          bars: bars,
          svg_width: width,
          chart_height: ch,
          pl: pl,
          pt: pt,
          bw: bw,
          grid_lines: grid_lines,
          label_step: label_step,
          bar_count: count,
          legend: legend
        )

      ~H"""
      <svg data-exo="stacked-bar-chart" viewBox={"0 0 #{@svg_width} #{@height}"} preserveAspectRatio="xMidYMid meet" style="width:100%;">
        <%!-- Horizontal grid lines --%>
        <%= for gl <- @grid_lines do %>
          <line x1={@pl} y1={gl.y} x2={@svg_width - 16} y2={gl.y} stroke="currentColor" stroke-opacity="0.08" />
          <text x={@pl - 8} y={gl.y + 4} text-anchor="end" fill="currentColor" fill-opacity="0.5" font-size="12">{gl.label}</text>
        <% end %>
        <%!-- Stacked bars --%>
        <%= for {bar, idx} <- Enum.with_index(@bars) do %>
          <%= for seg <- bar.segments do %>
            <rect x={bar.x} y={seg.y} width={@bw} height={max(seg.height, 0)} fill={seg.color} rx="4" ry="4" />
          <% end %>
          <text :if={rem(idx, @label_step) == 0 or idx == @bar_count - 1} x={bar.x + @bw / 2} y={@pt + @chart_height + 18} text-anchor="middle" fill="currentColor" fill-opacity="0.5" font-size="12">{bar.label}</text>
        <% end %>
        <%!-- Legend --%>
        <%= for {item, i} <- Enum.with_index(@legend) do %>
          <rect x={@pl + i * 110} y={@pt + @chart_height + 34} width="10" height="10" rx="2" fill={item.color} />
          <text x={@pl + i * 110 + 16} y={@pt + @chart_height + 43} fill="currentColor" fill-opacity="0.6" font-size="12">{item.label}</text>
        <% end %>
      </svg>
      """
    end
  end
end
