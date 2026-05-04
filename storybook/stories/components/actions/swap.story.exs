defmodule Storybook.Components.Swap do
  use PhoenixStorybook.Story, :page

  def doc, do: "Toggle swap between two elements using a checkbox pattern."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 1rem;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Default (inactive)</h3>
        <ExoUI.Components.swap id="swap-1" label="Enable notifications">
          <:on>ON</:on>
          <:off>OFF</:off>
        </ExoUI.Components.swap>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Active</h3>
        <ExoUI.Components.swap id="swap-2" active={true} label="Enable sync">
          <:on>ON</:on>
          <:off>OFF</:off>
        </ExoUI.Components.swap>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Theme toggle example</h3>
        <ExoUI.Components.swap id="swap-theme" label="Toggle dark mode">
          <:on>Dark Mode</:on>
          <:off>Light Mode</:off>
        </ExoUI.Components.swap>
      </section>
    </div>
    """
  end
end
