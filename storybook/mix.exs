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
        # earmark is retired and carries a stored-XSS advisory (unescaped HTML
        # attribute values). phoenix_storybook 1.1 uses it only to render the
        # markdown in this repo's own stories, never visitor input. It goes
        # away with phoenix_storybook >= 1.2, which renders with mdex.
        ignore_advisories: ["EEF-CVE-2026-48591"],
        ignore_retirements: [earmark: "1.4.49"]
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
      {:phoenix_live_view, "~> 1.1.27"},
      {:phoenix_live_reload, "~> 1.6"},
      {:phoenix_storybook, "~> 1.1.0"},
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
