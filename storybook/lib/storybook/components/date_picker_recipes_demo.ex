defmodule ExoUI.Storybook.Components.DatePickerRecipesDemo do
  @moduledoc """
  Production-style date picker recipes.

  Demonstrates parent-owned month/date state, constrained navigation, available
  date markers, hidden form values, server validation, disabled calendars,
  keyboard navigation, and live status text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  @initial_date ~D[2026-03-15]
  @min_date ~D[2026-03-01]
  @max_date ~D[2026-05-31]
  @locked_date ~D[2026-04-10]

  @impl true
  def mount(socket) do
    {:ok, assign_initial(socket, "initial date picker recipe")}
  end

  @impl true
  def handle_event("date-picker-recipe-prev-month", _params, socket) do
    {:noreply, move_booking_month(socket, :previous)}
  end

  def handle_event("date-picker-recipe-next-month", _params, socket) do
    {:noreply, move_booking_month(socket, :next)}
  end

  def handle_event("select-date-picker-recipe", %{"date" => date}, socket) do
    case Date.from_iso8601(date) do
      {:ok, selected} ->
        {:noreply, select_booking_date(socket, selected)}

      {:error, _reason} ->
        {:noreply, block_booking(socket, "blocked invalid date")}
    end
  end

  def handle_event("clear-date-picker-recipe", _params, socket) do
    {:noreply,
     assign(socket,
       selected_date: nil,
       validation_state: "blocked",
       errors: %{date: ["Choose a booking date before saving."]},
       last_action: "cleared booking date"
     )}
  end

  def handle_event(
        "submit-date-picker-recipes",
        _params,
        %{assigns: %{selected_date: nil}} = socket
      ) do
    {:noreply, block_booking(socket, "blocked date save")}
  end

  def handle_event("submit-date-picker-recipes", %{"booking" => booking}, socket) do
    submitted_date = Map.get(booking, "date", date_value(socket.assigns.selected_date))

    if submitted_date == "" do
      {:noreply, block_booking(socket, "blocked date save")}
    else
      {:noreply,
       assign(socket,
         validation_state: "submitted",
         submitted_count: socket.assigns.submitted_count + 1,
         errors: %{},
         last_action: "submitted booking date #{submitted_date}"
       )}
    end
  end

  def handle_event("reset-date-picker-recipes", _params, socket) do
    {:noreply, assign_initial(socket, "reset date picker recipe")}
  end

  @impl true
  def render(assigns) do
    assigns =
      assign(assigns,
        available_dates: available_dates(assigns.calendar_month),
        booking_errors: field_errors(assigns.errors, :date),
        selected_label: date_label(assigns.selected_date),
        month_label: month_label(assigns.calendar_month),
        can_reset?: can_reset?(assigns),
        min_date: @min_date,
        max_date: @max_date,
        locked_date: @locked_date,
        locked_month: Date.beginning_of_month(@locked_date)
      )

    ~H"""
    <div
      id={@id}
      data-exo="date-picker-recipes-workflow"
      data-current-month={date_value(@calendar_month)}
      data-selected-date={date_value(@selected_date)}
      data-validation-state={@validation_state}
      data-selection-count={@selection_count}
      data-month-change-count={@month_change_count}
      data-submitted-count={@submitted_count}
      data-blocked-count={@blocked_count}
      data-last-action={@last_action}
      style="min-height: 780px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Date picker recipes
        <:subtitle>
          Parent-controlled month state, available days, hidden form values, validation, disabled state, and keyboard movement.
        </:subtitle>
        <:actions>
          <.badge variant={validation_badge_variant(@validation_state)}>
            {@validation_state}
          </.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Selected" value={@selected_label} subtitle="hidden ISO value" />
        <.stat_card title="Month" value={@month_label} subtitle="parent-owned" />
        <.stat_card title="Submits" value={@submitted_count} subtitle="accepted saves" />
        <.stat_card title="Blocked" value={@blocked_count} subtitle="server validation" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Booking date form">
            <:action>
              <.button
                type="button"
                size="sm"
                variant="ghost"
                disabled={!@can_reset?}
                phx-click="reset-date-picker-recipes"
                phx-target={@myself}
              >
                Reset dates
              </.button>
            </:action>

            <ExoUI.Components.Form.form
              id="date-picker-recipes-form"
              for={%{}}
              as={:booking}
              phx-submit="submit-date-picker-recipes"
              phx-target={@myself}
              style="display: grid; gap: 1rem;"
            >
              <.date_picker
                id="date-recipe-booking-date"
                name="booking[date]"
                label="Booking date"
                description="Choose an available review day between March and May 2026."
                selected={@selected_date}
                current_month={@calendar_month}
                min={@min_date}
                max={@max_date}
                available_dates={@available_dates}
                errors={@booking_errors}
                on_select="select-date-picker-recipe"
                on_prev_month="date-picker-recipe-prev-month"
                on_next_month="date-picker-recipe-next-month"
                target={@myself}
              />

              <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
                <.button
                  id="date-recipe-clear"
                  type="button"
                  variant="ghost"
                  phx-click="clear-date-picker-recipe"
                  phx-target={@myself}
                >
                  Clear booking date
                </.button>
                <.button id="date-recipe-submit" type="submit">
                  <.icon name="calendar-check" /> Save booking date
                </.button>
              </div>
            </ExoUI.Components.Form.form>
          </.content_card>

          <.content_card title="Locked calendar state">
            <.date_picker
              id="date-recipe-locked-date"
              name="booking[locked_date]"
              label="Locked audit date"
              description="Disabled calendars keep semantics while preventing selection and month navigation."
              selected={@locked_date}
              current_month={@locked_month}
              min={@locked_date}
              max={@locked_date}
              disabled
            />
          </.content_card>
        </div>

        <aside style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Date picker state">
            <.list>
              <:item title="Selected">{@selected_label}</:item>
              <:item title="Visible month">{@month_label}</:item>
              <:item title="Available days">{available_summary(@available_dates)}</:item>
              <:item title="Window">Mar 1 - May 31, 2026</:item>
            </.list>
          </.content_card>

          <.content_card title="Interaction coverage">
            <.list>
              <:item title="Keyboard">Arrow keys, Home, End, PageUp, PageDown</:item>
              <:item title="ARIA">group, grid, gridcell, selected, disabled</:item>
              <:item title="Forms">hidden ISO input submits with the form</:item>
              <:item title="Validation">server errors wire into aria-describedby</:item>
            </.list>
          </.content_card>

          <.alert kind={alert_kind(@validation_state)} title="Date picker status">
            {@last_action}
          </.alert>
        </aside>
      </div>

      <p
        id="date-picker-recipes-state"
        data-exo="date-picker-recipes-state"
        data-selected-date={date_value(@selected_date)}
        data-current-month={date_value(@calendar_month)}
        data-validation-state={@validation_state}
        data-submitted-count={@submitted_count}
        data-blocked-count={@blocked_count}
        data-last-action={@last_action}
        style="margin: 0; color: var(--muted-foreground);"
      >
        Showing {@month_label}; selected {@selected_label}; last action: {@last_action}.
      </p>
    </div>
    """
  end

  defp assign_initial(socket, last_action) do
    assign(socket,
      selected_date: @initial_date,
      calendar_month: Date.beginning_of_month(@initial_date),
      validation_state: "ready",
      errors: %{},
      submitted_count: 0,
      blocked_count: 0,
      selection_count: 0,
      month_change_count: 0,
      last_action: last_action
    )
  end

  defp move_booking_month(socket, direction) do
    month =
      socket.assigns.calendar_month
      |> shift_month(direction)
      |> clamp_month()

    assign(socket,
      calendar_month: month,
      month_change_count: socket.assigns.month_change_count + 1,
      last_action: "moved to #{month_label(month)}"
    )
  end

  defp select_booking_date(socket, selected) do
    if date_in_range?(selected) do
      assign(socket,
        selected_date: selected,
        calendar_month: Date.beginning_of_month(selected),
        validation_state: "ready",
        errors: %{},
        selection_count: socket.assigns.selection_count + 1,
        last_action: "selected booking date #{Date.to_iso8601(selected)}"
      )
    else
      block_booking(socket, "blocked out-of-range date")
    end
  end

  defp block_booking(socket, last_action) do
    assign(socket,
      validation_state: "blocked",
      errors: %{date: ["Choose a booking date before saving."]},
      blocked_count: socket.assigns.blocked_count + 1,
      last_action: last_action
    )
  end

  defp available_dates(month) do
    month = Date.beginning_of_month(month)
    [4, 12, 15, 22] |> Enum.map(&Date.add(month, &1 - 1))
  end

  defp available_summary(dates) do
    dates
    |> Enum.map(&Integer.to_string(&1.day))
    |> Enum.join(", ")
  end

  defp shift_month(date, :previous) do
    date |> Date.beginning_of_month() |> Date.add(-1) |> Date.beginning_of_month()
  end

  defp shift_month(date, :next) do
    date |> Date.end_of_month() |> Date.add(1) |> Date.beginning_of_month()
  end

  defp clamp_month(month) do
    min_month = Date.beginning_of_month(@min_date)
    max_month = Date.beginning_of_month(@max_date)

    cond do
      Date.compare(month, min_month) == :lt -> min_month
      Date.compare(month, max_month) == :gt -> max_month
      true -> month
    end
  end

  defp date_in_range?(date) do
    Date.compare(date, @min_date) != :lt and Date.compare(date, @max_date) != :gt
  end

  defp can_reset?(assigns) do
    assigns.selected_date != @initial_date or
      assigns.calendar_month != Date.beginning_of_month(@initial_date) or
      assigns.validation_state != "ready" or assigns.submitted_count != 0 or
      assigns.blocked_count != 0 or assigns.selection_count != 0 or
      assigns.month_change_count != 0
  end

  defp field_errors(errors, field), do: Map.get(errors, field, [])

  defp date_value(nil), do: "none"
  defp date_value(%Date{} = date), do: Date.to_iso8601(date)

  defp date_label(nil), do: "None"
  defp date_label(%Date{} = date), do: Date.to_iso8601(date)

  defp month_label(%Date{} = date), do: Calendar.strftime(date, "%B %Y")

  defp validation_badge_variant("submitted"), do: "success"
  defp validation_badge_variant("blocked"), do: "warning"
  defp validation_badge_variant(_state), do: "primary"

  defp alert_kind("blocked"), do: :warning
  defp alert_kind("submitted"), do: :success
  defp alert_kind(_state), do: :info
end
