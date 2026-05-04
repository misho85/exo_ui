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
    assert html =~ ~s(aria-label="Step 2, Step 2, current")
    assert html =~ ~s(data-exo="step-description")
    assert html =~ "Current step"
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
end
