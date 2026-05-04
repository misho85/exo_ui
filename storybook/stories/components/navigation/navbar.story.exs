defmodule Storybook.Components.Navbar do
  use PhoenixStorybook.Story, :page

  def doc, do: "Top navigation bar with brand, center content, and end content slots."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Basic</h3>
        <ExoUI.Components.navbar>
          <:brand>MyApp</:brand>
        </ExoUI.Components.navbar>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">With center navigation</h3>
        <ExoUI.Components.navbar>
          <:brand>MyApp</:brand>
          <:center>
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </:center>
        </ExoUI.Components.navbar>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Full</h3>
        <ExoUI.Components.navbar>
          <:brand>MyApp</:brand>
          <:center>
            <a href="#">Dashboard</a>
            <a href="#">Projects</a>
            <a href="#">Team</a>
          </:center>
          <:end_content>
            <ExoUI.Components.avatar name="John Doe" size="sm" />
          </:end_content>
        </ExoUI.Components.navbar>
      </section>
    </div>
    """
  end
end
