defmodule Mix.Tasks.Exo.Install do
  @shortdoc "Installs ExoUI into your Phoenix project"

  @moduledoc """
  Installs ExoUI into your Phoenix project.

      $ mix exo.install

  This task will:

    * Add CSS import to `assets/css/app.css`
    * Add JS hooks import to `assets/js/app.js`
    * Merge ExoUI hooks into your LiveSocket configuration
    * Add ExoUI imports to your `html_helpers` in `*_web.ex`

  The task is idempotent and can be safely run multiple times.
  """

  use Mix.Task

  @css_import ~s|@import "../../deps/exo_ui/priv/static/exo.css";|
  @js_hooks_import ~s|import { hooks as exoHooks } from "../../deps/exo_ui/assets/js/index.js"|
  @web_module_imports """
        import ExoUI.Utils, only: [classes: 1, maybe_add_class: 2]
        import ExoUI.Components.Core
        import ExoUI.Components.Form
        import ExoUI.Components.Overlay
        import ExoUI.Components.Feedback
        import ExoUI.Components.DataDisplay
        import ExoUI.Charts
        import ExoUI.Layouts\
  """

  @impl Mix.Task
  def run(_args) do
    if Mix.Project.umbrella?() do
      Mix.raise("mix exo.install must be run inside an umbrella child app, not the root")
    end

    web_module = detect_web_module()

    Mix.shell().info("\nInstalling ExoUI into #{web_module}...\n")

    inject_css()
    inject_js()
    inject_web_module(web_module)

    Mix.shell().info("""

    ExoUI installation complete!

    If you have existing hooks, merge them manually:

        let liveSocket = new LiveSocket("/live", Socket, {
          hooks: {...exoHooks, ...myOtherHooks},
          ...
        })
    """)
  end

  # ---------------------------------------------------------------------------
  # CSS injection
  # ---------------------------------------------------------------------------

  defp inject_css do
    path = "assets/css/app.css"

    case read_file(path) do
      {:ok, content} ->
        if String.contains?(content, @css_import) do
          already_exists(path, "ExoUI CSS import")
        else
          new_content = @css_import <> "\n" <> content
          File.write!(path, new_content)
          injected(path, "ExoUI CSS import")
        end

      {:error, reason} ->
        cannot_read(path, reason)
        print_manual_instruction(path, @css_import)
    end
  end

  # ---------------------------------------------------------------------------
  # JS injection
  # ---------------------------------------------------------------------------

  defp inject_js do
    path = "assets/js/app.js"

    case read_file(path) do
      {:ok, content} ->
        content
        |> inject_js_import(path)
        |> inject_js_hooks(path)

      {:error, reason} ->
        cannot_read(path, reason)

        print_manual_instruction(path, """
        #{@js_hooks_import}

        // Then add hooks to your LiveSocket opts:
        //   hooks: {...exoHooks}
        """)
    end
  end

  defp inject_js_import(content, path) do
    if String.contains?(content, @js_hooks_import) do
      already_exists(path, "ExoUI JS hooks import")
      content
    else
      # Insert the import after the last existing import statement
      new_content = insert_import(content)
      File.write!(path, new_content)
      injected(path, "ExoUI JS hooks import")
      new_content
    end
  end

  defp insert_import(content) do
    lines = String.split(content, "\n")

    # Find the index of the last import statement
    last_import_idx =
      lines
      |> Enum.with_index()
      |> Enum.filter(fn {line, _idx} -> String.match?(line, ~r/^\s*import\s/) end)
      |> List.last()

    case last_import_idx do
      {_line, idx} ->
        {before, rest} = Enum.split(lines, idx + 1)
        Enum.join(before ++ [@js_hooks_import] ++ rest, "\n")

      nil ->
        # No imports found, prepend
        @js_hooks_import <> "\n" <> content
    end
  end

  defp inject_js_hooks(content, path) do
    cond do
      # Already has exoHooks in the LiveSocket call
      content =~ ~r/new LiveSocket\([^)]*\{[^}]*exoHooks/ ->
        already_exists(path, "ExoUI hooks in LiveSocket")

      # Has hooks: { ... } already — merge our hooks in
      content =~ ~r/hooks:\s*\{/ ->
        new_content =
          Regex.replace(
            ~r/(hooks:\s*\{)/,
            content,
            "\\1...exoHooks, ",
            global: false
          )

        File.write!(path, new_content)
        injected(path, "ExoUI hooks merged into existing hooks object")

      # Has hooks: someVar already — warn user to merge manually
      content =~ ~r/hooks:\s*\w/ ->
        Mix.shell().info(
          "  #{IO.ANSI.yellow()}* existing hooks detected#{IO.ANSI.reset()} in #{path} — " <>
            "please merge manually: hooks: {...exoHooks, ...yourHooks}"
        )

      # Has new LiveSocket(...) but no hooks option — add it
      content =~ ~r/new LiveSocket\(/ ->
        new_content = add_hooks_to_live_socket(content)

        if new_content != content do
          File.write!(path, new_content)
          injected(path, "hooks: {...exoHooks} to LiveSocket options")
        else
          Mix.shell().info(
            "  #{IO.ANSI.yellow()}* could not auto-inject#{IO.ANSI.reset()} hooks into LiveSocket in #{path}\n" <>
              "    Please add manually: hooks: {...exoHooks}"
          )
        end

      true ->
        Mix.shell().info(
          "  #{IO.ANSI.yellow()}* LiveSocket not found#{IO.ANSI.reset()} in #{path}\n" <>
            "    Please add manually: hooks: {...exoHooks} to your LiveSocket options"
        )
    end
  end

  # Handles the common Phoenix pattern:
  #   let liveSocket = new LiveSocket("/live", Socket, {params: {...}})
  # Inserts hooks: {...exoHooks} as the first option.
  defp add_hooks_to_live_socket(content) do
    # Match: new LiveSocket("/live", Socket, {
    # and insert hooks as first key
    Regex.replace(
      ~r/(new LiveSocket\([^,]+,\s*\w+,\s*\{)(\s*)/,
      content,
      "\\1\\2hooks: {...exoHooks},\\2",
      global: false
    )
  end

  # ---------------------------------------------------------------------------
  # Web module injection
  # ---------------------------------------------------------------------------

  defp inject_web_module(web_module) do
    web_module_str = to_string(web_module) |> String.replace("Elixir.", "")
    snake = Macro.underscore(web_module_str)
    path = "lib/#{snake}.ex"

    case read_file(path) do
      {:ok, content} ->
        if String.contains?(content, "ExoUI.Components.Core") do
          already_exists(path, "ExoUI imports")
        else
          new_content = inject_into_html_helpers(content, path)

          case new_content do
            {:ok, updated} ->
              File.write!(path, updated)
              injected(path, "ExoUI imports into html_helpers")

            :error ->
              # Fallback: try to inject `use ExoUI` instead
              inject_use_exo_ui(content, path)
          end
        end

      {:error, reason} ->
        cannot_read(path, reason)

        print_manual_instruction(path, """
        # Add to your html_helpers/0 function, inside the quote block:
        #{@web_module_imports}
        """)
    end
  end

  defp inject_into_html_helpers(content, path) do
    # Look for the html_helpers function and inject after the quote do block
    # Pattern: defp html_helpers do\n    quote do\n
    cond do
      content =~ ~r/defp html_helpers do\s*\n\s*quote do/ ->
        new_content =
          Regex.replace(
            ~r/(defp html_helpers do\s*\n\s*quote do\n)/,
            content,
            "\\1#{@web_module_imports}\n",
            global: false
          )

        {:ok, new_content}

      # Phoenix 1.7+ may use `defp html_helpers do` with slightly different formatting
      content =~ ~r/defp html_helpers do/ ->
        # Try a more flexible match
        case :binary.split(content, "defp html_helpers do") do
          [before, rest] ->
            case :binary.split(rest, "quote do\n") do
              [between, after_quote] ->
                {:ok,
                 before <>
                   "defp html_helpers do" <>
                   between <> "quote do\n" <> @web_module_imports <> "\n" <> after_quote}

              _ ->
                Mix.shell().info(
                  "  #{IO.ANSI.yellow()}* could not find#{IO.ANSI.reset()} `quote do` block inside html_helpers in #{path}"
                )

                :error
            end

          _ ->
            :error
        end

      true ->
        Mix.shell().info(
          "  #{IO.ANSI.yellow()}* could not find#{IO.ANSI.reset()} `defp html_helpers do` in #{path}"
        )

        :error
    end
  end

  defp inject_use_exo_ui(_content, path) do
    # Fallback: suggest adding `use ExoUI` manually
    Mix.shell().info(
      "  #{IO.ANSI.yellow()}* unable to auto-inject#{IO.ANSI.reset()} ExoUI imports into #{path}\n" <>
        "    Add the following inside your html_helpers quote block:\n\n" <>
        "#{indent(@web_module_imports, 8)}\n\n" <>
        "    Or add `use ExoUI` to import all components at once."
    )
  end

  # ---------------------------------------------------------------------------
  # Web module detection
  # ---------------------------------------------------------------------------

  defp detect_web_module do
    app = Mix.Project.config()[:app]
    base = app |> to_string() |> Macro.camelize()

    web_module =
      if String.ends_with?(base, "Web") do
        base
      else
        "#{base}Web"
      end

    # Verify the web module file exists
    snake = Macro.underscore(web_module)
    path = "lib/#{snake}.ex"

    unless File.exists?(path) do
      Mix.shell().info(
        "  #{IO.ANSI.yellow()}* warning:#{IO.ANSI.reset()} expected #{path} but file not found.\n" <>
          "    Using #{web_module} as the web module name."
      )
    end

    web_module
  end

  # ---------------------------------------------------------------------------
  # Helpers
  # ---------------------------------------------------------------------------

  defp read_file(path) do
    case File.read(path) do
      {:ok, content} -> {:ok, content}
      {:error, :enoent} -> {:error, "file not found"}
      {:error, reason} -> {:error, to_string(reason)}
    end
  end

  defp injected(path, what) do
    Mix.shell().info("  #{IO.ANSI.green()}* injecting#{IO.ANSI.reset()} #{what} into #{path}")
  end

  defp already_exists(path, what) do
    Mix.shell().info(
      "  #{IO.ANSI.light_black()}* already present#{IO.ANSI.reset()} #{what} in #{path}"
    )
  end

  defp cannot_read(path, reason) do
    Mix.shell().info("  #{IO.ANSI.red()}* cannot read#{IO.ANSI.reset()} #{path}: #{reason}")
  end

  defp print_manual_instruction(path, code) do
    Mix.shell().info("""
        Please add the following to #{path} manually:

        #{indent(String.trim(code), 4)}
    """)
  end

  defp indent(string, spaces) do
    pad = String.duplicate(" ", spaces)

    string
    |> String.split("\n")
    |> Enum.map_join("\n", &(pad <> &1))
  end
end
