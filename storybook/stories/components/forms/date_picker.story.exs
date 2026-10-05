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
    # A fixed date, not `Date.utc_today()`: the visual baseline is a screenshot
    # of this page, and a moving "today" changed it every day and every month.
    anchor = ~D[2026-03-18]
    start_of_month = Date.beginning_of_month(anchor)

    [
      {"dp-default",
       %Variation{
         id: :default,
         attributes: %{label: "Select a date", current_month: anchor}
       }},
      {"dp-selected",
       %Variation{
         id: :selected,
         attributes: %{
           name: "departure",
           label: "Departure",
           description: "The selected date is submitted as an ISO value.",
           current_month: anchor,
           selected: anchor
         }
       }},
      {"dp-constrained",
       %Variation{
         id: :constrained,
         attributes: %{
           label: "Available dates",
           current_month: anchor,
           min: start_of_month,
           max: Date.add(anchor, 14)
         }
       }},
      {"dp-available",
       %Variation{
         id: :available_dates,
         attributes: %{
           label: "Interview slots",
           current_month: anchor,
           available_dates: [Date.add(anchor, 1), Date.add(anchor, 3), Date.add(anchor, 7)]
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
           current_month: anchor,
           errors: ["Select a booking date."]
         }
       }},
      {"dp-disabled",
       %Variation{
         id: :disabled,
         attributes: %{
           label: "Not available",
           current_month: anchor,
           disabled: true
         }
       }}
    ]
    |> without_legacy_dom_ids()
  end

  defp without_legacy_dom_ids(variations),
    do: Enum.map(variations, fn {_dom_id, variation} -> variation end)
end
