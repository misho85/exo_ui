defmodule Storybook.Components.BottomNav do
  use PhoenixStorybook.Story, :page

  def doc, do: "Mobile bottom navigation bar with icon items."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; max-width: 400px;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Basic</h3>
        <ExoUI.Components.bottom_nav>
          <:item label="Home" href="#" active={true}>Home</:item>
          <:item label="Search" href="#">Search</:item>
          <:item label="Profile" href="#">Profile</:item>
        </ExoUI.Components.bottom_nav>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">With icons</h3>
        <ExoUI.Components.bottom_nav>
          <:item label="Home" icon="house" href="#" active={true}>Home</:item>
          <:item label="Explore" icon="search" href="#">Explore</:item>
          <:item label="Inbox" icon="inbox" href="#">Inbox</:item>
          <:item label="Account" icon="user" href="#">Account</:item>
        </ExoUI.Components.bottom_nav>
      </section>
    </div>
    """
  end
end
