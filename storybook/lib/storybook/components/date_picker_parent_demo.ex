defmodule ExoUI.Storybook.Components.DatePickerParentDemo do
  @moduledoc """
  Parent-controlled date picker demo.

  The date picker emits select/month events and this LiveComponent owns the
  selected date plus visible month state.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  @initial_date ~D[2026-03-15]
  @min_date ~D[2026-01-01]
  @max_date ~D[2026-12-31]

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       selected: @initial_date,
       current_month: Date.beginning_of_month(@initial_date),
       min_date: @min_date,
       max_date: @max_date
     )}
  end

  @impl true
  def handle_event("controlled-prev-month", _params, socket) do
    {:noreply, update(socket, :current_month, &previous_month/1)}
  end

  def handle_event("controlled-next-month", _params, socket) do
    {:noreply, update(socket, :current_month, &next_month/1)}
  end

  def handle_event("controlled-select-date", %{"date" => date}, socket) do
    selected = Date.from_iso8601!(date)

    {:noreply,
     assign(socket,
       selected: selected,
       current_month: Date.beginning_of_month(selected)
     )}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div
      id={@id}
      data-exo="date-picker-parent-demo"
      style="padding: 1rem; display: grid; gap: 1rem; max-width: 420px;"
    >
      <.date_picker
        id="controlled-booking-date"
        name="booking[date]"
        label="Controlled booking date"
        description="Parent LiveComponent owns the visible month and selected value."
        selected={@selected}
        current_month={@current_month}
        min={@min_date}
        max={@max_date}
        available_dates={available_dates(@current_month)}
        on_select="controlled-select-date"
        on_prev_month="controlled-prev-month"
        on_next_month="controlled-next-month"
        target={@myself}
      />

      <p
        id="controlled-date-picker-state"
        data-exo="date-picker-parent-state"
        data-month={Date.to_iso8601(@current_month)}
        data-selected={Date.to_iso8601(@selected)}
      >
        Showing {Calendar.strftime(@current_month, "%B %Y")} with selected date {Date.to_iso8601(
          @selected
        )}.
      </p>
    </div>
    """
  end

  defp available_dates(month) do
    month = Date.beginning_of_month(month)
    [4, 12, 15, 22] |> Enum.map(&Date.add(month, &1 - 1))
  end

  defp previous_month(date) do
    date |> Date.beginning_of_month() |> Date.add(-1) |> Date.beginning_of_month()
  end

  defp next_month(date) do
    date |> Date.end_of_month() |> Date.add(1) |> Date.beginning_of_month()
  end
end
