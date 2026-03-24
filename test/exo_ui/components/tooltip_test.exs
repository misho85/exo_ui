defmodule ExoUI.Components.TooltipTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders tooltip with text" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
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

    html =
      rendered_to_string(~H"""
      <.tooltip id="t2" text="tip" side="bottom">X</.tooltip>
      """)

    assert html =~ ~s(data-side="bottom")
  end

  test "renders rich content slot" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t3">
        <:content><strong>Bold</strong></:content>
        Hover
      </.tooltip>
      """)

    assert html =~ "<strong>Bold</strong>"
  end

  test "generates unique anchor names" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t4" text="tip">X</.tooltip>
      """)

    assert html =~ ~s(anchor-name: --tooltip-t4)
    assert html =~ ~s(position-anchor: --tooltip-t4)
  end

  test "renders arrow by default" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t5" text="tip">X</.tooltip>
      """)

    assert html =~ ~s(data-arrow)
  end

  test "hides arrow when false" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t6" text="tip" arrow={false}>X</.tooltip>
      """)

    refute html =~ ~s(data-arrow)
  end

  test "renders custom delay" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t7" text="tip" delay={300}>X</.tooltip>
      """)

    assert html =~ ~s(data-delay="300")
  end

  test "includes ExoTooltip hook" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t8" text="tip">X</.tooltip>
      """)

    assert html =~ ~s(phx-hook="ExoTooltip")
  end

  test "defaults to top side" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t9" text="tip">X</.tooltip>
      """)

    assert html =~ ~s(data-side="top")
  end

  test "defaults to center align" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t10a" text="tip">X</.tooltip>
      """)

    assert html =~ ~s(data-align="center")
  end

  test "renders align attribute" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t10" text="tip" align="start">X</.tooltip>
      """)

    assert html =~ ~s(data-align="start")
  end

  test "renders all side values" do
    for side <- ~w(top bottom left right) do
      assigns = %{side: side}

      html =
        rendered_to_string(~H"""
        <.tooltip id={"t-side-#{@side}"} text="tip" side={@side}>X</.tooltip>
        """)

      assert html =~ ~s(data-side="#{side}")
    end
  end

  test "renders side and align together" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t-combo" text="tip" side="bottom" align="end">X</.tooltip>
      """)

    assert html =~ ~s(data-side="bottom")
    assert html =~ ~s(data-align="end")
  end

  test "content slot takes priority over text attr" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t11" text="ignored">
        <:content>Rich content</:content>
        X
      </.tooltip>
      """)

    assert html =~ "Rich content"
    refute html =~ "ignored"
  end

  test "two tooltips have different anchor names" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="ta" text="A">X</.tooltip>
      <.tooltip id="tb" text="B">Y</.tooltip>
      """)

    assert html =~ ~s(anchor-name: --tooltip-ta)
    assert html =~ ~s(anchor-name: --tooltip-tb)
    assert html =~ ~s(position-anchor: --tooltip-ta)
    assert html =~ ~s(position-anchor: --tooltip-tb)
  end

  test "renders tabindex on anchor for keyboard focus" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t12" text="tip">X</.tooltip>
      """)

    assert html =~ ~s(tabindex="0")
  end

  test "default delay is 500ms" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t13" text="tip">X</.tooltip>
      """)

    assert html =~ ~s(data-delay="500")
  end

  test "renders popover=manual on content" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t15" text="tip">X</.tooltip>
      """)

    assert html =~ ~s(popover="manual")
  end

  test "forwards rest attrs" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.tooltip id="t14" text="tip" data-testid="tt">X</.tooltip>
      """)

    assert html =~ ~s(data-testid="tt")
  end
end
