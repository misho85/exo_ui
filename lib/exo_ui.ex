defmodule ExoUI do
  @moduledoc """
  ExoUI — Headless LiveView component library with default CSS theme.

  Components emit semantic HTML with `data-exo` attributes.
  Styling is done via CSS custom properties in a shipped theme file.
  """

  @version Mix.Project.config()[:version]

  @doc "Returns the current ExoUI version."
  def version, do: @version
end
