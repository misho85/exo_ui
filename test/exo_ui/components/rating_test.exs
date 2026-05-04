defmodule ExoUI.Components.RatingTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components.Form

  test "renders rating" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.rating name="score" value={3} />
      """)

    assert html =~ ~s(data-exo="rating")
    assert html =~ ~s(role="radiogroup")
    assert html =~ ~s(aria-label="3 out of 5")
    assert html =~ ~s(phx-hook="ExoRating")
    assert html =~ ~s(name="score")
    assert html =~ ~s(data-exo="rating-value")
    assert html =~ ~s(value="3")
  end

  test "keeps submitted value in hidden input and visual radios isolated" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.rating name="score" value={2} />
      """)

    assert html =~ ~s(<input type="hidden" name="score" value="2" data-exo="rating-value")
    assert html =~ ~s(name="score-star")
  end

  test "renders correct number of stars" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.rating name="s" value={0} max={3} />
      """)

    assert length(Regex.scan(~r/data-exo="rating-star"/, html)) == 3
  end

  test "renders readonly" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.rating name="s" value={2} readonly />
      """)

    assert html =~ ~s(data-readonly)
    assert html =~ ~s(role="img")
    assert html =~ ~s(aria-readonly="true")
    refute html =~ ~s(phx-hook="ExoRating")
    refute html =~ ~s(type="radio")
  end

  test "renders label description errors and field semantics" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.rating
        id="satisfaction"
        name="score"
        value={2}
        label="Satisfaction"
        description="Rate the last support interaction."
        errors={["is required"]}
      />
      """)

    assert html =~ ~s(data-exo="field")
    assert html =~ ~s(id="satisfaction-label")
    assert html =~ ~s(for="satisfaction")
    assert html =~ ~s(id="satisfaction-description")
    assert html =~ ~s(id="satisfaction-error")
    assert html =~ ~s(aria-labelledby="satisfaction-label")
    assert html =~ ~s(aria-describedby="satisfaction-description satisfaction-error")
    assert html =~ ~s(aria-invalid="true")
    assert html =~ ~s(role="alert")
  end

  test "renders disabled rating without activating the JS hook" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.rating name="score" value={4} disabled />
      """)

    assert html =~ ~s(data-disabled)
    assert html =~ ~s(aria-disabled="true")

    assert html =~
             ~s(<input type="hidden" name="score" value="4" data-exo="rating-value" disabled)

    refute html =~ ~s(phx-hook="ExoRating")
  end

  test "renders rating with field struct and clamps value to max" do
    assigns = %{form: Phoenix.Component.to_form(%{"score" => "9"})}

    html =
      rendered_to_string(~H"""
      <.rating field={@form[:score]} max={5} />
      """)

    assert html =~ ~s(id="score")
    assert html =~ ~s(name="score")
    assert html =~ ~s(value="5")
    assert html =~ ~s(aria-label="5 out of 5")
  end
end
