defmodule ExoUI.Components.FormFieldValueTest do
  @moduledoc """
  Regresija: `field={f[:polje]}` mora da donese i IME i VRIJEDNOST polja.

  Do popravke su `input/1`, `select/1` i `combobox/1` imali
  `attr :value, :any, default: nil` (a `input/1` i `attr :name, :any,
  default: nil`). Deklarisan `attr` sa `default:` upisuje kljuc u `assigns`
  prije tijela funkcije, pa `assign_new/3` — koji ne zove funkciju za postojeci
  kljuc — nikad nije okinuo. Komponenta pozvana sa `field=` se renderovala kao
  prazna.

  Posljedica u stvarnoj aplikaciji (trg24, TRG-104): proizvod u statusu
  `"active"` je otvarao formu sa PRAZNIM selectom, a skriveni native `<select>`
  je — bez ijedne oznacene opcije — padao na prvu u listi, `"draft"`. Trgovac
  nije mogao da vjeruje onome sto vidi.

  Testovi tvrde EFEKAT (`selected` na tacnoj opciji, `value=` na inputu), ne
  prisustvo teksta: sve opcije su uvijek u DOM-u, pa bi tvrdnja nad tekstom
  prolazila i sa praznim selectom.
  """
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component, except: [form: 1]
  import ExoUI.Components

  defp field(name, value) do
    %Phoenix.HTML.FormField{
      id: "user_#{name}",
      name: "user[#{name}]",
      errors: [],
      field: name,
      form: to_form(%{}, as: :user),
      value: value
    }
  end

  describe "input/1 sa field=" do
    test "donosi vrijednost polja" do
      assigns = %{f: field(:title, "Drvena stolica")}
      html = rendered_to_string(~H|<.input field={@f} />|)
      assert html =~ ~s(value="Drvena stolica")
    end

    test "donosi ime polja" do
      assigns = %{f: field(:title, "x")}
      html = rendered_to_string(~H|<.input field={@f} />|)
      assert html =~ ~s(name="user[title]")
    end

    test "eksplicitan value= pobjedjuje nad field-om" do
      assigns = %{f: field(:title, "iz polja")}
      html = rendered_to_string(~H|<.input field={@f} value="rucno" />|)
      assert html =~ ~s(value="rucno")
      refute html =~ ~s(value="iz polja")
    end

    test "bez field-a i bez value= i dalje renderuje, ne puca" do
      assigns = %{}
      html = rendered_to_string(~H|<.input name="slobodno" />|)
      assert html =~ ~s(name="slobodno")
    end
  end

  describe "select/1 sa field=" do
    test "oznacava opciju koja odgovara vrijednosti polja" do
      assigns = %{f: field(:status, "active")}

      html =
        rendered_to_string(
          ~H|<.select id="s" field={@f} options={[{"Nacrt", "draft"}, {"Aktivan", "active"}]} />|
        )

      # native fallback: tacna opcija nosi `selected`
      assert html =~ ~r/<option[^>]*value="active"[^>]*selected/
      refute html =~ ~r/<option[^>]*value="draft"[^>]*selected/

      # vidljivi trigger prikazuje natpis, ne prazno
      assert html =~ "Aktivan"
    end

    test "bez field-a i bez value= renderuje prompt, ne puca" do
      assigns = %{}

      html =
        rendered_to_string(
          ~H|<.select id="s" name="x" prompt="Izaberi" options={[{"A", "a"}]} />|
        )

      assert html =~ "Izaberi"
    end
  end

  describe "combobox/1 sa field=" do
    test "donosi vrijednost polja" do
      assigns = %{f: field(:city, "pg")}

      html =
        rendered_to_string(
          ~H|<.combobox id="c" field={@f} options={[{"Podgorica", "pg"}, {"Bar", "bar"}]} />|
        )

      assert html =~ "Podgorica"
    end

    test "bez field-a i bez value= renderuje, ne puca" do
      assigns = %{}
      html = rendered_to_string(~H|<.combobox id="c" name="x" options={[{"A", "a"}]} />|)
      assert html =~ ~s(data-exo=)
    end
  end
end
