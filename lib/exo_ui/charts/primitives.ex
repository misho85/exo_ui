defmodule ExoUI.Charts.Primitives do
  @moduledoc false

  use Phoenix.Component

  use ExoUI.Charts.Shared

  @doc "Renders a badge showing percentage change between current and previous values."
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

          direction =
            cond do
              change > 0 -> :up
              change < 0 -> :down
              true -> :flat
            end

          {abs(Float.round(change, 1)), direction}
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

  @doc "Renders a compact inline sparkline SVG chart."
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
      width = assigns.width - pad * 2
      height = assigns.height - pad * 2

      points =
        values
        |> Enum.with_index()
        |> Enum.map(fn {value, index} ->
          x = pad + index / max(count - 1, 1) * width
          y = pad + height - (value - min_val) / range * height
          {r(x), r(y)}
        end)

      line_points = Enum.map_join(points, " ", fn {x, y} -> "#{x},#{y}" end)
      {first_x, _} = List.first(points)

      area_points =
        line_points <> " #{r(pad + width)},#{r(pad + height)} #{r(first_x)},#{r(pad + height)}"

      id = "spark-#{:erlang.phash2(values)}"

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

  @doc "Renders a labeled horizontal progress bar."
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
end
