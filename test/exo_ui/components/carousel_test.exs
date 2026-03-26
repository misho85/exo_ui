defmodule ExoUI.Components.CarouselTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders carousel" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.carousel id="c">
        <:item>Slide 1</:item>
        <:item>Slide 2</:item>
      </.carousel>
      """)

    assert html =~ ~s(data-exo="carousel")
    assert html =~ ~s(phx-hook="ExoCarousel")
    assert html =~ ~s(data-exo="carousel-slide")
    assert html =~ "Slide 1"
    assert html =~ "Slide 2"
  end

  test "renders carousel with loop" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.carousel id="c" loop>
        <:item>A</:item>
      </.carousel>
      """)

    assert html =~ ~s(data-loop)
  end

  test "renders prev/next buttons" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.carousel id="c">
        <:item>A</:item>
      </.carousel>
      """)

    assert html =~ ~s(data-exo="carousel-prev")
    assert html =~ ~s(data-exo="carousel-next")
  end
end
