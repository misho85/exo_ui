defmodule ExoUI do
  @external_resource readme = Path.join([__DIR__, "..", "README.md"])

  @moduledoc readme
             |> File.read!()
             |> String.split("<!-- MDOC -->")
             |> Enum.fetch!(1)

  @version Mix.Project.config()[:version]

  @doc "Returns the current ExoUI version."
  def version, do: @version

  @doc """
  Imports all ExoUI components into your module.

  ## Options

    * `core_components: false` — skips importing components that clash with
      Phoenix's default CoreComponents (`button`, `form`, `input`, `header`,
      `table`, `flash`, `flash_group`). Use this when your app already defines
      these in its own CoreComponents module.

  ## Examples

      # Import everything
      use ExoUI

      # Skip components that clash with CoreComponents
      use ExoUI, core_components: false

  """
  defmacro __using__(opts) do
    skip_core = Keyword.get(opts, :core_components, true) == false

    core_import =
      if skip_core do
        quote do
          import ExoUI.Components.Core, except: [button: 1, header: 1]
        end
      else
        quote do
          import ExoUI.Components.Core
        end
      end

    form_import =
      if skip_core do
        quote do
          import ExoUI.Components.Form, except: [form: 1, input: 1]
        end
      else
        quote do
          import ExoUI.Components.Form
        end
      end

    feedback_import =
      if skip_core do
        quote do
          import ExoUI.Components.Feedback, except: [flash: 1, flash_group: 1]
        end
      else
        quote do
          import ExoUI.Components.Feedback
        end
      end

    data_display_import =
      if skip_core do
        quote do
          import ExoUI.Components.DataDisplay, except: [table: 1]
        end
      else
        quote do
          import ExoUI.Components.DataDisplay
        end
      end

    quote do
      unquote(core_import)
      unquote(form_import)
      import ExoUI.Components.Overlay
      unquote(feedback_import)
      unquote(data_display_import)
      import ExoUI.Charts
      import ExoUI.Layouts
      import ExoUI.Utils, only: [classes: 1, maybe_add_class: 2]
    end
  end
end
