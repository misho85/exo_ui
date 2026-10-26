defmodule ExoUI.CiMixHomeTest do
  @moduledoc """
  No Woodpecker step mounts a volume at `/root/.mix` (KRF-382).

  Mix loads every archive under `~/.mix/archives` into the code path when it starts,
  and `mix local.hex --force` deletes `hex-*` and unzips the new copy in place
  (`Mix.Tasks.Archive.Install.install/3`, Elixir 1.19.5); `local.rebar --force`
  rewrites `rebar3` the same way. On a volume another step can mount, a `mix` that
  starts inside that window finds no Hex ("Mix requires the Hex package manager",
  KRF-377), and one already running loses a module it loads lazily ("module
  Hex.RemoteConverger is not available", KRF-382) — in whichever repo happens to run
  beside it. Every step runs `local.hex --force`, which downloads Hex every time, so
  the shared volume saved nothing; the container's own `/root/.mix` is private to the
  step. `/root/.hex` may stay shared: Hex checks every cached read against a checksum
  and fetches again on a mismatch.

  The guard holds the SHAPE of the config. Setting `MIX_HOME` or `MIX_ARCHIVES` would
  move the same directory onto whatever path it names, so those fail too.
  """
  use ExUnit.Case, async: true

  @woodpecker Path.expand("../../.woodpecker", __DIR__)

  test "no Woodpecker step shares a Mix home" do
    files = Path.wildcard(Path.join(@woodpecker, "*.{yaml,yml}"))

    lines =
      for file <- files,
          {line, number} <- file |> File.read!() |> String.split("\n") |> Enum.with_index(1),
          line = String.trim(line),
          not String.starts_with?(line, "#"),
          do: {"#{Path.basename(file)}:#{number}", line}

    # Read no file, or no step that installs Hex, and the guard is green over nothing.
    assert Enum.any?(lines, fn {_, line} -> line =~ "mix local.hex" end),
           "no `mix local.hex` in #{@woodpecker}/*.yaml — is the path right?"

    offending =
      for {where, line} <- lines,
          line =~ ~r{:/root/\.mix(?:[/:"']|$)} or line =~ ~r/\bMIX_(?:HOME|ARCHIVES)\b/,
          do: "#{where}: #{line}"

    assert offending == [],
           "a Mix home shared between steps (KRF-382):\n" <> Enum.join(offending, "\n")
  end
end
