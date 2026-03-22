defmodule Storybook.Components.Select do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.input/1

  def template do
    """
    <div style="max-width: 320px;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :basic,
        attributes: %{
          type: "select",
          name: "country",
          value: "",
          label: "Country",
          prompt: "Select a country...",
          options: [{"United States", "us"}, {"United Kingdom", "uk"}, {"Germany", "de"}, {"France", "fr"}, {"Japan", "jp"}]
        }
      },
      %Variation{
        id: :preselected,
        attributes: %{
          type: "select",
          name: "role",
          value: "editor",
          label: "Role",
          options: [{"Admin", "admin"}, {"Editor", "editor"}, {"Viewer", "viewer"}]
        }
      },
      %Variation{
        id: :with_error,
        attributes: %{
          type: "select",
          name: "category",
          value: "",
          label: "Category",
          prompt: "Choose...",
          options: [{"Design", "design"}, {"Engineering", "eng"}, {"Marketing", "mkt"}],
          errors: ["is required"]
        }
      }
    ]
  end
end
