defmodule ExoUI.BuiltCssTest do
  @moduledoc """
  `priv/static/exo.css` je GRADJEN fajl, a aplikacije uvoze BAS NJEGA — ne
  izvore u `assets/css/src/`. Izmjena izvora bez `bun run build:all` je zato
  nevidljiva: kod se ponasa kako treba, CSS se ne mijenja, i trazi se greska
  na pogresnom mjestu.

  Desilo se 2026-08-21: `data-size` skala i `line-height` za `input` su bili
  napisani, komitovani i pusteni, a mjerenje u brauzeru je i dalje pokazivalo
  staro stanje — jer bundle nije bio pregradjen.
  """
  use ExUnit.Case, async: true

  @built "priv/static/exo.css"

  defp mtime(path) do
    File.stat!(path, time: :posix).mtime
  end

  defp sources do
    Path.wildcard("assets/css/**/*.css")
  end

  test "gradjeni bundle nije stariji od nijednog izvora" do
    built = mtime(@built)

    noviji =
      sources()
      |> Enum.filter(&(mtime(&1) > built))
      |> Enum.sort()

    assert noviji == [],
           """
           `#{@built}` je stariji od izvora koji su se u medjuvremenu mijenjali:

           #{Enum.map_join(noviji, "\n", &"  - #{&1}")}

           Pokreni:  bun run build:all
           """
  end

  test "bundle sadrzi ono sto izvori tvrde — provjera na dva svjeza pravila" do
    css = File.read!(@built)

    # Minifikator skida navodnike sa vrijednosti atributa, pa se trazi oba
    # oblika — inace provjera prolazi lazno.
    for marker <- ["data-size=sm", "data-size=md", "data-size=lg", "label-required"] do
      assert String.contains?(css, marker) or String.contains?(css, ~s("#{marker}")),
             "bundle ne sadrzi `#{marker}` — pregradi ga sa `bun run build:all`"
    end
  end
end
