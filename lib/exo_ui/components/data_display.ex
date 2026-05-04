defmodule ExoUI.Components.DataDisplay do
  @moduledoc """
  Data display components: tables, lists, cards, wizards, breadcrumbs, tabs, pagination, and accordions.
  """

  use Phoenix.Component

  @doc "Renders a data table with columns, optional row click, and action slots. Supports LiveView streams."
  attr :id, :string, required: true
  attr :rows, :list, required: true
  attr :row_id, :any, default: nil
  attr :row_click, :any, default: nil
  attr :row_item, :any, default: &Function.identity/1
  attr :row_label, :any, default: nil
  attr :caption, :string, default: nil
  attr :empty_label, :string, default: "No results."
  attr :actions_label, :string, default: "Actions"
  attr :class, :any, default: nil
  attr :rest, :global

  slot :col, required: true do
    attr :label, :string
    attr :align, :string
    attr :class, :any
    attr :header_class, :any
  end

  slot :action
  slot :empty

  def table(assigns) do
    assigns =
      with %{rows: %Phoenix.LiveView.LiveStream{}} <- assigns do
        assign(assigns, row_id: assigns.row_id || fn {id, _item} -> id end)
      end

    assigns =
      assign(assigns,
        column_count: length(assigns.col) + if(assigns.action == [], do: 0, else: 1),
        empty?: table_empty?(assigns.rows)
      )

    ~H"""
    <div data-exo="table-wrapper" class={@class} {@rest}>
      <table data-exo="table">
        <caption :if={@caption} data-exo="table-caption">{@caption}</caption>
        <thead>
          <tr data-exo="table-head-row">
            <th
              :for={col <- @col}
              data-exo="table-head-cell"
              data-align={col[:align]}
              scope="col"
              class={col[:header_class]}
            >
              {col[:label]}
            </th>
            <th :if={@action != []} data-exo="table-head-cell" scope="col">
              <span data-exo="sr-only">{@actions_label}</span>
            </th>
          </tr>
        </thead>
        <tbody
          id={@id}
          phx-update={is_struct(@rows, Phoenix.LiveView.LiveStream) && "stream"}
        >
          <tr :if={@empty?} data-exo="table-empty-row">
            <td data-exo="table-empty-cell" colspan={@column_count}>
              <div data-exo="table-empty">
                <%= if @empty != [] do %>
                  {render_slot(@empty)}
                <% else %>
                  {@empty_label}
                <% end %>
              </div>
            </td>
          </tr>
          <tr
            :for={row <- @rows}
            id={@row_id && @row_id.(row)}
            data-exo="table-row"
            data-clickable={@row_click && ""}
            aria-label={@row_label && @row_label.(@row_item.(row))}
          >
            <td
              :for={col <- @col}
              data-exo="table-cell"
              data-align={col[:align]}
              class={col[:class]}
              phx-click={@row_click && @row_click.(row)}
            >
              {render_slot(col, @row_item.(row))}
            </td>
            <td :if={@action != []} data-exo="table-action-cell">
              <div data-exo="table-actions">
                {render_slot(@action, @row_item.(row))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    """
  end

  defp table_empty?(%Phoenix.LiveView.LiveStream{}), do: false
  defp table_empty?(rows), do: Enum.empty?(rows)

  @doc "Renders a description list of title/content pairs."
  attr :class, :any, default: nil
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

  @doc "Renders a content card with optional title, header action, and body."
  attr :title, :string, default: nil
  attr :class, :any, default: nil
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

  @doc "Renders a statistics card with value, optional icon, subtitle, and trend indicator."
  attr :title, :string, required: true
  attr :value, :any, required: true
  attr :icon, :string, default: nil
  attr :subtitle, :string, default: nil
  attr :trend, :string, default: nil
  attr :trend_direction, :string, default: nil
  attr :class, :any, default: nil
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
        <span :if={@trend} data-exo="stat-card-trend" data-direction={@trend_direction}>
          {@trend}
        </span>
        <span :if={@subtitle} data-exo="stat-card-subtitle">{@subtitle}</span>
      </div>
    </div>
    """
  end

  @doc "Renders a compact metric card with value and optional trailing content."
  attr :title, :string, required: true
  attr :value, :any, required: true
  attr :subtitle, :string, default: nil
  attr :class, :any, default: nil
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

  @doc "Renders a wizard/stepper sidebar showing step progress."
  attr :steps, :list, required: true, doc: "list of %{id: string, label: string, status: atom}"
  attr :on_click, :string, default: "goto-step", doc: "phx-click event name"
  attr :class, :any, default: nil
  attr :rest, :global

  def wizard_sidebar(assigns) do
    assigns = assign(assigns, :last_idx, length(assigns.steps) - 1)

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
          <div :if={idx < @last_idx} data-exo="wizard-connector" data-status={step.status} />
        </li>
      </ol>
    </nav>
    """
  end

  @doc "Renders a breadcrumb navigation trail."
  attr :class, :any, default: nil
  attr :rest, :global

  slot :item, required: true do
    attr :href, :string
    attr :navigate, :string
    attr :patch, :string
  end

  def breadcrumb(assigns) do
    ~H"""
    <nav data-exo="breadcrumb" aria-label="Breadcrumb" class={@class} {@rest}>
      <ol>
        <li :for={{item, idx} <- Enum.with_index(@item)} data-exo="breadcrumb-item">
          <span :if={idx > 0} data-exo="breadcrumb-separator">/</span>
          <.link :if={item[:navigate]} navigate={item.navigate}>{render_slot(item)}</.link>
          <.link :if={item[:patch] && !item[:navigate]} patch={item.patch}>{render_slot(item)}</.link>
          <.link :if={item[:href] && !item[:navigate] && !item[:patch]} href={item.href}>
            {render_slot(item)}
          </.link>
          <span :if={!item[:href] && !item[:navigate] && !item[:patch]} aria-current="page">
            {render_slot(item)}
          </span>
        </li>
      </ol>
    </nav>
    """
  end

  @doc "Renders a tab bar with click or navigation-based tabs."
  attr :active, :string, required: true, doc: "the id of the currently active tab"
  attr :class, :any, default: nil

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

  @doc "Renders a pagination control with page numbers and prev/next buttons."
  attr :page, :integer, required: true
  attr :total_pages, :integer, required: true
  attr :patch_fn, :any, required: true, doc: "function taking page number, returns path"
  attr :prev_label, :string, default: "Previous page"
  attr :next_label, :string, default: "Next page"
  attr :aria_label, :string, default: "Pagination"
  attr :class, :any, default: nil

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

  @doc "Renders a multi-step progress indicator."
  attr :class, :any, default: nil
  attr :orientation, :string, values: ~w(horizontal vertical), default: "horizontal"
  attr :rest, :global

  slot :step, required: true do
    attr :title, :string, required: true
    attr :status, :string, values: ~w(complete current upcoming)
  end

  def steps(assigns) do
    ~H"""
    <ol data-exo="steps" data-orientation={@orientation} class={@class} {@rest}>
      <li
        :for={step <- @step}
        data-exo="step"
        data-status={step[:status] || "upcoming"}
      >
        <div data-exo="step-indicator">
          <span :if={step[:status] == "complete"}>&#10003;</span>
          <span :if={step[:status] != "complete"}></span>
        </div>
        <span data-exo="step-title">{step.title}</span>
      </li>
    </ol>
    """
  end

  @doc "Renders a chronological timeline of events."
  attr :class, :any, default: nil
  attr :rest, :global

  slot :event, required: true do
    attr :title, :string, required: true
    attr :time, :string
    attr :variant, :string
  end

  def timeline(assigns) do
    ~H"""
    <div data-exo="timeline" class={@class} {@rest}>
      <div :for={event <- @event} data-exo="timeline-event" data-variant={event[:variant]}>
        <div data-exo="timeline-indicator" />
        <div data-exo="timeline-connector" />
        <div data-exo="timeline-body">
          <p data-exo="timeline-title">{event.title}</p>
          <time :if={event[:time]} data-exo="timeline-time">{event.time}</time>
          <div :if={event.inner_block} data-exo="timeline-content">
            {render_slot(event)}
          </div>
        </div>
      </div>
    </div>
    """
  end

  @doc "Renders a scrollable carousel of items."
  attr :id, :string, required: true
  attr :class, :any, default: nil
  attr :loop, :boolean, default: false
  attr :rest, :global
  slot :item, required: true

  def carousel(assigns) do
    ~H"""
    <div
      data-exo="carousel"
      id={@id}
      data-loop={@loop || nil}
      phx-hook="ExoCarousel"
      class={@class}
      role="region"
      aria-roledescription="carousel"
      aria-label="Carousel"
      {@rest}
    >
      <div data-exo="carousel-viewport">
        <div data-exo="carousel-track">
          <div
            :for={{item, idx} <- Enum.with_index(@item)}
            data-exo="carousel-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={"Slide #{idx + 1}"}
          >
            {render_slot(item)}
          </div>
        </div>
      </div>
      <button data-exo="carousel-prev" aria-label="Previous slide">‹</button>
      <button data-exo="carousel-next" aria-label="Next slide">›</button>
    </div>
    """
  end

  @doc "Renders an accordion with collapsible detail items."
  attr :id, :string, required: true
  attr :class, :any, default: nil
  attr :variant, :string, default: nil
  attr :type, :string, default: "single", values: ["single", "multiple"]
  attr :collapsible, :boolean, default: true
  attr :joined, :boolean, default: false
  attr :rest, :global

  slot :item, required: true do
    attr :title, :string, required: true
    attr :open, :boolean
    attr :disabled, :boolean
  end

  def accordion(assigns) do
    ~H"""
    <div
      data-exo="accordion"
      id={@id}
      class={@class}
      data-variant={@variant}
      data-type={@type}
      data-collapsible={@collapsible || nil}
      data-joined={@joined || nil}
      phx-hook="ExoAccordion"
      {@rest}
    >
      <div
        :for={{item, idx} <- Enum.with_index(@item)}
        data-exo="accordion-item"
        data-disabled={item[:disabled] || nil}
      >
        <input
          type="checkbox"
          id={"#{@id}-#{idx}"}
          checked={item[:open]}
          disabled={item[:disabled]}
          data-exo="accordion-state"
          aria-hidden="true"
          tabindex="-1"
        />
        <button
          type="button"
          data-exo="accordion-trigger"
          aria-expanded={to_string(item[:open] == true)}
          aria-controls={"#{@id}-content-#{idx}"}
          aria-disabled={to_string(item[:disabled] == true)}
          disabled={item[:disabled]}
          id={"#{@id}-trigger-#{idx}"}
        >
          {item.title}
        </button>
        <div
          data-exo="accordion-content"
          id={"#{@id}-content-#{idx}"}
          role="region"
          aria-labelledby={"#{@id}-trigger-#{idx}"}
        >
          <div data-exo="accordion-body">
            {render_slot(item)}
          </div>
        </div>
      </div>
    </div>
    """
  end

  @doc "Renders a hero/banner section with title, subtitle, and action area."
  attr :class, :any, default: nil
  attr :rest, :global
  slot :title, required: true
  slot :subtitle
  slot :actions
  slot :inner_block

  def hero(assigns) do
    ~H"""
    <section data-exo="hero" class={@class} {@rest}>
      <div data-exo="hero-content">
        <h1 data-exo="hero-title">{render_slot(@title)}</h1>
        <p :if={@subtitle != []} data-exo="hero-subtitle">{render_slot(@subtitle)}</p>
        <div :if={@actions != []} data-exo="hero-actions">{render_slot(@actions)}</div>
      </div>
      {render_slot(@inner_block)}
    </section>
    """
  end

  @doc "Renders a chat message bubble with sender, timestamp, and avatar."
  attr :side, :string, values: ~w(start end), default: "start"
  attr :class, :any, default: nil
  attr :rest, :global
  slot :avatar
  slot :header
  slot :inner_block, required: true
  slot :footer

  def chat_bubble(assigns) do
    ~H"""
    <div data-exo="chat-bubble" data-side={@side} class={@class} {@rest}>
      <div :if={@avatar != []} data-exo="chat-bubble-avatar">{render_slot(@avatar)}</div>
      <div data-exo="chat-bubble-message">
        <div :if={@header != []} data-exo="chat-bubble-header">{render_slot(@header)}</div>
        <div data-exo="chat-bubble-content">{render_slot(@inner_block)}</div>
        <div :if={@footer != []} data-exo="chat-bubble-footer">{render_slot(@footer)}</div>
      </div>
    </div>
    """
  end
end
