defmodule ExoUI.Components.StructuralTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders header" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.header>
        Page Title
        <:subtitle>A description</:subtitle>
        <:actions><.button>Action</.button></:actions>
      </.header>
      """)

    assert html =~ ~s(data-exo="header")
    assert html =~ "Page Title"
    assert html =~ "A description"
  end

  test "renders list" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.list>
        <:item title="Name">John</:item>
        <:item title="Email">john@example.com</:item>
      </.list>
      """)

    assert html =~ ~s(data-exo="list")
    assert html =~ "<dl"
    assert html =~ "<dt"
    assert html =~ "<dd"
    assert html =~ "Name"
    assert html =~ "John"
  end

  test "renders content_card" do
    assigns = %{}
    html = rendered_to_string(~H|<.content_card title="Settings">Content</.content_card>|)
    assert html =~ ~s(data-exo="card")
    assert html =~ "Settings"
    assert html =~ "Content"
  end

  test "renders stat_card" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.stat_card title="Revenue" value="$1,234" icon="trending-up" trend="+12%" trend_direction="up" />|
      )

    assert html =~ ~s(data-exo="stat-card")
    assert html =~ ~s(data-exo="stat-card-icon")
    assert html =~ ~s(data-exo="icon")
    assert html =~ ~s(aria-hidden="true")
    assert html =~ "Revenue"
    assert html =~ "$1,234"
    assert html =~ ~s(data-direction="up")
  end

  test "renders metric_card" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.metric_card title="Users" value="1,200" subtitle="Total registered" />|
      )

    assert html =~ ~s(data-exo="metric-card")
    assert html =~ "Users"
    assert html =~ "1,200"
  end
end
