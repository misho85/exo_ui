defmodule Storybook.Components.Select do
  use PhoenixStorybook.Story, :page

  def doc, do: "Custom select component built on native popover. Replaces native <select>."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 2rem; max-width: 20rem;">
      <div>
        <h3>Basic</h3>
        <ExoUI.Components.select id="sel-basic" name="fruit" prompt="Select a fruit">
          <:option value="apple">Apple</:option>
          <:option value="banana">Banana</:option>
          <:option value="cherry">Cherry</:option>
          <:option value="date" disabled>Date (sold out)</:option>
        </ExoUI.Components.select>
      </div>

      <div>
        <h3>With value selected</h3>
        <ExoUI.Components.select id="sel-value" name="status" value="active" label="Status">
          <:option value="active">Active</:option>
          <:option value="inactive">Inactive</:option>
          <:option value="archived">Archived</:option>
        </ExoUI.Components.select>
      </div>

      <div>
        <h3>With groups</h3>
        <ExoUI.Components.select id="sel-groups" name="role" label="Role" prompt="Choose role">
          <:option value="super_admin" group="Admin">Super Admin</:option>
          <:option value="admin" group="Admin">Admin</:option>
          <:option value="editor" group="User">Editor</:option>
          <:option value="viewer" group="User">Viewer</:option>
        </ExoUI.Components.select>
      </div>

      <div>
        <h3>With icons</h3>
        <ExoUI.Components.select id="sel-icons" name="priority" value="medium" label="Priority">
          <:option value="low" icon="arrow-down">Low</:option>
          <:option value="medium" icon="minus">Medium</:option>
          <:option value="high" icon="arrow-up">High</:option>
        </ExoUI.Components.select>
      </div>

      <div>
        <h3>With errors</h3>
        <ExoUI.Components.select id="sel-err" name="x" label="Required field" errors={["can't be blank"]} prompt="Select...">
          <:option value="a">Option A</:option>
        </ExoUI.Components.select>
      </div>
    </div>
    """
  end
end
