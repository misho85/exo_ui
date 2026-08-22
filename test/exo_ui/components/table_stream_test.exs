defmodule ExoUI.Components.TableStreamTest do
  @moduledoc """
  Tri rupe koje su tjerale aplikaciju da napise svoju ljusku tabele.

  Najozbiljnija: strimovana tabela NIKAD nije prikazivala prazno stanje. Stream
  nije nabrojiv, pa se praznina iz njega ne moze procitati — a
  `table_empty?(%LiveStream{})` je zato vracao `false` i tabela je tiho
  renderovala nista, tamo gdje je imala sasvim dobar red „nema rezultata".
  """
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  defp rows, do: [%{id: 1, naziv: "Prvi"}, %{id: 2, naziv: "Drugi"}]

  test "prazna lista i dalje sama prikazuje prazno stanje" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.table id="t" rows={[]}>
  <:col :let={r} label="Naziv">{r.naziv}</:col>
</.table>|)

    assert html =~ ~s(data-exo="table-empty-row")
  end

  test "`rows_empty` javlja prazninu koju komponenta ne moze da pročita" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.table id="t" rows={[]} rows_empty={true} empty_label="Nema ničega">
  <:col :let={r} label="Naziv">{r.naziv}</:col>
</.table>|)

    assert html =~ "Nema ničega"
  end

  test "`rows_empty={false}` drzi prazno stanje sklonjeno i za praznu listu" do
    # Tako se ponasa strimovana tabela koja jos nije napunjena: red se ne crta,
    # jer „jos nije stiglo" nije isto sto i „nema ga".
    assigns = %{}

    html =
      rendered_to_string(~H|<.table id="t" rows={[]} rows_empty={false}>
  <:col :let={r} label="Naziv">{r.naziv}</:col>
</.table>|)

    refute html =~ ~s(data-exo="table-empty-row")
  end

  test "`row_class` boji red po PODATKU, ne po koloni" do
    assigns = %{rows: rows()}

    html =
      rendered_to_string(
        ~H|<.table id="t" rows={@rows} row_class={fn r -> r.id == 1 && "nisko" end}>
  <:col :let={r} label="Naziv">{r.naziv}</:col>
</.table>|
      )

    assert html =~ ~s(class="nisko")
    # samo jedan red, ne oba
    assert length(String.split(html, ~s(class="nisko"))) == 2
  end

  test "`body_rest` daje pozivaocu <tbody>, jer element nosi samo JEDAN hook" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.table id="t" rows={[]} body_rest={%{"phx-hook" => "BulkSelect"}}>
  <:col :let={r} label="Naziv">{r.naziv}</:col>
</.table>|)

    assert html =~ ~s(phx-hook="BulkSelect")
    # ExoTable je presao na omot — inace bi se dva hooka otimala o isti element
    assert html =~ ~r/data-exo="table-wrapper"[^>]*phx-hook="ExoTable"/
  end
end
