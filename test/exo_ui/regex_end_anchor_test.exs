defmodule ExoUI.RegexEndAnchorTest do
  @moduledoc """
  KRF-542 (part of KRF-539): in PCRE (Elixir `Regex`, Erlang `:re`) a `$`
  without the `m` modifier matches at the end of the subject AND before a final
  "\\n". So `validate_format(:slug, ~r/^[a-z0-9-]+$/)` accepted "acme\\n": the
  class does not eat the newline, and `$` matched in front of it. Elixir has no
  sigil letter for PCRE's `dollar_endonly`; the end of the string is `\\z`.

  The library itself had no such regex; the storybook's live reload patterns
  had five. This is the static guard that keeps a bare `$` out of both: a
  component that parses an attribute or a value with a regex ships into every
  app that uses ExoUI, so the end of the string must be `\\z` here too.
  """
  use ExUnit.Case, async: true

  describe "guard: no regex anchors the end with a bare `$`" do
    # The library (lib/, mix.exs) and the storybook app beside it (its lib/,
    # config/, stories and mix.exs). test/ is out: a regex that matches test
    # output checks nothing a user sends.
    @root Path.expand("../..", __DIR__)
    @sources Enum.flat_map(
               [
                 "lib/**/*.{ex,exs}",
                 "mix.exs",
                 "storybook/lib/**/*.{ex,exs}",
                 "storybook/config/**/*.exs",
                 "storybook/stories/**/*.exs",
                 "storybook/mix.exs"
               ],
               &Path.wildcard(Path.join(@root, &1))
             )

    test "lib/, mix.exs and storybook/" do
      # A glob that silently matches nothing would make the guard pass vacuously.
      assert length(@sources) > 150
      assert Path.join(@root, "lib/exo_ui.ex") in @sources
      assert Path.join(@root, "storybook/config/dev.exs") in @sources

      offenders =
        for path <- @sources,
            {line, source} <- bare_dollar_regexes(File.read!(path)),
            do: "#{Path.relative_to(path, @root)}:#{line}: #{inspect(source)}"

      assert offenders == [],
             "`$` without the `m` modifier also matches before a trailing \"\\n\" (KRF-539). " <>
               "Anchor the end with \\z — or \\Z where a trailing newline is meant to pass, " <>
               "with the reason beside it:\n" <> Enum.join(offenders, "\n")
    end

    test "sees every way a regex is written, and nothing else" do
      for flagged <- [
            ~S'~r/^a$/',
            ~S'~r{^a$}i',
            ~S'~R"^a$"',
            ~S'~r/^(a$|b)\z/',
            ~S'~r/^#{x}$/',
            ~S'Regex.compile!("^a$")',
            ~S'Regex.compile("^a$", "i")'
          ] do
        assert [_] = bare_dollar_regexes(flagged), flagged
      end

      for clean <- [
            ~S'~r/\Aa\z/',
            ~S'~r/^a\Z/',
            ~S'~r/^a$/m',
            ~S'~r/a\$/',
            ~S'~r/[$]/',
            ~S'"^a$"'
          ] do
        assert [] = bare_dollar_regexes(clean), clean
      end
    end
  end

  defp bare_dollar_regexes(source) do
    {_, found} =
      source
      |> Code.string_to_quoted!(emit_warnings: false)
      |> Macro.prewalk([], &collect_regex/2)

    for {line, body, mods} <- found,
        not String.contains?(mods, "m"),
        bare_dollar?(body, false),
        do: {line, body}
  end

  defp collect_regex({sigil, meta, [{:<<>>, _, parts}, mods]} = node, acc)
       when sigil in [:sigil_r, :sigil_R],
       do: {node, [{meta[:line], literal(parts), to_string(mods)} | acc]}

  defp collect_regex(
         {{:., _, [{:__aliases__, _, [:Regex]}, fun]}, meta, [body | rest]} = node,
         acc
       )
       when fun in [:compile, :compile!] and is_binary(body) do
    mods =
      case rest do
        [mods | _] when is_binary(mods) -> mods
        _ -> ""
      end

    {node, [{meta[:line], body, mods} | acc]}
  end

  defp collect_regex(node, acc), do: {node, acc}

  # an interpolation is opaque; only the literal text can carry a `$`
  defp literal(parts), do: Enum.map_join(parts, &if(is_binary(&1), do: &1, else: ""))

  # a `$` that is neither escaped nor inside a character class
  defp bare_dollar?(<<?\\, _, rest::binary>>, class?), do: bare_dollar?(rest, class?)
  defp bare_dollar?(<<?[, rest::binary>>, false), do: bare_dollar?(rest, true)
  defp bare_dollar?(<<?], rest::binary>>, true), do: bare_dollar?(rest, false)
  defp bare_dollar?(<<?$, _::binary>>, false), do: true
  defp bare_dollar?(<<_, rest::binary>>, class?), do: bare_dollar?(rest, class?)
  defp bare_dollar?(<<>>, _), do: false
end
