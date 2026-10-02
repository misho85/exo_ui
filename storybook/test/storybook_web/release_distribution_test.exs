defmodule ExoUI.Storybook.Web.ReleaseDistributionTest do
  @moduledoc """
  epmd and Erlang distribution listen on loopback only (KRF-493, KRF-509).

  Without the files in `storybook/rel/` the release listens on `0.0.0.0:4369` and
  `[::]:4369` (epmd) and on `0.0.0.0:<port>` (distribution). The container is on
  `dokploy-network`, which every project's containers on the box share, so only
  the cookie stood between them and the node. The pattern is three files and one
  Dockerfile line, and this test holds each of them.

  It is static because CI here builds no release that a check could boot. Where a
  CI step does build one, pogon's `scripts/release-dist-check.sh` boots it and
  judges every listener (Pogon › Tehnički standardi › Isporuka › Dokploy ›
  "Erlang distribucija i epmd samo na loopback-u"). On the box,
  `krafter-infra/scripts/audit-beam-dist.py` judges the running container.
  """
  use ExUnit.Case, async: true

  @root Path.expand("../../..", __DIR__)
  @rel Path.join(@root, "storybook/rel")
  @dockerfile Path.join(@root, "Dockerfile")

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
end
