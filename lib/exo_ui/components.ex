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

  attr :for, :any, required: true
  attr :as, :any, default: nil
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(autocomplete name rel action enctype method novalidate target multipart)
  slot :inner_block, required: true

  def form(assigns) do
    ~H"""
    <Phoenix.Component.form for={@for} as={@as} data-exo="form" class={@class} {@rest}>
      {render_slot(@inner_block)}
    </Phoenix.Component.form>
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

  attr :field, Phoenix.HTML.FormField, doc: "a form field struct"
  attr :id, :any, default: nil
  attr :type, :string, default: "text"
  attr :name, :any
  attr :value, :any
  attr :label, :string, default: nil
  attr :errors, :list, default: []
  attr :checked, :boolean, doc: "the checked flag for checkbox inputs"
  attr :prompt, :string, default: nil, doc: "the prompt for select inputs"
  attr :options, :list, doc: "the options to pass to Phoenix.HTML.Form.options_for_select/2"
  attr :multiple, :boolean, default: false, doc: "the multiple flag for select inputs"
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(accept autocomplete capture cols disabled form list max maxlength min minlength
    pattern placeholder readonly required rows size step)

  def input(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    errors = if Phoenix.Component.used_input?(field), do: field.errors, else: []

    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(errors, &translate_error(&1)))
    |> assign_new(:name, fn -> if assigns.multiple, do: field.name <> "[]", else: field.name end)
    |> assign_new(:value, fn -> field.value end)
    |> input()
  end

  def input(%{type: "hidden"} = assigns) do
    ~H"""
    <input type="hidden" name={@name} value={@value} {@rest} />
    """
  end

  def input(%{type: "checkbox"} = assigns) do
    assigns = assign_new(assigns, :checked, fn ->
      Phoenix.HTML.Form.normalize_value("checkbox", assigns[:value])
    end)

    ~H"""
    <label data-exo="field">
      <input type="hidden" name={@name} value="false" disabled={@rest[:disabled]} />
      <input
        type="checkbox"
        data-exo="checkbox"
        data-checked={@checked && ""}
        name={@name}
        value="true"
        checked={@checked}
        class={@class}
        {@rest}
      />
      <span :if={@label}>{@label}</span>
    </label>
    """
  end

  def input(%{type: "textarea"} = assigns) do
    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label">{@label}</label>
      <textarea
        data-exo="input"
        data-invalid={@errors != [] && ""}
        name={@name}
        class={@class}
        {@rest}
      >{Phoenix.HTML.Form.normalize_value("textarea", @value)}</textarea>
      <.field_errors errors={@errors} />
    </div>
    """
  end

  def input(assigns) do
    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label">{@label}</label>
      <input
        data-exo="input"
        data-invalid={@errors != [] && ""}
        type={@type}
        name={@name}
        value={Phoenix.HTML.Form.normalize_value(@type, @value)}
        class={@class}
        {@rest}
      />
      <.field_errors errors={@errors} />
    </div>
    """
  end

  defp field_errors(assigns) do
    ~H"""
    <div :for={msg <- @errors} data-exo="field-error">
      {msg}
    </div>
    """
  end

  attr :checked, :boolean, default: false
  attr :name, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global

  def toggle(assigns) do
    ~H"""
    <label data-exo="toggle" data-checked={@checked && ""}>
      <input :if={@name} type="hidden" name={@name} value="false" />
      <input
        type="checkbox"
        name={@name}
        value="true"
        checked={@checked}
        class={@class}
        {@rest}
      />
      <span data-exo="toggle-track">
        <span data-exo="toggle-thumb" />
      </span>
    </label>
    """
  end

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
        aria-labelledby={@title != [] && "#{@id}-title"}
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
        <.button variant={@variant} phx-click={@on_confirm |> hide_modal(@id)}>{@confirm_text}</.button>
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

  attr :active, :string, required: true, doc: "the id of the currently active tab"
  attr :class, :string, default: nil

  slot :tab, required: true do
    attr :id, :string, required: true
    attr :label, :string, required: true
    attr :patch, :string
    attr :navigate, :string
    attr :click, :string
    attr :click_value, :string
    attr :icon, :string
  end

  def tabs(assigns) do
    ~H"""
    <div data-exo="tabs" role="tablist" class={@class}>
      <%= for tab <- @tab do %>
        <button
          :if={tab[:click]}
          data-exo="tab"
          data-active={tab.id == @active && ""}
          phx-click={tab[:click]}
          phx-value-tab={tab[:click_value] || tab.id}
          role="tab"
          aria-selected={to_string(tab.id == @active)}
        >
          {tab.label}
        </button>
        <.link
          :if={!tab[:click]}
          data-exo="tab"
          data-active={tab.id == @active && ""}
          patch={tab[:patch]}
          navigate={tab[:navigate]}
          role="tab"
          aria-selected={to_string(tab.id == @active)}
        >
          {tab.label}
        </.link>
      <% end %>
    </div>
    """
  end

  attr :page, :integer, required: true
  attr :total_pages, :integer, required: true
  attr :patch_fn, :any, required: true, doc: "function taking page number, returns path"
  attr :prev_label, :string, default: "Previous page"
  attr :next_label, :string, default: "Next page"
  attr :aria_label, :string, default: "Pagination"
  attr :class, :string, default: nil

  def pagination(assigns) do
    range =
      cond do
        assigns.total_pages <= 7 ->
          Enum.to_list(1..assigns.total_pages)

        assigns.page <= 3 ->
          Enum.to_list(1..5) ++ [:ellipsis, assigns.total_pages]

        assigns.page >= assigns.total_pages - 2 ->
          [1, :ellipsis | Enum.to_list((assigns.total_pages - 4)..assigns.total_pages)]

        true ->
          [1, :ellipsis] ++
            Enum.to_list((assigns.page - 1)..(assigns.page + 1)) ++
            [:ellipsis, assigns.total_pages]
      end

    assigns = assign(assigns, :range, range)

    ~H"""
    <nav :if={@total_pages > 1} data-exo="pagination" aria-label={@aria_label} class={@class}>
      <.link
        :if={@page > 1}
        data-exo="pagination-btn"
        patch={@patch_fn.(@page - 1)}
        aria-label={@prev_label}
      >
        ‹
      </.link>
      <span :if={@page <= 1} data-exo="pagination-btn" data-disabled aria-disabled="true">
        ‹
      </span>

      <%= for item <- @range do %>
        <%= case item do %>
          <% :ellipsis -> %>
            <span data-exo="pagination-ellipsis">…</span>
          <% num -> %>
            <.link
              data-exo="pagination-btn"
              data-active={num == @page && ""}
              patch={@patch_fn.(num)}
              aria-current={num == @page && "page"}
            >
              {num}
            </.link>
        <% end %>
      <% end %>

      <.link
        :if={@page < @total_pages}
        data-exo="pagination-btn"
        patch={@patch_fn.(@page + 1)}
        aria-label={@next_label}
      >
        ›
      </.link>
      <span :if={@page >= @total_pages} data-exo="pagination-btn" data-disabled aria-disabled="true">
        ›
      </span>
    </nav>
    """
  end

  attr :id, :string, default: nil
  attr :position, :string, values: ~w(bottom-start bottom-end), default: "bottom-end"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :trigger, required: true
  slot :item, required: true

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

  attr :text, :string, required: true
  attr :position, :string, values: ~w(top bottom left right), default: "top"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def tooltip(assigns) do
    ~H"""
    <span data-exo="tooltip" data-position={@position} class={@class} {@rest}>
      {render_slot(@inner_block)}
      <span data-exo="tooltip-text">{@text}</span>
    </span>
    """
  end

  attr :steps, :list, required: true, doc: "list of %{id: string, label: string, status: atom}"
  attr :on_click, :string, default: "goto-step", doc: "phx-click event name"
  attr :class, :string, default: nil
  attr :rest, :global

  def wizard_sidebar(assigns) do
    ~H"""
    <nav data-exo="wizard" class={@class} {@rest}>
      <ol>
        <li
          :for={{step, idx} <- Enum.with_index(@steps)}
          data-exo="wizard-step"
          data-status={step.status}
        >
          <button
            :if={step.status in [:completed, :current]}
            data-exo="wizard-btn"
            data-status={step.status}
            phx-click={@on_click}
            phx-value-step={step.id}
          >
            <span data-exo="wizard-indicator">
              <span :if={step.status == :completed}>✓</span>
              <span :if={step.status != :completed}>{idx + 1}</span>
            </span>
            <span data-exo="wizard-label">{step.label}</span>
          </button>
          <div
            :if={step.status not in [:completed, :current]}
            data-exo="wizard-btn"
            data-status={step.status}
          >
            <span data-exo="wizard-indicator">{idx + 1}</span>
            <span data-exo="wizard-label">{step.label}</span>
          </div>
          <div :if={idx < length(@steps) - 1} data-exo="wizard-connector" data-status={step.status} />
        </li>
      </ol>
    </nav>
    """
  end

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

  attr :class, :string, default: nil
  attr :rest, :global
  slot :item, required: true do
    attr :title, :string, required: true
  end

  def list(assigns) do
    ~H"""
    <ul data-exo="list" class={@class} {@rest}>
      <li :for={item <- @item} data-exo="list-item">
        <div data-exo="list-title">{item.title}</div>
        <div data-exo="list-content">{render_slot(item)}</div>
      </li>
    </ul>
    """
  end

  attr :title, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :action
  slot :inner_block, required: true

  def content_card(assigns) do
    ~H"""
    <div data-exo="card" class={@class} {@rest}>
      <div :if={@title || @action != []} data-exo="card-header">
        <h3 :if={@title} data-exo="card-title">{@title}</h3>
        <div :if={@action != []} data-exo="card-action">{render_slot(@action)}</div>
      </div>
      <div data-exo="card-body">{render_slot(@inner_block)}</div>
    </div>
    """
  end

  attr :title, :string, required: true
  attr :value, :any, required: true
  attr :icon, :string, default: nil
  attr :subtitle, :string, default: nil
  attr :trend, :string, default: nil
  attr :trend_direction, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global

  def stat_card(assigns) do
    ~H"""
    <div data-exo="stat-card" class={@class} {@rest}>
      <div data-exo="stat-card-top">
        <div data-exo="stat-card-info">
          <span data-exo="stat-card-label">{@title}</span>
          <span data-exo="stat-card-value">{@value}</span>
        </div>
        <div :if={@icon} data-exo="stat-card-icon">{@icon}</div>
      </div>
      <div :if={@subtitle || @trend} data-exo="stat-card-bottom">
        <span :if={@trend} data-exo="stat-card-trend" data-direction={@trend_direction}>{@trend}</span>
        <span :if={@subtitle} data-exo="stat-card-subtitle">{@subtitle}</span>
      </div>
    </div>
    """
  end

  attr :title, :string, required: true
  attr :value, :any, required: true
  attr :subtitle, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global
  slot :trailing

  def metric_card(assigns) do
    ~H"""
    <div data-exo="metric-card" class={@class} {@rest}>
      <div data-exo="metric-card-top">
        <div>
          <span data-exo="metric-card-label">{@title}</span>
          <span data-exo="metric-card-value">{@value}</span>
        </div>
        <div :if={@trailing != []}>{render_slot(@trailing)}</div>
      </div>
      <span :if={@subtitle} data-exo="metric-card-subtitle">{@subtitle}</span>
    </div>
    """
  end

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

  attr :type, :string, values: ~w(text card avatar table), default: "text"
  attr :rows, :integer, default: 3
  attr :label, :string, default: "Loading..."
  attr :class, :string, default: nil
  attr :rest, :global

  def skeleton(assigns) do
    ~H"""
    <div data-exo="skeleton" data-type={@type} role="status" aria-label={@label} class={@class} {@rest}>
      <%= case @type do %>
        <% "text" -> %>
          <div data-exo="skeleton-line" :for={_ <- 1..@rows} />
        <% "card" -> %>
          <div data-exo="skeleton-block" style="height: 8rem;" />
          <div data-exo="skeleton-line" />
          <div data-exo="skeleton-line" style="width: 60%;" />
        <% "avatar" -> %>
          <div data-exo="skeleton-circle" />
        <% "table" -> %>
          <div data-exo="skeleton-line" style="height: 2rem;" />
          <div data-exo="skeleton-line" :for={_ <- 1..@rows} style="height: 3rem;" />
      <% end %>
    </div>
    """
  end

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

  attr :kind, :atom, required: true, values: [:info, :success, :warning, :error]
  attr :title, :string, default: nil
  attr :class, :string, default: nil
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

  @doc """
  Translates an error message using gettext.
  """
  def translate_error({msg, opts}) do
    config = Application.get_env(:exo_ui, :gettext_backend)

    if config do
      Gettext.dgettext(config, "errors", msg, opts)
    else
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", fn -> to_string(value) end)
      end)
    end
  end
end
