defmodule ExoUI.ColorMixTest do
  @moduledoc """
  TRG-346. `color-mix()` in a polar space (`oklch`, `lch`, `hsl`, `hwb`)
  interpolates the hue angle, and a neutral pulls the hue towards its own even
  at chroma 0: Chromium takes the written hue of `oklch(15% 0 0)`, so the
  alert's info text came out purple (hue 305 instead of 250) with ExoUI's own
  tokens. A tinted neutral does the same: with trg24's foreground,
  `oklch(20% 0.006 106)`, error text was brown (hue 66 instead of 27).

  A polar mix is safe only against `transparent`, which keeps the other
  colour's hue (measured). Anything else mixes in `oklab`, which has no angle
  to drag.
  """
  use ExUnit.Case, async: true

  @root Path.expand("../..", __DIR__)
  @polar ~w(oklch lch hsl hwb)

  test "a polar color-mix() only mixes with transparent" do
    files =
      Path.wildcard(Path.join(@root, "assets/css/**/*.css")) ++
        Path.wildcard(Path.join(@root, "lib/**/*.ex"))

    mixes = Enum.flat_map(files, &mixes/1)

    # Without a single polar mix to read, the check below passes on nothing.
    assert Enum.any?(mixes, fn {_, _, [space | _]} -> polar?(space) end),
           "found no color-mix(in oklch, ...) at all; the scan reads nothing"

    offenders =
      for {path, line, [space | colors]} <- mixes,
          polar?(space),
          not Enum.any?(colors, &(color(&1) == "transparent")) do
        "#{Path.relative_to(path, @root)}:#{line}: color-mix(#{Enum.join([space | colors], ", ")})"
      end

    assert offenders == [],
           "mixes in a polar space with a colour that may carry a hue; use `in oklab`:\n  " <>
             Enum.join(offenders, "\n  ")
  end

  defp polar?(space) do
    case String.split(space) do
      ["in", name | _] -> name in @polar
      _ -> false
    end
  end

  # "var(--exo-muted) 76%" -> "var(--exo-muted)"
  defp color(arg), do: arg |> String.replace(~r/\s+[\d.]+%$/, "") |> String.trim()

  defp mixes(path) do
    source = File.read!(path)

    # A comment may quote the very mix it warns against.
    source =
      if String.ends_with?(path, ".css"),
        do: Regex.replace(~r{/\*.*?\*/}s, source, &String.duplicate("\n", count_lines(&1) - 1)),
        else: source

    ~r/color-mix\(/
    |> Regex.scan(source, return: :index)
    |> Enum.map(fn [{start, length}] ->
      line = source |> binary_part(0, start) |> count_lines()
      args = source |> binary_part(start + length, byte_size(source) - start - length) |> args()
      {path, line, args}
    end)
  end

  defp count_lines(text), do: length(String.split(text, "\n"))

  # The comma-separated arguments up to the matching ")", nested calls kept whole.
  defp args(rest), do: args(rest, 0, "", [])

  defp args("", _depth, current, acc), do: Enum.reverse([String.trim(current) | acc])
  defp args(")" <> _, 0, current, acc), do: Enum.reverse([String.trim(current) | acc])
  defp args("," <> rest, 0, current, acc), do: args(rest, 0, "", [String.trim(current) | acc])
  defp args("(" <> rest, depth, current, acc), do: args(rest, depth + 1, current <> "(", acc)
  defp args(")" <> rest, depth, current, acc), do: args(rest, depth - 1, current <> ")", acc)

  defp args(<<char::utf8, rest::binary>>, depth, current, acc),
    do: args(rest, depth, current <> <<char::utf8>>, acc)
end
