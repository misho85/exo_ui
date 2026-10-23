defmodule ExoUI.BuiltCssTest do
  @moduledoc """
  Checks contracts in the CSS shipped to consumers. Exact source/bundle
  parity is verified by `bun run check:css`, independently of file timestamps.
  """
  use ExUnit.Case, async: true

  @built "priv/static/exo.css"

  test "bundle includes component sizes and required labels" do
    css = File.read!(@built)

    # Minifikator skida navodnike sa vrijednosti atributa, pa se trazi oba
    # oblika — inace provjera prolazi lazno.
    for marker <- ["data-size=sm", "data-size=md", "data-size=lg", "label-required"] do
      assert String.contains?(css, marker) or String.contains?(css, ~s("#{marker}")),
             "bundle ne sadrzi `#{marker}` — pregradi ga sa `bun run build:all`"
    end
  end

  test "table wrapper contains its absolutely positioned descendants" do
    css = File.read!(@built)

    # Skriveno zaglavlje kolone akcija je `position: absolute`; bez `relative`
    # na omotaču izlazi iz njegovog skrola i širi celu stranu na telefonu.
    [_, rule] = Regex.run(~r/\[data-exo="?table-wrapper"?\]\)\{([^}]*)\}/, css)

    assert rule =~ "position:relative"
    assert rule =~ "overflow-x:auto"
  end

  test "a badge never wraps its label" do
    css = File.read!(@built)

    # Dvije riječi u uskoj koloni tabele („Na čekanju") lomile su se u dva reda
    # unutar pilule (SPO-1051).
    [_, rule] = Regex.run(~r/\[data-exo="?badge"?\]\)\{([^}]*)\}/, css)

    assert rule =~ "white-space:nowrap"
  end
end
