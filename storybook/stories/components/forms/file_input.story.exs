defmodule Storybook.Components.FileInput do
  use PhoenixStorybook.Story, :page

  def doc, do: "File upload input with styled file selector button."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; max-width: 400px;">
      <ExoUI.Components.file_input name="avatar" label="Upload avatar" accept="image/*" />
      <ExoUI.Components.file_input
        name="documents"
        label="Upload documents"
        description="PDF, DOCX, or image files are accepted."
        multiple
      />
      <ExoUI.Components.file_input name="disabled" label="Disabled" disabled />
      <ExoUI.Components.file_input
        name="required_upload"
        label="Required upload"
        description="Attach at least one file before continuing."
        errors={["is required"]}
      />
    </div>
    """
  end
end
