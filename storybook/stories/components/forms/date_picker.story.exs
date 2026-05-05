defmodule Storybook.Components.DatePicker do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.date_picker/1

  def template do
    """
    <div style="padding: 1rem; display: flex; gap: 2rem; flex-wrap: wrap;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    today = Date.utc_today()
    start_of_month = Date.beginning_of_month(today)

    [
      {"dp-default",
       %Variation{
         id: :default,
         attributes: %{label: "Select a date", current_month: today}
       }},
      {"dp-selected",
       %Variation{
         id: :selected,
         attributes: %{
           name: "departure",
           label: "Departure",
           description: "The selected date is submitted as an ISO value.",
           current_month: today,
           selected: today
         }
       }},
      {"dp-constrained",
       %Variation{
         id: :constrained,
         attributes: %{
           label: "Available dates",
           current_month: today,
           min: start_of_month,
           max: Date.add(today, 14)
         }
       }},
      {"dp-available",
       %Variation{
         id: :available_dates,
         attributes: %{
           label: "Interview slots",
           current_month: today,
           available_dates: [Date.add(today, 1), Date.add(today, 3), Date.add(today, 7)]
         }
       }},
      {"dp-keyboard",
       %Variation{
         id: :keyboard_navigation,
         attributes: %{
           label: "Keyboard date",
           current_month: ~D[2026-03-15],
           selected: ~D[2026-03-15]
         }
       }},
      {"dp-error",
       %Variation{
         id: :with_error,
         attributes: %{
           name: "booking_date",
           label: "Booking date",
           description: "Choose an available day.",
           current_month: today,
           errors: ["Select a booking date."]
         }
       }},
      {"dp-disabled",
       %Variation{
         id: :disabled,
         attributes: %{
           label: "Not available",
           current_month: today,
           disabled: true
         }
       }}
    ]
    |> without_legacy_dom_ids()
  end

  defp without_legacy_dom_ids(variations),
    do: Enum.map(variations, fn {_dom_id, variation} -> variation end)
end
