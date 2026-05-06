defmodule ExoUI.Components.ButtonTest do
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders button with data-exo attribute" do
    assigns = %{}
    html = rendered_to_string(~H"<.button>Click</.button>")
    assert html =~ ~s(data-exo="btn")
    assert html =~ ~s(type="button")
    assert html =~ "Click"
  end

  test "renders button with variant" do
    assigns = %{}
    html = rendered_to_string(~H|<.button variant="primary">Click</.button>|)
    assert html =~ ~s(data-variant="primary")
  end

  test "renders button with size" do
    assigns = %{}
    html = rendered_to_string(~H|<.button size="sm">Click</.button>|)
    assert html =~ ~s(data-size="sm")
  end

  test "preserves explicit button type" do
    assigns = %{}
    html = rendered_to_string(~H|<.button type="submit">Submit</.button>|)
    assert html =~ ~s(type="submit")
  end

  test "passes popover target attributes through" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.button popovertarget="account-menu" popovertargetaction="hide">Close</.button>|
      )

    assert html =~ ~s(popovertarget="account-menu")
    assert html =~ ~s(popovertargetaction="hide")
  end

  test "renders disabled links without href navigation" do
    assigns = %{}
    html = rendered_to_string(~H|<.button href="/billing" disabled>Billing</.button>|)

    assert html =~ ~s(role="link")
    assert html =~ ~s(aria-disabled="true")
    assert html =~ ~s(tabindex="-1")
    assert html =~ ~s(data-disabled)
    refute html =~ ~s(href="/billing")
  end
end
