defmodule ExoUI.MixProject do
  use Mix.Project

  @version "0.1.0"
  @source_url "https://github.com/misho85/exo_ui"

  def project do
    [
      app: :exo_ui,
      version: @version,
      elixir: "~> 1.19",
      elixirc_paths: elixirc_paths(Mix.env()),
      deps: deps(),
      name: "ExoUI",
      description: "Headless LiveView component library with default CSS theme",
      source_url: @source_url,
      docs: docs()
    ]
  end

  def application do
    [extra_applications: [:logger]]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:phoenix, "~> 1.8"},
      {:phoenix_html, "~> 4.3"},
      {:phoenix_live_view, "~> 1.1"},
      {:gettext, "~> 1.0", optional: true},
      {:floki, "~> 0.37", only: :test},
      {:jason, "~> 1.4", only: :test},
      {:ex_doc, "~> 0.40", only: :dev, runtime: false}
    ]
  end

  defp docs do
    [main: "ExoUI", extras: ["README.md", "CHANGELOG.md"]]
  end
end
