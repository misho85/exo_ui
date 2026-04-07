defmodule ExoUI.Components.Feedback do
  @moduledoc """
  Feedback components: flash messages, toasts, alerts, and progress bars.
  """

  use Phoenix.Component

  @doc "Renders a dismissible flash message."
  attr :id, :string, default: nil
  attr :flash, :map, default: %{}
  attr :title, :string, default: nil
  attr :kind, :atom, required: true, values: [:info, :error]
  attr :close_label, :string, default: "close"
  attr :rest, :global
  slot :inner_block

  def flash(assigns) do
    assigns = assign_new(assigns, :id, fn -> "flash-#{assigns.kind}" end)

    ~H"""
    <div
      :if={
        msg = Phoenix.Flash.get(@flash, @kind) || (@inner_block != [] && render_slot(@inner_block))
      }
      id={@id}
      data-exo="flash"
      data-kind={@kind}
      role="alert"
      phx-click={
        Phoenix.LiveView.JS.push("lv:clear-flash", value: %{key: @kind})
        |> Phoenix.LiveView.JS.hide(to: "##{@id}")
      }
      {@rest}
    >
      <div data-exo="flash-content">
        <p :if={@title} data-exo="flash-title">{@title}</p>
        <p data-exo="flash-message">{msg}</p>
      </div>
      <button data-exo="flash-close" aria-label={@close_label}>✕</button>
    </div>
    """
  end

  @doc "Renders a group of flash messages including client/server error indicators."
  attr :flash, :map, required: true
  attr :id, :string, default: "flash-group"
  attr :disconnect_msg, :string, default: "Attempting to reconnect..."
  attr :reconnect_msg, :string, default: "We can't find the internet."

  def flash_group(assigns) do
    ~H"""
    <div id={@id} data-exo="flash-group">
      <.flash kind={:info} title="Info" flash={@flash} />
      <.flash kind={:error} title="Error" flash={@flash} />
      <.flash
        id="client-error"
        kind={:error}
        title="Error"
        phx-disconnected={Phoenix.LiveView.JS.show(to: "#client-error")}
        phx-connected={Phoenix.LiveView.JS.hide(to: "#client-error")}
        hidden
      >
        {@disconnect_msg}
      </.flash>
      <.flash
        id="server-error"
        kind={:error}
        title="Error"
        phx-disconnected={Phoenix.LiveView.JS.show(to: "#server-error")}
        phx-connected={Phoenix.LiveView.JS.hide(to: "#server-error")}
        hidden
      >
        {@reconnect_msg}
      </.flash>
    </div>
    """
  end

  @doc "Renders a stream-based toast notification container."
  attr :toasts, :any, default: []
  attr :close_label, :string, default: "close"

  def toast_container(assigns) do
    ~H"""
    <div data-exo="toast-container" id="toast-container" phx-update="stream">
      <div
        :for={{dom_id, toast} <- @toasts}
        id={dom_id}
        data-exo="toast"
        data-kind={toast.kind}
        role="alert"
      >
        <div data-exo="toast-content">
          <p :if={toast[:title]} data-exo="toast-title">{toast.title}</p>
          <p data-exo="toast-message">{toast.message}</p>
        </div>
        <button
          data-exo="toast-close"
          phx-click={Phoenix.LiveView.JS.hide(to: "##{dom_id}")}
          aria-label={@close_label}
        >
          ✕
        </button>
      </div>
    </div>
    """
  end

  @doc "Renders an alert banner with kind-based styling (info, success, warning, error)."
  attr :kind, :atom, required: true, values: [:info, :success, :warning, :error]
  attr :title, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global
  slot :inner_block, required: true
  slot :action

  def alert(assigns) do
    ~H"""
    <div data-exo="alert" data-kind={@kind} role="alert" class={@class} {@rest}>
      <div data-exo="alert-content">
        <p :if={@title} data-exo="alert-title">{@title}</p>
        <div data-exo="alert-message">{render_slot(@inner_block)}</div>
      </div>
      <div :if={@action != []} data-exo="alert-action">{render_slot(@action)}</div>
    </div>
    """
  end

  @doc "Renders a progress bar with percentage label."
  attr :value, :integer, required: true
  attr :max, :integer, default: 100
  attr :label, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def progress(assigns) do
    pct = if assigns.max == 0, do: 0, else: min(100, round(assigns.value / assigns.max * 100))
    assigns = assign(assigns, :pct, pct)

    ~H"""
    <div data-exo="progress-field" class={@class} {@rest}>
      <div :if={@label} data-exo="progress-header">
        <span data-exo="label">{@label}</span>
        <span data-exo="progress-value">{@pct}%</span>
      </div>
      <div
        data-exo="progress"
        role="progressbar"
        aria-valuenow={@value}
        aria-valuemin="0"
        aria-valuemax={@max}
      >
        <div data-exo="progress-bar" style={"width: #{@pct}%"} />
      </div>
    </div>
    """
  end
end
