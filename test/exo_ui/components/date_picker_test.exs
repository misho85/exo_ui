defmodule ExoUI.Components.DatePickerTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders date picker" do
    assigns = %{}
    html = rendered_to_string(~H|<.date_picker id="dp" />|)
    assert html =~ ~s(data-exo="date-picker")
    assert html =~ ~s(phx-hook="ExoDatePicker")
    assert html =~ ~s(data-exo="date-picker-header")
    assert html =~ ~s(data-exo="date-picker-grid")
    assert html =~ "Mon"
    assert html =~ "Sun"
  end

  test "renders with label" do
    assigns = %{}
    html = rendered_to_string(~H|<.date_picker id="dp" label="Select date" />|)
    assert html =~ "Select date"
    assert html =~ ~s(role="group")
    assert html =~ ~s(aria-labelledby="dp-label")
    assert html =~ ~s(id="dp-month")
    assert html =~ ~s(role="grid")
  end

  test "highlights selected date" do
    assigns = %{date: ~D[2026-03-15]}

    html =
      rendered_to_string(
        ~H|<.date_picker id="dp" name="departure" selected={@date} current_month={@date} />|
      )

    assert html =~ ~s(data-selected)
    assert html =~ ~s(aria-selected="true")
    assert html =~ ~s(value="2026-03-15")
  end

  test "connects description and errors to calendar group" do
    assigns = %{date: ~D[2026-03-15]}

    html =
      rendered_to_string(~H|<.date_picker
  id="dp"
  name="departure"
  label="Departure"
  description="Choose a date"
  errors={["is required"]}
  selected={@date}
  current_month={@date}
/>|)

    assert html =~ ~s(name="departure")
    assert html =~ ~s(value="2026-03-15")
    assert html =~ ~s(id="dp-description")
    assert html =~ ~s(id="dp-error")
    assert html =~ ~s(aria-describedby="dp-description dp-error")
    assert html =~ ~s(aria-invalid="true")
    assert html =~ ~s(role="alert")
  end

  test "marks constrained dates as disabled and navigation as unavailable" do
    assigns = %{date: ~D[2026-03-15]}

    html =
      rendered_to_string(
        ~H|<.date_picker id="dp" current_month={@date} min={@date} max={@date} />|
      )

    assert html =~ ~s(aria-label="Previous month")
    assert html =~ ~s(aria-label="Next month")
    assert html =~ ~s(disabled)
    assert html =~ ~s(aria-disabled="true")
  end

  test "renders available date state and disabled hidden input" do
    assigns = %{date: ~D[2026-03-15]}

    html =
      rendered_to_string(~H|<.date_picker
  id="dp"
  name="departure"
  current_month={@date}
  selected={@date}
  available_dates={[@date]}
  disabled
/>|)

    assert html =~ ~s(data-available)
    assert html =~ ~s(type="hidden" name="departure" value="2026-03-15" disabled)
  end

  test "normalizes ISO string dates from form params" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.date_picker
  id="dp"
  name="departure"
  current_month="2026-03-01"
  selected="2026-03-15"
  min="2026-03-10"
  max="2026-03-20"
  available_dates={["2026-03-15"]}
/>|)

    assert html =~ "March 2026"
    assert html =~ ~s(value="2026-03-15")
    assert html =~ ~s(data-selected)
    assert html =~ ~s(data-available)
  end

  test "renders date picker with field struct" do
    assigns = %{form: Phoenix.Component.to_form(%{"departure" => "2026-03-15"})}

    html = rendered_to_string(~H|<.date_picker field={@form[:departure]} />|)

    assert html =~ ~s(id="departure")
    assert html =~ ~s(name="departure")
    assert html =~ ~s(value="2026-03-15")
    assert html =~ "March 2026"
    assert html =~ ~s(data-selected)
  end
end
