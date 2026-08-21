defmodule ExoUI.Components.FlashIconTest do
  @moduledoc """
  Flash se cita na letimican pogled, cesto dok je oko negdje drugo na strani.
  Ikona je ono sto nosi VRSTU poruke kad boja ne moze — daltonistima, i u temi
  u kojoj su „uspjeh" i „upozorenje" blizu. Zato je podrazumijevana.
  """
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  defp flash_html(kind, opts \\ []) do
    assigns = %{k: kind, f: %{to_string(kind) => "poruka"}, o: opts}

    rendered_to_string(~H|<.flash kind={@k} flash={@f} {@o} />|)
  end

  test "svaka vrsta dobija svoju ikonu" do
    for {kind, name} <- [
          info: "info",
          success: "circle-check",
          warning: "triangle-alert",
          error: "circle-alert"
        ] do
      html = flash_html(kind)
      assert html =~ ~s(data-exo="flash-icon"), "#{kind} nema ikonu"
      # ExoUI ubacuje inline <svg>, pa se ime ne vidi u ispisu — tvrdi se da
      # ikona NIJE zamjenski upitnik, sto bi bio slucaj za nepostojece ime.
      refute html =~ "data-missing-icon", "#{kind} -> `#{name}` ne postoji u Lucide"
    end
  end

  test "`icon={nil}` je izricito bez ikone" do
    refute flash_html(:info, icon: nil) =~ ~s(data-exo="flash-icon")
  end

  test "pozivalac moze da nametne svoju ikonu" do
    html = flash_html(:info, icon: "bell")
    assert html =~ ~s(data-exo="flash-icon")
    refute html =~ "data-missing-icon"
  end

  test "ikona je skrivena od citaca ekrana — poruku vec nosi tekst" do
    assert flash_html(:error) =~ ~r/data-exo="flash-icon" aria-hidden="true"/
  end
end
