defmodule ExoUI.Components.Overlay do
  @moduledoc """
  Overlay components: modals, drawers, popovers, dropdowns, tooltips, and collapsibles.
  """

  use Phoenix.Component

  import ExoUI.Components.Core, only: [button: 1, icon: 1]

  @doc "Renders a modal dialog with backdrop, title, body, and optional actions."
  attr :id, :string, required: true
  attr :show, :boolean, default: false
  attr :role, :string, values: ~w(dialog alertdialog), default: "dialog"
  attr :label, :string, default: "Dialog"
  attr :on_cancel, Phoenix.LiveView.JS, default: %Phoenix.LiveView.JS{}
  attr :close_on_cancel, :boolean, default: true
  attr :class, :any, default: nil
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
      aria-hidden={to_string(!@show)}
      inert={!@show}
      phx-hook="ExoOverlay"
      phx-mounted={@show && show_modal(@id)}
      phx-remove={hide_modal(@id)}
      class={@class}
      {@rest}
    >
      <div data-exo="modal-backdrop" phx-click={maybe_hide_modal(@on_cancel, @id, @close_on_cancel)} />
      <div
        data-exo="modal-content"
        role={@role}
        aria-modal="true"
        aria-labelledby={if @title != [], do: "#{@id}-title"}
        aria-label={if @title == [], do: @label}
        aria-describedby={"#{@id}-body"}
        tabindex="-1"
      >
        <div data-exo="modal-header">
          <h2 :if={@title != []} id={"#{@id}-title"} data-exo="modal-title">
            {render_slot(@title)}
          </h2>
          <button
            type="button"
            data-exo="modal-close"
            phx-click={maybe_hide_modal(@on_cancel, @id, @close_on_cancel)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div id={"#{@id}-body"} data-exo="modal-body">
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
  attr :close_on_confirm, :boolean, default: true
  attr :close_on_cancel, :boolean, default: true

  def confirm_modal(assigns) do
    ~H"""
    <.modal
      id={@id}
      show={@show}
      role="alertdialog"
      on_cancel={@on_cancel}
      close_on_cancel={@close_on_cancel}
    >
      <:title>{@title}</:title>
      <p>{@message}</p>
      <:actions>
        <.button variant="ghost" phx-click={maybe_hide_modal(@on_cancel, @id, @close_on_cancel)}>
          {@cancel_text}
        </.button>
        <.button variant={@variant} phx-click={maybe_hide_modal(@on_confirm, @id, @close_on_confirm)}>
          {@confirm_text}
        </.button>
      </:actions>
    </.modal>
    """
  end

  @doc "Shows a modal by ID."
  def show_modal(id) do
    %Phoenix.LiveView.JS{}
    |> Phoenix.LiveView.JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> Phoenix.LiveView.JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> Phoenix.LiveView.JS.remove_attribute("inert", to: "##{id}")
    |> Phoenix.LiveView.JS.show(to: "##{id}")
    |> Phoenix.LiveView.JS.focus_first(to: "##{id} [data-exo=\"modal-content\"]")
  end

  @doc "Hides a modal by ID."
  def hide_modal(js \\ %Phoenix.LiveView.JS{}, id) do
    js
    |> Phoenix.LiveView.JS.set_attribute({"data-state", "closed"}, to: "##{id}")
    |> Phoenix.LiveView.JS.set_attribute({"aria-hidden", "true"}, to: "##{id}")
    |> Phoenix.LiveView.JS.set_attribute({"inert", "true"}, to: "##{id}")
    |> Phoenix.LiveView.JS.hide(to: "##{id}")
    |> Phoenix.LiveView.JS.pop_focus()
  end

  defp maybe_hide_modal(js, id, true), do: hide_modal(js, id)
  defp maybe_hide_modal(js, _id, false), do: js

  @doc "Renders a popover anchored to a trigger element using the Popover API."
  attr :id, :string, required: true
  attr :side, :string, values: ~w(top bottom left right), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "center"
  attr :mode, :string, values: ~w(auto manual), default: "auto"
  attr :haspopup, :string, default: "true"
  attr :class, :any, default: nil
  attr :rest, :global

  slot :trigger
  slot :inner_block, required: true

  def popover(assigns) do
    ~H"""
    <div data-exo="popover" id={"#{@id}-popover"} phx-hook="ExoPopover">
      <span
        :if={@trigger != []}
        data-exo="popover-trigger"
        data-popover-target={@id}
        data-popover-haspopup={@haspopup}
        aria-haspopup={@haspopup}
        aria-expanded="false"
        aria-controls={@id}
        style={"anchor-name: --popover-#{@id}"}
      >
        {render_slot(@trigger)}
      </span>
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
  attr :class, :any, default: nil
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
                data-sub-trigger=""
                data-disabled={entry[:disabled] && ""}
                role="menuitem"
                aria-disabled={to_string(entry[:disabled] || false)}
                aria-haspopup="menu"
                aria-expanded="false"
                aria-controls={entry[:target]}
                popovertarget={entry[:target]}
                disabled={entry[:disabled]}
                tabindex={if entry[:disabled], do: "-1"}
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
                data-disabled={entry[:disabled] && ""}
                role="menuitem"
                aria-disabled={to_string(entry[:disabled] || false)}
                popovertarget={@id}
                popovertargetaction="hide"
                phx-click={entry[:click]}
                disabled={entry[:disabled]}
                tabindex={if entry[:disabled], do: "-1"}
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
  attr :class, :any, default: nil
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
  attr :class, :any, default: nil
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
  attr :class, :any, default: nil
  attr :rest, :global
  slot :trigger, required: true
  slot :inner_block, required: true

  def collapsible(assigns) do
    ~H"""
    <div data-exo="collapsible" id={@id} class={@class} phx-hook="ExoCollapsible" {@rest}>
      <input
        type="checkbox"
        id={"#{@id}-state"}
        checked={@open}
        data-exo="collapsible-state"
        aria-hidden="true"
        tabindex="-1"
      />
      <button
        type="button"
        data-exo="collapsible-trigger"
        id={"#{@id}-trigger"}
        aria-expanded={to_string(@open)}
        aria-controls={"#{@id}-content"}
      >
        {render_slot(@trigger)}
      </button>
      <div
        id={"#{@id}-content"}
        data-exo="collapsible-content"
        role="region"
        aria-labelledby={"#{@id}-trigger"}
        aria-hidden={to_string(!@open)}
        inert={!@open}
      >
        <div data-exo="collapsible-body">
          {render_slot(@inner_block)}
        </div>
      </div>
    </div>
    """
  end

  @doc "Renders a slide-in drawer panel from the left or right edge."
  attr :id, :string, required: true
  attr :show, :boolean, default: false
  attr :side, :string, values: ~w(left right), default: "right"
  attr :label, :string, default: "Drawer"
  attr :on_cancel, Phoenix.LiveView.JS, default: %Phoenix.LiveView.JS{}
  attr :class, :any, default: nil
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
      aria-hidden={to_string(!@show)}
      inert={!@show}
      phx-hook="ExoOverlay"
      phx-mounted={@show && show_drawer(@id)}
      class={@class}
      {@rest}
    >
      <div data-exo="drawer-backdrop" phx-click={@on_cancel |> hide_drawer(@id)} />
      <div
        data-exo="drawer-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={if @title != [], do: "#{@id}-title"}
        aria-label={if @title == [], do: @label}
        aria-describedby={"#{@id}-body"}
        tabindex="-1"
      >
        <div data-exo="drawer-header">
          <h2 :if={@title != []} id={"#{@id}-title"} data-exo="drawer-title">
            {render_slot(@title)}
          </h2>
          <button
            type="button"
            data-exo="drawer-close"
            phx-click={@on_cancel |> hide_drawer(@id)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div id={"#{@id}-body"} data-exo="drawer-body">
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
    |> Phoenix.LiveView.JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> Phoenix.LiveView.JS.remove_attribute("inert", to: "##{id}")
    |> Phoenix.LiveView.JS.focus_first(to: "##{id} [data-exo=\"drawer-content\"]")
  end

  @doc "Returns a JS command to hide a drawer by id."
  def hide_drawer(js \\ %Phoenix.LiveView.JS{}, id) do
    js
    |> Phoenix.LiveView.JS.set_attribute({"data-state", "closed"}, to: "##{id}")
    |> Phoenix.LiveView.JS.set_attribute({"aria-hidden", "true"}, to: "##{id}")
    |> Phoenix.LiveView.JS.set_attribute({"inert", "true"}, to: "##{id}")
    |> Phoenix.LiveView.JS.pop_focus()
  end

  @doc "Renders a slide-out panel from the edge of the screen."
  attr :id, :string, required: true
  attr :show, :boolean, default: false
  attr :side, :string, values: ~w(left right top bottom), default: "right"
  attr :class, :any, default: nil
  attr :label, :string, default: "Sheet"
  attr :on_cancel, Phoenix.LiveView.JS, default: %Phoenix.LiveView.JS{}
  attr :rest, :global
  slot :inner_block, required: true
  slot :title
  slot :footer

  def sheet(assigns) do
    ~H"""
    <div
      id={@id}
      data-exo="sheet"
      data-side={@side}
      data-state={if @show, do: "open", else: "closed"}
      aria-hidden={to_string(!@show)}
      inert={!@show}
      phx-hook="ExoOverlay"
      phx-mounted={@show && show_sheet(@id)}
      class={[@show && "open", @class]}
      {@rest}
    >
      <div data-exo="sheet-backdrop" phx-click={hide_sheet(@on_cancel, @id)} />
      <div
        data-exo="sheet-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={if @title != [], do: "#{@id}-title"}
        aria-label={if @title == [], do: @label}
        aria-describedby={"#{@id}-body"}
        tabindex="-1"
      >
        <div :if={@title != []} data-exo="sheet-header">
          <h2 id={"#{@id}-title"} data-exo="sheet-title">{render_slot(@title)}</h2>
        </div>
        <div id={"#{@id}-body"} data-exo="sheet-body">
          {render_slot(@inner_block)}
        </div>
        <div :if={@footer != []} data-exo="sheet-footer">
          {render_slot(@footer)}
        </div>
        <button
          type="button"
          data-exo="sheet-close"
          aria-label="Close"
          phx-click={hide_sheet(@on_cancel, @id)}
        >
          ✕
        </button>
      </div>
    </div>
    """
  end

  @doc "Shows a sheet by ID."
  def show_sheet(id) do
    Phoenix.LiveView.JS.set_attribute(%Phoenix.LiveView.JS{}, {"data-state", "open"},
      to: "##{id}"
    )
    |> Phoenix.LiveView.JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> Phoenix.LiveView.JS.remove_attribute("inert", to: "##{id}")
    |> Phoenix.LiveView.JS.show(to: "##{id}")
    |> Phoenix.LiveView.JS.add_class("open", to: "##{id}")
    |> Phoenix.LiveView.JS.focus_first(to: "##{id} [data-exo=\"sheet-content\"]")
  end

  @doc "Hides a sheet by ID."
  def hide_sheet(%Phoenix.LiveView.JS{} = js \\ %Phoenix.LiveView.JS{}, id) do
    js
    |> Phoenix.LiveView.JS.set_attribute({"data-state", "closed"}, to: "##{id}")
    |> Phoenix.LiveView.JS.set_attribute({"aria-hidden", "true"}, to: "##{id}")
    |> Phoenix.LiveView.JS.set_attribute({"inert", "true"}, to: "##{id}")
    |> Phoenix.LiveView.JS.remove_class("open", to: "##{id}")
    |> Phoenix.LiveView.JS.hide(to: "##{id}", transition: {"", "", ""}, time: 300)
    |> Phoenix.LiveView.JS.pop_focus()
  end

  @doc "Renders a card that appears on hover."
  attr :id, :string, required: true
  attr :side, :string, values: ~w(top bottom left right), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "center"
  attr :open_delay, :integer, default: 300
  attr :close_delay, :integer, default: 150
  attr :class, :any, default: nil
  attr :rest, :global
  slot :trigger, required: true
  slot :inner_block, required: true

  def hover_card(assigns) do
    ~H"""
    <div
      data-exo="hover-card"
      data-open-delay={@open_delay}
      data-close-delay={@close_delay}
      id={@id}
      phx-hook="ExoHoverCard"
      class={@class}
      {@rest}
    >
      <div data-exo="hover-card-trigger" aria-describedby={"#{@id}-content"} aria-expanded="false">
        {render_slot(@trigger)}
      </div>
      <div
        id={"#{@id}-content"}
        data-exo="hover-card-content"
        data-side={@side}
        data-align={@align}
        role="tooltip"
        hidden
      >
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end

  @doc "Renders a right-click context menu."
  attr :id, :string, required: true
  attr :label, :string, default: "Context menu"
  attr :class, :any, default: nil
  attr :rest, :global
  slot :trigger, required: true

  slot :item do
    attr :label, :string, required: true
    attr :disabled, :boolean
    attr :separator, :boolean
  end

  def context_menu(assigns) do
    ~H"""
    <div data-exo="context-menu" id={@id} phx-hook="ExoContextMenu" class={@class} {@rest}>
      <div data-exo="context-menu-trigger">
        {render_slot(@trigger)}
      </div>
      <div id={"#{@id}-content"} data-exo="context-menu-content" role="menu" aria-label={@label}>
        <%= for item <- @item do %>
          <div :if={item[:separator]} data-exo="context-menu-separator" role="separator" />
          <button
            :if={!item[:separator]}
            type="button"
            data-exo="context-menu-item"
            role="menuitem"
            disabled={item[:disabled]}
            data-disabled={item[:disabled] || nil}
            aria-disabled={to_string(item[:disabled] || false)}
            tabindex={if item[:disabled], do: "-1"}
          >
            {item.label}
          </button>
        <% end %>
      </div>
    </div>
    """
  end

  @doc "Renders a command palette dialog (Ctrl+K / Cmd+K)."
  attr :id, :string, required: true
  attr :placeholder, :string, default: "Search..."
  attr :label, :string, default: "Command palette"
  attr :empty_label, :string, default: "No results found."
  attr :class, :any, default: nil
  attr :rest, :global
  slot :inner_block

  slot :item do
    attr :label, :string, required: true
    attr :value, :string
    attr :search, :string
    attr :shortcut, :string
    attr :disabled, :boolean
    attr :click, :any
    attr :close, :boolean
  end

  slot :empty

  def command_palette(assigns) do
    ~H"""
    <div
      data-exo="command-palette"
      id={@id}
      phx-hook="ExoCommandPalette"
      class={@class}
      aria-hidden="true"
      {@rest}
    >
      <div data-exo="command-palette-backdrop" />
      <div data-exo="command-palette-dialog" role="dialog" aria-modal="true" aria-label={@label}>
        <div data-exo="command-palette-input-wrapper">
          <svg
            data-exo="command-palette-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            data-exo="command-palette-input"
            placeholder={@placeholder}
            autocomplete="off"
            spellcheck="false"
          />
        </div>
        <div id={"#{@id}-list"} data-exo="command-palette-list" role="listbox">
          <button
            :for={item <- @item}
            type="button"
            data-exo="command-palette-item"
            data-value={item[:value] || item[:label]}
            data-search={item[:search] || item[:label]}
            data-close={item[:close] == false && "false"}
            role="option"
            tabindex="-1"
            disabled={item[:disabled]}
            aria-disabled={item[:disabled] || nil}
            data-disabled={item[:disabled] || nil}
            phx-click={item[:click]}
          >
            <span data-exo="command-palette-item-label">
              <%= if item[:inner_block] do %>
                {render_slot(item)}
              <% else %>
                {item[:label]}
              <% end %>
            </span>
            <span :if={item[:shortcut]} data-exo="command-palette-shortcut">{item[:shortcut]}</span>
          </button>

          <%= if @item == [] do %>
            {render_slot(@inner_block)}
          <% end %>

          <div data-exo="command-palette-empty" hidden>
            <%= if @empty != [] do %>
              {render_slot(@empty)}
            <% else %>
              {@empty_label}
            <% end %>
          </div>
        </div>
      </div>
    </div>
    """
  end

  @doc "Shows a command palette."
  def show_command_palette(id) do
    Phoenix.LiveView.JS.show(to: "##{id}")
    |> Phoenix.LiveView.JS.add_class("open", to: "##{id}")
    |> Phoenix.LiveView.JS.focus(to: "##{id} [data-exo=\"command-palette-input\"]")
  end

  @doc "Hides a command palette."
  def hide_command_palette(js \\ %Phoenix.LiveView.JS{}, id) do
    js
    |> Phoenix.LiveView.JS.remove_class("open", to: "##{id}")
    |> Phoenix.LiveView.JS.hide(to: "##{id}", transition: {"", "", ""}, time: 150)
  end

  @doc "Renders a horizontal menu bar with dropdown sub-menus."
  attr :id, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  slot :menu, required: true do
    attr :label, :string, required: true
  end

  def menubar(assigns) do
    id = assigns[:id] || "menubar-#{System.unique_integer([:positive])}"

    assigns =
      assigns
      |> assign(:id, id)
      |> assign(:menus, Enum.with_index(assigns.menu))

    ~H"""
    <div id={@id} data-exo="menubar" phx-hook="ExoMenubar" role="menubar" class={@class} {@rest}>
      <div :for={{menu, index} <- @menus} data-exo="menubar-menu">
        <button
          id={"#{@id}-trigger-#{index}"}
          type="button"
          data-exo="menubar-trigger"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls={"#{@id}-content-#{index}"}
        >
          {menu.label}
        </button>
        <div
          id={"#{@id}-content-#{index}"}
          data-exo="menubar-content"
          role="menu"
          aria-labelledby={"#{@id}-trigger-#{index}"}
          hidden
        >
          {render_slot(menu)}
        </div>
      </div>
    </div>
    """
  end
end
