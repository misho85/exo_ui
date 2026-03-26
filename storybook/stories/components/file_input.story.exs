defmodule Storybook.Components.FileInput do
  use PhoenixStorybook.Story, :page

  def doc, do: "File upload input with styled file selector button."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; max-width: 400px;">
      <ExoUI.Components.file_input name="avatar" label="Upload avatar" accept="image/*" />
      <ExoUI.Components.file_input name="documents" label="Upload documents" multiple />
      <ExoUI.Components.file_input name="disabled" label="Disabled" disabled />
    </div>
    """
  end
end
