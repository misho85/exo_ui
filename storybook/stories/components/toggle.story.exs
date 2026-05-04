defmodule Storybook.Components.Toggle do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.toggle/1

  def variations do
    [
      %Variation{
        id: :off,
        attributes: %{checked: false}
      },
      %Variation{
        id: :on,
        attributes: %{checked: true}
      },
      %Variation{
        id: :with_label,
        attributes: %{
          name: "notifications",
          checked: true,
          label: "Notifications",
          description: "Send product updates by email."
        }
      },
      %Variation{
        id: :with_error,
        attributes: %{name: "terms", label: "Accept terms", errors: ["must be accepted"]}
      }
    ]
  end
end
