defmodule ExoUI.Components.Core do
  @moduledoc """
  Core UI primitives: buttons, badges, icons, separators, and other foundational components.
  """

  use Phoenix.Component

  @doc "Renders a button or link styled as a button."
  attr :variant, :string, default: nil
  attr :size, :string, values: ~w(xs sm md lg), default: "md"
  attr :class, :any, default: nil

  attr :rest, :global,
    include:
      ~w(href navigate patch method disabled name value type form download popovertarget popovertargetaction target rel)

  slot :inner_block, required: true

  def button(assigns) do
    rest = assigns.rest

    assigns =
      assigns
      |> assign(:link?, button_link?(rest))
      |> assign(:disabled?, button_disabled?(rest[:disabled]))
      |> assign(:button_rest, Map.put_new(rest, :type, "button"))

    ~H"""
    <.link
      :if={@link? && !@disabled?}
      data-exo="btn"
      data-variant={@variant}
      data-size={@size}
      class={@class}
      {@rest}
    >
      {render_slot(@inner_block)}
    </.link>
    <span
      :if={@link? && @disabled?}
      data-exo="btn"
      data-variant={@variant}
      data-size={@size}
      data-disabled=""
      role="link"
      aria-disabled="true"
      tabindex="-1"
      class={@class}
    >
      {render_slot(@inner_block)}
    </span>
    <button
      :if={!@link?}
      data-exo="btn"
      data-variant={@variant}
      data-size={@size}
      data-disabled={@disabled? && ""}
      class={@class}
      {@button_rest}
    >
      {render_slot(@inner_block)}
    </button>
    """
  end

  defp button_link?(rest), do: rest[:href] || rest[:navigate] || rest[:patch]
  defp button_disabled?(value), do: value in [true, "true", "disabled", ""]

  @doc "Renders an inline badge/tag."
  attr :variant, :string, default: "primary"
  attr :size, :string, values: ~w(sm md lg), default: "md"
  attr :icon, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def badge(assigns) do
    ~H"""
    <span data-exo="badge" data-variant={@variant} data-size={@size} class={@class} {@rest}>
      <.icon :if={@icon} name={@icon} size="xs" />
      {render_slot(@inner_block)}
    </span>
    """
  end

  @doc "Renders a horizontal or vertical separator line."
  attr :orientation, :string, values: ~w(horizontal vertical), default: "horizontal"
  attr :decorative, :boolean, default: true
  attr :label, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def separator(assigns) do
    ~H"""
    <div
      data-exo="separator"
      data-orientation={@orientation}
      data-decorative={if @decorative, do: "true", else: "false"}
      role={if @decorative, do: nil, else: "separator"}
      aria-hidden={if @decorative, do: "true"}
      aria-orientation={if @decorative, do: nil, else: @orientation}
      aria-label={if @decorative, do: nil, else: @label}
      class={@class}
      {@rest}
    />
    """
  end

  @doc """
  Renders a Lucide icon by name.

  ## `size`, not a class

  Until 2026-08-21 the only way to size an icon was `class="size-4"` — and the
  attr's own DEFAULT was that class. Two things were wrong with it.

  First, it made the library speak Tailwind. `icon/1` is the only primitive
  whose size did not go through `size=` + `data-size` like `button/1`,
  `badge/1`, `avatar/1` and `spinner/1`, so it was also the only one an
  application had to size by hand at every call site — 156 of them in trg24.

  Second, a class is a different kind of thing from an attribute when the
  cascade changes. `:where()` rules carry zero specificity, so the moment an
  application puts `exo.css` into a Tailwind layer, every stray utility class
  on a primitive wakes up at once. That is not hypothetical: it happened, and
  it shrank every control on 41 screens (trg24 §7.13).

  `class` still works and still wins — for the rare icon that needs a size
  outside the scale.
  """
  attr :name, :string, required: true
  attr :size, :string, values: ~w(xs sm md lg xl), default: "sm"
  attr :class, :any, default: nil
  attr :rest, :global, include: ~w(focusable role)

  def icon(assigns) do
    Code.ensure_loaded!(ExoUI.Lucide)

    assigns = assign(assigns, :icon_rest, icon_rest(assigns))

    case icon_name_to_existing_atom(assigns.name) do
      {:ok, icon_fn} -> render_lucide_icon(icon_fn, assigns)
      :error -> missing_icon(assigns)
    end
  end

  defp render_lucide_icon(icon_fn, assigns) do
    lucide_assigns =
      assigns
      |> Map.drop([:name, :rest, :icon_rest])
      |> Map.merge(assigns.icon_rest)

    ExoUI.Lucide.render(icon_fn, lucide_assigns)
  rescue
    ArgumentError -> missing_icon(assigns)
  end

  defp icon_name_to_existing_atom(name) when is_binary(name) do
    {:ok, name |> String.replace("-", "_") |> String.to_existing_atom()}
  rescue
    ArgumentError -> :error
  end

  defp icon_name_to_existing_atom(name) when is_atom(name), do: {:ok, name}
  defp icon_name_to_existing_atom(_name), do: :error

  defp icon_rest(assigns) do
    assigns.rest
    |> Map.put(:class, assigns.class)
    |> Map.put(:"data-size", assigns[:size])
    |> put_rest_default(:"data-exo", "icon")
    |> put_rest_default(:"aria-hidden", "true")
    |> put_rest_default(:focusable, "false")
  end

  defp put_rest_default(rest, key, value) when is_atom(key) do
    string_key = Atom.to_string(key)

    if Map.has_key?(rest, key) || Map.has_key?(rest, string_key) do
      rest
    else
      Map.put(rest, key, value)
    end
  end

  defp missing_icon(assigns) do
    ~H"""
    <svg
      {@icon_rest}
      data-missing-icon={@name}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.1 9a3 3 0 1 1 5.8 1.1c-.8 1.3-2.4 1.4-2.8 3" />
      <path d="M12 17h.01" />
    </svg>
    """
  end

  @doc "Renders light/dark/system theme toggle buttons."
  attr :id, :string, default: "theme-toggle"
  attr :aria_label, :string, default: "Theme"

  def theme_toggle(assigns) do
    ~H"""
    <div
      data-exo="theme-toggle"
      phx-hook="ExoThemeToggle"
      id={@id}
      role="group"
      aria-label={@aria_label}
    >
      <button
        type="button"
        data-exo="theme-btn"
        data-theme-value="light"
        aria-label="Light theme"
        aria-pressed="false"
      >
        <.icon name="sun" size="sm" />
      </button>
      <button
        type="button"
        data-exo="theme-btn"
        data-theme-value="dark"
        aria-label="Dark theme"
        aria-pressed="false"
      >
        <.icon name="moon" size="sm" />
      </button>
      <button
        type="button"
        data-exo="theme-btn"
        data-theme-value="system"
        aria-label="System theme"
        aria-pressed="false"
      >
        <.icon name="monitor" size="sm" />
      </button>
    </div>
    """
  end

  @doc """
  Renders a page header with title, optional subtitle, and action buttons.

  A page header is separated from the content below it by a rule. That is the
  default, not an option: without it the title floats and the page reads as one
  undifferentiated column. Pass `separator={false}` for the rare header that
  sits inside a card or panel that already provides its own edge.
  """
  attr :class, :any, default: nil

  attr :separator, :boolean,
    default: true,
    doc: "draws the rule below the header; turn off inside a bordered container"

  attr :rest, :global
  slot :inner_block, required: true
  slot :subtitle
  slot :actions
  slot :leading, doc: "sits LEFT of the title — a back button, an avatar, a status dot"

  def header(assigns) do
    ~H"""
    <header data-exo="header" data-separator={@separator && ""} class={@class} {@rest}>
      <div data-exo="header-lead">
        <div :if={@leading != []} data-exo="header-leading">{render_slot(@leading)}</div>
        <div data-exo="header-text">
          <h1 data-exo="header-title">{render_slot(@inner_block)}</h1>
          <p :if={@subtitle != []} data-exo="header-subtitle">{render_slot(@subtitle)}</p>
        </div>
      </div>
      <div :if={@actions != []} data-exo="header-actions">{render_slot(@actions)}</div>
    </header>
    """
  end

  @doc "Renders an avatar with image or initials fallback."
  attr :name, :string, required: true
  attr :src, :string, default: nil
  attr :alt, :string, default: nil
  attr :size, :string, values: ~w(xs sm md lg xl), default: "md"
  attr :class, :any, default: nil
  attr :rest, :global

  def avatar(assigns) do
    initials =
      assigns.name
      |> String.split(~r/\s+/)
      |> Enum.take(2)
      |> Enum.map(&String.first/1)
      |> Enum.join()
      |> String.upcase()

    assigns =
      assigns
      |> assign(:initials, initials)
      |> assign(:avatar_label, if(is_nil(assigns.alt), do: assigns.name, else: assigns.alt))

    ~H"""
    <span
      data-exo="avatar"
      data-size={@size}
      role={if @src, do: nil, else: "img"}
      aria-label={if @src, do: nil, else: @avatar_label}
      class={@class}
      {@rest}
    >
      <img :if={@src} src={@src} alt={@avatar_label} data-exo="avatar-img" />
      <span :if={!@src} data-exo="avatar-initials" aria-hidden="true">{@initials}</span>
    </span>
    """
  end

  @doc "Renders a loading skeleton placeholder (text, card, avatar, or table variant)."
  attr :type, :string, values: ~w(text card avatar table), default: "text"
  attr :rows, :integer, default: 3
  attr :label, :string, default: "Loading..."
  attr :class, :any, default: nil
  attr :rest, :global

  def skeleton(assigns) do
    row_count = max(assigns.rows, 0)
    rows = if row_count > 0, do: 1..row_count, else: []

    assigns = assign(assigns, :rows_range, rows)

    ~H"""
    <div
      data-exo="skeleton"
      data-type={@type}
      role="status"
      aria-label={@label}
      aria-live="polite"
      aria-busy="true"
      class={@class}
      {@rest}
    >
      <%= case @type do %>
        <% "text" -> %>
          <div :for={_ <- @rows_range} data-exo="skeleton-line" aria-hidden="true" />
        <% "card" -> %>
          <div data-exo="skeleton-block" style="height: 8rem;" aria-hidden="true" />
          <div data-exo="skeleton-line" aria-hidden="true" />
          <div data-exo="skeleton-line" style="width: 60%;" aria-hidden="true" />
        <% "avatar" -> %>
          <div data-exo="skeleton-circle" aria-hidden="true" />
        <% "table" -> %>
          <div data-exo="skeleton-line" style="height: 2rem;" aria-hidden="true" />
          <div
            :for={_ <- @rows_range}
            data-exo="skeleton-line"
            style="height: 3rem;"
            aria-hidden="true"
          />
      <% end %>
    </div>
    """
  end

  @doc "Renders an empty state placeholder with icon, title, and optional action."
  attr :icon, :string, default: nil
  attr :title, :string, required: true
  attr :subtitle, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global
  slot :action

  def empty_state(assigns) do
    ~H"""
    <div data-exo="empty-state" class={@class} {@rest}>
      <div :if={@icon} data-exo="empty-state-icon" aria-hidden="true">
        <.icon name={@icon} size="lg" />
      </div>
      <h3 data-exo="empty-state-title">{@title}</h3>
      <p :if={@subtitle} data-exo="empty-state-subtitle">{@subtitle}</p>
      <div :if={@action != []} data-exo="empty-state-action">{render_slot(@action)}</div>
    </div>
    """
  end

  @doc "Renders a loading spinner."
  attr :size, :string, values: ~w(sm md lg), default: "md"
  attr :label, :string, default: "Loading"
  attr :class, :any, default: nil
  attr :rest, :global

  def spinner(assigns) do
    ~H"""
    <div
      data-exo="spinner"
      data-size={@size}
      role="status"
      aria-label={@label}
      class={@class}
      {@rest}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
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
  attr :label, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def kbd(assigns) do
    ~H"""
    <kbd data-exo="kbd" aria-label={@label} class={@class} {@rest}>{render_slot(@inner_block)}</kbd>
    """
  end

  @doc "Renders a scrollable container with custom scrollbar styling."
  attr :id, :string, default: nil
  attr :aria_label, :string, default: nil
  attr :viewport_class, :any, default: nil
  attr :viewport_id, :string, default: nil
  attr :tabindex, :string, default: "0"
  attr :class, :any, default: nil
  attr :orientation, :string, values: ~w(vertical horizontal both), default: "vertical"
  attr :rest, :global
  slot :inner_block, required: true

  def scroll_area(assigns) do
    assigns =
      assign(assigns,
        role: if(assigns[:aria_label], do: "region"),
        viewport_id: assigns[:viewport_id] || (assigns[:id] && "#{assigns[:id]}-viewport")
      )

    ~H"""
    <div
      id={@id}
      data-exo="scroll-area"
      data-orientation={@orientation}
      role={@role}
      aria-label={@aria_label}
      class={@class}
      {@rest}
    >
      <div
        id={@viewport_id}
        data-exo="scroll-area-viewport"
        tabindex={@tabindex}
        class={@viewport_class}
      >
        {render_slot(@inner_block)}
      </div>
    </div>
    """
  end

  @doc "Renders a top navigation bar with brand, center content, and end content."
  attr :class, :any, default: nil
  attr :rest, :global
  slot :brand
  slot :center
  slot :end_content

  def navbar(assigns) do
    ~H"""
    <nav data-exo="navbar" class={@class} {@rest}>
      <div :if={@brand != []} data-exo="navbar-brand">{render_slot(@brand)}</div>
      <div :if={@center != []} data-exo="navbar-center">{render_slot(@center)}</div>
      <div :if={@end_content != []} data-exo="navbar-end">{render_slot(@end_content)}</div>
    </nav>
    """
  end

  @doc "Renders a page footer with columns of links and a bottom section."
  attr :class, :any, default: nil
  attr :rest, :global

  slot :column do
    attr :title, :string, required: true
  end

  slot :bottom

  def footer(assigns) do
    ~H"""
    <footer data-exo="footer" class={@class} {@rest}>
      <div :if={@column != []} data-exo="footer-columns">
        <div :for={col <- @column} data-exo="footer-column">
          <h4 data-exo="footer-column-title">{col.title}</h4>
          {render_slot(col)}
        </div>
      </div>
      <div :if={@bottom != []} data-exo="footer-bottom">{render_slot(@bottom)}</div>
    </footer>
    """
  end

  @doc "Renders a mobile bottom navigation bar with icon items."
  attr :target, :any, default: nil, doc: "optional phx-target for click-based items"
  attr :class, :any, default: nil
  attr :rest, :global

  slot :item, required: true do
    attr :label, :string, required: true
    attr :icon, :string
    attr :href, :string
    attr :navigate, :string
    attr :patch, :string
    attr :click, :string
    attr :click_value, :string
    attr :active, :boolean
  end

  def bottom_nav(assigns) do
    ~H"""
    <nav data-exo="bottom-nav" class={@class} {@rest}>
      <button
        :for={item <- @item}
        :if={item[:click]}
        type="button"
        data-exo="bottom-nav-item"
        data-active={item[:active] && ""}
        phx-click={item.click}
        phx-value-item={item[:click_value] || item.label}
        phx-target={@target}
        aria-current={item[:active] && "page"}
      >
        <span :if={item[:icon]} data-exo="bottom-nav-icon" aria-hidden="true">
          <.icon name={item.icon} size="md" />
        </span>
        <span data-exo="bottom-nav-label">{item.label}</span>
      </button>
      <.link
        :for={item <- @item}
        :if={!item[:click]}
        data-exo="bottom-nav-item"
        data-active={item[:active] && ""}
        href={item[:href]}
        navigate={item[:navigate]}
        patch={item[:patch]}
        aria-current={item[:active] && "page"}
      >
        <span :if={item[:icon]} data-exo="bottom-nav-icon" aria-hidden="true">
          <.icon name={item.icon} size="md" />
        </span>
        <span data-exo="bottom-nav-label">{item.label}</span>
      </.link>
    </nav>
    """
  end

  @doc "Renders a notification dot/badge overlay on another element."
  attr :position, :string,
    values: ~w(top-right top-left bottom-right bottom-left top-center bottom-center),
    default: "top-right"

  attr :class, :any, default: nil
  attr :badge_label, :string, default: nil
  attr :badge_live, :string, default: "polite"
  attr :rest, :global
  slot :badge
  slot :inner_block, required: true

  def indicator(assigns) do
    ~H"""
    <div data-exo="indicator" data-position={@position} class={@class} {@rest}>
      {render_slot(@inner_block)}
      <span
        :if={@badge != []}
        data-exo="indicator-badge"
        role="status"
        aria-live={@badge_live}
        aria-label={@badge_label}
      >
        {render_slot(@badge)}
      </span>
    </div>
    """
  end

  @doc "Renders a toggle that swaps between two elements."
  attr :id, :string, required: true
  attr :active, :boolean, default: false
  attr :label, :string, default: "Toggle"
  attr :class, :any, default: nil
  attr :rest, :global
  slot :on, required: true
  slot :off, required: true

  def swap(assigns) do
    ~H"""
    <label
      data-exo="swap"
      id={@id}
      class={@class}
      role="switch"
      tabindex="0"
      aria-label={@label}
      aria-checked={to_string(@active)}
      data-active={@active && ""}
      phx-hook="ExoSwap"
      {@rest}
    >
      <input
        type="checkbox"
        checked={@active}
        data-exo="swap-state"
        aria-hidden="true"
        tabindex="-1"
      />
      <div data-exo="swap-on" aria-hidden="true">{render_slot(@on)}</div>
      <div data-exo="swap-off" aria-hidden="true">{render_slot(@off)}</div>
    </label>
    """
  end
end
