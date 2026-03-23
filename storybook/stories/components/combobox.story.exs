defmodule Storybook.Components.Combobox do
  use PhoenixStorybook.Story, :page

  def doc, do: "Searchable select with client or server-side filtering."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 2rem; max-width: 20rem;">
      <div>
        <h3>Client-side filter</h3>
        <ExoUI.Components.combobox id="cb-client" name="country" filter="client" prompt="Search countries...">
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
        <ExoUI.Components.combobox id="cb-selected" name="lang" value="elixir" filter="client" prompt="Search...">
          <:option value="elixir">Elixir</:option>
          <:option value="rust">Rust</:option>
          <:option value="go">Go</:option>
          <:option value="python">Python</:option>
        </ExoUI.Components.combobox>
      </div>

      <div>
        <h3>Input trigger (autocomplete)</h3>
        <ExoUI.Components.combobox id="cb-input" name="city" trigger="input" filter="client" prompt="Type a city...">
          <:option value="bg">Belgrade</:option>
          <:option value="zg">Zagreb</:option>
          <:option value="sa">Sarajevo</:option>
          <:option value="lj">Ljubljana</:option>
        </ExoUI.Components.combobox>
      </div>

      <div>
        <h3>With empty state</h3>
        <ExoUI.Components.combobox id="cb-empty" name="x" filter="client" prompt="Search (try 'zzz')...">
          <:option value="a">Alpha</:option>
          <:option value="b">Beta</:option>
          <:empty>No results found</:empty>
        </ExoUI.Components.combobox>
      </div>
    </div>
    """
  end
end
