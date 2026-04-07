defmodule Storybook.Components.ChatBubble do
  use PhoenixStorybook.Story, :page

  def doc, do: "Chat message bubble with avatar, header, and footer slots."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 500px; padding: 1rem;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Start (incoming)</h3>
        <ExoUI.Components.chat_bubble>
          <:header>Alice</:header>
          <:footer>12:30 PM</:footer>
          Hey, how are you?
        </ExoUI.Components.chat_bubble>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">End (outgoing)</h3>
        <ExoUI.Components.chat_bubble side="end">
          <:header>You</:header>
          <:footer>12:31 PM</:footer>
          I'm doing great, thanks!
        </ExoUI.Components.chat_bubble>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Conversation</h3>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <ExoUI.Components.chat_bubble>
            <:avatar>
              <ExoUI.Components.avatar name="Alice Smith" size="sm" />
            </:avatar>
            <:header>Alice</:header>
            <:footer>12:30 PM</:footer>
            Did you see the new release?
          </ExoUI.Components.chat_bubble>

          <ExoUI.Components.chat_bubble side="end">
            <:header>You</:header>
            <:footer>12:31 PM</:footer>
            Yes, looks amazing!
          </ExoUI.Components.chat_bubble>

          <ExoUI.Components.chat_bubble>
            <:avatar>
              <ExoUI.Components.avatar name="Alice Smith" size="sm" />
            </:avatar>
            <:header>Alice</:header>
            <:footer>12:32 PM</:footer>
            Let's try it out together.
          </ExoUI.Components.chat_bubble>
        </div>
      </section>
    </div>
    """
  end
end
