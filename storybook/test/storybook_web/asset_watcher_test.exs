defmodule ExoUI.Storybook.Web.AssetWatcherTest do
  @moduledoc """
  A dev watcher whose binary dies has to say so (KRF-460).

  macOS 27 killed tailwind 4.1.12 at every launch, `Tailwind.install_and_run/2`
  returned 137 as a plain value, and `Phoenix.Endpoint.Watcher` treated the
  normal return as success: the built CSS went stale with nothing in the log.
  """
  use ExUnit.Case, async: true

  import ExUnit.CaptureLog

  alias ExoUI.Storybook.Web.AssetWatcher

  defmodule Esbuild do
    def install_and_run(profile, args) do
      send(self(), {:ran, profile, args})
      Process.get(:exit_status)
    end

    defdelegate config_for!(profile), to: Elixir.Esbuild
    def bin_path, do: "/fake/_build/esbuild-darwin-arm64"
    def configured_version, do: "0.0.1"
  end

  describe "watch/3" do
    test "passes the profile and args through and logs nothing on exit 0" do
      Process.put(:exit_status, 0)

      log =
        capture_log(fn ->
          assert AssetWatcher.watch(Esbuild, :storybook, ~w(--watch)) == :ok
        end)

      assert_received {:ran, :storybook, ["--watch"]}
      refute log =~ "[error]"
    end

    test "esbuild names its output directory and how to reinstall it" do
      Process.put(:exit_status, 1)

      log =
        capture_log(fn ->
          AssetWatcher.watch(Esbuild, :storybook, ~w(--sourcemap=inline --watch))
        end)

      assert log =~ "esbuild watcher (profile :storybook) stopped with exit status 1"
      assert log =~ "priv/static/assets"
      assert log =~ "`mix esbuild.install`"
      refute log =~ "SIGKILL"
    end
  end

  describe "config/dev.exs" do
    # A watcher added the generator's way (`{Tailwind, :install_and_run, …}`)
    # would bring the silent failure back.
    test "every watcher goes through AssetWatcher with a profile that exists" do
      watchers =
        for {_app, entries} <-
              Path.expand("../../config/dev.exs", __DIR__)
              |> Config.Reader.read!(env: :dev, target: :host),
            {_key, opts} <- entries,
            Keyword.keyword?(opts),
            watcher <- Keyword.get(opts, :watchers, []),
            do: watcher

      assert watchers != []

      for {name, watcher} <- watchers do
        assert {AssetWatcher, :watch, [tool, profile, args]} = watcher,
               "#{name} watcher is #{inspect(watcher)}"

        assert tool == Elixir.Esbuild
        assert is_list(args)
        assert tool.config_for!(profile)
      end
    end
  end
end
