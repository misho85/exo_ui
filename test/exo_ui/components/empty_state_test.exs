defmodule ExoUI.Components.EmptyStateTest do
  @moduledoc """
  Prazno stanje je najcesce JEDINI sadrzaj na ekranu. Zato mu velicina ikone
  NE SMIJE da zavisi od domacinovog Tailwind-a: `class="size-8"` na ikoni je
  radio samo ako domacin ima Tailwind i ako je bas ta klasa ispala u njegov
  izlaz. Sada velicinu zada CSS biblioteke.
  """
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "ikona ide u svoj omot, bez Tailwind klase velicine" do
    assigns = %{}
    html = rendered_to_string(~H|<.empty_state icon="package" title="Nema ničega" />|)

    assert html =~ ~s(data-exo="empty-state-icon")
    refute html =~ "size-8"
  end

  test "omot ikone je skriven od citaca ekrana — ikona nije sadrzaj" do
    assigns = %{}
    html = rendered_to_string(~H|<.empty_state icon="package" title="Nema ničega" />|)
    assert html =~ ~r/data-exo="empty-state-icon" aria-hidden="true"/
  end

  test "bez ikone nema ni omota" do
    assigns = %{}
    html = rendered_to_string(~H|<.empty_state title="Nema ničega" />|)
    refute html =~ ~s(data-exo="empty-state-icon")
  end

  test "podnaslov i akcija se crtaju samo kad postoje" do
    assigns = %{}
    bare = rendered_to_string(~H|<.empty_state title="Prazno" />|)
    refute bare =~ ~s(data-exo="empty-state-subtitle")
    refute bare =~ ~s(data-exo="empty-state-action")

    full =
      rendered_to_string(~H|<.empty_state title="Prazno" subtitle="Dodaj prvi">
  <:action><button>Dodaj</button></:action>
</.empty_state>|)

    assert full =~ ~s(data-exo="empty-state-subtitle")
    assert full =~ ~s(data-exo="empty-state-action")
    assert full =~ "Dodaj prvi"
  end
end
