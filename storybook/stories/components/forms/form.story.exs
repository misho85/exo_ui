defmodule Storybook.Components.Form do
  use PhoenixStorybook.Story, :component

  def function, do: &__MODULE__.exo_form/1

  def attributes do
    [
      %Attr{id: :for, type: :any, required: true, doc: "Form data or form struct."},
      %Attr{id: :as, type: :any, default: nil, doc: "Optional form name."},
      %Attr{id: :class, type: :any, default: nil},
      %Attr{id: :rest, type: :global}
    ]
  end

  def slots do
    [
      %Slot{id: :inner_block, required: true, doc: "Form fields and actions."}
    ]
  end

  def exo_form(assigns), do: ExoUI.Components.Form.form(assigns)

  def template do
    """
    <div style="padding: 1rem; max-width: 520px;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      {"profile-form",
       %Variation{
         id: :profile,
         attributes: %{
           for: %{"name" => "Ada Lovelace", "email" => "ada@example.com"},
           as: :profile
         },
         slots: [
           ~s|<ExoUI.Components.input name="profile[name]" value="Ada Lovelace" label="Name" placeholder="Jane Doe" />|,
           ~s|<ExoUI.Components.input name="profile[email]" value="ada@example.com" type="email" label="Email" placeholder="jane@example.com" />|,
           ~s|<ExoUI.Components.input name="profile[bio]" type="textarea" label="Bio" value="Product engineer focused on LiveView UI systems." rows="4" />|,
           ~s|<ExoUI.Components.input name="profile[public]" type="checkbox" label="Public profile" checked />|,
           ~s|<div style="display: flex; gap: 0.5rem; justify-content: flex-end;"><ExoUI.Components.button type="button" variant="ghost">Cancel</ExoUI.Components.button><ExoUI.Components.button type="submit">Save</ExoUI.Components.button></div>|
         ]
       }}
    ]
    |> without_legacy_dom_ids()
  end

  defp without_legacy_dom_ids(variations),
    do: Enum.map(variations, fn {_dom_id, variation} -> variation end)
end
