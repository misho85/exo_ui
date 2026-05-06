defmodule ExoUI.Components.StorybookPrimitiveUsageTest do
  use ExUnit.Case, async: true

  @root Path.expand("../../..", __DIR__)

  test "storybook workflow demos do not use deprecated input type select" do
    offenders =
      @root
      |> Path.join("storybook/lib/storybook/components/**/*.{ex,exs}")
      |> Path.wildcard()
      |> files_matching(~r/type="select"/)

    assert offenders == []
  end

  test "browser workflow tests and capture scripts drive ExoUI select instead of native selectOption" do
    offenders =
      [
        Path.join(@root, "test/browser/**/*.spec.js"),
        Path.join(@root, "scripts/capture_storybook_components.js")
      ]
      |> Enum.flat_map(&Path.wildcard/1)
      |> files_matching(~r/\.selectOption\(/)

    assert offenders == []
  end

  defp files_matching(files, pattern) do
    files
    |> Enum.filter(fn file ->
      Regex.match?(pattern, File.read!(file))
    end)
    |> Enum.map(&Path.relative_to(&1, @root))
    |> Enum.sort()
  end
end
