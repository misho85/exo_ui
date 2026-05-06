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

  test "renders accordion items with button trigger" do
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
    assert html =~ "<button"
    assert html =~ "Question 1"
    assert html =~ "Answer 1"
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

  test "renders accordion item as expanded when open" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Open" open={true}>Content</:item>
      </.accordion>
      """)

    assert html =~ ~s(aria-expanded="true")
    assert html =~ ~s(aria-hidden="false")
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

  test "renders type=single by default" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Q">A</:item>
      </.accordion>
      """)

    assert html =~ ~s(data-type="single")
  end

  test "renders type=multiple" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq" type="multiple">
        <:item title="Q">A</:item>
      </.accordion>
      """)

    assert html =~ ~s(data-type="multiple")
  end

  test "renders collapsible attribute" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq" collapsible={true}>
        <:item title="Q">A</:item>
      </.accordion>
      """)

    assert html =~ ~s(data-collapsible)
  end

  test "omits collapsible when false" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq" collapsible={false}>
        <:item title="Q">A</:item>
      </.accordion>
      """)

    refute html =~ ~s(data-collapsible)
  end

  test "renders disabled item" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Disabled" disabled={true}>Content</:item>
      </.accordion>
      """)

    assert html =~ ~s(data-disabled)
    assert html =~ ~s(aria-disabled="true")
    assert html =~ ~s(disabled)
  end

  test "renders ARIA attributes" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Q" open={true}>A</:item>
      </.accordion>
      """)

    assert html =~ ~s(aria-expanded="true")
    assert html =~ ~s(aria-controls="faq-content-0")
    assert html =~ ~s(role="region")
    assert html =~ ~s(aria-labelledby="faq-trigger-0")
    assert html =~ ~s(aria-hidden="false")
    assert html =~ ~s(id="faq-trigger-0")
    assert html =~ ~s(id="faq-content-0")
  end

  test "closed content is hidden from assistive tech and focus" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Closed">A</:item>
      </.accordion>
      """)

    assert html =~ ~s(aria-hidden="true")
    assert html =~ ~s(inert)
  end

  test "renders aria-expanded=false when closed" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Q">A</:item>
      </.accordion>
      """)

    assert html =~ ~s(aria-expanded="false")
  end

  test "renders phx-hook for ExoAccordion" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Q">A</:item>
      </.accordion>
      """)

    assert html =~ ~s(phx-hook="ExoAccordion")
  end

  test "does not render a hidden checkbox state mirror" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.accordion id="faq">
        <:item title="Q">A</:item>
      </.accordion>
      """)

    refute html =~ ~s(data-exo="accordion-state")
    refute html =~ ~s(type="checkbox")
  end
end
