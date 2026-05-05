defmodule Storybook.Components.Popover do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Overlay.popover/1

  def template do
    """
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 2rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :default,
        slots: [
          ~s|<:trigger>Open popover</:trigger>|,
          ~s|<p style="padding: 0.5rem 0.75rem;">Popover content. Click outside to dismiss.</p>|
        ]
      },
      %Variation{
        id: :top,
        attributes: %{side: "top"},
        slots: [
          ~s|<:trigger>Open top</:trigger>|,
          ~s|<p style="padding: 0.5rem 0.75rem;">This appears above the trigger.</p>|
        ]
      },
      %Variation{
        id: :right,
        attributes: %{side: "right"},
        slots: [
          ~s|<:trigger>Open right</:trigger>|,
          ~s|<p style="padding: 0.5rem 0.75rem;">This appears to the right.</p>|
        ]
      },
      %Variation{
        id: :with_close_button,
        slots: [
          ~s|<:trigger>Open</:trigger>|,
          ~s|<p style="padding: 0.5rem 0.75rem;">Click the button below to close.</p>|,
          ~s|<button type="button" popovertarget="popover-single-with-close-button" popovertargetaction="hide" style="margin-top: 0.5rem;">Close</button>|
        ]
      }
    ]
  end
end
