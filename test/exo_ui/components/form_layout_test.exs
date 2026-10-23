defmodule ExoUI.Components.FormLayoutTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  describe "form_layout/1" do
    test "renders the main column and the aside" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.form_layout id="product-layout">
          <:main>
            <p>title</p>
          </:main>
          <:aside>
            <p>status</p>
          </:aside>
        </.form_layout>
        """)

      doc = Floki.parse_fragment!(html)
      assert doc |> Floki.find("#product-layout[data-exo=form-layout]") |> length() == 1
      assert Floki.find(doc, "[data-exo=form-layout-grid][data-aside]") |> length() == 1
      assert Floki.find(doc, "[data-exo=form-layout-main] p") |> Floki.text() == "title"
      assert Floki.find(doc, "[data-exo=form-layout-aside] p") |> Floki.text() == "status"
    end

    test "without an aside the grid stays one column" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.form_layout>
          <:main>
            <p>title</p>
          </:main>
        </.form_layout>
        """)

      doc = Floki.parse_fragment!(html)
      assert Floki.find(doc, "[data-exo=form-layout-grid][data-aside]") |> length() == 0
      assert Floki.find(doc, "[data-exo=form-layout-aside]") |> length() == 0
    end
  end

  describe "optional_field/1" do
    test "closed: the chip shows and the field is hidden but in the DOM" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.optional_field id="hs" label="HS code">
          <input name="hs_code" value="" />
        </.optional_field>
        """)

      doc = Floki.parse_fragment!(html)
      chip = Floki.find(doc, "#hs-chip")
      assert Floki.attribute(chip, "hidden") == []
      assert Floki.attribute(chip, "type") == ["button"]
      assert Floki.attribute(chip, "aria-controls") == ["hs-content"]
      assert Floki.text(chip) =~ "HS code"
      assert Floki.attribute(Floki.find(doc, "#hs-content"), "hidden") != []
      assert Floki.find(doc, "#hs-content input[name=hs_code]") |> length() == 1
    end

    test "open: the field shows and the chip is hidden" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.optional_field id="hs" label="HS code" open>
          <input name="hs_code" value="610910" />
        </.optional_field>
        """)

      doc = Floki.parse_fragment!(html)
      assert Floki.attribute(Floki.find(doc, "#hs-chip"), "hidden") != []
      assert Floki.attribute(Floki.find(doc, "#hs-content"), "hidden") == []
    end

    test "the chip opens the field and hides itself from JS" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.optional_field id="hs" label="HS code">
          <input name="hs_code" value="" />
        </.optional_field>
        """)

      [click] =
        html |> Floki.parse_fragment!() |> Floki.find("#hs-chip") |> Floki.attribute("phx-click")

      assert Jason.decode!(click) == [
               ["set_attr", %{"attr" => ["hidden", ""]}],
               ["remove_attr", %{"attr" => "hidden", "to" => "#hs-content"}],
               ["focus_first", %{"to" => "#hs-content"}]
             ]
    end
  end

  describe "save_bar/1" do
    test "hidden while nothing changed" do
      assigns = %{}

      html = rendered_to_string(~H|<.save_bar id="bar" form="product-form" />|)

      bar = html |> Floki.parse_fragment!() |> Floki.find("#bar")
      assert Floki.attribute(bar, "hidden") != []
    end

    test "names itself with the message and submits the form" do
      assigns = %{}

      html =
        rendered_to_string(~H"""
        <.save_bar
          id="bar"
          form="product-form"
          show
          message="Nesačuvane izmjene"
          save_label="Sačuvaj"
          saving_label="Čuvanje..."
          discard_label="Odbaci"
          on_discard="discard"
        />
        """)

      doc = Floki.parse_fragment!(html)
      bar = Floki.find(doc, "#bar")
      assert Floki.attribute(bar, "hidden") == []
      assert Floki.attribute(bar, "role") == ["region"]
      assert Floki.attribute(bar, "aria-labelledby") == ["bar-message"]
      assert Floki.find(doc, "#bar-message") |> Floki.text() == "Nesačuvane izmjene"

      save = Floki.find(doc, "#bar-save")
      assert Floki.attribute(save, "type") == ["submit"]
      assert Floki.attribute(save, "form") == ["product-form"]
      assert Floki.attribute(save, "phx-disable-with") == ["Čuvanje..."]
      assert Floki.text(save) =~ "Sačuvaj"

      discard = Floki.find(doc, "#bar-discard")
      assert Floki.attribute(discard, "type") == ["button"]
      assert Floki.attribute(discard, "phx-click") == ["discard"]
      assert Floki.text(discard) =~ "Odbaci"
    end

    test "no discard button without on_discard" do
      assigns = %{}

      html = rendered_to_string(~H|<.save_bar id="bar" form="f" show />|)

      assert html |> Floki.parse_fragment!() |> Floki.find("#bar-discard") |> length() == 0
    end
  end
end
