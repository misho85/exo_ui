defmodule Storybook.Components.DropdownMenuChoices do
  use PhoenixStorybook.Story, :example

  def doc,
    do:
      "A menu with a choice and a toggle: `menuitemradio` items in a named group and a " <>
        "`menuitemcheckbox`, reached by the arrow keys like any other item."

  @impl true
  def render(assigns) do
    ~H"""
    <div style="min-height: 420px; padding: 2rem;">
      <ExoUI.Components.Overlay.popover id="dropdown-choices" align="start" haspopup="menu">
        <:trigger>
          <ExoUI.Components.button variant="outline">View</ExoUI.Components.button>
        </:trigger>

        <div
          id="dropdown-choices-menu"
          data-exo="dropdown-menu"
          role="menu"
          aria-label="View options"
          phx-hook="ExoDropdownMenu"
        >
          <button type="button" data-exo="dropdown-item" role="menuitem">
            <span data-exo="dropdown-item-label">Refresh</span>
          </button>
          <div data-exo="dropdown-separator" role="separator" />

          <div role="group" aria-labelledby="dropdown-choices-density">
            <span id="dropdown-choices-density" data-exo="dropdown-label">Density</span>
            <button type="button" data-exo="dropdown-item" role="menuitemradio" aria-checked="false">
              <span data-exo="dropdown-item-label">Compact</span>
            </button>
            <button type="button" data-exo="dropdown-item" role="menuitemradio" aria-checked="true">
              <span data-exo="dropdown-item-label">Comfortable</span>
            </button>
            <button
              type="button"
              data-exo="dropdown-item"
              role="menuitemradio"
              aria-checked="false"
              disabled
            >
              <span data-exo="dropdown-item-label">Spacious</span>
            </button>
          </div>
          <div data-exo="dropdown-separator" role="separator" />

          <button type="button" data-exo="dropdown-item" role="menuitemcheckbox" aria-checked="true">
            <span data-exo="dropdown-item-label">Show grid</span>
          </button>
          <button type="button" data-exo="dropdown-item" role="menuitem">
            <span data-exo="dropdown-item-label">Reset view</span>
          </button>
        </div>
      </ExoUI.Components.Overlay.popover>
    </div>
    """
  end
end
