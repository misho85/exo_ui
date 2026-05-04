defmodule Storybook.Components.Combobox do
  use PhoenixStorybook.Story, :page

  def doc, do: "Searchable select with client or server-side filtering."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 2rem; max-width: 20rem;">
      <div>
        <h3>Client-side filter</h3>
        <ExoUI.Components.combobox
          id="cb-client"
          name="country"
          filter="client"
          prompt="Search countries..."
        >
          <:option value="rs">Serbia</:option>
          <:option value="hr">Croatia</:option>
          <:option value="ba">Bosnia &amp; Herzegovina</:option>
          <:option value="me">Montenegro</:option>
          <:option value="si">Slovenia</:option>
          <:option value="mk">North Macedonia</:option>
        </ExoUI.Components.combobox>
      </div>

      <div>
        <h3>With value selected</h3>
        <ExoUI.Components.combobox
          id="cb-selected"
          name="lang"
          value="elixir"
          label="Language"
          description="Choose the primary implementation language."
          filter="client"
          prompt="Search..."
        >
          <:option value="elixir">Elixir</:option>
          <:option value="rust">Rust</:option>
          <:option value="go">Go</:option>
          <:option value="python">Python</:option>
        </ExoUI.Components.combobox>
      </div>

      <div>
        <h3>Input trigger (autocomplete)</h3>
        <ExoUI.Components.combobox
          id="cb-input"
          name="city"
          trigger="input"
          filter="client"
          prompt="Type a city..."
        >
          <:option value="bg">Belgrade</:option>
          <:option value="zg">Zagreb</:option>
          <:option value="sa">Sarajevo</:option>
          <:option value="lj">Ljubljana</:option>
        </ExoUI.Components.combobox>
      </div>

      <div>
        <h3>Grouped options</h3>
        <ExoUI.Components.combobox
          id="cb-grouped"
          name="assignee"
          label="Assignee"
          value="maria"
          filter="client"
          prompt="Find a person..."
        >
          <:option value="ana" group="Design">Ana Markovic</:option>
          <:option value="maria" group="Design">Maria Ilic</:option>
          <:option value="nikola" group="Engineering">Nikola Petrovic</:option>
          <:option value="stefan" group="Engineering" disabled>Stefan unavailable</:option>
        </ExoUI.Components.combobox>
      </div>

      <div>
        <h3>With empty state</h3>
        <ExoUI.Components.combobox
          id="cb-empty"
          name="x"
          label="Result"
          description="Type a query to filter client-side options."
          filter="client"
          prompt="Search (try 'zzz')..."
        >
          <:option value="a">Alpha</:option>
          <:option value="b">Beta</:option>
          <:empty>No results found</:empty>
        </ExoUI.Components.combobox>
      </div>

      <div>
        <h3>Creatable result</h3>
        <ExoUI.Components.combobox
          id="cb-creatable"
          name="tag"
          label="Tag"
          filter="client"
          creatable
          prompt="Search or create tag..."
        >
          <:option value="bug">Bug</:option>
          <:option value="feature">Feature</:option>
          <:option value="docs">Docs</:option>
        </ExoUI.Components.combobox>
      </div>

      <div>
        <h3>Loading</h3>
        <ExoUI.Components.combobox
          id="cb-loading"
          name="remote_user"
          label="Remote user"
          loading
          prompt="Search directory..."
        >
          <:empty>Type to search users</:empty>
        </ExoUI.Components.combobox>
      </div>

      <div>
        <h3>Disabled</h3>
        <ExoUI.Components.combobox
          id="cb-disabled"
          name="locked_owner"
          value="ops"
          label="Locked owner"
          disabled
          prompt="Owner cannot be changed"
        >
          <:option value="ops">Operations</:option>
          <:option value="support">Support</:option>
        </ExoUI.Components.combobox>
      </div>

      <div>
        <h3>With errors</h3>
        <ExoUI.Components.combobox
          id="cb-error"
          name="team"
          label="Team"
          description="Required for routing ownership."
          errors={["can't be blank"]}
          filter="client"
          prompt="Choose a team..."
        >
          <:option value="design">Design</:option>
          <:option value="engineering">Engineering</:option>
        </ExoUI.Components.combobox>
      </div>
    </div>
    """
  end
end
