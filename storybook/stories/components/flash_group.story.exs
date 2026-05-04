defmodule Storybook.Components.FlashGroup do
  use PhoenixStorybook.Story, :page

  def doc, do: "Flash group that renders info, error, and LiveView connection state messages."

  def render(assigns) do
    assigns =
      assign(assigns, :flash, %{
        "info" => "Profile saved successfully.",
        "error" => "Could not sync the latest changes."
      })

    ~H"""
    <div style="padding: 1rem; min-height: 260px;">
      <ExoUI.Components.flash_group flash={@flash} />
    </div>
    """
  end
end
