defmodule Storybook.Components.Combobox do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.combobox/1

  def template do
    """
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; max-width: 20rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      {"cb-client",
       %Variation{
         id: :client_filter,
         attributes: %{
           name: "country",
           filter: "client",
           prompt: "Search countries..."
         },
         slots: [
           ~s|<:option value="rs">Serbia</:option>|,
           ~s|<:option value="hr">Croatia</:option>|,
           ~s|<:option value="ba">Bosnia &amp; Herzegovina</:option>|,
           ~s|<:option value="me">Montenegro</:option>|,
           ~s|<:option value="si">Slovenia</:option>|,
           ~s|<:option value="mk">North Macedonia</:option>|
         ]
       }},
      {"cb-selected",
       %Variation{
         id: :with_value,
         attributes: %{
           name: "lang",
           value: "elixir",
           label: "Language",
           description: "Choose the primary implementation language.",
           filter: "client",
           prompt: "Search..."
         },
         slots: [
           ~s|<:option value="elixir">Elixir</:option>|,
           ~s|<:option value="rust">Rust</:option>|,
           ~s|<:option value="go">Go</:option>|,
           ~s|<:option value="python">Python</:option>|
         ]
       }},
      {"cb-input",
       %Variation{
         id: :input_trigger,
         attributes: %{
           name: "city",
           trigger: "input",
           filter: "client",
           prompt: "Type a city..."
         },
         slots: [
           ~s|<:option value="bg">Belgrade</:option>|,
           ~s|<:option value="zg">Zagreb</:option>|,
           ~s|<:option value="sa">Sarajevo</:option>|,
           ~s|<:option value="lj">Ljubljana</:option>|
         ]
       }},
      {"cb-grouped",
       %Variation{
         id: :grouped_options,
         attributes: %{
           name: "assignee",
           label: "Assignee",
           value: "maria",
           filter: "client",
           prompt: "Find a person..."
         },
         slots: [
           ~s|<:option value="ana" group="Design">Ana Markovic</:option>|,
           ~s|<:option value="maria" group="Design">Maria Ilic</:option>|,
           ~s|<:option value="nikola" group="Engineering">Nikola Petrovic</:option>|,
           ~s|<:option value="stefan" group="Engineering" disabled>Stefan unavailable</:option>|
         ]
       }},
      {"cb-empty",
       %Variation{
         id: :empty_state,
         attributes: %{
           name: "x",
           label: "Result",
           description: "Type a query to filter client-side options.",
           filter: "client",
           prompt: "Search (try 'zzz')..."
         },
         slots: [
           ~s|<:option value="a">Alpha</:option>|,
           ~s|<:option value="b">Beta</:option>|,
           ~s|<:empty>No results found</:empty>|
         ]
       }},
      {"cb-creatable",
       %Variation{
         id: :creatable,
         attributes: %{
           name: "tag",
           label: "Tag",
           filter: "client",
           creatable: true,
           prompt: "Search or create tag..."
         },
         slots: [
           ~s|<:option value="bug">Bug</:option>|,
           ~s|<:option value="feature">Feature</:option>|,
           ~s|<:option value="docs">Docs</:option>|
         ]
       }},
      {"cb-loading",
       %Variation{
         id: :loading,
         attributes: %{
           name: "remote_user",
           label: "Remote user",
           loading: true,
           prompt: "Search directory..."
         },
         slots: [
           ~s|<:empty>Type to search users</:empty>|
         ]
       }},
      {"cb-disabled",
       %Variation{
         id: :disabled,
         attributes: %{
           name: "locked_owner",
           value: "ops",
           label: "Locked owner",
           disabled: true,
           prompt: "Owner cannot be changed"
         },
         slots: [
           ~s|<:option value="ops">Operations</:option>|,
           ~s|<:option value="support">Support</:option>|
         ]
       }},
      {"cb-error",
       %Variation{
         id: :with_errors,
         attributes: %{
           name: "team",
           label: "Team",
           description: "Required for routing ownership.",
           errors: ["can't be blank"],
           filter: "client",
           prompt: "Choose a team..."
         },
         slots: [
           ~s|<:option value="design">Design</:option>|,
           ~s|<:option value="engineering">Engineering</:option>|
         ]
       }}
    ]
    |> without_legacy_dom_ids()
  end

  defp without_legacy_dom_ids(variations),
    do: Enum.map(variations, fn {_dom_id, variation} -> variation end)
end
