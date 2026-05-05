# Date Picker Recipes

Use this pattern when a date picker needs production LiveView behavior:
parent-owned month state, server-owned selected date state, min/max limits,
available-day markers, form submission, validation errors, disabled calendars,
and keyboard navigation.

## Parent-Controlled Calendar

```heex
<.date_picker
  id="booking-date"
  name="booking[date]"
  label="Booking date"
  description="Choose an available review day."
  selected={@selected_date}
  current_month={@calendar_month}
  min={~D[2026-03-01]}
  max={~D[2026-05-31]}
  available_dates={@available_dates}
  errors={Map.get(@errors, :date, [])}
  on_select="select-booking-date"
  on_prev_month="previous-booking-month"
  on_next_month="next-booking-month"
  target={@myself}
/>
```

```elixir
def handle_event("select-booking-date", %{"date" => date}, socket) do
  selected = Date.from_iso8601!(date)

  {:noreply,
   assign(socket,
     selected_date: selected,
     calendar_month: Date.beginning_of_month(selected),
     errors: %{}
   )}
end

def handle_event("previous-booking-month", _params, socket) do
  {:noreply, update(socket, :calendar_month, &previous_month/1)}
end

def handle_event("next-booking-month", _params, socket) do
  {:noreply, update(socket, :calendar_month, &next_month/1)}
end
```

## Form Submission

`name` renders a hidden ISO date input. Keep the calendar inside the form when
the selected date must submit with the rest of the record.

```heex
<.form for={%{}} as={:booking} phx-submit="save-booking">
  <.date_picker
    id="booking-date"
    name="booking[date]"
    selected={@selected_date}
    current_month={@calendar_month}
    errors={Map.get(@errors, :date, [])}
  />

  <.button type="submit">Save booking date</.button>
</.form>
```

```elixir
def handle_event("save-booking", %{"booking" => %{"date" => ""}}, socket) do
  {:noreply, assign(socket, errors: %{date: ["Choose a booking date before saving."]})}
end

def handle_event("save-booking", %{"booking" => %{"date" => date}}, socket) do
  {:noreply, assign(socket, selected_date: Date.from_iso8601!(date), errors: %{})}
end
```

## Rules

- The parent LiveView or LiveComponent owns both `selected` and
  `current_month`; the date picker emits events but does not persist state.
- Pass stable `id` and `name` values when the date needs form submission,
  descriptions, or errors.
- Use `target={@myself}` inside LiveComponents so select and month events route
  back to the owning component.
- Use `min` and `max` for hard navigation/date bounds. Disabled days and month
  buttons expose `aria-disabled`.
- Treat `available_dates` as a marker layer. If unavailable days must be
  rejected, enforce that in the select or submit handler.
- Keep validation errors server-owned and pass them through `errors`; ExoUI
  links the calendar group to description/error text with `aria-describedby`.
- Disabled calendars are valid for read-only audit views, but they should still
  render the selected value and calendar semantics.
- Browser coverage should verify hidden input value, month navigation,
  keyboard focus movement, `role="grid"`/`role="gridcell"`, `aria-selected`,
  `aria-disabled`, available/unavailable markers, validation errors, and reset
  behavior.
