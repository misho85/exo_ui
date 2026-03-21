defmodule ExoUI.Components.DatePickerTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders date picker" do
    assigns = %{}
    html = rendered_to_string(~H|<.date_picker id="dp" />|)
    assert html =~ ~s(data-exo="date-picker")
    assert html =~ ~s(data-exo="date-picker-header")
    assert html =~ ~s(data-exo="date-picker-grid")
    assert html =~ "Mon"
    assert html =~ "Sun"
  end

  test "renders with label" do
    assigns = %{}
    html = rendered_to_string(~H|<.date_picker id="dp" label="Select date" />|)
    assert html =~ "Select date"
  end

  test "highlights selected date" do
    assigns = %{date: ~D[2026-03-15]}
    html = rendered_to_string(~H|<.date_picker id="dp" selected={@date} current_month={@date} />|)
    assert html =~ ~s(data-selected)
  end
end
