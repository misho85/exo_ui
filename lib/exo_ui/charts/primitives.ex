defmodule ExoUI.Charts.Primitives do
  @moduledoc false

  use Phoenix.Component

  use ExoUI.Charts.Shared

  @doc "Renders a badge showing percentage change between current and previous values."
  attr :current, :any, required: true
  attr :previous, :any, required: true
  attr :aria_label, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

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

    assigns =
      assign(assigns,
        pct: pct,
        direction: direction,
        computed_label: chart_label(assigns.aria_label, trend_badge_label(direction, pct))
      )

    ~H"""
    <span
      :if={@direction == :up}
      data-exo="trend-badge"
      data-direction="up"
      aria-label={@computed_label}
      class={@class}
      {@rest}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        <path d="M6 2l4 5H2z" />
      </svg>
      {format_pct(@pct)}%
    </span>
    <span
      :if={@direction == :down}
      data-exo="trend-badge"
      data-direction="down"
      aria-label={@computed_label}
      class={@class}
      {@rest}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        <path d="M6 10l4-5H2z" />
      </svg>
      {format_pct(@pct)}%
    </span>
    <span
      :if={@direction == :flat}
      data-exo="trend-badge"
      data-direction="flat"
      aria-label={@computed_label}
      class={@class}
      {@rest}
    >
      &mdash;
    </span>
    """
  end

  @doc "Renders a compact inline sparkline SVG chart."
  attr :data, :list, required: true
  attr :width, :integer, default: 80
  attr :height, :integer, default: 24
  attr :color, :string, default: "var(--exo-primary)"
  attr :empty_text, :string, default: "No trend data"
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def sparkline(assigns) do
    if length(assigns.data) < 2 do
      assigns =
        assign(assigns, :computed_label, chart_label(assigns.aria_label, assigns.empty_text))

      ~H"""
      <span
        data-exo="sparkline-empty"
        role="img"
        aria-label={@computed_label}
        class={@class}
        {@rest}
      >
        {@empty_text}
      </span>
      """
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
      chart_title = chart_label(assigns.aria_label, "Sparkline chart")
      chart_description = chart_description(assigns.description)

      assigns =
        assign(assigns, chart_title: chart_title, chart_description: chart_description)

      ~H"""
      <svg
        data-exo="sparkline"
        role="img"
        aria-label={@chart_title}
        viewBox={"0 0 #{@width} #{@height}"}
        width={@width}
        height={@height}
        class={@class}
        style="display:inline-block;"
        {@rest}
      >
        <title>{@chart_title}</title>
        <desc :if={@chart_description}>{@chart_description}</desc>
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
  attr :aria_label, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def progress_bar(assigns) do
    value_max = max(assigns.max, 0)
    value_now = assigns.count |> max(0) |> min(value_max)
    pct = if value_max > 0, do: value_now / value_max * 100, else: 0
    pct_label = if pct == trunc(pct), do: "#{trunc(pct)}%", else: "#{Float.round(pct, 1)}%"
    pct_style = if pct == trunc(pct), do: trunc(pct), else: Float.round(pct, 1)

    assigns =
      assign(assigns,
        pct: pct,
        pct_style: pct_style,
        pct_label: pct_label,
        value_now: value_now,
        value_max: value_max,
        computed_label: chart_label(assigns.aria_label, assigns.label)
      )

    ~H"""
    <div
      data-exo="progress-bar"
      role="progressbar"
      aria-label={@computed_label}
      aria-valuemin="0"
      aria-valuemax={@value_max}
      aria-valuenow={@value_now}
      aria-valuetext={@pct_label}
      class={@class}
      {@rest}
    >
      <div data-exo="progress-bar-header">
        <span>{@label}</span>
        <span data-exo="progress-bar-count">{@pct_label}</span>
      </div>
      <div data-exo="progress-bar-track">
        <div data-exo="progress-bar-fill" style={"width: #{@pct_style}%; background: #{@color};"} />
      </div>
    </div>
    """
  end

  defp trend_badge_label(:up, pct), do: "Up #{format_pct(pct)}%"
  defp trend_badge_label(:down, pct), do: "Down #{format_pct(pct)}%"
  defp trend_badge_label(:flat, _pct), do: "No change"
end
