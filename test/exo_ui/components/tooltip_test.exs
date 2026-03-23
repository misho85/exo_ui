defmodule ExoUI.Components.TooltipTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders tooltip with text" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t1" text="Help">Hover</.tooltip>
    """)
    assert html =~ ~s(data-exo="tooltip")
    assert html =~ ~s(data-exo="tooltip-anchor")
    assert html =~ ~s(data-exo="tooltip-content")
    assert html =~ ~s(role="tooltip")
    assert html =~ ~s(aria-describedby="t1-content")
    assert html =~ "Help"
    assert html =~ "Hover"
  end

  test "renders with side" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t2" text="tip" side="bottom">X</.tooltip>
    """)
    assert html =~ ~s(data-side="bottom")
  end

  test "renders rich content slot" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t3">
      <:content><strong>Bold</strong></:content>
      Hover
    </.tooltip>
    """)
    assert html =~ "<strong>Bold</strong>"
  end

  test "generates unique anchor names" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t4" text="tip">X</.tooltip>
    """)
    assert html =~ ~s(anchor-name: --tooltip-t4)
    assert html =~ ~s(position-anchor: --tooltip-t4)
  end

  test "renders arrow by default" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t5" text="tip">X</.tooltip>
    """)
    assert html =~ ~s(data-arrow)
  end

  test "hides arrow when false" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t6" text="tip" arrow={false}>X</.tooltip>
    """)
    refute html =~ ~s(data-arrow)
  end

  test "renders custom delay" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t7" text="tip" delay={300}>X</.tooltip>
    """)
    assert html =~ ~s(--exo-tooltip-delay: 300ms)
  end

  test "includes ExoTooltip hook" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t8" text="tip">X</.tooltip>
    """)
    assert html =~ ~s(phx-hook="ExoTooltip")
  end
end
