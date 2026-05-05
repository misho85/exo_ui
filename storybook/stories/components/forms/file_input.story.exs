defmodule Storybook.Components.FileInput do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.file_input/1

  def template do
    """
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; max-width: 400px;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :avatar,
        attributes: %{id: "avatar", name: "avatar", label: "Upload avatar", accept: "image/*"}
      },
      %Variation{
        id: :multiple,
        attributes: %{
          id: "documents",
          name: "documents",
          label: "Upload documents",
          description: "PDF, DOCX, or image files are accepted.",
          multiple: true
        }
      },
      %Variation{
        id: :disabled,
        attributes: %{id: "disabled", name: "disabled", label: "Disabled", disabled: true}
      },
      %Variation{
        id: :required_upload,
        attributes: %{
          id: "required_upload",
          name: "required_upload",
          label: "Required upload",
          description: "Attach at least one file before continuing.",
          errors: ["is required"]
        }
      }
    ]
  end
end
