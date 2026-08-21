defmodule ExoUI.Components.Feedback do
  @moduledoc """
  Feedback components: flash messages, toasts, alerts, and progress bars.
  """

  use Phoenix.Component

  import ExoUI.Components.Core, only: [icon: 1]

  @doc "Renders a dismissible flash message."
  attr :id, :string, default: nil
  attr :flash, :map, default: %{}
  attr :title, :string, default: nil
  attr :kind, :atom, required: true, values: [:info, :success, :warning, :error]
  attr :close_label, :string, default: "Dismiss notification"

  attr :icon, :any,
    default: :default,
    doc: """
    Lucide icon name shown before the message. `:default` picks one from
    `kind`; `nil` renders no icon.

    A flash is read at a glance, often while the eye is somewhere else on the
    page. The icon is what carries `kind` when colour cannot — for a
    colour-blind reader, and in any theme where success and warning sit close
    together.
    """

  attr :rest, :global
  slot :inner_block

  def flash(assigns) do
    id = assigns[:id] || "flash-#{assigns.kind}"

    assigns =
      assign(assigns,
        id: id,
        role: feedback_role(assigns.kind),
        live: feedback_live(assigns.kind),
        title_id: if(assigns[:title], do: "#{id}-title"),
        message_id: "#{id}-message",
        dismiss:
          Phoenix.LiveView.JS.push("lv:clear-flash", value: %{key: assigns.kind})
          |> Phoenix.LiveView.JS.hide(to: "##{id}"),
        icon_name: flash_icon(assigns[:icon], assigns.kind)
      )

    ~H"""
    <div
      :if={
        msg = Phoenix.Flash.get(@flash, @kind) || (@inner_block != [] && render_slot(@inner_block))
      }
      id={@id}
      data-exo="flash"
      data-kind={@kind}
      role={@role}
      aria-live={@live}
      aria-atomic="true"
      aria-labelledby={@title_id}
      aria-describedby={@message_id}
      {@rest}
    >
      <span :if={@icon_name} data-exo="flash-icon" aria-hidden="true">
        <.icon name={@icon_name} size="md" />
      </span>
      <div data-exo="flash-content">
        <p :if={@title} id={@title_id} data-exo="flash-title">{@title}</p>
        <p id={@message_id} data-exo="flash-message">{msg}</p>
      </div>
      <button type="button" data-exo="flash-close" aria-label={@close_label} phx-click={@dismiss}>
        <.icon name="x" size="sm" />
      </button>
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
  attr :id, :string, default: "toast-container"
  attr :label, :string, default: "Notifications"
  attr :close_label, :string, default: "Dismiss notification"
  attr :auto_dismiss, :boolean, default: false
  attr :duration, :integer, default: 5000

  attr :placement, :string,
    values: ~w(top-right top-left bottom-right bottom-left),
    default: "bottom-right"

  attr :rest, :global

  def toast_container(assigns) do
    ~H"""
    <div
      data-exo="toast-container"
      id={@id}
      data-placement={@placement}
      data-auto-dismiss={to_string(@auto_dismiss)}
      data-duration={@duration}
      role="region"
      aria-label={@label}
      phx-update="stream"
      phx-hook={@auto_dismiss && "ExoToast"}
      {@rest}
    >
      <div
        :for={{dom_id, toast} <- @toasts}
        id={dom_id}
        data-exo="toast"
        data-kind={toast.kind}
        role={feedback_role(toast.kind)}
        aria-live={feedback_live(toast.kind)}
        aria-atomic="true"
        aria-labelledby={toast[:title] && "#{dom_id}-title"}
        aria-describedby={"#{dom_id}-message"}
      >
        <div data-exo="toast-content">
          <p :if={toast[:title]} id={"#{dom_id}-title"} data-exo="toast-title">{toast.title}</p>
          <p id={"#{dom_id}-message"} data-exo="toast-message">{toast.message}</p>
        </div>
        <button
          type="button"
          data-exo="toast-close"
          phx-click={Phoenix.LiveView.JS.hide(to: "##{dom_id}")}
          aria-label={@close_label}
        >
          <.icon name="x" size="sm" />
        </button>
      </div>
    </div>
    """
  end

  # `:default` bira ikonu po vrsti; `nil` je izricito „bez ikone".
  defp flash_icon(:default, :info), do: "info"
  defp flash_icon(:default, :success), do: "circle-check"
  defp flash_icon(:default, :warning), do: "triangle-alert"
  defp flash_icon(:default, :error), do: "circle-alert"
  defp flash_icon(:default, _), do: "info"
  defp flash_icon(name, _kind), do: name

  defp feedback_role(kind) when kind in [:error, :warning, "error", "warning"], do: "alert"
  defp feedback_role(_kind), do: "status"

  defp feedback_live(kind) when kind in [:error, :warning, "error", "warning"], do: "assertive"
  defp feedback_live(_kind), do: "polite"

  @doc "Renders an alert banner with kind-based styling (info, success, warning, error)."
  attr :id, :string, default: nil
  attr :kind, :atom, required: true, values: [:info, :success, :warning, :error]
  attr :title, :string, default: nil
  attr :icon, :string, default: nil
  attr :role, :string, default: nil
  attr :live, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global
  slot :inner_block, required: true
  slot :action

  def alert(assigns) do
    assigns =
      assign(assigns,
        role: assigns.role || feedback_role(assigns.kind),
        live: assigns.live || feedback_live(assigns.kind),
        title_id: if(assigns.id && assigns.title, do: "#{assigns.id}-title"),
        message_id: if(assigns.id, do: "#{assigns.id}-message")
      )

    ~H"""
    <div
      id={@id}
      data-exo="alert"
      data-kind={@kind}
      role={@role}
      aria-live={@live}
      aria-atomic="true"
      aria-labelledby={@title_id}
      aria-describedby={@message_id}
      class={@class}
      {@rest}
    >
      <div :if={@icon} data-exo="alert-icon">
        <.icon name={@icon} size="sm" />
      </div>
      <div data-exo="alert-content">
        <p :if={@title} id={@title_id} data-exo="alert-title">{@title}</p>
        <div id={@message_id} data-exo="alert-message">{render_slot(@inner_block)}</div>
      </div>
      <div :if={@action != []} data-exo="alert-action">{render_slot(@action)}</div>
    </div>
    """
  end

  @doc "Renders a progress bar with percentage label."
  attr :value, :integer, required: true
  attr :max, :integer, default: 100
  attr :label, :string, default: nil
  attr :aria_label, :string, default: nil
  attr :aria_value_text, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global

  def progress(assigns) do
    value_max = max(assigns.max, 0)
    value_now = assigns.value |> max(0) |> min(value_max)
    pct = if value_max == 0, do: 0, else: min(100, round(value_now / value_max * 100))

    assigns =
      assign(assigns,
        pct: pct,
        value_now: value_now,
        value_max: value_max,
        progress_label: assigns.aria_label || assigns.label || "Progress",
        progress_value_text: assigns.aria_value_text || "#{pct}%"
      )

    ~H"""
    <div data-exo="progress-field" class={@class} {@rest}>
      <div :if={@label} data-exo="progress-header">
        <span data-exo="label">{@label}</span>
        <span data-exo="progress-value">{@pct}%</span>
      </div>
      <div
        data-exo="progress"
        role="progressbar"
        aria-label={@progress_label}
        aria-valuenow={@value_now}
        aria-valuemin="0"
        aria-valuemax={@value_max}
        aria-valuetext={@progress_value_text}
      >
        <div data-exo="progress-bar" style={"width: #{@pct}%"} />
      </div>
    </div>
    """
  end

  @doc "Renders a circular progress indicator using SVG."
  attr :value, :integer, required: true
  attr :max, :integer, default: 100
  attr :size, :string, values: ~w(sm md lg), default: "md"
  attr :show_value, :boolean, default: true
  attr :aria_label, :string, default: "Progress"
  attr :aria_value_text, :string, default: nil
  attr :class, :any, default: nil
  attr :rest, :global
  slot :inner_block

  def radial_progress(assigns) do
    value_max = max(assigns.max, 0)
    value_now = assigns.value |> max(0) |> min(value_max)
    pct = if value_max == 0, do: 0, else: min(100, round(value_now / value_max * 100))
    circumference = 2 * :math.pi() * 40
    offset = circumference - pct / 100 * circumference

    assigns =
      assigns
      |> assign(:pct, pct)
      |> assign(:value_now, value_now)
      |> assign(:value_max, value_max)
      |> assign(:progress_value_text, assigns.aria_value_text || "#{pct}%")
      |> assign(:circumference, circumference)
      |> assign(:offset, offset)

    ~H"""
    <div
      data-exo="radial-progress"
      data-size={@size}
      role="progressbar"
      aria-label={@aria_label}
      aria-valuenow={@value_now}
      aria-valuemin="0"
      aria-valuemax={@value_max}
      aria-valuetext={@progress_value_text}
      class={@class}
      {@rest}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle
          data-exo="radial-progress-track"
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          stroke-width="8"
          opacity="0.2"
        />
        <circle
          data-exo="radial-progress-fill"
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          stroke-width="8"
          stroke-linecap="round"
          stroke-dasharray={@circumference}
          stroke-dashoffset={@offset}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span :if={@show_value && @inner_block == []} data-exo="radial-progress-label">
        {@pct}%
      </span>
      <span :if={@inner_block != []} data-exo="radial-progress-label">
        {render_slot(@inner_block)}
      </span>
    </div>
    """
  end
end
