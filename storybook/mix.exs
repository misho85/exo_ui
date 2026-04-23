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
      aliases: aliases()
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
      {:phoenix_storybook, "~> 1.0"},
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
