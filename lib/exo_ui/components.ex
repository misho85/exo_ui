defmodule ExoUI.Components do
  @moduledoc """
  Headless LiveView components.

  All components emit semantic HTML with `data-exo` attributes.
  No CSS classes are applied — styling is handled by the theme CSS file.
  """

  use Phoenix.Component

  attr :variant, :string, default: nil
  attr :size, :string, values: ~w(xs sm md lg), default: "md"
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(href navigate patch method disabled name value type form download)
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
end
