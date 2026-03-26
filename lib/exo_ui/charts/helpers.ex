defmodule ExoUI.Charts.Helpers do
  @moduledoc false

  # Shared layout and computation helpers for ExoUI chart components.
  # These functions extract patterns duplicated across 3+ chart variants.

  @svg_width 600

  @doc """
  Computes the standard chart layout dimensions used by bar charts and line/area charts.

  Returns a map with:
  - `width` — SVG viewBox width (always 600)
  - `pl`, `pr`, `pt`, `pb` — padding left/right/top/bottom
  - `cw` — chart area width (width - pl - pr)
  - `ch` — chart area height (height - pt - pb)

  ## Options
  - `:pl` — padding left (default 12)
  - `:pr` — padding right (default 12)
  - `:pt` — padding top (default 8)
  - `:pb` — padding bottom (default 28)
  """
  def chart_dimensions(height, opts \\ []) do
    pl = Keyword.get(opts, :pl, 12)
    pr = Keyword.get(opts, :pr, 12)
    pt = Keyword.get(opts, :pt, 8)
    pb = Keyword.get(opts, :pb, 28)
    cw = @svg_width - pl - pr
    ch = height - pb - pt

    %{width: @svg_width, pl: pl, pr: pr, pt: pt, pb: pb, cw: cw, ch: ch}
  end

  @doc """
  Computes bar width and gap for evenly spaced vertical bars.

  Returns `{bar_width, gap}`.

  ## Options
  - `:bar_ratio` — fraction of gap occupied by bar (default 0.65)
  - `:min_width` — minimum bar width (default 4)
  """
  def bar_geometry(cw, count, opts \\ []) do
    ratio = Keyword.get(opts, :bar_ratio, 0.65)
    min_w = Keyword.get(opts, :min_width, 4)
    gap = cw / count
    bw = max(gap * ratio, min_w)
    {bw, gap}
  end

  @doc """
  Computes the x-axis label step so at most ~12 labels appear.
  """
  def label_step(count), do: max(div(count, 12), 1)

  @doc """
  Abbreviates a label to 3 characters (shadcn tickFormatter: value.slice(0, 3)).
  """
  def short_label(label), do: label |> to_string() |> String.slice(0, 3)

  @doc """
  Ensures max_val is never zero (avoids division by zero).
  """
  def safe_max(0), do: 1
  def safe_max(+0.0), do: 1
  def safe_max(val), do: val

  @doc """
  SVG width constant used across all charts.
  """
  def svg_width, do: @svg_width
end
