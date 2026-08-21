defmodule ExoUI.Components.IconTruthTest do
  @moduledoc """
  `data-size` na ikoni NE SMIJE da laze.

  Provjera velicina u vizuelnom prolazu cita bas taj atribut i poredi ga sa
  izmjerenom mjerom. Ako komponenta renderuje ikonu na podrazumijevanom `sm`, a
  onda joj CSS kontejnera zada 24px, atribut tvrdi jedno a ekran pokazuje drugo
  — i provjera postaje beskorisna tacno tamo gdje najvise treba.

  Zato komponente koje SAME renderuju ikonu moraju da zadaju `size=`, a ne da
  je naknadno rastezu CSS-om. (Dugme je izuzetak i to je zapisano uz njegovo
  pravilo: ono ne renderuje ikonu nego je prima od pozivaoca, pa mu je jedini
  alat CSS.)
  """
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "prazno stanje zada velicinu ikone, ne prepusta je CSS-u" do
    assigns = %{}
    html = rendered_to_string(~H|<.empty_state icon="package" title="Prazno" />|)
    assert html =~ ~r/data-exo="icon"[^>]*data-size="lg"|data-size="lg"[^>]*data-exo="icon"/
  end

  test "flash zada velicinu ikone" do
    assigns = %{f: %{"info" => "poruka"}}
    html = rendered_to_string(~H|<.flash kind={:info} flash={@f} />|)
    assert html =~ ~s(data-size="md")
  end

  test "kucica za potvrdu zada velicinu kvacice" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="checkbox" name="x" label="Da" />|)
    assert html =~ ~s(data-size="xs")
  end
end
