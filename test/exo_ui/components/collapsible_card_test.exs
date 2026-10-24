defmodule ExoUI.Components.CollapsibleCardTest do
  @moduledoc """
  TRG-807. `content_card collapsible` is a settings section as a row: the
  header shows the title, the current state and a chevron, the body opens
  under it, and the browser owns `open` after mount, so a patch from typing in
  the section does not close it.
  """
  use ExUnit.Case, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "a collapsible card is a closed details with title, summary and chevron" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.content_card id="osnovno" collapsible title="Osnovni podaci" summary="Studio Ritam · EUR">
        <input name="tenant[name]" />
      </.content_card>
      """)

    assert html =~ ~s(<details data-exo="card" data-collapsible)
    refute html =~ ~s( open)
    assert html =~ ~s(<summary data-exo="card-header">)
    assert html =~ ~s(data-exo="card-summary">Studio Ritam · EUR<)
    assert html =~ ~s(data-exo="card-chevron")
    # The fields are in the DOM while closed: a form across cards submits them.
    assert html =~ ~s(name="tenant[name]")
    # The browser keeps `open`; a patch does not reset it.
    assert html =~ "ignore_attrs"
  end

  test "open renders the section open" do
    assigns = %{}

    html =
      rendered_to_string(~H"""
      <.content_card id="x" collapsible open title="T">body</.content_card>
      """)

    assert html =~ ~r/<details[^>]* open/
  end

  test "a card without collapsible is unchanged" do
    assigns = %{}

    html = rendered_to_string(~H|<.content_card title="T">body</.content_card>|)

    assert html =~ ~s(<div data-exo="card")
    refute html =~ "details"
  end
end
