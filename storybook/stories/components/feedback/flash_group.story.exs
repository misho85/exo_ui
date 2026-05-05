defmodule Storybook.Components.FlashGroup do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Feedback.flash_group/1

  def template do
    """
    <div style="padding: 1rem; min-height: 260px;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :with_messages,
        attributes: %{
          id: "flash-group-demo",
          flash: %{
            "info" => "Profile saved successfully.",
            "error" => "Could not sync the latest changes."
          }
        }
      },
      %Variation{
        id: :custom_connection_messages,
        attributes: %{
          id: "flash-group-custom",
          flash: %{},
          disconnect_msg: "Trying to reconnect...",
          reconnect_msg: "Connection is still unavailable."
        }
      }
    ]
  end
end
