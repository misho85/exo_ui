defmodule ExoUI.Components.AccordionTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders accordion with data-exo attribute" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Question 1">Answer 1</:item>
      </.accordion>
      """)

    assert html =~ ~s(data-exo="accordion")
    assert html =~ ~s(id="faq")
  end

  test "renders accordion items" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Question 1">Answer 1</:item>
        <:item title="Question 2">Answer 2</:item>
      </.accordion>
      """)

    assert html =~ ~s(data-exo="accordion-item")
    assert html =~ ~s(data-exo="accordion-trigger")
    assert html =~ ~s(data-exo="accordion-content")
    assert html =~ ~s(data-exo="accordion-body")
    assert html =~ "Question 1"
    assert html =~ "Answer 1"
    assert html =~ "Question 2"
    assert html =~ "Answer 2"
  end

  test "renders accordion with variant" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq" variant="plus">
        <:item title="Q">A</:item>
      </.accordion>
      """)

    assert html =~ ~s(data-variant="plus")
  end

  test "renders accordion with joined state" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq" joined={true}>
        <:item title="Q">A</:item>
      </.accordion>
      """)

    assert html =~ ~s(data-joined)
  end

  test "renders accordion without joined when false" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq" joined={false}>
        <:item title="Q">A</:item>
      </.accordion>
      """)

    refute html =~ ~s(data-joined)
  end

  test "renders accordion item with checked checkbox when open" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Open" open={true}>Content</:item>
      </.accordion>
      """)

    assert html =~ "checked"
  end

  test "renders accordion with class" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq" class="my-accordion">
        <:item title="Q">A</:item>
      </.accordion>
      """)

    assert html =~ ~s(class="my-accordion")
  end

  test "renders accordion with checkbox and label elements" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Q">A</:item>
      </.accordion>
      """)

    assert html =~ ~s(type="checkbox")
    assert html =~ "<label"
    assert html =~ ~s(data-exo="accordion-state")
    assert html =~ ~s(id="faq-0")
    assert html =~ ~s(for="faq-0")
  end
end
