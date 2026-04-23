defmodule ExoUI.Charts.Cartesian do
  @moduledoc false

  use Phoenix.Component

  alias ExoUI.Charts.Helpers, as: H

  use ExoUI.Charts.Shared

  @doc "Renders a vertical bar chart with x-axis labels and hover tooltips."
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

          max_val =
            data
            |> Enum.map(&elem(&1, 1))
            |> Enum.map(&to_number/1)
            |> Enum.max(fn -> 1 end)
            |> H.safe_max()

          bar_count = length(data)
          %{width: width, pl: pl, pr: pr, pt: pt, cw: cw, ch: ch} = H.chart_dimensions(height)
          {bw, gap} = H.bar_geometry(cw, bar_count)
          grid = horizontal_grid_lines(pt, ch, pl, width, pr)

          bars =
            data
            |> Enum.with_index()
            |> Enum.map(fn {{label, value}, index} ->
              value_number = to_number(value)
              bar_height = if max_val > 0, do: value_number / max_val * ch, else: 0
              x = pl + index * gap + (gap - bw) / 2
              y = pt + ch - bar_height

              %{
                label: label,
                short_label: H.short_label(label),
                value: value,
                x: x,
                y: y,
                height: bar_height,
                width: bw
              }
            end)

          label_step = H.label_step(bar_count)

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

  @doc "Renders a horizontal bar chart with labels on the y-axis."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No data"

  def horizontal_bar_chart(assigns) do
        if Enum.empty?(assigns.data) do
          ~H|<div data-exo="chart-empty">{@empty_text}</div>|
        else
          data = assigns.data

          max_val =
            data
            |> Enum.map(&elem(&1, 1))
            |> Enum.map(&to_number/1)
            |> Enum.max(fn -> 1 end)
            |> H.safe_max()

          row_height = 36
          label_width = 80
          width = H.svg_width()
          chart_width = width - label_width - 12

          rows =
            data
            |> Enum.with_index()
            |> Enum.map(fn {{label, value}, index} ->
              value_number = to_number(value)
              bar_width = if max_val > 0, do: value_number / max_val * chart_width, else: 0

              %{
                label: label,
                short_label: H.short_label(label),
                value: value,
                y: index * row_height,
                bar_width: bar_width
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

          ~H"""
          <svg
            data-exo="h-bar-chart"
            viewBox={"0 0 #{@svg_width} #{@total_height}"}
            preserveAspectRatio="xMidYMid meet"
            style="width:100%;"
          >
            <%= for row <- @rows do %>
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

  @doc "Renders a smooth area chart with catmull-rom curves and gradient fill."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"
  attr :id, :string, default: nil
  attr :empty_text, :string, default: "No data"

  def area_chart(assigns) do
        id = assigns[:id] || "area-#{:erlang.phash2(assigns.data)}"
        assigns = assign(assigns, :id, id)

        if Enum.empty?(assigns.data) do
          ~H|<div data-exo="chart-empty">{@empty_text}</div>|
        else
          data = assigns.data
          height = assigns.height
          values = Enum.map(data, fn {_label, value} -> to_number(value) end)
          min_val = Enum.min(values)
          max_val = Enum.max(values)
          range = max_val - min_val
          range = if range == 0, do: 1.0, else: range
          count = length(values)
          %{width: width, pl: pl, pr: pr, pt: pt, cw: cw, ch: ch} = H.chart_dimensions(height)
          grid = horizontal_grid_lines(pt, ch, pl, width, pr)

          points =
            data
            |> Enum.with_index()
            |> Enum.map(fn {{_label, value}, index} ->
              x = pl + index / max(count - 1, 1) * cw
              y = pt + ch - (to_number(value) - min_val) / range * ch
              {r(x), r(y)}
            end)

          curve_path = catmull_rom_to_bezier_path(points)
          {last_x, _} = List.last(points)
          {first_x, _} = List.first(points)
          baseline_y = r(pt + ch)
          area_path = catmull_rom_area_path(points, baseline_y, first_x, last_x)
          label_step = H.label_step(count)

          labels =
            data
            |> Enum.with_index()
            |> Enum.map(fn {{label, _}, index} ->
              x = pl + index / max(count - 1, 1) * cw
              %{label: H.short_label(label), x: r(x), show: rem(index, label_step) == 0 or index == count - 1}
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
              <linearGradient id={"#{@id}-grad"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color={@color} stop-opacity="0.8" />
                <stop offset="95%" stop-color={@color} stop-opacity="0.1" />
              </linearGradient>
            </defs>
            <%= for {gy, x1, x2} <- @grid do %>
              <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
            <% end %>
            <path d={@area_path} fill={"url(##{@id}-grad)"} fill-opacity="0.4" />
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
  end

  @doc "Renders a stacked bar chart with multiple series and legend."
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
            Enum.map(data, fn {_label, values} ->
              Enum.reduce(keys, 0, fn key, acc -> acc + (Map.get(values, key, 0) |> to_number()) end)
            end)

          max_val = Enum.max(totals) |> H.safe_max()
          count = length(data)
          %{width: width, pl: pl, pr: pr, pt: pt, cw: cw, ch: ch} = H.chart_dimensions(height, pb: 52)
          {bw, gap} = H.bar_geometry(cw, count)
          grid = horizontal_grid_lines(pt, ch, pl, width, pr)
          key_count = length(keys)

          bars =
            data
            |> Enum.with_index()
            |> Enum.map(fn {{label, values}, index} ->
              x = pl + index * gap + (gap - bw) / 2

              segments =
                keys
                |> Enum.with_index()
                |> Enum.reduce({[], pt + ch}, fn {key, key_index}, {segments_acc, y_cursor} ->
                  value = to_number(Map.get(values, key, 0))
                  segment_height = if max_val > 0, do: value / max_val * ch, else: 0

                  rounding =
                    cond do
                      key_count == 1 -> :all
                      key_index == 0 -> :bottom
                      key_index == key_count - 1 -> :top
                      true -> :none
                    end

                  segment = %{
                    key: key,
                    x: x,
                    y: y_cursor - segment_height,
                    width: bw,
                    height: segment_height,
                    value: Map.get(values, key, 0),
                    color: Map.get(colors, key, "#999"),
                    rounding: rounding
                  }

                  {[segment | segments_acc], y_cursor - segment_height}
                end)

              %{
                label: label,
                short_label: H.short_label(label),
                x: x,
                segments: Enum.reverse(elem(segments, 0))
              }
            end)

          label_step = H.label_step(count)

          legend =
            Enum.map(keys, fn key ->
              %{key: key, color: Map.get(colors, key, "#999"), label: to_string(key)}
            end)

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
            <%= for {gy, x1, x2} <- @grid do %>
              <line x1={x1} y1={gy} x2={x2} y2={gy} stroke="currentColor" stroke-opacity="0.1" />
            <% end %>
            <%= for {bar, idx} <- Enum.with_index(@bars) do %>
              <%= for segment <- bar.segments do %>
                <%= if segment.height > 0 do %>
                  <%= case segment.rounding do %>
                    <% :all -> %>
                      <path
                        d={fully_rounded_rect_path(segment.x, segment.y, segment.width, segment.height, 4)}
                        fill={segment.color}
                      >
                        <title>{segment.key}: {format_tooltip(segment.value)}</title>
                      </path>
                    <% :bottom -> %>
                      <path
                        d={rounded_bottom_rect_path(segment.x, segment.y, segment.width, segment.height, 4)}
                        fill={segment.color}
                      >
                        <title>{segment.key}: {format_tooltip(segment.value)}</title>
                      </path>
                    <% :top -> %>
                      <path
                        d={rounded_top_rect_path(segment.x, segment.y, segment.width, segment.height, 4)}
                        fill={segment.color}
                      >
                        <title>{segment.key}: {format_tooltip(segment.value)}</title>
                      </path>
                    <% :none -> %>
                      <rect x={segment.x} y={segment.y} width={segment.width} height={segment.height} fill={segment.color}>
                        <title>{segment.key}: {format_tooltip(segment.value)}</title>
                      </rect>
                  <% end %>
                <% end %>
              <% end %>
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
            <%= for {item, index} <- Enum.with_index(@legend) do %>
              <rect
                x={@legend_start + index * 100}
                y={@pt + @chart_height + 32}
                width="10"
                height="10"
                rx="2"
                fill={item.color}
              />
              <text
                x={@legend_start + index * 100 + 16}
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

  @doc "Renders a grouped bar chart with two series side by side."
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
          values = Enum.flat_map(data, fn {_label, value1, value2} -> [to_number(value1), to_number(value2)] end)
          max_val = Enum.max(values, fn -> 1 end) |> H.safe_max()
          count = length(data)
          %{width: width, pl: pl, pr: pr, pt: pt, cw: cw, ch: ch} = H.chart_dimensions(height)
          {bw, gap} = H.bar_geometry(cw, count, bar_ratio: 0.3)
          grid = horizontal_grid_lines(pt, ch, pl, width, pr)

          bars =
            data
            |> Enum.with_index()
            |> Enum.map(fn {{label, value1, value2}, index} ->
              number1 = to_number(value1)
              number2 = to_number(value2)
              height1 = number1 / max_val * ch
              height2 = number2 / max_val * ch
              center = pl + index * gap + gap / 2
              x1 = center - bw - 1
              x2 = center + 1

              %{
                label: label,
                short_label: H.short_label(label),
                v1: value1,
                v2: value2,
                x1: x1,
                x2: x2,
                y1: pt + ch - height1,
                y2: pt + ch - height2,
                h1: height1,
                h2: height2,
                center: center
              }
            end)

          label_step = H.label_step(count)

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

  @doc "Renders a bar chart with value labels displayed on each bar."
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

          max_val =
            data
            |> Enum.map(&elem(&1, 1))
            |> Enum.map(&to_number/1)
            |> Enum.max(fn -> 1 end)
            |> H.safe_max()

          count = length(data)
          %{width: width, pl: pl, pr: pr, pt: pt, cw: cw, ch: ch} = H.chart_dimensions(height, pt: 24)
          {bw, gap} = H.bar_geometry(cw, count)
          grid = horizontal_grid_lines(pt, ch, pl, width, pr)

          bars =
            data
            |> Enum.with_index()
            |> Enum.map(fn {{label, value}, index} ->
              value_number = to_number(value)
              bar_height = if max_val > 0, do: value_number / max_val * ch, else: 0
              x = pl + index * gap + (gap - bw) / 2
              y = pt + ch - bar_height

              %{
                label: label,
                short_label: H.short_label(label),
                value: value,
                x: x,
                y: y,
                height: bar_height,
                width: bw
              }
            end)

          label_step = H.label_step(count)

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

  @doc "Renders a bar chart with distinct colors for positive and negative values."
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
          values = Enum.map(data, fn {_label, value} -> to_number(value) end)
          max_abs = values |> Enum.map(&abs/1) |> Enum.max(fn -> 1 end) |> H.safe_max()
          count = length(data)

          %{width: width, pl: pl, pr: pr, pt: pt, cw: cw, ch: ch} =
            H.chart_dimensions(height, pb: 8, pt: 24)

          half_ch = ch / 2
          zero_y = pt + half_ch
          {bw, gap} = H.bar_geometry(cw, count)
          grid = horizontal_grid_lines(pt, ch, pl, width, pr)

          bars =
            data
            |> Enum.with_index()
            |> Enum.map(fn {{label, value}, index} ->
              value_number = to_number(value)
              bar_height = abs(value_number) / max_abs * half_ch
              x = pl + index * gap + (gap - bw) / 2

              {y, color} =
                if value_number >= 0 do
                  {zero_y - bar_height, assigns.color_positive}
                else
                  {zero_y, assigns.color_negative}
                end

              %{
                label: label,
                short_label: H.short_label(label),
                value: value,
                x: x,
                y: y,
                height: bar_height,
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

  @doc "Renders a single-series line chart with catmull-rom smoothing."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color, :string, default: "var(--exo-primary)"

  def line_chart(assigns) do
        data = assigns.data
        height = assigns.height
        values = Enum.map(data, fn {_label, value} -> to_number(value) end)
        min_val = Enum.min(values, fn -> 0 end)
        max_val = Enum.max(values, fn -> 1 end)
        range = max_val - min_val
        range = if range == 0, do: 1.0, else: range
        count = length(values)
        %{width: width, pl: pl, pr: pr, pt: pt, cw: cw, ch: ch} = H.chart_dimensions(height)
        grid = horizontal_grid_lines(pt, ch, pl, width, pr)

        points =
          data
          |> Enum.with_index()
          |> Enum.map(fn {{_label, value}, index} ->
            x = pl + index / max(count - 1, 1) * cw
            y = pt + ch - (to_number(value) - min_val) / range * ch
            {r(x), r(y)}
          end)

        curve_path = catmull_rom_to_bezier_path(points)
        label_step = H.label_step(count)

        labels =
          data
          |> Enum.with_index()
          |> Enum.map(fn {{label, _}, index} ->
            x = pl + index / max(count - 1, 1) * cw
            %{label: H.short_label(label), x: r(x), show: rem(index, label_step) == 0 or index == count - 1}
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

  @doc "Renders a two-series line chart with catmull-rom smoothing."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color1, :string, default: "var(--exo-primary)"
  attr :color2, :string, default: "color-mix(in oklch, var(--exo-primary) 50%, transparent)"

  def line_chart_multiple(assigns) do
        data = assigns.data
        height = assigns.height
        values = Enum.flat_map(data, fn {_label, value1, value2} -> [to_number(value1), to_number(value2)] end)
        min_val = Enum.min(values, fn -> 0 end)
        max_val = Enum.max(values, fn -> 1 end)
        range = max_val - min_val
        range = if range == 0, do: 1.0, else: range
        count = length(data)
        %{width: width, pl: pl, pr: pr, pt: pt, cw: cw, ch: ch} = H.chart_dimensions(height)
        grid = horizontal_grid_lines(pt, ch, pl, width, pr)

        points1 =
          data
          |> Enum.with_index()
          |> Enum.map(fn {{_label, value1, _value2}, index} ->
            x = pl + index / max(count - 1, 1) * cw
            y = pt + ch - (to_number(value1) - min_val) / range * ch
            {r(x), r(y)}
          end)

        points2 =
          data
          |> Enum.with_index()
          |> Enum.map(fn {{_label, _value1, value2}, index} ->
            x = pl + index / max(count - 1, 1) * cw
            y = pt + ch - (to_number(value2) - min_val) / range * ch
            {r(x), r(y)}
          end)

        curve1 = catmull_rom_to_bezier_path(points1)
        curve2 = catmull_rom_to_bezier_path(points2)
        label_step = H.label_step(count)

        labels =
          data
          |> Enum.with_index()
          |> Enum.map(fn {{label, _, _}, index} ->
            x = pl + index / max(count - 1, 1) * cw
            %{label: H.short_label(label), x: r(x), show: rem(index, label_step) == 0 or index == count - 1}
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

  @doc "Renders a stacked area chart with two series and catmull-rom curves."
  attr :data, :list, required: true
  attr :height, :integer, default: 200
  attr :color1, :string, default: "var(--exo-primary)"
  attr :color2, :string, default: "color-mix(in oklch, var(--exo-primary) 50%, transparent)"
  attr :id, :string, default: nil

  def area_chart_stacked(assigns) do
        id = assigns[:id] || "area-stacked-#{:erlang.phash2(assigns.data)}"
        assigns = assign(assigns, :id, id)

        data = assigns.data
        height = assigns.height
        stacked_vals = Enum.map(data, fn {_label, value1, value2} -> to_number(value1) + to_number(value2) end)
        max_val = Enum.max(stacked_vals, fn -> 1 end) |> H.safe_max()
        count = length(data)
        %{width: width, pl: pl, pr: pr, pt: pt, cw: cw, ch: ch} = H.chart_dimensions(height)
        baseline_y = r(pt + ch)
        grid = horizontal_grid_lines(pt, ch, pl, width, pr)

        points1 =
          data
          |> Enum.with_index()
          |> Enum.map(fn {{_label, value1, _value2}, index} ->
            x = pl + index / max(count - 1, 1) * cw
            y = pt + ch - to_number(value1) / max_val * ch
            {r(x), r(y)}
          end)

        points2 =
          data
          |> Enum.with_index()
          |> Enum.map(fn {{_label, value1, value2}, index} ->
            x = pl + index / max(count - 1, 1) * cw
            y = pt + ch - (to_number(value1) + to_number(value2)) / max_val * ch
            {r(x), r(y)}
          end)

        {first_x, _} = List.first(points1)
        {last_x, _} = List.last(points1)
        area1_path = catmull_rom_area_path(points1, baseline_y, first_x, last_x)
        curve1_path = catmull_rom_to_bezier_path(points1)
        area2_path = catmull_rom_area_path(points2, baseline_y, first_x, last_x)
        curve2_path = catmull_rom_to_bezier_path(points2)
        label_step = H.label_step(count)

        labels =
          data
          |> Enum.with_index()
          |> Enum.map(fn {{label, _, _}, index} ->
            x = pl + index / max(count - 1, 1) * cw
            %{label: H.short_label(label), x: r(x), show: rem(index, label_step) == 0 or index == count - 1}
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
          <path d={@area2_path} fill={"url(##{@id}-grad2)"} fill-opacity="0.4" />
          <path
            d={@curve2_path}
            fill="none"
            stroke={@color2}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
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
  end
