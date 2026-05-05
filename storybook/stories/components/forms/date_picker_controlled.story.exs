defmodule Storybook.Components.DatePickerControlled do
  use PhoenixStorybook.Story, :live_component

  alias ExoUI.Storybook.Components.DatePickerParentDemo

  def component, do: DatePickerParentDemo

  def layout, do: :one_column

  def variations do
    [
      %Variation{
        id: :month_navigation,
        attributes: %{id: "date-picker-controlled-demo"}
      }
    ]
  end
end
