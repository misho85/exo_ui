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
    refute html =~ ~s(phx-hook="ExoRating")
    refute html =~ ~s(type="radio")
  end
end
