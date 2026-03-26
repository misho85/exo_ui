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

  attr :rest, :global,
    include: ~w(autocomplete name rel action enctype method novalidate target multipart)

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

  attr :rest, :global,
    include: ~w(accept autocomplete capture cols disabled form list max maxlength min minlength
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
    assigns =
      assign_new(assigns, :checked, fn ->
        Phoenix.HTML.Form.normalize_value("checkbox", assigns[:value])
      end)

    ~H"""
    <label data-exo="checkbox-item">
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
      <span data-exo="checkbox-indicator">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span :if={@label}>{@label}</span>
    </label>
    """
  end

  def input(%{type: "textarea"} = assigns) do
    assigns = assign_new(assigns, :id, fn -> nil end)

    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label" for={@id}>{@label}</label>
      <textarea
        id={@id}
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

  @deprecated "Use select/1 instead"
  def input(%{type: "select"} = assigns) do
    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label">{@label}</label>
      <select
        data-exo="select"
        data-invalid={@errors != [] && ""}
        name={@name}
        multiple={@multiple}
        class={@class}
        {@rest}
      >
        <option :if={@prompt} value="">{@prompt}</option>
        {Phoenix.HTML.Form.options_for_select(@options, @value)}
      </select>
      <.field_errors errors={@errors} />
    </div>
    """
  end

  def input(assigns) do
    assigns = assign_new(assigns, :id, fn -> nil end)

    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label" for={@id}>{@label}</label>
      <input
        id={@id}
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

  # --- popover ---

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

  # --- dropdown_menu ---

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

  # --- select ---

  attr :id, :string, required: true
  attr :name, :any
  attr :value, :any, default: nil
  attr :field, Phoenix.HTML.FormField, default: nil
  attr :label, :string, default: nil
  attr :prompt, :string, default: nil
  attr :multiple, :boolean, default: false
  attr :errors, :list, default: []
  attr :disabled, :boolean, default: false
  attr :side, :string, values: ~w(top bottom left right), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "start"
  attr :class, :string, default: nil
  attr :rest, :global

  slot :option do
    attr :value, :any, required: true
    attr :icon, :string
    attr :disabled, :boolean
    attr :group, :string
  end

  def select(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    errors = if Phoenix.Component.used_input?(field), do: field.errors, else: []

    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(errors, &translate_error(&1)))
    |> assign_new(:name, fn -> if assigns.multiple, do: field.name <> "[]", else: field.name end)
    |> assign_new(:value, fn -> field.value end)
    |> select()
  end

  def select(assigns) do
    selected_opt =
      Enum.find(assigns.option, fn opt ->
        to_string(opt[:value]) == to_string(assigns[:value])
      end)

    grouped =
      assigns.option
      |> Enum.group_by(& &1[:group])
      |> Enum.map(fn {group_name, opts} -> {group_name, opts} end)

    label_id = if assigns[:label], do: "#{assigns.id}-label"

    assigns =
      assign(assigns,
        selected_opt: selected_opt,
        grouped: grouped,
        label_id: label_id
      )

    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label" id={@label_id}>{@label}</label>
      <div data-exo="popover" phx-hook="ExoSelect" id={"#{@id}-select"}>
        <button
          type="button"
          popovertarget={@id}
          data-exo="popover-trigger"
          data-exo-select="trigger"
          data-invalid={@errors != [] && ""}
          aria-haspopup="listbox"
          aria-labelledby={if @label_id, do: @label_id}
          style={"anchor-name: --select-#{@id}"}
          disabled={@disabled}
        >
          <span data-exo="select-value">
            {if @selected_opt, do: render_slot(@selected_opt), else: @prompt}
          </span>
          <svg
            data-exo="select-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <div
          id={@id}
          popover="auto"
          data-exo="popover-content"
          data-side={@side}
          data-align={@align}
          style={"position-anchor: --select-#{@id}"}
        >
          <div data-exo="select-menu" role="listbox" aria-labelledby={if @label_id, do: @label_id}>
            <%= for {group_name, opts} <- @grouped do %>
              <%= if group_name do %>
                <div data-exo="select-group" role="group" aria-label={group_name}>
                  <span data-exo="select-group-label">{group_name}</span>
                  <div
                    :for={opt <- opts}
                    data-exo="select-option"
                    role="option"
                    data-value={opt[:value]}
                    data-selected={to_string(opt[:value]) == to_string(@value) && ""}
                    data-disabled={opt[:disabled] && ""}
                    aria-selected={to_string(to_string(opt[:value]) == to_string(@value))}
                    tabindex="-1"
                  >
                    <span :if={opt[:icon]} data-exo="select-option-icon">
                      <.icon name={opt.icon} class="size-4" />
                    </span>
                    <span data-exo="select-check"><.icon name="check" class="size-4" /></span>
                    {render_slot(opt)}
                  </div>
                </div>
              <% else %>
                <div
                  :for={opt <- opts}
                  data-exo="select-option"
                  role="option"
                  data-value={opt[:value]}
                  data-selected={to_string(opt[:value]) == to_string(@value) && ""}
                  data-disabled={opt[:disabled] && ""}
                  aria-selected={to_string(to_string(opt[:value]) == to_string(@value))}
                  tabindex="-1"
                >
                  <span :if={opt[:icon]} data-exo="select-option-icon">
                    <.icon name={opt.icon} class="size-4" />
                  </span>
                  <span data-exo="select-check"><.icon name="check" class="size-4" /></span>
                  {render_slot(opt)}
                </div>
              <% end %>
            <% end %>
          </div>
        </div>
      </div>
      <input type="hidden" name={@name} value={@value || ""} />
      <.field_errors errors={@errors} />
    </div>
    """
  end

  # --- combobox ---

  attr :id, :string, required: true
  attr :name, :any
  attr :value, :any, default: nil
  attr :field, Phoenix.HTML.FormField, default: nil
  attr :label, :string, default: nil
  attr :prompt, :string, default: nil
  attr :trigger, :string, values: ~w(button input), default: "button"
  attr :filter, :string, values: ~w(client server), default: "server"
  attr :on_filter, :string, default: "combobox-filter"
  attr :debounce, :integer, default: 300
  attr :multiple, :boolean, default: false
  attr :creatable, :boolean, default: false
  attr :on_create, :string, default: "combobox-create"
  attr :clearable, :boolean, default: true
  attr :loading, :boolean, default: false
  attr :errors, :list, default: []
  attr :disabled, :boolean, default: false
  attr :side, :string, values: ~w(top bottom left right), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "start"
  attr :class, :string, default: nil
  attr :rest, :global

  slot :option do
    attr :value, :any, required: true
    attr :icon, :string
    attr :disabled, :boolean
    attr :group, :string
  end

  slot :empty

  def combobox(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    errors = if Phoenix.Component.used_input?(field), do: field.errors, else: []

    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(errors, &translate_error(&1)))
    |> assign_new(:name, fn -> if assigns.multiple, do: field.name <> "[]", else: field.name end)
    |> assign_new(:value, fn -> field.value end)
    |> combobox()
  end

  def combobox(%{trigger: "input"} = assigns) do
    assigns = assign(assigns, label_id: if(assigns[:label], do: "#{assigns.id}-label"))

    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label" id={@label_id}>{@label}</label>
      <div
        data-exo="popover"
        phx-hook="ExoCombobox"
        id={"#{@id}-combobox"}
        data-filter={@filter}
        data-on-filter={@on_filter}
        data-debounce={to_string(@debounce)}
        data-trigger="input"
        data-multiple={@multiple && ""}
      >
        <input
          type="text"
          data-exo="popover-trigger"
          data-exo-combobox="input-trigger"
          role="combobox"
          placeholder={@prompt}
          autocomplete="off"
          aria-haspopup="listbox"
          aria-controls={"#{@id}-listbox"}
          style={"anchor-name: --combobox-#{@id}"}
          disabled={@disabled}
        />
        <div
          id={@id}
          popover="manual"
          data-exo="popover-content"
          data-side={@side}
          data-align={@align}
          style={"position-anchor: --combobox-#{@id}"}
        >
          <div
            id={"#{@id}-listbox"}
            data-exo="combobox-list"
            role="listbox"
            aria-labelledby={if @label_id, do: @label_id}
          >
            <div
              :for={opt <- @option}
              data-exo="combobox-option"
              role="option"
              data-value={opt[:value]}
              data-selected={to_string(opt[:value]) == to_string(@value) && ""}
              data-disabled={opt[:disabled] && ""}
              aria-selected={to_string(to_string(opt[:value]) == to_string(@value))}
              tabindex="-1"
            >
              <span :if={opt[:icon]} data-exo="combobox-option-icon">
                <.icon name={opt.icon} class="size-4" />
              </span>
              <span data-exo="combobox-check"><.icon name="check" class="size-4" /></span>
              {render_slot(opt)}
            </div>
          </div>
          <div :for={empty <- @empty} data-exo="combobox-empty">{render_slot(empty)}</div>
          <div data-exo="combobox-loading" style={if !@loading, do: "display:none"}>
            <span data-exo="combobox-spinner">Loading...</span>
          </div>
        </div>
      </div>
      <input type="hidden" name={@name} value={@value || ""} />
      <.field_errors errors={@errors} />
    </div>
    """
  end

  def combobox(assigns) do
    selected_opt =
      Enum.find(assigns.option, fn opt ->
        to_string(opt[:value]) == to_string(assigns[:value])
      end)

    label_id = if assigns[:label], do: "#{assigns.id}-label"

    assigns =
      assign(assigns,
        selected_opt: selected_opt,
        label_id: label_id
      )

    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label" id={@label_id}>{@label}</label>
      <div
        data-exo="popover"
        phx-hook="ExoCombobox"
        id={"#{@id}-combobox"}
        data-filter={@filter}
        data-on-filter={@on_filter}
        data-debounce={to_string(@debounce)}
        data-trigger="button"
        data-multiple={@multiple && ""}
      >
        <div data-exo="combobox-trigger-group">
          <button
            type="button"
            popovertarget={@id}
            data-exo="popover-trigger"
            data-exo-combobox="trigger"
            data-invalid={@errors != [] && ""}
            aria-haspopup="listbox"
            aria-labelledby={if @label_id, do: @label_id}
            style={"anchor-name: --combobox-#{@id}"}
            disabled={@disabled}
          >
            <span data-exo="combobox-value">
              {if @selected_opt, do: render_slot(@selected_opt), else: @prompt}
            </span>
            <svg
              data-exo="combobox-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m7 15 5-5 5 5" /><path d="m7 9 5 5 5-5" />
            </svg>
          </button>
          <button
            :if={@clearable && @value}
            type="button"
            data-exo="combobox-clear"
            aria-label="Clear"
          >
            &#x2715;
          </button>
        </div>
        <div
          id={@id}
          popover="auto"
          data-exo="popover-content"
          data-side={@side}
          data-align={@align}
          style={"position-anchor: --combobox-#{@id}"}
        >
          <input
            type="text"
            data-exo="combobox-search"
            role="combobox"
            placeholder={@prompt}
            aria-controls={"#{@id}-listbox"}
            autocomplete="off"
          />
          <div
            id={"#{@id}-listbox"}
            data-exo="combobox-list"
            role="listbox"
            aria-labelledby={if @label_id, do: @label_id}
          >
            <div
              :for={opt <- @option}
              data-exo="combobox-option"
              role="option"
              data-value={opt[:value]}
              data-selected={to_string(opt[:value]) == to_string(@value) && ""}
              data-disabled={opt[:disabled] && ""}
              aria-selected={to_string(to_string(opt[:value]) == to_string(@value))}
              tabindex="-1"
            >
              <span :if={opt[:icon]} data-exo="combobox-option-icon">
                <.icon name={opt.icon} class="size-4" />
              </span>
              <span data-exo="combobox-check"><.icon name="check" class="size-4" /></span>
              {render_slot(opt)}
            </div>
          </div>
          <div :for={empty <- @empty} data-exo="combobox-empty">{render_slot(empty)}</div>
          <div data-exo="combobox-loading" style={if !@loading, do: "display:none"}>
            <span data-exo="combobox-spinner">Loading...</span>
          </div>
          <div :if={@creatable} data-exo="combobox-create" hidden phx-click={@on_create}>
            Create "<span data-exo="combobox-create-query"></span>"
          </div>
        </div>
      </div>
      <input type="hidden" name={@name} value={@value || ""} />
      <.field_errors errors={@errors} />
    </div>
    """
  end

  attr :id, :string, default: nil
  attr :position, :string, values: ~w(bottom-start bottom-end), default: "bottom-end"
  attr :class, :string, default: nil
  attr :rest, :global
  slot :trigger, required: true
  slot :item, required: true

  @deprecated "Use dropdown_menu/1 instead"
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

  # --- tooltip ---

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
        <span :if={@trend} data-exo="stat-card-trend" data-direction={@trend_direction}>
          {@trend}
        </span>
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

  attr :name, :string, required: true
  attr :class, :any, default: "size-4"

  def icon(assigns) do
    icon_fn = assigns.name |> String.replace("-", "_") |> String.to_existing_atom()
    ExoUI.Lucide.render(icon_fn, Map.delete(assigns, :name))
  end

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

  attr :id, :string, required: true
  attr :rows, :list, required: true
  attr :row_id, :any, default: nil
  attr :row_click, :any, default: nil
  attr :row_item, :any, default: &Function.identity/1
  attr :actions_label, :string, default: "Actions"
  attr :class, :string, default: nil
  attr :rest, :global

  slot :col, required: true do
    attr :label, :string
  end

  slot :action

  def table(assigns) do
    assigns =
      with %{rows: %Phoenix.LiveView.LiveStream{}} <- assigns do
        assign(assigns, row_id: assigns.row_id || fn {id, _item} -> id end)
      end

    ~H"""
    <div data-exo="table-wrapper" class={@class} {@rest}>
      <table data-exo="table">
        <thead>
          <tr data-exo="table-head-row">
            <th :for={col <- @col} data-exo="table-head-cell">{col[:label]}</th>
            <th :if={@action != []} data-exo="table-head-cell">
              <span data-exo="sr-only">{@actions_label}</span>
            </th>
          </tr>
        </thead>
        <tbody
          id={@id}
          phx-update={is_struct(@rows, Phoenix.LiveView.LiveStream) && "stream"}
        >
          <tr
            :for={row <- @rows}
            id={@row_id && @row_id.(row)}
            data-exo="table-row"
            data-clickable={@row_click && ""}
          >
            <td
              :for={col <- @col}
              data-exo="table-cell"
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

  attr :id, :string, required: true
  attr :selected, :any, default: nil
  attr :current_month, :any, default: nil
  attr :min, :any, default: nil
  attr :max, :any, default: nil
  attr :available_dates, :list, default: []
  attr :on_select, :string, default: "select-date"
  attr :on_prev_month, :string, default: "prev-month"
  attr :on_next_month, :string, default: "next-month"
  attr :label, :string, default: nil
  attr :class, :any, default: nil
  attr :disabled, :boolean, default: false

  def date_picker(assigns) do
    today = Date.utc_today()
    current = assigns[:current_month] || today
    first_of_month = Date.beginning_of_month(current)
    last_of_month = Date.end_of_month(current)

    start_dow = Date.day_of_week(first_of_month)
    pad_before = start_dow - 1
    grid_start = Date.add(first_of_month, -pad_before)

    days = Enum.map(0..41, fn i -> Date.add(grid_start, i) end)
    weeks = Enum.chunk_every(days, 7)
    available_set = MapSet.new(assigns[:available_dates] || [])

    can_prev =
      case assigns[:min] do
        nil -> true
        min_date -> Date.compare(first_of_month, Date.beginning_of_month(min_date)) == :gt
      end

    can_next =
      case assigns[:max] do
        nil -> true
        max_date -> Date.compare(last_of_month, max_date) == :lt
      end

    assigns =
      assign(assigns,
        today: today,
        current: current,
        weeks: weeks,
        available_set: available_set,
        can_prev: can_prev,
        can_next: can_next
      )

    ~H"""
    <div id={@id} data-exo="date-picker" class={@class}>
      <span :if={@label} data-exo="date-picker-label">{@label}</span>
      <div data-exo="date-picker-container">
        <%!-- Header: Month navigation --%>
        <div data-exo="date-picker-header">
          <button
            type="button"
            data-exo="date-picker-nav"
            phx-click={@on_prev_month}
            disabled={!@can_prev || @disabled}
            data-disabled={(!@can_prev || @disabled) && ""}
          >
            ‹
          </button>
          <span data-exo="date-picker-month">
            {Calendar.strftime(@current, "%B %Y")}
          </span>
          <button
            type="button"
            data-exo="date-picker-nav"
            phx-click={@on_next_month}
            disabled={!@can_next || @disabled}
            data-disabled={(!@can_next || @disabled) && ""}
          >
            ›
          </button>
        </div>

        <%!-- Weekday headers --%>
        <div data-exo="date-picker-weekdays">
          <div :for={day_name <- ~w(Mon Tue Wed Thu Fri Sat Sun)} data-exo="date-picker-weekday">
            {day_name}
          </div>
        </div>

        <%!-- Calendar grid --%>
        <div data-exo="date-picker-grid">
          <div :for={week <- @weeks} data-exo="date-picker-week">
            <%= for day <- week do %>
              <% in_month = day.month == @current.month and day.year == @current.year
              is_today = day == @today
              is_selected = @selected != nil and day == @selected
              has_availability = MapSet.member?(@available_set, day)

              is_disabled =
                @disabled or not in_month or
                  (not is_nil(@min) and Date.compare(day, @min) == :lt) or
                  (not is_nil(@max) and Date.compare(day, @max) == :gt) %>
              <button
                type="button"
                data-exo="date-picker-day"
                data-selected={is_selected && ""}
                data-today={is_today && in_month && ""}
                data-outside={!in_month && ""}
                data-disabled={is_disabled && ""}
                data-available={has_availability && in_month && ""}
                phx-click={unless(is_disabled, do: @on_select)}
                phx-value-date={Date.to_iso8601(day)}
                disabled={is_disabled}
              >
                {day.day}
              </button>
            <% end %>
          </div>
        </div>
      </div>
    </div>
    """
  end

  # --- radio_group ---

  attr :name, :string, required: true
  attr :value, :any, default: nil
  attr :options, :list, required: true, doc: "list of {label, value} tuples"
  attr :label, :string, default: nil
  attr :errors, :list, default: []
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(disabled)

  def radio_group(assigns) do
    ~H"""
    <fieldset data-exo="radio-group" class={@class} {@rest}>
      <legend :if={@label} data-exo="label">{@label}</legend>
      <label :for={{opt_label, opt_value} <- @options} data-exo="radio-item">
        <input
          type="radio"
          data-exo="radio"
          name={@name}
          value={opt_value}
          checked={to_string(@value) == to_string(opt_value)}
        />
        <span data-exo="radio-indicator" />
        <span>{opt_label}</span>
      </label>
      <.field_errors errors={@errors} />
    </fieldset>
    """
  end

  # --- accordion ---

  attr :id, :string, required: true
  attr :class, :string, default: nil
  attr :variant, :string, default: nil
  attr :joined, :boolean, default: false
  attr :rest, :global

  slot :item, required: true do
    attr :title, :string, required: true
    attr :open, :boolean
  end

  def accordion(assigns) do
    ~H"""
    <div
      data-exo="accordion"
      id={@id}
      class={@class}
      data-variant={@variant}
      data-joined={@joined || nil}
      {@rest}
    >
      <details :for={item <- @item} data-exo="accordion-item" open={item[:open]}>
        <summary data-exo="accordion-trigger">{item.title}</summary>
        <div data-exo="accordion-content">
          {render_slot(item)}
        </div>
      </details>
    </div>
    """
  end

  # --- breadcrumb ---

  attr :class, :string, default: nil
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

  # --- collapsible ---

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

  # --- drawer ---

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

  def show_drawer(id) do
    %Phoenix.LiveView.JS{}
    |> Phoenix.LiveView.JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> Phoenix.LiveView.JS.remove_attribute("inert", to: "##{id}")
  end

  def hide_drawer(js \\ %Phoenix.LiveView.JS{}, id) do
    js
    |> Phoenix.LiveView.JS.set_attribute({"data-state", "closed"}, to: "##{id}")
    |> Phoenix.LiveView.JS.set_attribute({"inert", "true"}, to: "##{id}")
  end

  # --- slider ---

  attr :name, :string, required: true
  attr :value, :any, default: 50
  attr :min, :integer, default: 0
  attr :max, :integer, default: 100
  attr :step, :integer, default: 1
  attr :label, :string, default: nil
  attr :class, :string, default: nil
  attr :rest, :global, include: ~w(disabled)

  def slider(assigns) do
    ~H"""
    <div data-exo="slider-field" class={@class}>
      <label :if={@label} data-exo="label">{@label}</label>
      <input
        type="range"
        data-exo="slider"
        name={@name}
        value={@value}
        min={@min}
        max={@max}
        step={@step}
        {@rest}
      />
    </div>
    """
  end

  # --- progress ---

  attr :value, :integer, required: true
  attr :max, :integer, default: 100
  attr :label, :string, default: nil
  attr :class, :string, default: nil
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

  @doc """
  Translates an error message using gettext.
  """
  def translate_error({msg, opts}) do
    config = Application.get_env(:exo_ui, :gettext_backend)

    if config do
      Gettext.dgettext(config, "errors", msg, opts)
    else
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", fn _ -> to_string(value) end)
      end)
    end
  end
end
