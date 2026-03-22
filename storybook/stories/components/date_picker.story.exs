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
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">Default</p>
        <ExoUI.Components.date_picker
          id="dp-default"
          label="Select a date"
          current_month={@today}
        />
      </div>

      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">With selected date</p>
        <ExoUI.Components.date_picker
          id="dp-selected"
          label="Departure"
          current_month={@today}
          selected={@today}
        />
      </div>

      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">With min/max constraints</p>
        <ExoUI.Components.date_picker
          id="dp-constrained"
          label="Available dates"
          current_month={@today}
          min={@start_of_month}
          max={Date.add(@today, 14)}
        />
      </div>

      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">Disabled</p>
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
