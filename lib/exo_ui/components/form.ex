defmodule ExoUI.Components.Form do
  @moduledoc """
  Form-related components: inputs, selects, comboboxes, toggles, sliders, and date pickers.
  """

  use Phoenix.Component

  import ExoUI.Components.Core, only: [icon: 1]

  @doc "Renders a form wrapper with `data-exo=\"form\"`."
  attr :for, :any, required: true
  attr :as, :any, default: nil
  attr :class, :any, default: nil

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

  @doc "Renders a form input (text, textarea, checkbox, hidden, or select)."
  attr :field, Phoenix.HTML.FormField, doc: "a form field struct"
  attr :id, :any, default: nil
  attr :type, :string, default: "text"
  attr :name, :any, default: nil
  attr :value, :any, default: nil
  attr :label, :string, default: nil
  attr :description, :string, default: nil
  attr :errors, :list, default: []
  attr :checked, :boolean, doc: "the checked flag for checkbox inputs"
  attr :prompt, :string, default: nil, doc: "the prompt for select inputs"
  attr :options, :list, doc: "the options to pass to Phoenix.HTML.Form.options_for_select/2"
  attr :multiple, :boolean, default: false, doc: "the multiple flag for select inputs"
  attr :class, :any, default: nil

  attr :rest, :global,
    include: ~w(accept autocomplete capture cols disabled form list max maxlength min minlength
    pattern placeholder readonly required rows size step)

  def input(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    errors = if Phoenix.Component.used_input?(field), do: field.errors, else: []

    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(errors, &translate_error(&1)))
    |> assign_new(:name, fn ->
      if assigns.multiple, do: field.name <> "[]", else: field.name
    end)
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
      |> prepare_basic_field()
      |> assign(:wrap, assigns.description != nil or assigns.errors != [])

    ~H"""
    <div :if={@wrap} data-exo="field">
      <.checkbox_control
        id={@id}
        name={@name}
        checked={@checked}
        class={@class}
        label={@label}
        errors={@errors}
        describedby={@describedby}
        rest={@rest}
      />
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    <.checkbox_control
      :if={!@wrap}
      id={@id}
      name={@name}
      checked={@checked}
      class={@class}
      label={@label}
      errors={@errors}
      describedby={@describedby}
      rest={@rest}
    />
    """
  end

  def input(%{type: "textarea"} = assigns) do
    assigns = prepare_basic_field(assigns)

    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label" for={@id}>{@label}</label>
      <textarea
        id={@id}
        data-exo="input"
        data-invalid={@errors != [] && ""}
        aria-invalid={if @errors != [], do: "true"}
        aria-describedby={@describedby}
        name={@name}
        class={@class}
        {@rest}
      >{Phoenix.HTML.Form.normalize_value("textarea", @value)}</textarea>
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  # Deprecated: Use select/1 instead
  def input(%{type: "select"} = assigns) do
    assigns = prepare_basic_field(assigns)

    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label" for={@id}>{@label}</label>
      <select
        id={@id}
        data-exo="select"
        data-invalid={@errors != [] && ""}
        aria-invalid={if @errors != [], do: "true"}
        aria-describedby={@describedby}
        name={@name}
        multiple={@multiple}
        class={@class}
        {@rest}
      >
        <option :if={@prompt} value="">{@prompt}</option>
        {Phoenix.HTML.Form.options_for_select(@options, @value)}
      </select>
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  def input(assigns) do
    assigns = prepare_basic_field(assigns)

    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label" for={@id}>{@label}</label>
      <input
        id={@id}
        data-exo="input"
        data-invalid={@errors != [] && ""}
        aria-invalid={if @errors != [], do: "true"}
        aria-describedby={@describedby}
        type={@type}
        name={@name}
        value={Phoenix.HTML.Form.normalize_value(@type, @value)}
        class={@class}
        {@rest}
      />
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  attr :id, :any, default: nil
  attr :name, :any, default: nil
  attr :checked, :boolean, required: true
  attr :class, :any, default: nil
  attr :label, :string, default: nil
  attr :errors, :list, default: []
  attr :describedby, :string, default: nil
  attr :rest, :map, default: %{}

  defp checkbox_control(assigns) do
    ~H"""
    <label data-exo="checkbox-item" for={@id}>
      <input :if={@name} type="hidden" name={@name} value="false" disabled={@rest[:disabled]} />
      <input
        id={@id}
        type="checkbox"
        data-exo="checkbox"
        data-checked={@checked && ""}
        data-invalid={@errors != [] && ""}
        aria-invalid={if @errors != [], do: "true"}
        aria-describedby={@describedby}
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

  attr :id, :string, default: nil
  attr :errors, :list, required: true

  defp field_errors(assigns) do
    assigns = assign(assigns, :error_items, Enum.with_index(assigns.errors))

    ~H"""
    <div
      :for={{msg, index} <- @error_items}
      id={if index == 0, do: @id}
      data-exo="field-error"
      role="alert"
    >
      {msg}
    </div>
    """
  end

  @doc "Renders a toggle switch (on/off)."
  attr :field, Phoenix.HTML.FormField, default: nil, doc: "a form field struct"
  attr :id, :any, default: nil
  attr :checked, :boolean, default: false
  attr :name, :string, default: nil
  attr :label, :string, default: nil
  attr :aria_label, :string, default: nil
  attr :description, :string, default: nil
  attr :errors, :list, default: []
  attr :class, :any, default: nil
  attr :rest, :global, include: ~w(disabled)

  def toggle(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    errors = if Phoenix.Component.used_input?(field), do: field.errors, else: []

    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(errors, &translate_error(&1)))
    |> assign(:name, if(is_nil(assigns.name), do: field.name, else: assigns.name))
    |> assign(:checked, Phoenix.HTML.Form.normalize_value("checkbox", field.value))
    |> toggle()
  end

  def toggle(assigns) do
    assigns = prepare_basic_field(assigns)
    wrap? = assigns.label != nil or assigns.description != nil or assigns.errors != []

    assigns =
      assign(assigns,
        wrap: wrap?,
        input_label: assigns.aria_label || if(assigns.label, do: nil, else: "Toggle")
      )

    ~H"""
    <div :if={@wrap} data-exo="field">
      <label data-exo="toggle" data-checked={@checked && ""}>
        <input :if={@name} type="hidden" name={@name} value="false" disabled={@rest[:disabled]} />
        <input
          type="checkbox"
          id={@id}
          name={@name}
          value="true"
          checked={@checked}
          role="switch"
          aria-label={@input_label}
          aria-invalid={if @errors != [], do: "true"}
          aria-describedby={@describedby}
          class={@class}
          {@rest}
        />
        <span data-exo="toggle-track">
          <span data-exo="toggle-thumb" />
        </span>
        <span :if={@label}>{@label}</span>
      </label>
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    <label :if={!@wrap} data-exo="toggle" data-checked={@checked && ""}>
      <input :if={@name} type="hidden" name={@name} value="false" disabled={@rest[:disabled]} />
      <input
        type="checkbox"
        id={@id}
        name={@name}
        value="true"
        checked={@checked}
        role="switch"
        aria-label={@input_label}
        aria-invalid={if @errors != [], do: "true"}
        aria-describedby={@describedby}
        class={@class}
        {@rest}
      />
      <span data-exo="toggle-track">
        <span data-exo="toggle-thumb" />
      </span>
    </label>
    """
  end

  @doc "Renders a custom select dropdown with option slots and optional grouping."
  attr :id, :string, required: true
  attr :name, :any
  attr :value, :any, default: nil
  attr :field, Phoenix.HTML.FormField, default: nil
  attr :label, :string, default: nil
  attr :description, :string, default: nil
  attr :prompt, :string, default: nil
  attr :errors, :list, default: []
  attr :disabled, :boolean, default: false
  attr :side, :string, values: ~w(top bottom left right), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "start"
  attr :class, :any, default: nil
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
    |> assign_new(:name, fn -> field.name end)
    |> assign_new(:value, fn -> field.value end)
    |> select()
  end

  def select(assigns) do
    assigns = prepare_choice(assigns)

    ~H"""
    <div data-exo="field" class={@class} {@rest}>
      <label :if={@label} data-exo="label" id={@label_id}>{@label}</label>
      <div data-exo="popover" phx-hook="ExoSelect" id={"#{@id}-select"}>
        <button
          type="button"
          popovertarget={@id}
          data-exo="popover-trigger"
          data-exo-select="trigger"
          data-invalid={@errors != [] && ""}
          aria-invalid={if @errors != [], do: "true"}
          aria-describedby={@describedby}
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-controls={"#{@id}-listbox"}
          aria-labelledby={if @label_id, do: @label_id}
          style={"anchor-name: --select-#{@id}"}
          disabled={@disabled}
        >
          <span data-exo="select-value" data-placeholder={!@selected_opt && ""}>
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
          <div
            id={"#{@id}-listbox"}
            data-exo="select-menu"
            role="listbox"
            aria-labelledby={if @label_id, do: @label_id}
          >
            <.choice_option_groups kind="select" grouped={@grouped} value={@value} />
          </div>
        </div>
      </div>
      <.choice_hidden_input name={@name} value={@value} />
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  @doc "Renders a searchable combobox with client or server-side filtering."
  attr :id, :string, required: true
  attr :name, :any
  attr :value, :any, default: nil
  attr :field, Phoenix.HTML.FormField, default: nil
  attr :label, :string, default: nil
  attr :description, :string, default: nil
  attr :prompt, :string, default: nil
  attr :trigger, :string, values: ~w(button input), default: "button"
  attr :filter, :string, values: ~w(client server), default: "server"
  attr :on_filter, :string, default: "combobox-filter"
  attr :on_filter_target, :any, default: nil
  attr :debounce, :integer, default: 300
  attr :creatable, :boolean, default: false
  attr :on_create, :string, default: "combobox-create"
  attr :clearable, :boolean, default: true
  attr :loading, :boolean, default: false
  attr :status, :string, default: nil, doc: "custom live-region text for server-filtered results"
  attr :errors, :list, default: []
  attr :disabled, :boolean, default: false
  attr :side, :string, values: ~w(top bottom left right), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "start"
  attr :class, :any, default: nil
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
    |> assign_new(:name, fn -> field.name end)
    |> assign_new(:value, fn -> field.value end)
    |> combobox()
  end

  def combobox(%{trigger: "input"} = assigns) do
    assigns = prepare_choice(assigns)

    ~H"""
    <div data-exo="field" class={@class} {@rest}>
      <label :if={@label} data-exo="label" id={@label_id}>{@label}</label>
      <div
        data-exo="popover"
        phx-hook="ExoCombobox"
        id={"#{@id}-combobox"}
        data-filter={@filter}
        data-on-filter={@on_filter}
        data-debounce={to_string(@debounce)}
        data-trigger="input"
        phx-target={@on_filter_target}
      >
        <input
          type="text"
          data-exo="popover-trigger"
          data-exo-combobox="input-trigger"
          data-invalid={@errors != [] && ""}
          aria-invalid={if @errors != [], do: "true"}
          aria-describedby={@describedby}
          role="combobox"
          placeholder={@prompt}
          autocomplete="off"
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-controls={"#{@id}-listbox"}
          aria-labelledby={if @label_id, do: @label_id}
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
            aria-busy={to_string(@loading)}
            aria-labelledby={if @label_id, do: @label_id}
          >
            <.choice_option_groups kind="combobox" grouped={@grouped} value={@value} />
          </div>
          <div :for={empty <- @empty} data-exo="combobox-empty">{render_slot(empty)}</div>
          <div data-exo="combobox-loading" style={if !@loading, do: "display:none"}>
            <span data-exo="combobox-spinner">Loading...</span>
          </div>
        </div>
        <span
          id={"#{@id}-status"}
          data-exo="combobox-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {combobox_status(@status, @loading)}
        </span>
      </div>
      <.choice_hidden_input name={@name} value={@value} />
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  def combobox(assigns) do
    assigns = prepare_choice(assigns)

    ~H"""
    <div data-exo="field" class={@class} {@rest}>
      <label :if={@label} data-exo="label" id={@label_id}>{@label}</label>
      <div
        data-exo="popover"
        phx-hook="ExoCombobox"
        id={"#{@id}-combobox"}
        data-filter={@filter}
        data-on-filter={@on_filter}
        data-debounce={to_string(@debounce)}
        data-trigger="button"
        phx-target={@on_filter_target}
      >
        <div data-exo="combobox-trigger-group">
          <button
            type="button"
            popovertarget={@id}
            data-exo="popover-trigger"
            data-exo-combobox="trigger"
            data-invalid={@errors != [] && ""}
            aria-invalid={if @errors != [], do: "true"}
            aria-describedby={@describedby}
            aria-haspopup="listbox"
            aria-expanded="false"
            aria-controls={"#{@id}-listbox"}
            aria-labelledby={if @label_id, do: @label_id}
            style={"anchor-name: --combobox-#{@id}"}
            disabled={@disabled}
          >
            <span data-exo="combobox-value" data-placeholder={!@selected_opt && ""}>
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
            disabled={@disabled}
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
            aria-busy={to_string(@loading)}
            aria-labelledby={if @label_id, do: @label_id}
          >
            <.choice_option_groups kind="combobox" grouped={@grouped} value={@value} />
          </div>
          <div :for={empty <- @empty} data-exo="combobox-empty">{render_slot(empty)}</div>
          <div data-exo="combobox-loading" style={if !@loading, do: "display:none"}>
            <span data-exo="combobox-spinner">Loading...</span>
          </div>
          <div :if={@creatable} data-exo="combobox-create" hidden phx-click={@on_create}>
            Create "<span data-exo="combobox-create-query"></span>"
          </div>
        </div>
        <span
          id={"#{@id}-status"}
          data-exo="combobox-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {combobox_status(@status, @loading)}
        </span>
      </div>
      <.choice_hidden_input name={@name} value={@value} />
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  attr :kind, :string, required: true, values: ~w(select combobox)
  attr :grouped, :list, required: true
  attr :value, :any, default: nil

  defp choice_option_groups(assigns) do
    ~H"""
    <%= for {group_name, opts} <- @grouped do %>
      <%= if group_name do %>
        <div data-exo={@kind <> "-group"} role="group" aria-label={group_name}>
          <span data-exo={@kind <> "-group-label"}>{group_name}</span>
          <.choice_options kind={@kind} options={opts} value={@value} />
        </div>
      <% else %>
        <.choice_options kind={@kind} options={opts} value={@value} />
      <% end %>
    <% end %>
    """
  end

  attr :kind, :string, required: true, values: ~w(select combobox)
  attr :options, :list, required: true
  attr :value, :any, default: nil

  defp choice_options(assigns) do
    ~H"""
    <div
      :for={opt <- @options}
      data-exo={@kind <> "-option"}
      role="option"
      data-value={opt[:value]}
      data-selected={option_selected?(opt[:value], @value) && ""}
      data-disabled={opt[:disabled] && ""}
      aria-selected={to_string(option_selected?(opt[:value], @value))}
      aria-disabled={to_string(opt[:disabled] == true)}
      tabindex="-1"
    >
      <span :if={opt[:icon]} data-exo={@kind <> "-option-icon"}>
        <.icon name={opt.icon} class="size-4" />
      </span>
      <span data-exo={@kind <> "-check"}><.icon name="check" class="size-4" /></span>
      {render_slot(opt)}
    </div>
    """
  end

  attr :name, :any, default: nil
  attr :value, :any, default: nil

  defp choice_hidden_input(assigns) do
    ~H"""
    <input :if={@name} type="hidden" name={@name} value={hidden_choice_value(@value)} />
    """
  end

  defp combobox_status(status, _loading) when is_binary(status), do: status
  defp combobox_status(_status, true), do: "Loading results"
  defp combobox_status(_status, _loading), do: ""

  defp prepare_choice(assigns) do
    assigns = prepare_basic_field(assigns)

    assign(assigns,
      grouped: group_options(assigns.option),
      label_id: choice_label_id(assigns),
      selected_opt: selected_option(assigns.option, assigns[:value])
    )
  end

  defp group_options(options) do
    options
    |> Enum.chunk_by(& &1[:group])
    |> Enum.map(fn [first | _] = grouped_options -> {first[:group], grouped_options} end)
  end

  defp option_selected?(option_value, value) do
    to_string(option_value) == to_string(value)
  end

  defp selected_option(options, value) do
    Enum.find(options, fn opt -> option_selected?(opt[:value], value) end)
  end

  defp choice_label_id(assigns) do
    assigns[:label_id]
  end

  defp hidden_choice_value(value), do: value || ""

  defp prepare_basic_field(assigns) do
    id = assigns[:id] || generated_input_id(assigns[:name])
    errors = assigns[:errors] || []

    description_id =
      if present?(assigns[:description]) && present?(id), do: "#{id}-description"

    error_id = if errors != [] && present?(id), do: "#{id}-error"
    label_id = if present?(assigns[:label]) && present?(id), do: "#{id}-label"

    assign(assigns,
      id: id,
      label_id: label_id,
      description_id: description_id,
      error_id: error_id,
      describedby: describedby([description_id, error_id])
    )
  end

  defp prepare_fieldset(assigns) do
    id = assigns[:id] || generated_input_id(assigns[:legend])
    errors = assigns[:errors] || []

    description_id =
      if present?(assigns[:description]) && present?(id), do: "#{id}-description"

    error_id = if errors != [] && present?(id), do: "#{id}-error"
    legend_id = if present?(assigns[:legend]) && present?(id), do: "#{id}-legend"

    assign(assigns,
      id: id,
      legend_id: legend_id,
      description_id: description_id,
      error_id: error_id,
      describedby: describedby([description_id, error_id])
    )
  end

  defp describedby(ids) do
    ids
    |> Enum.filter(&present?/1)
    |> Enum.join(" ")
    |> case do
      "" -> nil
      value -> value
    end
  end

  defp radio_item_id(nil, _value), do: nil
  defp radio_item_id(group_id, value), do: "#{group_id}-#{generated_input_id(value) || "option"}"

  defp generated_input_id(nil), do: nil

  defp generated_input_id(value) do
    value
    |> to_string()
    |> String.replace(~r/[^a-zA-Z0-9_-]+/, "-")
    |> String.trim("-")
    |> case do
      "" -> nil
      id -> id
    end
  end

  defp present?(value), do: value not in [nil, ""]

  @doc "Renders a radio button group from a list of {label, value} tuples or slot-based items."
  attr :field, Phoenix.HTML.FormField, default: nil, doc: "a form field struct"
  attr :id, :string, default: nil
  attr :name, :string
  attr :value, :any, default: nil
  attr :options, :list, default: [], doc: "list of {label, value} tuples"
  attr :label, :string, default: nil
  attr :description, :string, default: nil
  attr :errors, :list, default: []
  attr :disabled, :boolean, default: false
  attr :class, :any, default: nil
  attr :rest, :global

  slot :item do
    attr :value, :any, required: true
    attr :disabled, :boolean
  end

  def radio_group(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    errors = if Phoenix.Component.used_input?(field), do: field.errors, else: []

    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(errors, &translate_error(&1)))
    |> assign(:name, if(is_nil(assigns[:name]), do: field.name, else: assigns[:name]))
    |> assign(:value, if(is_nil(assigns.value), do: field.value, else: assigns.value))
    |> radio_group()
  end

  def radio_group(assigns) do
    assigns = prepare_basic_field(assigns)

    ~H"""
    <fieldset
      id={@id}
      data-exo="radio-group"
      class={@class}
      disabled={@disabled}
      aria-invalid={if @errors != [], do: "true"}
      aria-describedby={@describedby}
      {@rest}
    >
      <legend :if={@label} id={@label_id} data-exo="label">{@label}</legend>
      <%= if @item != [] do %>
        <label
          :for={item <- @item}
          data-exo="radio-item"
          for={radio_item_id(@id, item[:value])}
          data-disabled={(@disabled || item[:disabled]) && ""}
        >
          <input
            id={radio_item_id(@id, item[:value])}
            type="radio"
            data-exo="radio"
            name={@name}
            value={item[:value]}
            checked={to_string(@value) == to_string(item[:value])}
            disabled={@disabled || item[:disabled]}
          />
          <span data-exo="radio-indicator" />
          <span>{render_slot(item)}</span>
        </label>
      <% else %>
        <label
          :for={{opt_label, opt_value} <- @options}
          data-exo="radio-item"
          for={radio_item_id(@id, opt_value)}
          data-disabled={@disabled && ""}
        >
          <input
            id={radio_item_id(@id, opt_value)}
            type="radio"
            data-exo="radio"
            name={@name}
            value={opt_value}
            checked={to_string(@value) == to_string(opt_value)}
            disabled={@disabled}
          />
          <span data-exo="radio-indicator" />
          <span>{opt_label}</span>
        </label>
      <% end %>
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </fieldset>
    """
  end

  @doc "Renders a range slider input."
  attr :field, Phoenix.HTML.FormField, default: nil, doc: "a form field struct"
  attr :id, :string, default: nil
  attr :name, :string, default: nil
  attr :value, :any, default: nil
  attr :min, :integer, default: 0
  attr :max, :integer, default: 100
  attr :step, :integer, default: 1
  attr :label, :string, default: nil
  attr :description, :string, default: nil
  attr :errors, :list, default: []
  attr :class, :any, default: nil
  attr :rest, :global, include: ~w(disabled)

  def slider(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    errors = if Phoenix.Component.used_input?(field), do: field.errors, else: []

    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(errors, &translate_error(&1)))
    |> assign(:name, if(is_nil(assigns[:name]), do: field.name, else: assigns[:name]))
    |> assign(:value, if(is_nil(assigns[:value]), do: field.value, else: assigns[:value]))
    |> slider()
  end

  def slider(assigns) do
    assigns =
      assigns
      |> assign(:value, if(is_nil(assigns[:value]), do: 50, else: assigns[:value]))
      |> prepare_basic_field()

    ~H"""
    <div data-exo="slider-field" class={@class}>
      <label :if={@label} data-exo="label" for={@id}>{@label}</label>
      <input
        id={@id}
        type="range"
        data-exo="slider"
        data-invalid={@errors != [] && ""}
        aria-invalid={if @errors != [], do: "true"}
        aria-describedby={@describedby}
        name={@name}
        value={@value}
        min={@min}
        max={@max}
        step={@step}
        {@rest}
      />
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  @doc "Renders a calendar date picker with month navigation and date selection."
  attr :field, Phoenix.HTML.FormField, default: nil, doc: "a form field struct"
  attr :id, :string, default: nil
  attr :selected, :any, default: nil
  attr :current_month, :any, default: nil
  attr :min, :any, default: nil
  attr :max, :any, default: nil
  attr :available_dates, :list, default: []
  attr :on_select, :string, default: "select-date"
  attr :on_prev_month, :string, default: "prev-month"
  attr :on_next_month, :string, default: "next-month"
  attr :name, :string, default: nil
  attr :label, :string, default: nil
  attr :description, :string, default: nil
  attr :errors, :list, default: []
  attr :class, :any, default: nil
  attr :disabled, :boolean, default: false
  attr :rest, :global

  def date_picker(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    errors = if Phoenix.Component.used_input?(field), do: field.errors, else: []

    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(errors, &translate_error(&1)))
    |> assign(:name, if(is_nil(assigns[:name]), do: field.name, else: assigns[:name]))
    |> assign(
      :selected,
      if(is_nil(assigns[:selected]), do: field.value, else: assigns[:selected])
    )
    |> date_picker()
  end

  def date_picker(assigns) do
    assigns = prepare_basic_field(assigns)
    today = Date.utc_today()
    selected = normalize_date(assigns[:selected])
    current = normalize_date(assigns[:current_month]) || selected || today
    min_date = normalize_date(assigns[:min])
    max_date = normalize_date(assigns[:max])

    available_dates =
      Enum.reject(Enum.map(assigns[:available_dates] || [], &normalize_date/1), &is_nil/1)

    first_of_month = Date.beginning_of_month(current)
    last_of_month = Date.end_of_month(current)

    start_dow = Date.day_of_week(first_of_month)
    pad_before = start_dow - 1
    grid_start = Date.add(first_of_month, -pad_before)

    days = Enum.map(0..41, fn i -> Date.add(grid_start, i) end)
    weeks = Enum.chunk_every(days, 7)
    available_set = MapSet.new(available_dates)

    can_prev =
      case min_date do
        nil -> true
        min_date -> Date.compare(first_of_month, Date.beginning_of_month(min_date)) == :gt
      end

    can_next =
      case max_date do
        nil -> true
        max_date -> Date.compare(last_of_month, max_date) == :lt
      end

    assigns =
      assign(assigns,
        selected: selected,
        min: min_date,
        max: max_date,
        available_dates: available_dates,
        today: today,
        current: current,
        weeks: weeks,
        available_set: available_set,
        can_prev: can_prev,
        can_next: can_next
      )

    ~H"""
    <div
      id={@id}
      data-exo="date-picker"
      data-invalid={@errors != [] && ""}
      class={@class}
      role="group"
      aria-labelledby={@label_id}
      aria-describedby={@describedby}
      aria-invalid={if @errors != [], do: "true"}
      phx-hook={if @id, do: "ExoDatePicker"}
      {@rest}
    >
      <label :if={@label} id={@label_id} data-exo="date-picker-label">{@label}</label>
      <div data-exo="date-picker-container">
        <div data-exo="date-picker-header">
          <button
            type="button"
            data-exo="date-picker-nav"
            aria-label="Previous month"
            phx-click={@on_prev_month}
            disabled={!@can_prev || @disabled}
            data-disabled={(!@can_prev || @disabled) && ""}
          >
            ‹
          </button>
          <span id={"#{@id}-month"} data-exo="date-picker-month" aria-live="polite">
            {Calendar.strftime(@current, "%B %Y")}
          </span>
          <button
            type="button"
            data-exo="date-picker-nav"
            aria-label="Next month"
            phx-click={@on_next_month}
            disabled={!@can_next || @disabled}
            data-disabled={(!@can_next || @disabled) && ""}
          >
            ›
          </button>
        </div>

        <div data-exo="date-picker-weekdays" role="row">
          <div
            :for={day_name <- ~w(Mon Tue Wed Thu Fri Sat Sun)}
            data-exo="date-picker-weekday"
            role="columnheader"
            aria-label={weekday_label(day_name)}
          >
            {day_name}
          </div>
        </div>

        <div
          data-exo="date-picker-grid"
          role="grid"
          aria-labelledby={"#{@id}-month"}
          aria-readonly="true"
        >
          <div :for={week <- @weeks} data-exo="date-picker-week" role="row">
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
                data-unavailable={
                  @available_dates != [] && in_month && !has_availability && !is_disabled && ""
                }
                role="gridcell"
                aria-label={
                  date_aria_label(day, is_selected, is_today, is_disabled, has_availability, in_month)
                }
                aria-selected={to_string(is_selected)}
                aria-current={if is_today && in_month, do: "date"}
                aria-disabled={to_string(is_disabled)}
                tabindex={date_tabindex(is_selected, is_today, in_month, is_disabled)}
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
      <input
        :if={@name}
        type="hidden"
        name={@name}
        value={date_input_value(@selected)}
        disabled={@disabled}
      />
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  defp weekday_label("Mon"), do: "Monday"
  defp weekday_label("Tue"), do: "Tuesday"
  defp weekday_label("Wed"), do: "Wednesday"
  defp weekday_label("Thu"), do: "Thursday"
  defp weekday_label("Fri"), do: "Friday"
  defp weekday_label("Sat"), do: "Saturday"
  defp weekday_label("Sun"), do: "Sunday"

  defp date_aria_label(day, selected?, today?, disabled?, available?, in_month?) do
    base = Calendar.strftime(day, "%B %-d, %Y")

    [
      base,
      selected? && "selected",
      today? && in_month? && "today",
      disabled? && "unavailable",
      available? && in_month? && "available"
    ]
    |> Enum.filter(&(&1 not in [false, nil]))
    |> Enum.join(", ")
  end

  defp date_tabindex(true, _today?, _in_month?, false), do: "0"
  defp date_tabindex(false, true, true, false), do: "0"
  defp date_tabindex(_selected?, _today?, _in_month?, _disabled?), do: "-1"

  defp date_input_value(nil), do: ""
  defp date_input_value(%Date{} = date), do: Date.to_iso8601(date)
  defp date_input_value(value), do: to_string(value)

  defp normalize_date(%Date{} = date), do: date
  defp normalize_date(nil), do: nil

  defp normalize_date(value) when is_binary(value) do
    case Date.from_iso8601(value) do
      {:ok, date} -> date
      {:error, _reason} -> nil
    end
  end

  defp normalize_date(_value), do: nil

  @doc "Renders a star rating input."
  attr :field, Phoenix.HTML.FormField, default: nil, doc: "a form field struct"
  attr :id, :string, default: nil
  attr :name, :string, default: nil
  attr :value, :any, default: nil
  attr :max, :integer, default: 5
  attr :readonly, :boolean, default: false
  attr :disabled, :boolean, default: false
  attr :size, :string, values: ~w(sm md lg), default: "md"
  attr :label, :string, default: nil
  attr :description, :string, default: nil
  attr :errors, :list, default: []
  attr :class, :any, default: nil
  attr :rest, :global

  def rating(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    errors = if Phoenix.Component.used_input?(field), do: field.errors, else: []

    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(errors, &translate_error(&1)))
    |> assign(:name, if(is_nil(assigns[:name]), do: field.name, else: assigns[:name]))
    |> assign(:value, if(is_nil(assigns[:value]), do: field.value, else: assigns[:value]))
    |> rating()
  end

  def rating(assigns) do
    assigns =
      assigns
      |> assign(:value, rating_value(assigns[:value], assigns.max))
      |> assign(:stars, rating_stars(assigns.max))
      |> prepare_basic_field()
      |> assign(:wrap, assigns.label != nil or assigns.description != nil or assigns.errors != [])

    ~H"""
    <div :if={@wrap} data-exo="field">
      <label :if={@label} id={@label_id} data-exo="label" for={@id}>{@label}</label>
      <.rating_control
        id={@id}
        name={@name}
        value={@value}
        max={@max}
        readonly={@readonly}
        disabled={@disabled}
        size={@size}
        class={@class}
        stars={@stars}
        label_id={@label_id}
        describedby={@describedby}
        errors={@errors}
        rest={@rest}
      />
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    <.rating_control
      :if={!@wrap}
      id={@id}
      name={@name}
      value={@value}
      max={@max}
      readonly={@readonly}
      disabled={@disabled}
      size={@size}
      class={@class}
      stars={@stars}
      label_id={@label_id}
      describedby={@describedby}
      errors={@errors}
      rest={@rest}
    />
    """
  end

  attr :id, :string, default: nil
  attr :name, :string, default: nil
  attr :value, :integer, required: true
  attr :max, :integer, required: true
  attr :readonly, :boolean, required: true
  attr :disabled, :boolean, required: true
  attr :size, :string, required: true
  attr :class, :any, default: nil
  attr :stars, :list, required: true
  attr :label_id, :string, default: nil
  attr :describedby, :string, default: nil
  attr :errors, :list, default: []
  attr :rest, :map, default: %{}

  defp rating_control(assigns) do
    ~H"""
    <div
      id={@id}
      data-exo="rating"
      phx-hook={if !@readonly && !@disabled, do: "ExoRating"}
      data-size={@size}
      data-readonly={@readonly || nil}
      data-disabled={@disabled || nil}
      data-value={@value}
      data-invalid={@errors != [] && ""}
      role={if @readonly, do: "img", else: "radiogroup"}
      aria-label={unless @label_id, do: rating_aria_label(@value, @max)}
      aria-labelledby={@label_id}
      aria-describedby={@describedby}
      aria-invalid={if @errors != [], do: "true"}
      aria-readonly={if @readonly, do: "true"}
      aria-disabled={if @disabled, do: "true"}
      class={@class}
      {@rest}
    >
      <input
        :if={@name}
        type="hidden"
        name={@name}
        value={@value}
        data-exo="rating-value"
        disabled={@disabled}
      />
      <%= for star <- @stars do %>
        <label
          :if={!@readonly}
          data-exo="rating-star"
          data-active={star <= @value || nil}
          data-disabled={@disabled || nil}
        >
          <input
            type="radio"
            name={"#{@name || @id || "rating"}-star"}
            value={star}
            checked={star == @value}
            data-exo="rating-input"
            aria-label={rating_star_aria_label(star, @max)}
            disabled={@disabled}
          />
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
        </label>
        <span
          :if={@readonly}
          data-exo="rating-star"
          data-active={star <= @value || nil}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      <% end %>
    </div>
    """
  end

  defp rating_value(value, max) do
    value
    |> parse_integer(0)
    |> min(max)
    |> max(0)
  end

  defp rating_stars(max) when max > 0, do: Enum.to_list(1..max)
  defp rating_stars(_max), do: []

  defp rating_aria_label(value, max), do: "#{value} out of #{max}"
  defp rating_star_aria_label(star, max), do: "#{star} out of #{max}"

  defp parse_integer(value, _default) when is_integer(value), do: value

  defp parse_integer(value, default) when is_binary(value) do
    case Integer.parse(value) do
      {number, _rest} -> number
      :error -> default
    end
  end

  defp parse_integer(_value, default), do: default

  @doc "Renders a fieldset for grouping related form elements."
  attr :id, :string, default: nil
  attr :legend, :string, default: nil
  attr :description, :string, default: nil
  attr :errors, :list, default: []
  attr :disabled, :boolean, default: false
  attr :class, :any, default: nil
  attr :rest, :global
  slot :inner_block, required: true

  def fieldset(assigns) do
    assigns = prepare_fieldset(assigns)

    ~H"""
    <fieldset
      id={@id}
      data-exo="fieldset"
      disabled={@disabled}
      class={@class}
      aria-describedby={@describedby}
      aria-invalid={if @errors != [], do: "true"}
      {@rest}
    >
      <legend :if={@legend} id={@legend_id} data-exo="fieldset-legend">{@legend}</legend>
      <p :if={@description} id={@description_id} data-exo="fieldset-description">
        {@description}
      </p>
      <div data-exo="fieldset-content">
        {render_slot(@inner_block)}
      </div>
      <.field_errors id={@error_id} errors={@errors} />
    </fieldset>
    """
  end

  @doc "Renders a styled file upload input."
  attr :field, Phoenix.HTML.FormField, default: nil, doc: "a form field struct"
  attr :name, :string, default: nil
  attr :id, :string, default: nil
  attr :label, :string, default: nil
  attr :description, :string, default: nil
  attr :errors, :list, default: []
  attr :accept, :string, default: nil
  attr :multiple, :boolean, default: false
  attr :class, :any, default: nil
  attr :rest, :global, include: ~w(disabled required)

  def file_input(%{field: %Phoenix.HTML.FormField{} = field} = assigns) do
    errors = if Phoenix.Component.used_input?(field), do: field.errors, else: []

    assigns
    |> assign(field: nil, id: assigns[:id] || field.id)
    |> assign(:errors, Enum.map(errors, &translate_error(&1)))
    |> assign(:name, if(is_nil(assigns[:name]), do: field.name, else: assigns[:name]))
    |> file_input()
  end

  def file_input(assigns) do
    assigns = prepare_basic_field(assigns)

    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label" for={@id}>{@label}</label>
      <input
        type="file"
        id={@id}
        name={@name}
        accept={@accept}
        multiple={@multiple}
        data-exo="file-input"
        data-invalid={@errors != [] && ""}
        aria-invalid={if @errors != [], do: "true"}
        aria-describedby={@describedby}
        class={@class}
        {@rest}
      />
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  @doc """
  Translates an error message.

  Delegates to `ExoUI.Utils.translate_error/1`. Configure a custom
  translate function via:

      config :exo_ui, :translate_function, {MyAppWeb.CoreComponents, :translate_error}
  """
  defdelegate translate_error(msg_opts), to: ExoUI.Utils
end
