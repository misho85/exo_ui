defmodule ExoUI.Components.Overlay do
  @moduledoc """
  Overlay components: modals, drawers, popovers, dropdowns, tooltips, and collapsibles.
  """

  use Phoenix.Component

  import ExoUI.Components.Core, only: [button: 1, icon: 1]

  @doc "Renders a modal dialog with backdrop, title, body, and optional actions."
  attr :id, :string, required: true
  attr :show, :boolean, default: false
  attr :on_cancel, Phoenix.LiveView.JS, default: %Phoenix.LiveView.JS{}
  attr :class, :string, default: nil
  attr :rest, :global
  slot :title
  slot :inner_block, required: true
  slot :actions

  def modal(assigns) do
    ~H"""
    <div
      id={@id}
      data-exo="modal"
      data-state={if @show, do: "open", else: "closed"}
      phx-mounted={@show && show_modal(@id)}
      phx-remove={hide_modal(@id)}
      class={@class}
      {@rest}
    >
      <div data-exo="modal-backdrop" phx-click={@on_cancel |> hide_modal(@id)} />
      <div
        data-exo="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={if @title != [], do: "#{@id}-title"}
        tabindex="-1"
      >
        <div data-exo="modal-header">
          <h2 :if={@title != []} id={"#{@id}-title"} data-exo="modal-title">
            {render_slot(@title)}
          </h2>
          <button data-exo="modal-close" phx-click={@on_cancel |> hide_modal(@id)} aria-label="close">
            ✕
          </button>
        </div>
        <div data-exo="modal-body">
          {render_slot(@inner_block)}
        </div>
        <div :if={@actions != []} data-exo="modal-actions">
          {render_slot(@actions)}
        </div>
      </div>
    </div>
    """
  end

  @doc "Renders a confirmation modal with confirm/cancel buttons."
  attr :id, :string, default: "confirm-modal"
  attr :show, :boolean, default: false
  attr :title, :string, default: "Confirm"
  attr :message, :string, required: true
  attr :confirm_text, :string, default: "Confirm"
  attr :cancel_text, :string, default: "Cancel"
  attr :variant, :string, default: "danger"
  attr :on_confirm, Phoenix.LiveView.JS, default: %Phoenix.LiveView.JS{}
  attr :on_cancel, Phoenix.LiveView.JS, default: %Phoenix.LiveView.JS{}

  def confirm_modal(assigns) do
    ~H"""
    <.modal id={@id} show={@show} on_cancel={@on_cancel}>
      <:title>{@title}</:title>
      <p>{@message}</p>
      <:actions>
        <.button variant="ghost" phx-click={@on_cancel |> hide_modal(@id)}>{@cancel_text}</.button>
        <.button variant={@variant} phx-click={@on_confirm |> hide_modal(@id)}>
          {@confirm_text}
        </.button>
      </:actions>
    </.modal>
    """
  end

  defp show_modal(id) do
    %Phoenix.LiveView.JS{}
    |> Phoenix.LiveView.JS.show(to: "##{id}")
    |> Phoenix.LiveView.JS.focus_first(to: "##{id} [data-exo=\"modal-content\"]")
  end

  defp hide_modal(js \\ %Phoenix.LiveView.JS{}, id) do
    js
    |> Phoenix.LiveView.JS.hide(to: "##{id}")
    |> Phoenix.LiveView.JS.pop_focus()
  end

  @doc "Renders a popover anchored to a trigger element using the Popover API."
  attr :id, :string, required: true
  attr :side, :string, values: ~w(top bottom left right), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "center"
  attr :mode, :string, values: ~w(auto manual), default: "auto"
  attr :haspopup, :string, default: "true"
  attr :class, :string, default: nil
  attr :rest, :global

  slot :trigger
  slot :inner_block, required: true

  def popover(assigns) do
    ~H"""
    <div data-exo="popover" id={"#{@id}-popover"} phx-hook="ExoPopover">
      <button
        :if={@trigger != []}
        type="button"
        popovertarget={@id}
        data-exo="popover-trigger"
        aria-haspopup={@haspopup}
        style={"anchor-name: --popover-#{@id}"}
      >
        {render_slot(@trigger)}
      </button>
      <div
        id={@id}
        popover={@mode}
        data-exo="popover-content"
        data-side={@side}
        data-align={@align}
        class={@class}
        style={"position-anchor: --popover-#{@id}"}
        {@rest}
      >
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end

  @doc "Renders a dropdown menu with entries (items, separators, labels, sub-triggers)."
  attr :id, :string, required: true
  attr :side, :string, values: ~w(top bottom left right), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "end"
  attr :class, :string, default: nil
  attr :rest, :global

  slot :trigger

  slot :entry do
    attr :type, :string
    attr :click, :string
    attr :href, :string
    attr :navigate, :string
    attr :patch, :string
    attr :icon, :string
    attr :shortcut, :string
    attr :variant, :string
    attr :disabled, :boolean
    attr :target, :string
  end

  def dropdown_menu(assigns) do
    ~H"""
    <.popover id={@id} side={@side} align={@align} haspopup="menu">
      <:trigger :if={@trigger != []}>{render_slot(@trigger)}</:trigger>
      <div
        data-exo="dropdown-menu"
        role="menu"
        aria-label={@id}
        id={"#{@id}-menu"}
        phx-hook="ExoDropdownMenu"
        class={@class}
        {@rest}
      >
        <%= for {entry, idx} <- Enum.with_index(@entry) do %>
          <%= cond do %>
            <% entry[:type] == "separator" -> %>
              <div data-exo="dropdown-separator" role="separator" />
            <% entry[:type] == "label" -> %>
              <span data-exo="dropdown-label" id={"#{@id}-label-#{idx}"} role="none">
                {render_slot(entry)}
              </span>
            <% entry[:type] == "sub_trigger" -> %>
              <button
                type="button"
                data-exo="dropdown-item"
                role="menuitem"
                popovertarget={entry.target}
                disabled={entry[:disabled]}
              >
                <span :if={entry[:icon]} data-exo="dropdown-item-icon">
                  <.icon name={entry.icon} class="size-4" />
                </span>
                <span data-exo="dropdown-item-label">{render_slot(entry)}</span>
                <svg
                  data-exo="dropdown-item-chevron"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            <% entry[:navigate] || entry[:patch] || entry[:href] -> %>
              <.link
                data-exo="dropdown-item"
                data-variant={entry[:variant]}
                data-disabled={entry[:disabled] && ""}
                aria-disabled={to_string(entry[:disabled] || false)}
                role="menuitem"
                tabindex={if entry[:disabled], do: "-1"}
                navigate={entry[:navigate]}
                patch={entry[:patch]}
                href={entry[:href]}
              >
                <span :if={entry[:icon]} data-exo="dropdown-item-icon">
                  <.icon name={entry.icon} class="size-4" />
                </span>
                <span data-exo="dropdown-item-label">{render_slot(entry)}</span>
                <kbd :if={entry[:shortcut]} data-exo="dropdown-item-shortcut">{entry.shortcut}</kbd>
              </.link>
            <% true -> %>
              <button
                type="button"
                data-exo="dropdown-item"
                data-variant={entry[:variant]}
                role="menuitem"
                popovertarget={@id}
                popovertargetaction="hide"
                phx-click={entry[:click]}
                disabled={entry[:disabled]}
              >
                <span :if={entry[:icon]} data-exo="dropdown-item-icon">
                  <.icon name={entry.icon} class="size-4" />
                </span>
                <span data-exo="dropdown-item-label">{render_slot(entry)}</span>
                <kbd :if={entry[:shortcut]} data-exo="dropdown-item-shortcut">{entry.shortcut}</kbd>
              </button>
          <% end %>
        <% end %>
      </div>
    </.popover>
    """
  end

  attr :id, :string, default: nil
  attr :position, :string, values: ~w(bottom-start bottom-end), default: "bottom-end"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :trigger, required: true
  slot :item, required: true

  # Deprecated: Use dropdown_menu/1 instead
  def dropdown(assigns) do
    assigns = assign_new(assigns, :id, fn -> "dropdown-#{System.unique_integer([:positive])}" end)

    ~H"""
    <div data-exo="dropdown" id={@id} class={@class} {@rest}>
      <div
        data-exo="dropdown-trigger"
        phx-click={Phoenix.LiveView.JS.toggle(to: "##{@id}-menu")}
      >
        {render_slot(@trigger)}
      </div>
      <div
        id={"#{@id}-menu"}
        data-exo="dropdown-menu"
        data-position={@position}
        style="display: none;"
        phx-click-away={Phoenix.LiveView.JS.hide(to: "##{@id}-menu")}
      >
        <div :for={item <- @item} data-exo="dropdown-item">
          {render_slot(item)}
        </div>
      </div>
    </div>
    """
  end

  @doc "Renders a tooltip that appears on hover/focus with configurable placement."
  attr :id, :string, required: true
  attr :text, :string, default: nil
  attr :side, :string, values: ~w(top bottom left right), default: "top"
  attr :align, :string, values: ~w(start center end), default: "center"
  attr :delay, :integer, default: 500
  attr :arrow, :boolean, default: true
  attr :class, :string, default: nil
  attr :rest, :global

  slot :inner_block, required: true
  slot :content

  def tooltip(assigns) do
    ~H"""
    <span data-exo="tooltip" phx-hook="ExoTooltip" id={@id}>
      <span
        data-exo="tooltip-anchor"
        tabindex="0"
        aria-describedby={"#{@id}-content"}
        style={"anchor-name: --tooltip-#{@id}"}
      >
        {render_slot(@inner_block)}
      </span>
      <span
        id={"#{@id}-content"}
        data-exo="tooltip-content"
        data-side={@side}
        data-align={@align}
        data-arrow={@arrow && ""}
        data-delay={@delay}
        role="tooltip"
        class={@class}
        style={"position-anchor: --tooltip-#{@id}; --exo-tooltip-delay: #{@delay}ms"}
        {@rest}
      >
        {if @content != [], do: render_slot(@content), else: @text}
      </span>
    </span>
    """
  end

  @doc "Renders a collapsible section with a toggle trigger."
  attr :id, :string, required: true
  attr :open, :boolean, default: false
  attr :class, :string, default: nil
  attr :rest, :global
  slot :trigger, required: true
  slot :inner_block, required: true

  def collapsible(assigns) do
    ~H"""
    <div data-exo="collapsible" id={@id} class={@class} {@rest}>
      <button
        type="button"
        data-exo="collapsible-trigger"
        aria-expanded={to_string(@open)}
        aria-controls={"#{@id}-content"}
        phx-click={Phoenix.LiveView.JS.toggle(to: "##{@id}-content")}
      >
        {render_slot(@trigger)}
      </button>
      <div
        id={"#{@id}-content"}
        data-exo="collapsible-content"
        style={unless @open, do: "display: none;"}
      >
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end

  @doc "Renders a slide-in drawer panel from the left or right edge."
  attr :id, :string, required: true
  attr :show, :boolean, default: false
  attr :side, :string, values: ~w(left right), default: "right"
  attr :on_cancel, Phoenix.LiveView.JS, default: %Phoenix.LiveView.JS{}
  attr :class, :string, default: nil
  attr :rest, :global
  slot :title
  slot :inner_block, required: true

  def drawer(assigns) do
    ~H"""
    <div
      id={@id}
      data-exo="drawer"
      data-side={@side}
      data-state={if @show, do: "open", else: "closed"}
      inert={!@show}
      class={@class}
      {@rest}
    >
      <div data-exo="drawer-backdrop" phx-click={@on_cancel |> hide_drawer(@id)} />
      <div data-exo="drawer-content">
        <div data-exo="drawer-header">
          <h2 :if={@title != []} data-exo="drawer-title">{render_slot(@title)}</h2>
          <button
            data-exo="drawer-close"
            phx-click={@on_cancel |> hide_drawer(@id)}
            aria-label="close"
          >
            ✕
          </button>
        </div>
        <div data-exo="drawer-body">
          {render_slot(@inner_block)}
        </div>
      </div>
    </div>
    """
  end

  @doc "Returns a JS command to show a drawer by id."
  def show_drawer(id) do
    %Phoenix.LiveView.JS{}
    |> Phoenix.LiveView.JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> Phoenix.LiveView.JS.remove_attribute("inert", to: "##{id}")
  end

  @doc "Returns a JS command to hide a drawer by id."
  def hide_drawer(js \\ %Phoenix.LiveView.JS{}, id) do
    js
    |> Phoenix.LiveView.JS.set_attribute({"data-state", "closed"}, to: "##{id}")
    |> Phoenix.LiveView.JS.set_attribute({"inert", "true"}, to: "##{id}")
  end
end
