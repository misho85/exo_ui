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
        <:item label="Intro">Slide 1</:item>
        <:item>Slide 2</:item>
      </.carousel>
      """)

    assert html =~ ~s(data-exo="carousel")
    assert html =~ ~s(phx-hook="ExoCarousel")
    assert html =~ ~s(data-exo="carousel-slide")
    assert html =~ ~s(data-slide-count="2")
    assert html =~ ~s(tabindex="0")
    assert html =~ ~s(aria-label="Intro")
    assert html =~ ~s(aria-label="Slide 2 of 2")
    assert html =~ ~s(id="c-slide-1")
    assert html =~ ~s(aria-controls="c-viewport")
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

    {:ok, tree} = Floki.parse_fragment(html)

    assert html =~ ~s(data-exo="carousel-prev")
    assert html =~ ~s(data-exo="carousel-next")
    assert html =~ ~s(type="button")
    assert html =~ ~s(disabled)
    assert html =~ ~s(data-disabled)
    assert Floki.find(tree, ~s([data-exo="carousel-prev"] [data-exo="icon"])) != []
    assert Floki.find(tree, ~s([data-exo="carousel-next"] [data-exo="icon"])) != []
    refute html =~ "‹"
    refute html =~ "›"
  end

  test "renders carousel without controls" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.carousel id="c" controls={false}>
        <:item>A</:item>
        <:item>B</:item>
      </.carousel>
      """)

    refute html =~ ~s(data-exo="carousel-prev")
    refute html =~ ~s(data-exo="carousel-next")
  end
end
