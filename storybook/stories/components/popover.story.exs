defmodule Storybook.Components.Popover do
  use PhoenixStorybook.Story, :page

  def doc, do: "Base floating container using native HTML Popover API."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 2rem;">
      <div>
        <h3>Default (bottom center)</h3>
        <ExoUI.Components.popover id="pop-default">
          <:trigger>Open popover</:trigger>
          <p>Popover content. Click outside to dismiss.</p>
        </ExoUI.Components.popover>
      </div>

      <div>
        <h3>Top</h3>
        <ExoUI.Components.popover id="pop-top" side="top">
          <:trigger>Open top</:trigger>
          <p>This appears above the trigger.</p>
        </ExoUI.Components.popover>
      </div>

      <div>
        <h3>Right</h3>
        <ExoUI.Components.popover id="pop-right" side="right">
          <:trigger>Open right</:trigger>
          <p>This appears to the right.</p>
        </ExoUI.Components.popover>
      </div>

      <div>
        <h3>With close button</h3>
        <ExoUI.Components.popover id="pop-close">
          <:trigger>Open</:trigger>
          <p>Click the button below to close.</p>
          <button type="button" popovertarget="pop-close" popovertargetaction="hide" style="margin-top: 0.5rem;">
            Close
          </button>
        </ExoUI.Components.popover>
      </div>
    </div>
    """
  end
end
