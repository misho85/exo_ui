defmodule ExoUI.Components.Core do
  @moduledoc """
  Core UI primitives: buttons, badges, icons, separators, and other foundational components.
  """

  use Phoenix.Component

  @doc "Renders a button or link styled as a button."
  attr :variant, :string, default: nil
  attr :size, :string, values: ~w(xs sm md lg), default: "md"
  attr :class, :string, default: nil

  attr :rest, :global,
    include: ~w(href navigate patch method disabled name value type form download)

  slot :inner_block, required: true

  def button(assigns) do
    ~H"""
    <.link
      :if={@rest[:href] || @rest[:navigate] || @rest[:patch]}
      data-exo="btn"
      data-variant={@variant}
      data-size={@size}
      class={@class}
      {@rest}
    >
      {render_slot(@inner_block)}
    </.link>
    <button
      :if={!(@rest[:href] || @rest[:navigate] || @rest[:patch])}
      data-exo="btn"
      data-variant={@variant}
      data-size={@size}
      data-disabled={@rest[:disabled] && ""}
      class={@class}
      {@rest}
    >
      {render_slot(@inner_block)}
    </button>
    """
  end

  @doc "Renders an inline badge/tag."
  attr :variant, :string, default: "primary"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def badge(assigns) do
    ~H"""
    <span data-exo="badge" data-variant={@variant} class={@class} {@rest}>
      {render_slot(@inner_block)}
    </span>
    """
  end

  @doc "Renders a horizontal or vertical separator line."
  attr :orientation, :string, values: ~w(horizontal vertical), default: "horizontal"
  attr :class, :string, default: nil
  attr :rest, :global

  def separator(assigns) do
    ~H"""
    <div
      data-exo="separator"
      data-orientation={@orientation}
      role="separator"
      aria-orientation={@orientation}
      class={@class}
      {@rest}
    />
    """
  end

  @doc "Renders a Lucide icon by name."
  attr :name, :string, required: true
  attr :class, :any, default: "size-4"

  def icon(assigns) do
    icon_fn = assigns.name |> String.replace("-", "_") |> String.to_existing_atom()
    ExoUI.Lucide.render(icon_fn, Map.delete(assigns, :name))
  end

  @doc "Renders light/dark/system theme toggle buttons."
  attr :id, :string, default: "theme-toggle"

  def theme_toggle(assigns) do
    ~H"""
    <div data-exo="theme-toggle" phx-hook="ExoThemeToggle" id={@id}>
      <button data-exo="theme-btn" data-theme-value="light" aria-label="Light theme">☀</button>
      <button data-exo="theme-btn" data-theme-value="dark" aria-label="Dark theme">☾</button>
      <button data-exo="theme-btn" data-theme-value="system" aria-label="System theme">⚙</button>
    </div>
    """
  end

  @doc "Renders a page header with title, optional subtitle, and action buttons."
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true
  slot :subtitle
  slot :actions

  def header(assigns) do
    ~H"""
    <header data-exo="header" class={@class} {@rest}>
      <div data-exo="header-text">
        <h1 data-exo="header-title">{render_slot(@inner_block)}</h1>
        <p :if={@subtitle != []} data-exo="header-subtitle">{render_slot(@subtitle)}</p>
      </div>
      <div :if={@actions != []} data-exo="header-actions">{render_slot(@actions)}</div>
    </header>
    """
  end

  @doc "Renders an avatar with image or initials fallback."
  attr :name, :string, required: true
  attr :src, :string, default: nil
  attr :size, :string, values: ~w(xs sm md lg xl), default: "md"
  attr :class, :string, default: nil
  attr :rest, :global

  def avatar(assigns) do
    initials =
      assigns.name
      |> String.split(~r/\s+/)
      |> Enum.take(2)
      |> Enum.map(&String.first/1)
      |> Enum.join()
      |> String.upcase()

    assigns = assign(assigns, :initials, initials)

    ~H"""
    <span data-exo="avatar" data-size={@size} class={@class} {@rest}>
      <img :if={@src} src={@src} alt={@name} data-exo="avatar-img" />
      <span :if={!@src} data-exo="avatar-initials">{@initials}</span>
    </span>
    """
  end

  @doc "Renders a loading skeleton placeholder (text, card, avatar, or table variant)."
  attr :type, :string, values: ~w(text card avatar table), default: "text"
  attr :rows, :integer, default: 3
  attr :label, :string, default: "Loading..."
  attr :class, :string, default: nil
  attr :rest, :global

  def skeleton(assigns) do
    ~H"""
    <div
      data-exo="skeleton"
      data-type={@type}
      role="status"
      aria-label={@label}
      class={@class}
      {@rest}
    >
      <%= case @type do %>
        <% "text" -> %>
          <div :for={_ <- 1..@rows} data-exo="skeleton-line" />
        <% "card" -> %>
          <div data-exo="skeleton-block" style="height: 8rem;" />
          <div data-exo="skeleton-line" />
          <div data-exo="skeleton-line" style="width: 60%;" />
        <% "avatar" -> %>
          <div data-exo="skeleton-circle" />
        <% "table" -> %>
          <div data-exo="skeleton-line" style="height: 2rem;" />
          <div :for={_ <- 1..@rows} data-exo="skeleton-line" style="height: 3rem;" />
      <% end %>
    </div>
    """
  end

  @doc "Renders an empty state placeholder with icon, title, and optional action."
  attr :icon, :string, default: nil
  attr :title, :string, required: true
  attr :subtitle, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :action

  def empty_state(assigns) do
    ~H"""
    <div data-exo="empty-state" class={@class} {@rest}>
      <div :if={@icon} data-exo="empty-state-icon">{@icon}</div>
      <h3 data-exo="empty-state-title">{@title}</h3>
      <p :if={@subtitle} data-exo="empty-state-subtitle">{@subtitle}</p>
      <div :if={@action != []} data-exo="empty-state-action">{render_slot(@action)}</div>
    </div>
    """
  end

  @doc "Renders a loading spinner."
  attr :size, :string, values: ~w(sm md lg), default: "md"
  attr :class, :string, default: nil
  attr :rest, :global

  def spinner(assigns) do
    ~H"""
    <div
      data-exo="spinner"
      data-size={@size}
      role="status"
      aria-label="Loading"
      class={@class}
      {@rest}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" opacity="0.25" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        />
      </svg>
    </div>
    """
  end

  @doc "Renders a keyboard shortcut indicator."
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def kbd(assigns) do
    ~H"""
    <kbd data-exo="kbd" class={@class} {@rest}>{render_slot(@inner_block)}</kbd>
    """
  end

  @doc "Renders a scrollable container with custom scrollbar styling."
  attr :class, :string, default: nil
  attr :orientation, :string, values: ~w(vertical horizontal both), default: "vertical"
  attr :rest, :global
  slot :inner_block, required: true

  def scroll_area(assigns) do
    ~H"""
    <div data-exo="scroll-area" data-orientation={@orientation} class={@class} {@rest}>
      <div data-exo="scroll-area-viewport">
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end
end
