defmodule ExoUI do
  @external_resource readme = Path.join([__DIR__, "..", "README.md"])

  @moduledoc readme
             |> File.read!()
             |> String.split("<!-- MDOC -->")
             |> Enum.fetch!(1)

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
      import ExoUI.Utils, only: [classes: 1, maybe_add_class: 2]
    end
  end
end
