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
        <:step title="Step 2" status="current" />
      </.steps>
      """)

    assert html =~ ~s(data-exo="steps")
    assert html =~ ~s(data-exo="step")
    assert html =~ "Step 1"
    assert html =~ ~s(data-status="complete")
    assert html =~ ~s(data-status="current")
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
end
