defmodule ExoUI.Charts.Shared do
  @moduledoc false

  # Injects shared numeric and SVG-path helpers into chart family modules.
  defmacro __using__(_opts) do
    quote do
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

      defp catmull_rom_to_bezier_path([]), do: ""
      defp catmull_rom_to_bezier_path([{x, y}]), do: "M#{r(x)},#{r(y)}"

      defp catmull_rom_to_bezier_path(points) do
        n = length(points)
        pts = List.to_tuple(points)
        {x0, y0} = elem(pts, 0)
        start = "M#{r(x0)},#{r(y0)}"

        segments =
          Enum.map(0..(n - 2), fn i ->
            p0 = elem(pts, max(i - 1, 0))
            p1 = elem(pts, i)
            p2 = elem(pts, min(i + 1, n - 1))
            p3 = elem(pts, min(i + 2, n - 1))

            catmull_rom_segment_to_bezier(p0, p1, p2, p3)
          end)

        start <> Enum.join(segments)
      end

      defp catmull_rom_segment_to_bezier({x0, y0}, {x1, y1}, {x2, y2}, {x3, y3}) do
        t1x = (x2 - x0) / 2.0
        t1y = (y2 - y0) / 2.0
        t2x = (x3 - x1) / 2.0
        t2y = (y3 - y1) / 2.0
        cp1x = x1 + t1x / 3.0
        cp1y = y1 + t1y / 3.0
        cp2x = x2 - t2x / 3.0
        cp2y = y2 - t2y / 3.0

        "C#{r(cp1x)},#{r(cp1y)} #{r(cp2x)},#{r(cp2y)} #{r(x2)},#{r(y2)}"
      end

      defp catmull_rom_area_path(points, baseline_y, left_x, right_x) do
        curve = catmull_rom_to_bezier_path(points)
        "#{curve}L#{r(right_x)},#{r(baseline_y)}L#{r(left_x)},#{r(baseline_y)}Z"
      end

      defp rounded_bottom_rect_path(x, y, w, h, radius) do
        radius = min(radius, min(w / 2, h / 2))

        if radius <= 0 do
          "M#{r(x)},#{r(y)}h#{r(w)}v#{r(h)}h#{r(-w)}Z"
        else
          "M#{r(x)},#{r(y)}" <>
            "h#{r(w)}" <>
            "v#{r(h - radius)}" <>
            "a#{r(radius)},#{r(radius)} 0 0 1 #{r(-radius)},#{r(radius)}" <>
            "h#{r(-(w - 2 * radius))}" <>
            "a#{r(radius)},#{r(radius)} 0 0 1 #{r(-radius)},#{r(-radius)}" <>
            "v#{r(-(h - radius))}" <>
            "Z"
        end
      end

      defp rounded_top_rect_path(x, y, w, h, radius) do
        radius = min(radius, min(w / 2, h / 2))

        if radius <= 0 do
          "M#{r(x)},#{r(y)}h#{r(w)}v#{r(h)}h#{r(-w)}Z"
        else
          "M#{r(x)},#{r(y + h)}" <>
            "v#{r(-(h - radius))}" <>
            "a#{r(radius)},#{r(radius)} 0 0 1 #{r(radius)},#{r(-radius)}" <>
            "h#{r(w - 2 * radius)}" <>
            "a#{r(radius)},#{r(radius)} 0 0 1 #{r(radius)},#{r(radius)}" <>
            "v#{r(h - radius)}" <>
            "Z"
        end
      end

      defp fully_rounded_rect_path(x, y, w, h, radius) do
        radius = min(radius, min(w / 2, h / 2))

        if radius <= 0 do
          "M#{r(x)},#{r(y)}h#{r(w)}v#{r(h)}h#{r(-w)}Z"
        else
          "M#{r(x + radius)},#{r(y)}" <>
            "h#{r(w - 2 * radius)}" <>
            "a#{r(radius)},#{r(radius)} 0 0 1 #{r(radius)},#{r(radius)}" <>
            "v#{r(h - 2 * radius)}" <>
            "a#{r(radius)},#{r(radius)} 0 0 1 #{r(-radius)},#{r(radius)}" <>
            "h#{r(-(w - 2 * radius))}" <>
            "a#{r(radius)},#{r(radius)} 0 0 1 #{r(-radius)},#{r(-radius)}" <>
            "v#{r(-(h - 2 * radius))}" <>
            "a#{r(radius)},#{r(radius)} 0 0 1 #{r(radius)},#{r(-radius)}" <>
            "Z"
        end
      end

      defp horizontal_grid_lines(pt, ch, pl, svg_width, pr, count \\ 4) do
        Enum.map(1..count, fn i ->
          frac = i / count
          r(pt + ch * (1 - frac))
        end)
        |> Enum.map(fn gy ->
          {gy, pl, svg_width - pr}
        end)
      end

      defp build_pie_slices(data, total, cx, cy, outer_r, _inner_r) do
        {slices, _} =
          Enum.reduce(data, {[], -:math.pi() / 2}, fn {label, value, color}, {acc, start_angle} ->
            value = to_number(value)
            sweep = value / total * 2 * :math.pi()
            end_angle = start_angle + sweep

            path =
              if sweep >= 2 * :math.pi() - 0.001 do
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
            value = to_number(value)
            sweep = value / total * 2 * :math.pi()
            end_angle = start_angle + sweep

            path =
              if sweep >= 2 * :math.pi() - 0.001 do
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
        ox1 = cx + r_outer * :math.cos(start_angle)
        oy1 = cy + r_outer * :math.sin(start_angle)
        ox2 = cx + r_outer * :math.cos(end_angle)
        oy2 = cy + r_outer * :math.sin(end_angle)
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
  end
end
