defmodule ExoUI.Storybook.Web.AssetWatcher do
  @moduledoc """
  Runs a Tailwind or esbuild profile as a dev-server watcher and logs an error
  when the binary stops (KRF-460, after STR-129 in struka).

  `Tailwind.install_and_run/2` and `Esbuild.install_and_run/2` return the
  binary's exit status instead of raising. `Phoenix.Endpoint.Watcher` only
  reacts to a raise, so a watcher whose binary dies ends as a normal task exit:
  the `:transient` child is not restarted and nothing reaches the log. In
  September 2026 macOS 27 killed the tailwind 4.1.12 standalone binary at every
  launch (exit 137), and the built CSS stayed at its last good build with no
  line anywhere saying so.

  A non-zero exit is now logged as an error that names the files that are no
  longer rebuilt and the command that reinstalls the binary. The watcher is
  still not restarted. A binary that cannot start fails the same way on every
  restart, so a loop would print the same error every two seconds, and several
  such watchers would exceed the endpoint supervisor's restart limit and take
  the dev server down with them.
  """

  require Logger

  @doc """
  Watcher entry point: `{ExoUI.Storybook.Web.AssetWatcher, :watch, [Tailwind, :profile, ~w(--watch)]}`.

  `tool` is `Tailwind` or `Esbuild` (anything with the same `install_and_run/2`,
  `config_for!/1`, `bin_path/0` and `configured_version/0`). `profile` and
  `args` are passed to `tool.install_and_run/2` unchanged.
  """
  @spec watch(module(), atom(), [String.t()]) :: :ok
  def watch(tool, profile, args) when is_atom(tool) and is_atom(profile) and is_list(args) do
    case tool.install_and_run(profile, args) do
      0 -> :ok
      status -> Logger.error(failure_message(tool, profile, args, status))
    end

    :ok
  end

  defp failure_message(tool, profile, args, status) do
    name = tool |> Module.split() |> List.last() |> String.downcase()

    [
      "#{name} watcher (profile #{inspect(profile)}) stopped with exit status #{status}. ",
      "Not rebuilt until the dev server restarts: #{Enum.join(outputs(tool, profile, args), ", ")}.",
      sigkill_hint(tool, status),
      "\nReinstall the configured #{name} #{tool.configured_version()} with `mix #{name}.install`. ",
      "If a fresh download dies the same way, the release binary itself is the problem (KRF-460)."
    ]
    |> IO.iodata_to_binary()
  end

  # The flag that names each tool's output: a file for tailwind, a directory or a
  # file for esbuild. Relative paths resolve against the profile's own `cd`.
  defp outputs(tool, profile, args) do
    config = tool.config_for!(profile)
    cd = config[:cd] || File.cwd!()

    for arg <- (config[:args] || []) ++ args,
        [_, path] <- [Regex.run(~r/^--(?:output|outdir|outfile)=(.+)\z/, arg)] do
      path |> Path.expand(cd) |> Path.relative_to_cwd()
    end
    |> case do
      [] -> ["(no --output/--outdir/--outfile in the profile)"]
      paths -> paths
    end
  end

  # 137 = 128 + SIGKILL. The macOS kernel kills a binary whose code signature it
  # rejects before it prints anything. `codesign -v` does not tell the two
  # apart: it calls tailwind 4.3.1 invalid too, and that one runs. Whether
  # `--help` exits 0 does.
  defp sigkill_hint(tool, 137) do
    if match?({:unix, :darwin}, :os.type()) do
      path = tool.bin_path()

      "\nExit 137 is SIGKILL. On macOS that is usually the kernel rejecting the binary's " <>
        "code signature: if `#{path} --help` is killed too, " <>
        "`codesign --force --sign - #{path}` re-signs it ad hoc."
    else
      "\nExit 137 is SIGKILL: the process was killed from outside."
    end
  end

  defp sigkill_hint(_tool, _status), do: ""
end
