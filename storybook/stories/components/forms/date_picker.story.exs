defmodule Storybook.Components.DatePicker do
  use PhoenixStorybook.Story, :page

  def doc, do: "Interactive calendar date picker with month navigation."

  def render(assigns) do
    today = Date.utc_today()

    assigns =
      assigns
      |> assign(:today, today)
      |> assign(:start_of_month, Date.beginning_of_month(today))

    ~H"""
    <div style="padding: 1rem; display: flex; gap: 2rem; flex-wrap: wrap;">
      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          Default
        </p>
        <ExoUI.Components.date_picker
          id="dp-default"
          label="Select a date"
          current_month={@today}
        />
      </div>

      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          With selected date
        </p>
        <ExoUI.Components.date_picker
          id="dp-selected"
          name="departure"
          label="Departure"
          description="The selected date is submitted as an ISO value."
          current_month={@today}
          selected={@today}
        />
      </div>

      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          With min/max constraints
        </p>
        <ExoUI.Components.date_picker
          id="dp-constrained"
          label="Available dates"
          current_month={@today}
          min={@start_of_month}
          max={Date.add(@today, 14)}
        />
      </div>

      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          Available dates
        </p>
        <ExoUI.Components.date_picker
          id="dp-available"
          label="Interview slots"
          current_month={@today}
          available_dates={[Date.add(@today, 1), Date.add(@today, 3), Date.add(@today, 7)]}
        />
      </div>

      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          Keyboard navigation
        </p>
        <ExoUI.Components.date_picker
          id="dp-keyboard"
          label="Keyboard date"
          current_month={~D[2026-03-15]}
          selected={~D[2026-03-15]}
        />
      </div>

      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          With error
        </p>
        <ExoUI.Components.date_picker
          id="dp-error"
          name="booking_date"
          label="Booking date"
          description="Choose an available day."
          current_month={@today}
          errors={["Select a booking date."]}
        />
      </div>

      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">
          Disabled
        </p>
        <ExoUI.Components.date_picker
          id="dp-disabled"
          label="Not available"
          current_month={@today}
          disabled={true}
        />
      </div>
    </div>
    """
  end
end
