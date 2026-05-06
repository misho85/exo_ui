defmodule ExoUI.Layouts do
  @moduledoc """
  Layout components for ExoUI.

  Provides the app shell with collapsible sidebar navigation.
  """

  use Phoenix.Component

  import ExoUI.Components.Core, only: [icon: 1]

  @doc "Renders an app shell with collapsible sidebar, topbar, and main content area."
  attr :id, :string, default: "sidebar-layout"
  attr :class, :any, default: nil
  attr :content_class, :any, default: nil

  slot :brand, doc: "branding area at top of sidebar (logo, tenant name)"
  slot :nav, required: true, doc: "navigation menu items"
  slot :topbar_start, doc: "left side of topbar (breadcrumbs, search)"
  slot :topbar_end, doc: "right side of topbar (theme toggle, notifications, user menu)"
  slot :footer, doc: "user info at bottom of sidebar"
  slot :inner_block, required: true, doc: "page content"

  def sidebar_layout(assigns) do
    ~H"""
    <div
      data-exo="sidebar"
      data-state="open"
      id={@id}
      phx-hook="ExoSidebar"
      class={@class}
    >
      <input
        id={"#{@id}-toggle"}
        type="checkbox"
        data-exo="sidebar-toggle"
        checked
        aria-hidden="true"
        tabindex="-1"
        phx-update="ignore"
      />

      <%!-- Main content area --%>
      <div data-exo="sidebar-content">
        <%!-- Top bar --%>
        <header data-exo="sidebar-topbar">
          <button
            type="button"
            data-exo="sidebar-hamburger"
            aria-label="Toggle sidebar"
            aria-controls={"#{@id}-panel"}
            aria-expanded="true"
          >
            <.icon name="menu" class="size-5" />
          </button>

          <div :if={@topbar_start != []} data-exo="topbar-start">
            {render_slot(@topbar_start)}
          </div>
          <div :if={@topbar_start == []} data-exo="topbar-start" />

          <div :if={@topbar_end != []} data-exo="topbar-end">
            {render_slot(@topbar_end)}
          </div>
          <div :if={@topbar_end == []} data-exo="topbar-end" />
        </header>

        <%!-- Page content --%>
        <main data-exo="sidebar-main">
          <div class={@content_class}>
            {render_slot(@inner_block)}
          </div>
        </main>
      </div>

      <%!-- Sidebar panel --%>
      <div id={"#{@id}-panel"} data-exo="sidebar-panel" data-state="open">
        <button
          type="button"
          data-exo="sidebar-overlay"
          aria-label="Close sidebar"
        />
        <aside data-exo="sidebar-aside">
          <div :if={@brand != []} data-exo="sidebar-brand">
            {render_slot(@brand)}
          </div>

          <nav data-exo="sidebar-nav">
            {render_slot(@nav)}
          </nav>

          <div :if={@footer != []} data-exo="sidebar-footer">
            {render_slot(@footer)}
          </div>
        </aside>
      </div>
    </div>
    """
  end

  @doc "Renders a sidebar navigation item with optional icon and badge."
  attr :href, :string, required: true
  attr :icon, :string, default: nil
  attr :label, :string, required: true
  attr :active, :boolean, default: false
  attr :badge, :integer, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def sidebar_item(assigns) do
    ~H"""
    <li data-exo="sidebar-item" data-active={@active && ""} class={@class} {@rest}>
      <.link navigate={@href}>
        <span :if={@icon} data-exo="sidebar-icon" aria-hidden="true">
          <.icon name={@icon} class="size-4" />
        </span>
        <span data-exo="sidebar-label">{@label}</span>
        <span
          :if={@badge && @badge > 0}
          data-exo="sidebar-badge"
        >
          {@badge}
        </span>
      </.link>
    </li>
    """
  end
end
