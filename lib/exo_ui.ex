defmodule ExoUI do
  @moduledoc """
  ExoUI — Headless LiveView component library with default CSS theme.

  Components emit semantic HTML with `data-exo` attributes.
  Styling is done via CSS custom properties in a shipped theme file.

  ## Usage

      use ExoUI

  This imports `ExoUI.Components`, `ExoUI.Charts`, and `ExoUI.Layouts`
  into your module so all components are available in HEEx templates.
  """

  @version Mix.Project.config()[:version]

  @doc "Returns the current ExoUI version."
  def version, do: @version

  @doc false
  defmacro __using__(_opts) do
    quote do
      import ExoUI.Components.Core
      import ExoUI.Components.Form
      import ExoUI.Components.Overlay
      import ExoUI.Components.Feedback
      import ExoUI.Components.DataDisplay
      import ExoUI.Charts
      import ExoUI.Layouts
    end
  end
end
