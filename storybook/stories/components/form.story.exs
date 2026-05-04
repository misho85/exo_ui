defmodule Storybook.Components.Form do
  use PhoenixStorybook.Story, :page

  def doc, do: "Form wrapper with common input fields and actions."

  def render(assigns) do
    assigns =
      assign(
        assigns,
        :form,
        Phoenix.Component.to_form(%{"name" => "Ada Lovelace", "email" => "ada@example.com"},
          as: :profile
        )
      )

    ~H"""
    <div style="padding: 1rem; max-width: 520px;">
      <ExoUI.Components.form for={@form} id="profile-form">
        <ExoUI.Components.input field={@form[:name]} label="Name" placeholder="Jane Doe" />
        <ExoUI.Components.input
          field={@form[:email]}
          type="email"
          label="Email"
          placeholder="jane@example.com"
        />
        <ExoUI.Components.input
          name="profile[bio]"
          type="textarea"
          label="Bio"
          value="Product engineer focused on LiveView UI systems."
          rows="4"
        />
        <ExoUI.Components.input name="profile[public]" type="checkbox" label="Public profile" checked />

        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <ExoUI.Components.button type="button" variant="ghost">Cancel</ExoUI.Components.button>
          <ExoUI.Components.button type="submit">Save</ExoUI.Components.button>
        </div>
      </ExoUI.Components.form>
    </div>
    """
  end
end
