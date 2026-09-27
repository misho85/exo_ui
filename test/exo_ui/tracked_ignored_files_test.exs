defmodule ExoUI.TrackedIgnoredFilesTest do
  @moduledoc """
  KRF-383, the fleet pass after dinaric-hub's KRF-281. A `.gitignore` rule does
  not apply to a file git already tracks, so a file can sit in the repository
  under a rule that says it never should, and nothing complains.

  Here it was `.claude/settings.local.json`, one machine's Claude Code
  permission list, which only that machine's global excludes kept out. It
  left the index with `git rm --cached`, and `.gitignore` now names it, as
  krafter, re24 and pogon do.

  Generated or local files leave the index with `git rm --cached`; a file
  tracked on purpose gets a `!` exception after the rule that catches it.

  Only the repository's own `.gitignore` files are read
  (`--exclude-per-directory`), not the machine's global excludes or
  `.git/info/exclude`, so the answer is the same on every checkout and in CI.
  """
  use ExUnit.Case, async: true

  @root Path.expand("../..", __DIR__)

  # Discover the repository from @root, whatever a hook or a linked worktree exported.
  @git_env for v <- ~w(GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR), do: {v, nil}

  test "no tracked file is matched by a .gitignore rule" do
    tracked = git!(["ls-files", "--cached", "-z"])

    # Without an index to read, the check below passes on nothing.
    assert "mix.exs" in tracked, "git ls-files in #{@root} does not list mix.exs"

    ignored =
      git!(["ls-files", "--cached", "--ignored", "--exclude-per-directory=.gitignore", "-z"])

    assert ignored == [],
           "tracked, but a .gitignore says they should not be (`git check-ignore -v --no-index <file>` " <>
             "names the rule). Generated or local: `git rm --cached <file>`. Tracked on purpose: " <>
             "a `!` exception after that rule.\n  " <> Enum.join(ignored, "\n  ")
  end

  defp git!(args) do
    {out, status} = System.cmd("git", args, cd: @root, env: @git_env, stderr_to_stdout: true)
    assert status == 0, "git #{Enum.join(args, " ")} exited #{status} in #{@root}:\n#{out}"
    String.split(out, <<0>>, trim: true)
  end
end
