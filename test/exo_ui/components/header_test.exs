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

  describe "radnje (TRG-742)" do
    test "glavna radnja je jedno puno dugme sa prečicom, a ekran sa njom dobija hook" do
      assigns = %{}

      html =
        rendered_to_string(~H|<.header>
  Narudžbina
  <:primary phx-click="ship" icon="truck">Pošalji</:primary>
</.header>|)

      assert html =~ ~s(phx-hook="ExoHeader")
      assert html =~ ~s(id="page-header")

      assert html =~
               ~r/data-variant="primary"[^>]*data-exo-header="primary"|data-exo-header="primary"[^>]*data-variant="primary"/

      assert html =~ ~s(aria-keyshortcuts="Meta+Enter Control+Enter")
      assert html =~ ~s(phx-click="ship")
      assert html =~ "Pošalji"
    end

    test "dvije glavne radnje istovremeno obaraju crtanje" do
      assigns = %{}

      assert_raise ArgumentError, ~r/at most one primary/, fn ->
        rendered_to_string(~H|<.header>
  Narudžbina
  <:primary phx-click="a">A</:primary>
  <:primary phx-click="b">B</:primary>
</.header>|)
      end
    end

    test "glavna radnja pod uslovom koji ne važi se ne broji" do
      assigns = %{paid?: true}

      html =
        rendered_to_string(~H|<.header>
  Narudžbina
  <:primary :if={!@paid?} phx-click="pay">Uplata primljena</:primary>
  <:primary :if={@paid?} phx-click="ship">Pošalji</:primary>
</.header>|)

      assert html =~ "Pošalji"
      refute html =~ "Uplata primljena"
    end

    test "glavna i sekundarna radnja ne primaju `variant` ni `danger`" do
      assigns = %{}

      assert_raise ArgumentError, ~r/destructive action goes to `more`/, fn ->
        rendered_to_string(~H|<.header>
  Narudžbina
  <:secondary variant="danger" phx-click="cancel">Otkaži</:secondary>
</.header>|)
      end

      assert_raise ArgumentError, ~r/destructive action goes to `more`/, fn ->
        rendered_to_string(~H|<.header>
  Narudžbina
  <:primary danger phx-click="cancel">Otkaži</:primary>
</.header>|)
      end
    end

    test "sekundarne radnje su dugmad sa okvirom, sa svojim atributima" do
      assigns = %{}

      html =
        rendered_to_string(~H|<.header>
  Narudžbine
  <:secondary href="/orders/export" icon="download" data-action="export">Izvezi</:secondary>
</.header>|)

      assert html =~ ~s(data-variant="outline")
      assert html =~ ~s(href="/orders/export")
      assert html =~ ~s(data-action="export")
      # bez glavne radnje i strelica nema prečica, pa ni hook-a ni id-a
      refute html =~ "ExoHeader"
      refute html =~ ~s(id="page-header")
    end

    test "„Još radnji\" je meni: opasna stavka je crvena, dugme ga zatvara, link vodi" do
      assigns = %{}

      html =
        rendered_to_string(~H|<.header id="order" more_label="Još radnji">
  Narudžbina
  <:more navigate="/orders/1/edit">Izmijeni</:more>
  <:more danger phx-click="open-cancel-modal" data-action="open-cancel-modal">
    Otkaži narudžbinu
  </:more>
</.header>|)

      assert html =~ "Još radnji"
      assert html =~ ~s(id="order-more-menu")
      assert html =~ ~s(role="menu")
      assert html =~ ~s(phx-hook="ExoDropdownMenu")

      assert html =~
               ~r/<a[^>]*href="\/orders\/1\/edit"[^>]*>|<a[^>]*role="menuitem"[^>]*href="\/orders\/1\/edit"/

      [cancel] = Regex.run(~r/<button[^>]*open-cancel-modal[^>]*>/, html)
      assert cancel =~ ~s(data-variant="danger")
      assert cancel =~ ~s(role="menuitem")
      assert cancel =~ ~s(popovertarget="order-more")
      assert cancel =~ ~s(popovertargetaction="hide")
      refute cancel =~ "danger=\""
    end

    test "strelice vode na susjedne zapise, a nepostojeći je onemogućen" do
      assigns = %{}

      html =
        rendered_to_string(
          ~H|<.header prev="/orders/2" prev_label="Prethodna" next_label="Sljedeća">
  Narudžbina
</.header>|
        )

      assert html =~ ~s(phx-hook="ExoHeader")
      assert html =~ ~s(data-exo="header-pager")
      [prev] = Regex.run(~r/<a[^>]*data-exo-header="prev"[^>]*>/, html)
      assert prev =~ ~s(href="/orders/2")
      assert prev =~ ~s(aria-label="Prethodna")
      assert prev =~ ~s|title="Prethodna (K)"|
      [next] = Regex.run(~r/<button[^>]*data-exo-header="next"[^>]*>/, html)
      assert next =~ "disabled"
      assert next =~ ~s|title="Sljedeća (J)"|
    end

    test "bedževi stoje uz naslov, van `<h1>`" do
      assigns = %{}

      html =
        rendered_to_string(~H|<.header>
  #1001
  <:badges><span>Plaćeno</span></:badges>
</.header>|)

      assert html =~ ~r/<h1[^>]*>\s*#1001\s*<\/h1>\s*<div data-exo="header-badges">/
    end
  end
end
