defmodule Storybook.Components.Input do
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
        id: :text,
        attributes: %{type: "text", name: "name", value: "", label: "Full Name", placeholder: "John Doe"}
      },
      %Variation{
        id: :email,
        attributes: %{type: "email", name: "email", value: "", label: "Email"}
      },
      %Variation{
        id: :password,
        attributes: %{type: "password", name: "pass", value: "", label: "Password"}
      },
      %Variation{
        id: :textarea,
        attributes: %{type: "textarea", name: "bio", value: "", label: "Bio"}
      },
      %Variation{
        id: :with_error,
        attributes: %{type: "text", name: "email", value: "bad", label: "Email", errors: ["is invalid"]}
      }
    ]
  end
end
