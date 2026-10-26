defmodule ExoUI.Storybook.Web.ReleaseDistributionTest do
  @moduledoc """
  epmd and Erlang distribution listen on loopback only (KRF-493, KRF-509).

  Without the files in `storybook/rel/` the release listens on `0.0.0.0:4369` and
  `[::]:4369` (epmd) and on `0.0.0.0:<port>` (distribution). The container is on
  `dokploy-network`, which every project's containers on the box share, so only
  the cookie stood between them and the node. The pattern is three files and one
  Dockerfile line, and this test holds each of them.

  These tests read the files. The CI step `release` (KRF-611) builds the release
  and `scripts/release-dist-check.sh` boots it and judges every listener (Pogon ›
  Tehnički standardi › Isporuka › Dokploy › "Erlang distribucija i epmd samo na
  loopback-u"). On the box, `krafter-infra/scripts/audit-beam-dist.py` judges the
  running container.

  That step is only worth something while it builds what Dokploy deploys, so the
  `describe` block below holds it to the builder stage of the `Dockerfile` (fleet
  pattern KRF-221, Pogon › … › "Paritet CI ↔ Dockerfile"): mix commands, apt
  packages, compiler image and `MIX_ENV`. Static: no Docker, no network.
  """
  use ExUnit.Case, async: true

  @root Path.expand("../../..", __DIR__)
  @rel Path.join(@root, "storybook/rel")
  @dockerfile Path.join(@root, "Dockerfile")
  @ci Path.join(@root, ".woodpecker/ci.yaml")

  defp code_lines(path) do
    path
    |> File.read!()
    |> String.split("\n")
    |> Enum.reject(&(String.trim(&1) == "" or String.starts_with?(String.trim(&1), "#")))
  end

  test "env.sh pins the node name and epmd to loopback, unconditionally" do
    env = code_lines(Path.join(@rel, "env.sh.eex"))

    # Unindented, so not inside an `if`, and literal, so no `${VAR:-…}` from the
    # Dokploy env or a Dockerfile `ENV` can put the listeners back on 0.0.0.0.
    assert "export RELEASE_DISTRIBUTION=name" in env
    assert "export ERL_EPMD_ADDRESS=127.0.0.1" in env

    # The hostname stays in the name part, because Oban takes `node()` as its
    # node name; the host part is the loopback address `rpc` reaches epmd on.
    assert Enum.any?(
             env,
             &String.match?(&1, ~r/^export RELEASE_NODE="<%= @release\.name %>-.+@127\.0\.0\.1"$/)
           ),
           "env.sh.eex must export RELEASE_NODE=\"<%= @release.name %>-<hostname>@127.0.0.1\""
  end

  test "vm.args (start) and remote.vm.args (rpc, remote) bind distribution to loopback" do
    for file <- ["vm.args.eex", "remote.vm.args.eex"] do
      assert "-kernel inet_dist_use_interface {127,0,0,1}" in code_lines(Path.join(@rel, file)),
             "#{file} must carry `-kernel inet_dist_use_interface {127,0,0,1}`"
    end
  end

  # CI and a local build see `rel/` in the checkout; the image sees only what it
  # copies. Without the copy `mix release` takes the default templates and
  # production listens on 0.0.0.0 (the RAP-99 trap).
  test "the builder stage copies rel/ before `mix release`" do
    lines = @dockerfile |> File.read!() |> String.split("\n") |> Enum.map(&String.trim/1)
    from = Enum.find_index(lines, &String.match?(&1, ~r/^FROM\s+\S+\s+AS\s+builder$/i))
    assert from, "no `FROM … AS builder` stage in Dockerfile"

    stage =
      lines |> Enum.drop(from + 1) |> Enum.take_while(&(not String.match?(&1, ~r/^FROM\s/i)))

    copied = Enum.find_index(stage, &(&1 == "COPY storybook/rel ./rel"))
    built = Enum.find_index(stage, &String.match?(&1, ~r/^RUN\s.*\bmix release$/))

    assert copied, "the builder stage does not run `COPY storybook/rel ./rel`"
    assert built && copied < built, "`COPY storybook/rel ./rel` must come before `mix release`"
  end

  describe "the CI step `release` builds what Dokploy deploys" do
    test "it runs every mix command of the builder stage" do
      from_dockerfile =
        stage("builder")
        |> run_commands()
        |> Enum.filter(&String.starts_with?(&1, "mix "))
        |> Enum.map(&String.replace(&1, ~r/\$\{?MIX_ENV\}?/, builder_mix_env()))

      # Pins (KRF-336): `mix local.rebar --force` is chained after `&&`, so a
      # parser that reads only the first piece of a RUN fails here instead of
      # quietly checking less.
      assert "mix release" in from_dockerfile, "the builder stage no longer runs `mix release`?"
      assert "mix local.rebar --force" in from_dockerfile, "the RUN parser lost a chained command"

      ci = step_commands("release")

      # The same command, or the same with added flags (`mix release --overwrite`).
      missing =
        Enum.reject(from_dockerfile, fn command ->
          Enum.any?(ci, &(&1 == command or String.starts_with?(&1, command <> " ")))
        end)

      assert missing == [],
             "the builder stage runs, and the CI step `release` does not (CI would build " <>
               "another artifact than the one Dokploy deploys):\n" <> Enum.join(missing, "\n")
    end

    # A KRF-452 cache mount (`RUN --mount=… sh scripts/mix-build-cache.sh restore …
    # && mix compile && sh scripts/mix-build-cache.sh save …`, not in this
    # Dockerfile today) keeps its `mix compile` under the check above, and the
    # script calls, which do not start with `mix `, are not compared: CI replays
    # the mix commands, not the cache plumbing. Held by a fixture.
    test "RUN flags and comment lines inside a continuation are not part of a command" do
      body =
        "RUN --mount=type=cache,id=c,target=/c sh scripts/mix-build-cache.sh restore /c app \\\n" <>
          "  # restore first\n  && mix compile\n"

      assert run_commands(body) == ["sh scripts/mix-build-cache.sh restore /c app", "mix compile"]
    end

    test "it installs the builder stage's apt packages" do
      packages = fn commands ->
        for command <- commands,
            String.starts_with?(command, "apt-get install "),
            package <- command |> String.split() |> Enum.drop(2),
            not String.starts_with?(package, "-"),
            do: package
      end

      from_dockerfile = packages.(run_commands(stage("builder")))

      assert "build-essential" in from_dockerfile,
             "the builder stage no longer installs build-essential?"

      missing = from_dockerfile -- packages.(step_commands("release"))

      assert missing == [],
             "the builder stage installs #{Enum.join(missing, ", ")}, the CI step `release` does not"
    end

    # A compiler-bound error must not show up for the first time on the deploy
    # host, so `test` (ExUnit) and the scheduled audit run on the same image too:
    # every Elixir image in every Woodpecker file is the builder's.
    test "every Elixir compile in CI runs on the builder stage's compiler" do
      image = builder_image()
      refute image =~ "$", "unresolved ARG in the builder image: #{image}"

      assert step("release") =~ ~r/^    image: #{Regex.escape(image)}$/m,
             "the Dockerfile builds on #{image}, the CI step `release` on another image"

      found =
        for file <- Path.wildcard(Path.join(@root, ".woodpecker/*.{yaml,yml}")),
            [found] <-
              Regex.scan(~r/\bimage: (\S*elixir\S*)/, File.read!(file), capture: :all_but_first),
            do: {Path.basename(file), found}

      assert {"ci.yaml", image} in found, "the CI step `test` does not run on #{image}?"

      others = for {file, other} <- found, other != image, do: "#{file}: #{other}"

      assert others == [],
             "the Dockerfile builds on #{image}, CI also on:\n" <> Enum.join(others, "\n")
    end

    test "it builds under the builder stage's MIX_ENV and boots the built release" do
      assert step("release") =~ ~r/^      MIX_ENV: #{builder_mix_env()}$/m,
             "the CI step `release` does not build under MIX_ENV=#{builder_mix_env()}"

      commands = step_commands("release")
      assert "./scripts/release-config-check.sh" in commands
      assert "./scripts/release-dist-check.sh" in commands
    end
  end

  # Everything between `FROM … AS <name>` and the next `FROM`.
  defp stage(name) do
    [_, rest] = String.split(File.read!(@dockerfile), ~r/^FROM .* AS #{name}$/m, parts: 2)
    [body | _] = String.split(rest, ~r/^FROM /m, parts: 2)
    body
  end

  defp builder_mix_env do
    [_, env] = Regex.run(~r/^ENV MIX_ENV="?([^"\s]+)"?$/m, stage("builder"))
    env
  end

  # `FROM ${BUILDER_IMAGE} AS builder` with the `ARG` defaults resolved.
  defp builder_image do
    text = File.read!(@dockerfile)

    args =
      for [_, k, v] <- Regex.scan(~r/^ARG (\w+)="?([^"\n]*?)"?$/m, text), into: %{}, do: {k, v}

    [_, from] = Regex.run(~r/^FROM (\S+) AS builder$/m, text)
    resolve(from, args)
  end

  defp resolve(value, args) do
    resolved = Regex.replace(~r/\$\{(\w+)\}/, value, fn whole, k -> Map.get(args, k, whole) end)
    if resolved == value, do: value, else: resolve(resolved, args)
  end

  # `a  &&  b` -> ["a", "b"], whitespace collapsed.
  defp split_and(line) do
    line |> String.split("&&") |> Enum.map(&(&1 |> String.split() |> Enum.join(" ")))
  end

  # The commands of a stage's RUN lines (KRF-336): comment lines go first (Docker
  # drops them inside a continuation, and kept they would cut the joined line),
  # then continuations are joined, then every RUN is split on `&&`. `RUN --mount=…`
  # flags tell BuildKit how to run the command and are not part of it.
  defp run_commands(body) do
    body
    |> String.split("\n")
    |> Enum.reject(&String.starts_with?(String.trim_leading(&1), "#"))
    |> Enum.join("\n")
    |> String.replace("\\\n", " ")
    |> String.split("\n")
    |> Enum.filter(&String.starts_with?(&1, "RUN "))
    |> Enum.map(&String.replace(&1, ~r/^RUN\s+(?:--\S+\s+)*/, ""))
    |> Enum.flat_map(&split_and/1)
  end

  # One step of `.woodpecker/ci.yaml`, from its `- name:` line to the next step.
  defp step(name) do
    [_, rest] = String.split(File.read!(@ci), ~r/^  - name: #{name}$/m, parts: 2)
    [body | _] = String.split(rest, ~r/^  - name: |^\S/m, parts: 2)
    body
  end

  # The step's one-line `commands:` items, without the `(cd storybook && …)` wrapper
  # and split on `&&` (KRF-336, as the fleet's parity tests read them). A block scalar
  # (`- |`) comes out as `|` and matches no command, so it fails the checks above
  # instead of hiding commands from them.
  defp step_commands(name) do
    [_, commands] = String.split(step(name), ~r/^    commands:$/m, parts: 2)

    ~r/^      - (.+)$/m
    |> Regex.scan(commands, capture: :all_but_first)
    |> List.flatten()
    |> Enum.map(&String.replace(&1, ~r/^\(cd storybook && (.*)\)$/, "\\1"))
    |> Enum.flat_map(&split_and/1)
  end
end
