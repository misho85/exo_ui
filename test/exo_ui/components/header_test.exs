defmodule ExoUI.Components.HeaderTest do
  @moduledoc """
  `header/1` je do 2026-08-21 bio nedovrsen na dva mjesta koja su aplikaciju
  tjerala da napise svoje zaglavlje:

  1. **Nije imao crtu ispod.** Bez nje naslov lebdi i stranica se cita kao jedna
     nerazdvojena kolona. trg24 je mjerio (TRG-102): od 41 ekrana 38 je crtu
     imalo a tri nisu — i ta tri su izgledala kao kvar, ne kao varijanta.
  2. **Nije imao gdje da stane dugme „nazad".** Svaka forma ga ima lijevo od
     naslova, pa se cijelo zaglavlje prepisivalo rucno samo zbog toga.
  """
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "crta ide sama od sebe" do
    assigns = %{}
    html = rendered_to_string(~H|<.header>Proizvodi</.header>|)
    assert html =~ ~s(data-separator)
  end

  test "`separator={false}` je za zaglavlje unutar kartice" do
    assigns = %{}
    html = rendered_to_string(~H|<.header separator={false}>Proizvodi</.header>|)
    refute html =~ ~s(data-separator)
  end

  test "`leading` stoji lijevo od naslova, u istoj cjelini" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.header>
  <:leading><a href="/">nazad</a></:leading>
  Novi proizvod
</.header>|)

    assert html =~ ~s(data-exo="header-leading")
    # naslov i `leading` dijele omot, da se pomjeraju zajedno
    assert html =~ ~r/data-exo="header-lead"[\s\S]*header-leading[\s\S]*header-title/
  end

  test "bez `leading` nema praznog omota" do
    assigns = %{}
    html = rendered_to_string(~H|<.header>Proizvodi</.header>|)
    refute html =~ ~s(data-exo="header-leading")
  end

  test "podnaslov i akcije se crtaju samo kad postoje" do
    assigns = %{}
    bare = rendered_to_string(~H|<.header>Proizvodi</.header>|)
    refute bare =~ ~s(data-exo="header-subtitle")
    refute bare =~ ~s(data-exo="header-actions")

    full =
      rendered_to_string(~H|<.header>
  Proizvodi
  <:subtitle>42 stavke</:subtitle>
  <:actions><button>Novi</button></:actions>
</.header>|)

    assert full =~ "42 stavke"
    assert full =~ ~s(data-exo="header-actions")
  end
end
