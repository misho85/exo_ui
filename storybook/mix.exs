defmodule ExoUI.Storybook.MixProject do
  use Mix.Project

  def project do
    [
      app: :exo_ui_storybook,
      version: "0.1.0",
      elixir: "~> 1.18",
      start_permanent: Mix.env() == :prod,
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
      {:phoenix, "~> 1.8"},
      {:phoenix_html, "~> 4.1"},
      {:phoenix_live_view, "~> 1.1"},
      {:phoenix_live_reload, "~> 1.5", only: :dev},
      {:phoenix_storybook, "~> 1.0"},
      {:esbuild, "~> 0.9", only: :dev},
      {:jason, "~> 1.4"},
      {:bandit, "~> 1.6"}
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
