defmodule Mix.Tasks.Exo.InstallTest do
  use ExUnit.Case, async: false

  import ExUnit.CaptureIO

  @css_import ~s|@import "../../deps/exo_ui/priv/static/exo.css";|
  @js_import ~s|import { hooks as exoHooks } from "../../deps/exo_ui/assets/js/index.js"|
  @web_use "use ExoUI, core_components: false"

  setup do
    tmp_dir = Path.join(System.tmp_dir!(), "exo_install_#{System.unique_integer([:positive])}")
    File.rm_rf!(tmp_dir)
    File.mkdir_p!(tmp_dir)

    on_exit(fn -> File.rm_rf!(tmp_dir) end)

    %{tmp_dir: tmp_dir}
  end

  test "installs into a standard Phoenix-like project", %{tmp_dir: tmp_dir} do
    write_project!(tmp_dir)

    run_install!(tmp_dir)

    assert File.read!(Path.join(tmp_dir, "assets/css/app.css")) =~ @css_import

    js = File.read!(Path.join(tmp_dir, "assets/js/app.js"))
    assert js =~ @js_import
    assert js =~ "hooks: {...exoHooks},"

    web = File.read!(Path.join(tmp_dir, "lib/demo_web.ex"))
    assert web =~ @web_use
    refute web =~ "import ExoUI.Components.Core"
  end

  test "running twice stays idempotent", %{tmp_dir: tmp_dir} do
    write_project!(tmp_dir)

    run_install!(tmp_dir)
    run_install!(tmp_dir)

    assert occurrences(File.read!(Path.join(tmp_dir, "assets/css/app.css")), @css_import) == 1

    js = File.read!(Path.join(tmp_dir, "assets/js/app.js"))
    assert occurrences(js, @js_import) == 1
    assert occurrences(js, "hooks: {...exoHooks},") == 1

    web = File.read!(Path.join(tmp_dir, "lib/demo_web.ex"))
    assert occurrences(web, @web_use) == 1
  end

  test "merges into an existing hooks object", %{tmp_dir: tmp_dir} do
    write_project!(tmp_dir,
      app_js: """
      import "phoenix_html"
      import { Socket } from "phoenix"
      import { LiveSocket } from "phoenix_live_view"

      const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
      const Hooks = { ExistingHook }

      const liveSocket = new LiveSocket("/live", Socket, {
        hooks: { ExistingHook },
        params: { _csrf_token: csrfToken }
      })
      """
    )

    run_install!(tmp_dir)

    js = File.read!(Path.join(tmp_dir, "assets/js/app.js"))
    assert js =~ "hooks: {...exoHooks,  ExistingHook },"
  end

  test "does not replace legacy web imports with duplicate use", %{tmp_dir: tmp_dir} do
    write_project!(tmp_dir,
      web_ex: """
      defmodule DemoWeb do
        def html do
          quote do
            unquote(html_helpers())
          end
        end

        defp html_helpers do
          quote do
            import ExoUI.Utils, only: [classes: 1, maybe_add_class: 2]
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
      """
    )

    run_install!(tmp_dir)

    web = File.read!(Path.join(tmp_dir, "lib/demo_web.ex"))
    assert occurrences(web, "import ExoUI.Components.Core") == 1
    refute web =~ @web_use
  end

  defp run_install!(tmp_dir) do
    capture_io(fn ->
      Mix.Project.in_project(:demo, tmp_dir, fn _module ->
        Mix.Task.reenable("exo.install")
        Mix.Tasks.Exo.Install.run([])
      end)
    end)
  end

  defp write_project!(tmp_dir, overrides \\ []) do
    File.mkdir_p!(Path.join(tmp_dir, "assets/css"))
    File.mkdir_p!(Path.join(tmp_dir, "assets/js"))
    File.mkdir_p!(Path.join(tmp_dir, "lib"))

    files = %{
      "mix.exs" => mix_exs_fixture(),
      "assets/css/app.css" => "/* app styles */\n",
      "assets/js/app.js" => app_js_fixture(),
      "lib/demo_web.ex" => web_ex_fixture()
    }

    files
    |> Map.merge(override_files(overrides))
    |> Enum.each(fn {path, content} ->
      File.write!(Path.join(tmp_dir, path), content)
    end)
  end

  defp override_files(overrides) do
    Map.new(overrides, fn
      {:app_js, content} -> {"assets/js/app.js", content}
      {:web_ex, content} -> {"lib/demo_web.ex", content}
      {:app_css, content} -> {"assets/css/app.css", content}
      {path, content} when is_binary(path) -> {path, content}
    end)
  end

  defp mix_exs_fixture do
    """
    defmodule Demo.MixProject do
      use Mix.Project

      def project do
        [
          app: :demo,
          version: "0.1.0",
          elixir: "~> 1.17",
          start_permanent: Mix.env() == :prod,
          deps: []
        ]
      end

      def application do
        [extra_applications: [:logger]]
      end
    end
    """
  end

  defp app_js_fixture do
    """
    import "phoenix_html"
    import { Socket } from "phoenix"
    import { LiveSocket } from "phoenix_live_view"

    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")

    const liveSocket = new LiveSocket("/live", Socket, {
      params: { _csrf_token: csrfToken }
    })
    """
  end

  defp web_ex_fixture do
    """
    defmodule DemoWeb do
      def html do
        quote do
          unquote(html_helpers())
        end
      end

      defp html_helpers do
        quote do
          use Phoenix.HTML
          import DemoWeb.CoreComponents
          alias Phoenix.LiveView.JS
          unquote(verified_routes())
        end
      end

      defp verified_routes do
        quote do
        end
      end
    end
    """
  end

  defp occurrences(content, needle) do
    content
    |> String.split(needle)
    |> length()
    |> Kernel.-(1)
  end
end
