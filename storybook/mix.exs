defmodule ExoUI.Storybook.MixProject do
  use Mix.Project

  def project do
    [
      app: :exo_ui_storybook,
      version: "0.1.0",
      elixir: "~> 1.19",
      start_permanent: Mix.env() == :prod,
      listeners: [Phoenix.CodeReloader],
      deps: deps(),
      aliases: aliases(),
      # `mix hex.audit` runs in CI. Every entry here is acknowledged by id,
      # with the reason, and drops out once it no longer matches the lock.
      hex: [
        # Bandit's HTTP/2 send deadlines restart on every WINDOW_UPDATE
        # (published 2026-10-14, every bandit >= 1.4.0, no fixed release).
        # The storybook never speaks HTTP/2: config/runtime.exs turns it off
        # and ExUnit holds that (http2_disabled_test.exs). Drop this entry
        # with the bandit release that fixes it.
        ignore_advisories: ["EEF-CVE-2026-105659"]
      ]
    ]
  end

  def application do
    [
      mod: {ExoUI.Storybook.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  defp deps do
    [
      {:exo_ui, path: ".."},
      {:phoenix, "~> 1.8.5"},
      {:phoenix_html, "~> 4.3"},
      {:phoenix_live_view, "~> 1.2"},
      {:phoenix_live_reload, "~> 1.6"},
      {:phoenix_storybook, "~> 1.5"},
      {:esbuild, "~> 0.10", runtime: false},
      {:jason, "~> 1.4"},
      {:bandit, "~> 1.10"}
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "assets.setup", "assets.build"],
      "assets.setup": ["esbuild.install --if-missing"],
      "assets.build": ["esbuild storybook"]
    ]
  end
end
