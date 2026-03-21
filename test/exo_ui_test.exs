defmodule ExoUITest do
  use ExUnit.Case

  test "version returns string" do
    assert is_binary(ExoUI.version())
  end
end
