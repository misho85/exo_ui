defmodule Storybook.Components.Select do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.select/1

  def template do
    """
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; max-width: 20rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      {"sel-basic",
       %Variation{
         id: :basic,
         attributes: %{name: "fruit", prompt: "Select a fruit"},
         slots: [
           ~s|<:option value="apple">Apple</:option>|,
           ~s|<:option value="banana">Banana</:option>|,
           ~s|<:option value="cherry">Cherry</:option>|,
           ~s|<:option value="date" disabled>Date (sold out)</:option>|
         ]
       }},
      {"sel-value",
       %Variation{
         id: :with_value,
         attributes: %{name: "status", value: "active", label: "Status"},
         slots: [
           ~s|<:option value="active">Active</:option>|,
           ~s|<:option value="inactive">Inactive</:option>|,
           ~s|<:option value="archived">Archived</:option>|
         ]
       }},
      {"sel-groups",
       %Variation{
         id: :with_groups,
         attributes: %{
           name: "role",
           label: "Role",
           prompt: "Choose role"
         },
         slots: [
           ~s|<:option value="super_admin" group="Admin">Super Admin</:option>|,
           ~s|<:option value="admin" group="Admin">Admin</:option>|,
           ~s|<:option value="editor" group="User">Editor</:option>|,
           ~s|<:option value="viewer" group="User">Viewer</:option>|
         ]
       }},
      {"sel-icons",
       %Variation{
         id: :with_icons,
         attributes: %{name: "priority", value: "medium", label: "Priority"},
         slots: [
           ~s|<:option value="low" icon="arrow-down">Low</:option>|,
           ~s|<:option value="medium" icon="minus">Medium</:option>|,
           ~s|<:option value="high" icon="arrow-up">High</:option>|
         ]
       }},
      {"sel-desc",
       %Variation{
         id: :with_description,
         attributes: %{
           name: "category",
           label: "Category",
           description: "Choose the primary category for this item",
           prompt: "Select..."
         },
         slots: [
           ~s|<:option value="tech">Technology</:option>|,
           ~s|<:option value="science">Science</:option>|,
           ~s|<:option value="art">Art</:option>|
         ]
       }},
      {"sel-disabled",
       %Variation{
         id: :disabled,
         attributes: %{
           name: "locked",
           label: "Locked field",
           disabled: true,
           prompt: "Cannot select"
         },
         slots: [
           ~s|<:option value="a">Option A</:option>|,
           ~s|<:option value="b">Option B</:option>|
         ]
       }},
      {"sel-err",
       %Variation{
         id: :with_errors,
         attributes: %{
           name: "x",
           label: "Required field",
           description: "The form cannot be submitted without this value.",
           errors: ["can't be blank"],
           prompt: "Select..."
         },
         slots: [
           ~s|<:option value="a">Option A</:option>|
         ]
       }}
    ]
    |> without_legacy_dom_ids()
  end

  defp without_legacy_dom_ids(variations),
    do: Enum.map(variations, fn {_dom_id, variation} -> variation end)
end
