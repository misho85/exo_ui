defmodule ExoUI.Components.InputSizeTest do
  @moduledoc """
  `input/1` i `select/1` su bili jedini primitivi bez gustine.

  `button/1`, `badge/1`, `avatar/1` i `spinner/1` svi imaju `size` i svi ga
  emituju kao `data-size`, pa ga CSS hvata pravilom nulte specificnosti. Polje
  je bilo iskljucak sa jednom jedinom velicinom, pa je svaka aplikacija kojoj
  treba gusce polje morala da dopisuje svoje klase preko biblioteke — sto je
  tacno ono sto biblioteka treba da ukine.

  Ljestvica je namjerno ista kao kod `btn`: `sm` / `md` / `lg`, isti tokeni
  razmaka i teksta, da polje i dugme jedan pored drugog stoje u istom redu.
  """
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component, except: [form: 1]
  import ExoUI.Components

  defp sizes, do: ~w(sm md lg)

  describe "input/1 gustina" do
    test "podrazumijevano je md, i to se vidi u ispisu" do
      assigns = %{}
      html = rendered_to_string(~H|<.input name="a" />|)
      assert html =~ ~s(data-size="md")
    end

    test "svaka velicina stize do polja" do
      for size <- sizes() do
        assigns = %{size: size}
        html = rendered_to_string(~H|<.input name="a" size={@size} />|)
        assert html =~ ~s(data-size="#{size}"), "input size=#{size} nije emitovan"
      end
    end

    test "textarea nosi istu gustinu" do
      assigns = %{}
      html = rendered_to_string(~H|<.input type="textarea" name="a" size="lg" />|)
      assert html =~ ~s(data-size="lg")
    end

    test "okvir sa prefiksom nosi gustinu, jer okvir drzi visinu" do
      assigns = %{}

      html =
        rendered_to_string(~H|<.input name="a" size="sm">
  <:prefix>EUR</:prefix>
</.input>|)

      assert html =~ ~s(data-exo="input-frame")
      # i okvir i polje u njemu
      assert html =~ ~r/data-exo="input-frame"[^>]*data-size="sm"/
    end
  end

  describe "select/1 gustina" do
    test "okidac nosi data-size" do
      for size <- sizes() do
        assigns = %{size: size}

        html =
          rendered_to_string(~H|<.select id="s" name="s" options={[{"A", "a"}]} size={@size} />|)

        assert html =~ ~r/data-exo-select="trigger"[^>]*data-size="#{size}"/
      end
    end

    test "input type=select prosljedjuje gustinu nadole" do
      assigns = %{}

      html =
        rendered_to_string(~H|<.input type="select" name="s" options={[{"A", "a"}]} size="lg" />|)

      assert html =~ ~r/data-exo-select="trigger"[^>]*data-size="lg"/
    end
  end

  describe "prefiks i sufiks su slotovi, ne stringovi" do
    # Kao string su primali samo tekst. Polje za lozinku sa dugmetom „prikazi"
    # je zbog toga moralo da se gradi rucno mimo biblioteke.
    test "sufiks prima oznake, ne samo tekst" do
      assigns = %{}

      html =
        rendered_to_string(~H|<.input name="p" type="password">
  <:suffix><button type="button" data-toggle>oko</button></:suffix>
</.input>|)

      assert html =~ ~s(data-exo="input-suffix")
      assert html =~ "<button"
      assert html =~ "data-toggle"
    end

    test "prazan slot NE pravi okvir" do
      # `present?([])` je `true` (prazna lista nije ni nil ni ""), pa bi
      # naivna provjera dala okvir svakom polju — i dvostruku ivicu.
      assigns = %{}
      html = rendered_to_string(~H|<.input name="a" />|)
      refute html =~ ~s(data-exo="input-frame")
      refute html =~ "data-adorned"
    end
  end

  describe "obavezno polje" do
    test "natpis dobija zvjezdicu kad je polje obavezno" do
      assigns = %{}
      html = rendered_to_string(~H|<.input name="a" label="Ime" required />|)
      assert html =~ ~s(data-exo="label-required")
    end

    test "bez `required` nema zvjezdice" do
      assigns = %{}
      html = rendered_to_string(~H|<.input name="a" label="Ime" />|)
      refute html =~ ~s(data-exo="label-required")
    end

    test "zvjezdica je skrivena od citaca ekrana — `required` je vec objavljen" do
      assigns = %{}
      html = rendered_to_string(~H|<.input name="a" label="Ime" required />|)
      assert html =~ ~r/data-exo="label-required" aria-hidden="true"/
    end

    test "select takodje oznacava obavezno polje" do
      assigns = %{}

      html =
        rendered_to_string(
          ~H|<.input type="select" name="s" label="Status" options={[{"A", "a"}]} required />|
        )

      assert html =~ ~s(data-exo="label-required")
    end
  end
end
