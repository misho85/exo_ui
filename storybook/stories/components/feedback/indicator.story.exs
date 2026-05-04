defmodule Storybook.Components.Indicator do
  use PhoenixStorybook.Story, :page

  def doc, do: "Notification dot or badge overlay positioned on another element."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 1rem;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Badge with count</h3>
        <div style="display: flex; gap: 2rem; align-items: center;">
          <ExoUI.Components.indicator>
            <:badge>5</:badge>
            <ExoUI.Components.button>Inbox</ExoUI.Components.button>
          </ExoUI.Components.indicator>

          <ExoUI.Components.indicator>
            <:badge>99+</:badge>
            <ExoUI.Components.button>Notifications</ExoUI.Components.button>
          </ExoUI.Components.indicator>
        </div>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Positions</h3>
        <div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
          <ExoUI.Components.indicator position="top-right">
            <:badge>TR</:badge>
            <ExoUI.Components.badge>Item</ExoUI.Components.badge>
          </ExoUI.Components.indicator>

          <ExoUI.Components.indicator position="top-left">
            <:badge>TL</:badge>
            <ExoUI.Components.badge>Item</ExoUI.Components.badge>
          </ExoUI.Components.indicator>

          <ExoUI.Components.indicator position="bottom-right">
            <:badge>BR</:badge>
            <ExoUI.Components.badge>Item</ExoUI.Components.badge>
          </ExoUI.Components.indicator>

          <ExoUI.Components.indicator position="bottom-left">
            <:badge>BL</:badge>
            <ExoUI.Components.badge>Item</ExoUI.Components.badge>
          </ExoUI.Components.indicator>
        </div>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Without badge (dot only via CSS)</h3>
        <ExoUI.Components.indicator>
          <ExoUI.Components.avatar name="John Doe" size="md" />
        </ExoUI.Components.indicator>
      </section>
    </div>
    """
  end
end
