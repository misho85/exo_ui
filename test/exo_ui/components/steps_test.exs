defmodule ExoUI.Components.StepsTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components.DataDisplay

  test "renders steps" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.steps>
        <:step title="Step 1" status="complete" />
        <:step title="Step 2" status="current" description="Current step" />
      </.steps>
      """)

    assert html =~ ~s(data-exo="steps")
    assert html =~ ~s(data-exo="step")
    assert html =~ "Step 1"
    assert html =~ ~s(data-status="complete")
    assert html =~ ~s(data-status="current")
    assert html =~ ~s(aria-current="step")
    assert html =~ ~s(data-exo="step-description")
    assert html =~ "Current step"
  end

  # A step is read from its content, not from a name that replaces it: the
  # name was an English sentence ("Step 2, Shipping, complete") around the
  # title the caller had translated.
  test "a step has no name of its own, and its status is hidden text" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.steps aria_label="Checkout">
        <:step title="Address" status="complete" />
        <:step title="Shipping" status="current" />
        <:step title="Payment" status="upcoming" />
        <:step title="Review" />
      </.steps>
      """)

    refute html =~ ~r/<li[^>]*aria-label/
    assert html =~ ~s(<ol data-exo="steps" data-orientation="horizontal" role="list")

    assert sr_only_by_title(html) == [
             {"Address", ["Completed"]},
             {"Shipping", []},
             {"Payment", ["Not completed"]},
             {"Review", ["Not completed"]}
           ]
  end

  test "status text is the caller's" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.steps aria_label="Koraci" complete_label="završeno" upcoming_label="nije završeno">
        <:step title="Adresa" status="complete" />
        <:step title="Dostava" status="current" />
        <:step title="Plaćanje" status="upcoming" />
      </.steps>
      """)

    refute html =~ "Completed"
    refute html =~ "Not completed"

    assert sr_only_by_title(html) == [
             {"Adresa", ["završeno"]},
             {"Dostava", []},
             {"Plaćanje", ["nije završeno"]}
           ]
  end

  test "renders vertical steps" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.steps orientation="vertical">
        <:step title="A" status="complete" />
      </.steps>
      """)

    assert html =~ ~s(data-orientation="vertical")
  end

  test "renders step numbers for non-complete states" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.steps>
        <:step title="First" status="current" />
        <:step title="Second" status="upcoming" />
      </.steps>
      """)

    assert html =~ ">1</span>"
    assert html =~ ">2</span>"
  end

  defp sr_only_by_title(html) do
    for [step] <- Regex.scan(~r/<li data-exo="step".*?<\/li>/s, html) do
      [_, title] = Regex.run(~r/data-exo="step-title">([^<]*)</, step)

      hidden =
        for [_, text] <- Regex.scan(~r/data-exo="sr-only">\s*([^<]*?)\s*</, step), do: text

      {title, hidden}
    end
  end
end
