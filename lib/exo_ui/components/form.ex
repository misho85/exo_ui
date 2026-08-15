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

  @doc """
  Renders a form input (text, textarea, checkbox, hidden, or select).

  `type="select"` delegates to `select/1` for single-select usage. `multiple`
  keeps the native select fallback for compatibility because ExoUI's custom
  select is single-value.
  """
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
  attr :prefix, :string, default: nil, doc: "text displayed before a text-like input value"
  attr :suffix, :string, default: nil, doc: "text displayed after a text-like input value"
  attr :leading_icon, :string, default: nil, doc: "Lucide icon displayed before a text-like input"
  attr :trailing_icon, :string, default: nil, doc: "Lucide icon displayed after a text-like input"
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

  # Compatibility fallback: ExoUI's custom select is single-value.
  def input(%{type: "select", multiple: true} = assigns) do
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

  def input(%{type: "select"} = assigns) do
    assigns =
      assigns
      |> assign_new(:options, fn -> [] end)
      |> prepare_basic_field()
      |> assign(:select_disabled, select_disabled?(assigns.rest))
      |> assign(:select_rest, Map.drop(assigns.rest, [:disabled, "disabled"]))

    ~H"""
    <.select
      id={@id}
      name={@name}
      value={@value}
      options={@options}
      label={@label}
      description={@description}
      prompt={@prompt}
      errors={@errors}
      disabled={@select_disabled}
      class={@class}
      {@select_rest}
    />
    """
  end

  def input(assigns) do
    assigns =
      assigns
      |> prepare_basic_field()
      |> assign(:adorned, input_adorned?(assigns))

    ~H"""
    <div data-exo="field">
      <label :if={@label} data-exo="label" for={@id}>{@label}</label>

      <div
        :if={@adorned}
        data-exo="input-frame"
        data-invalid={@errors != [] && ""}
        data-disabled={@rest[:disabled] && ""}
      >
        <span :if={@leading_icon} data-exo="input-icon" data-position="leading" aria-hidden="true">
          <.icon name={@leading_icon} class="size-4" />
        </span>
        <span :if={@prefix} data-exo="input-prefix">{@prefix}</span>
        <input
          id={@id}
          data-exo="input"
          data-adorned
          data-invalid={@errors != [] && ""}
          aria-invalid={if @errors != [], do: "true"}
          aria-describedby={@describedby}
          type={@type}
          name={@name}
          value={Phoenix.HTML.Form.normalize_value(@type, @value)}
          class={@class}
          {@rest}
        />
        <span :if={@suffix} data-exo="input-suffix">{@suffix}</span>
        <span :if={@trailing_icon} data-exo="input-icon" data-position="trailing" aria-hidden="true">
          <.icon name={@trailing_icon} class="size-4" />
        </span>
      </div>

      <input
        :if={!@adorned}
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
      <span data-exo="checkbox-indicator" aria-hidden="true">
        <.icon name="check" class="size-3" />
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

  @doc """
  Renders a custom select dropdown with option slots and optional grouping.

  ## The value is carried by a REAL `<select>`, not a hidden input

  The popover/listbox above is presentation; the form value lives in a native
  `<select name={@name}>` rendered alongside it (`data-exo="select-native"`,
  visually hidden by `select.css`). `ExoSelect` writes the chosen value onto
  that element and dispatches `input`+`change`, exactly as a user operating a
  native select would.

  This is deliberate, and it buys three things a hidden input cannot:

    * **`phx-change` works.** LiveView looks the binding up on the element that
      fired the event, or on its `<form>` — never on an ancestor `<div>`. Any
      `phx-*` attribute passed to this component is therefore forwarded to the
      native `<select>`, not to the field wrapper.
    * **`Phoenix.LiveViewTest` can drive it.** `form/3` refuses to change
      `<input type="hidden">` values, so with a hidden input every test that
      submitted a select value raised `ArgumentError`, forcing tests to bypass
      form serialization entirely.
    * **`required`, and value validation, are the browser's job again.**

  ## `prompt` is a real, selectable option

  `prompt` renders as `<option value="">` in the native select AND as the first
  entry of the listbox — matching `<select>` semantics, where picking the empty
  option clears the field. Before this it was only placeholder text on the
  trigger, so a filter could be set but never unset.
  """
  attr :id, :string, required: true
  attr :name, :any
  attr :value, :any, default: nil
  attr :options, :list, default: [], doc: "list of {label, value} tuples or option maps"
  attr :field, Phoenix.HTML.FormField, default: nil
  attr :label, :string, default: nil
  attr :description, :string, default: nil
  attr :prompt, :string, default: nil, doc: "empty-value option; selectable, clears the field"
  attr :errors, :list, default: []
  attr :disabled, :boolean, default: false
  attr :required, :boolean, default: false
  attr :side, :string, values: ~w(top bottom left right), default: "bottom"
  attr :align, :string, values: ~w(start center end), default: "start"
  attr :class, :any, default: nil

  attr :rest, :global,
    doc: "`phx-*` go to the native <select> (see moduledoc); everything else to the wrapper"

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
    assigns = assigns |> prepare_choice() |> split_phx_rest()

    ~H"""
    <div data-exo="field" class={@class} {@wrapper_rest}>
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
          aria-labelledby={@trigger_labelledby}
          style={"anchor-name: --select-#{@id}"}
          disabled={@disabled}
        >
          <span id={@value_id} data-exo="select-value" data-placeholder={!@selected_opt && ""}>
            <%= if @selected_opt do %>
              <.choice_option_label option={@selected_opt} />
            <% else %>
              {@prompt}
            <% end %>
          </span>
          <span data-exo="select-icon" aria-hidden="true">
            <.icon name="chevron-down" class="size-4" />
          </span>
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
            <div
              :if={@prompt}
              data-exo="select-option"
              role="option"
              data-value=""
              data-selected={blank_choice?(@value) && ""}
              aria-selected={to_string(blank_choice?(@value))}
              aria-disabled="false"
              tabindex="-1"
            >
              <span data-exo="select-check"><.icon name="check" class="size-4" /></span>
              {@prompt}
            </div>
            <.choice_option_groups kind="select" grouped={@grouped} value={@value} />
          </div>
        </div>
      </div>
      <.choice_native_select
        id={"#{@id}-native"}
        name={@name}
        value={@value}
        grouped={@grouped}
        prompt={@prompt}
        disabled={@disabled}
        required={@required}
        rest={@phx_rest}
      />
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  @doc "Renders a searchable combobox with client or server-side filtering."
  attr :id, :string, required: true
  attr :name, :any
  attr :value, :any, default: nil
  attr :options, :list, default: [], doc: "list of {label, value} tuples or option maps"
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
      <.choice_hidden_input name={@name} value={@value} disabled={@disabled} />
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
            aria-labelledby={@trigger_labelledby}
            style={"anchor-name: --combobox-#{@id}"}
            disabled={@disabled}
          >
            <span id={@value_id} data-exo="combobox-value" data-placeholder={!@selected_opt && ""}>
              <%= if @selected_opt do %>
                <.choice_option_label option={@selected_opt} />
              <% else %>
                {@prompt}
              <% end %>
            </span>
            <span data-exo="combobox-icon" aria-hidden="true">
              <.icon name="chevrons-up-down" class="size-4" />
            </span>
          </button>
          <button
            :if={@clearable && @value}
            type="button"
            data-exo="combobox-clear"
            aria-label="Clear"
            disabled={@disabled}
          >
            <.icon name="x" class="size-3" />
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
      <.choice_hidden_input name={@name} value={@value} disabled={@disabled} />
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
      <.choice_option_label option={opt} />
    </div>
    """
  end

  attr :option, :any, required: true

  defp choice_option_label(assigns) do
    ~H"""
    <%= if slot_option?(@option) do %>
      {render_slot(@option)}
    <% else %>
      {@option[:label]}
    <% end %>
    """
  end

  # The form-bearing element behind `select/1` — see that function's @doc for
  # why this is a real `<select>` and not a hidden input.
  #
  # `tabindex="-1"` + `aria-hidden` keep it out of the tab order and off the
  # accessibility tree: the popover trigger is the exposed control, and exposing
  # both would announce the field twice. Hidden form controls are still
  # submitted (only `disabled` excludes them), so the value always travels.
  attr :id, :string, required: true
  attr :name, :any, default: nil
  attr :value, :any, default: nil
  attr :grouped, :list, required: true
  attr :prompt, :string, default: nil
  attr :disabled, :boolean, default: false
  attr :required, :boolean, default: false
  attr :rest, :map, default: %{}

  defp choice_native_select(assigns) do
    ~H"""
    <select
      :if={@name}
      id={@id}
      name={@name}
      data-exo="select-native"
      disabled={@disabled}
      required={@required}
      tabindex="-1"
      aria-hidden="true"
      {@rest}
    >
      <option :if={@prompt} value="" selected={blank_choice?(@value)}>{@prompt}</option>
      <%= for {group_name, opts} <- @grouped do %>
        <%= if group_name do %>
          <optgroup label={group_name}>
            <.choice_native_options options={opts} value={@value} />
          </optgroup>
        <% else %>
          <.choice_native_options options={opts} value={@value} />
        <% end %>
      <% end %>
    </select>
    """
  end

  attr :options, :list, required: true
  attr :value, :any, default: nil

  defp choice_native_options(assigns) do
    ~H"""
    <option
      :for={opt <- @options}
      value={opt[:value]}
      selected={option_selected?(opt[:value], @value)}
      disabled={opt[:disabled] == true}
    >
      {native_option_label(opt)}
    </option>
    """
  end

  # `<option>` may only contain text, so a slot-based option falls back to its
  # `value`. Slot options are a presentation feature (icons, descriptions);
  # what matters here is that the value round-trips.
  defp native_option_label(opt), do: opt[:label] || opt[:value]

  defp blank_choice?(value), do: value in [nil, ""]

  # `phx-*` must land on the element that fires the event — see `select/1`
  # @doc. Everything else (`data-*`, `aria-*`, `id`…) keeps going to the field
  # wrapper, where callers have always put it.
  defp split_phx_rest(assigns) do
    {phx, wrapper} =
      assigns.rest
      |> Enum.split_with(fn {key, _} -> String.starts_with?(to_string(key), "phx-") end)

    assign(assigns, phx_rest: Map.new(phx), wrapper_rest: Map.new(wrapper))
  end

  attr :name, :any, default: nil
  attr :value, :any, default: nil
  attr :disabled, :boolean, default: false

  defp choice_hidden_input(assigns) do
    ~H"""
    <input
      :if={@name}
      type="hidden"
      name={@name}
      value={hidden_choice_value(@value)}
      disabled={@disabled}
    />
    """
  end

  defp select_disabled?(rest), do: rest[:disabled] in [true, "true", "disabled", ""]

  defp combobox_status(status, _loading) when is_binary(status), do: status
  defp combobox_status(_status, true), do: "Loading results"
  defp combobox_status(_status, _loading), do: ""

  defp prepare_choice(assigns) do
    assigns = prepare_basic_field(assigns)
    options = normalized_choice_options(assigns.option, assigns[:options])

    assign(assigns,
      grouped: group_options(options),
      label_id: choice_label_id(assigns),
      value_id: choice_value_id(assigns),
      trigger_labelledby: choice_trigger_labelledby(assigns),
      selected_opt: selected_option(options, assigns[:value])
    )
  end

  defp normalized_choice_options(slot_options, options) do
    slot_options ++ normalized_choice_options(options || [])
  end

  defp normalized_choice_options(options) do
    Enum.flat_map(options, fn
      {group, grouped_options} when is_list(grouped_options) ->
        Enum.map(grouped_options, &normalize_choice_option(&1, group))

      option ->
        [normalize_choice_option(option, nil)]
    end)
  end

  defp normalize_choice_option({label, value}, group) do
    %{label: label, value: value, group: group}
  end

  defp normalize_choice_option(%{} = option, group) do
    %{
      label:
        Map.get(option, :label) || Map.get(option, "label") || Map.get(option, :value) ||
          Map.get(option, "value"),
      value: Map.get(option, :value) || Map.get(option, "value"),
      icon: Map.get(option, :icon) || Map.get(option, "icon"),
      description: Map.get(option, :description) || Map.get(option, "description"),
      disabled:
        normalize_option_disabled(Map.get(option, :disabled) || Map.get(option, "disabled")),
      group: Map.get(option, :group) || Map.get(option, "group") || group
    }
  end

  defp normalize_choice_option(value, group) do
    %{label: value, value: value, group: group}
  end

  defp slot_option?(option), do: Map.has_key?(option, :inner_block)

  defp normalize_option_disabled(value), do: value in [true, "true"]

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

  defp choice_value_id(assigns), do: "#{assigns.id}-value"

  defp choice_trigger_labelledby(%{label_id: label_id} = assigns) when is_binary(label_id) do
    "#{label_id} #{choice_value_id(assigns)}"
  end

  defp choice_trigger_labelledby(_assigns), do: nil

  defp hidden_choice_value(value), do: value || ""

  defp prepare_basic_field(assigns) do
    id = assigns[:id] || generated_input_id(assigns[:name]) || generated_input_id(assigns[:label])
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

  defp input_adorned?(assigns) do
    Enum.any?(
      [assigns[:prefix], assigns[:suffix], assigns[:leading_icon], assigns[:trailing_icon]],
      &present?/1
    )
  end

  defp radio_item_id(nil, _value), do: nil
  defp radio_item_id(group_id, value), do: "#{group_id}-#{generated_input_id(value) || "option"}"

  defp radio_description_id(nil, _option), do: nil

  defp radio_description_id(group_id, option) do
    if present?(option[:description]) do
      "#{radio_item_id(group_id, option[:value])}-description"
    end
  end

  defp radio_option_disabled?(group_disabled, option) do
    group_disabled || option[:disabled] == true
  end

  defp generated_input_id(nil), do: nil

  defp generated_input_id(value) do
    value
    |> to_string()
    |> String.downcase()
    |> String.replace(~r/[^a-zA-Z0-9_-]+/, "-")
    |> String.trim("-")
    |> case do
      "" -> nil
      id -> id
    end
  end

  defp present?(value), do: value not in [nil, ""]

  @doc "Renders a radio button group from option data or slot-based items."
  attr :field, Phoenix.HTML.FormField, default: nil, doc: "a form field struct"
  attr :id, :string, default: nil
  attr :name, :string
  attr :value, :any, default: nil
  attr :options, :list, default: [], doc: "list of {label, value} tuples or option maps"
  attr :label, :string, default: nil
  attr :description, :string, default: nil
  attr :errors, :list, default: []
  attr :disabled, :boolean, default: false
  attr :class, :any, default: nil
  attr :rest, :global

  slot :item do
    attr :value, :any, required: true
    attr :disabled, :boolean
    attr :description, :string
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
    assigns =
      assigns
      |> prepare_basic_field()
      |> assign(:radio_options, normalized_choice_options(assigns.item, assigns[:options]))

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
      <label
        :for={option <- @radio_options}
        data-exo="radio-item"
        for={radio_item_id(@id, option[:value])}
        data-value={option[:value]}
        data-disabled={radio_option_disabled?(@disabled, option) && ""}
        aria-disabled={to_string(radio_option_disabled?(@disabled, option))}
      >
        <input
          id={radio_item_id(@id, option[:value])}
          type="radio"
          data-exo="radio"
          name={@name}
          value={option[:value]}
          checked={option_selected?(option[:value], @value)}
          disabled={radio_option_disabled?(@disabled, option)}
          aria-describedby={radio_description_id(@id, option)}
        />
        <span data-exo="radio-indicator" />
        <span data-exo="radio-label"><.choice_option_label option={option} /></span>
        <span
          :if={option[:description]}
          id={radio_description_id(@id, option)}
          data-exo="radio-description"
        >
          {option[:description]}
        </span>
      </label>
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
  attr :show_value, :boolean, default: false
  attr :value_suffix, :string, default: nil
  attr :aria_value_text, :string, default: nil
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
    default_value = div(assigns.min + assigns.max, 2)

    assigns =
      assigns
      |> assign(:value, if(is_nil(assigns[:value]), do: default_value, else: assigns[:value]))
      |> assign(
        :value_text,
        slider_value_text(assigns[:value] || default_value, assigns[:value_suffix])
      )
      |> assign(:computed_aria_value_text, slider_aria_value_text(assigns))
      |> prepare_basic_field()

    ~H"""
    <div
      id={if @show_value && @id, do: "#{@id}-slider-field"}
      data-exo="slider-field"
      class={@class}
      phx-hook={if @show_value && @id, do: "ExoSlider"}
    >
      <div :if={@label || @show_value} data-exo="slider-header">
        <label :if={@label} data-exo="label" for={@id}>{@label}</label>
        <output
          :if={@show_value}
          id={if @id, do: "#{@id}-value"}
          data-exo="slider-value"
          data-exo-slider="output"
          data-suffix={@value_suffix}
          data-aria-value-text={@aria_value_text}
          for={@id}
        >
          {@value_text}
        </output>
      </div>
      <input
        id={@id}
        type="range"
        data-exo="slider"
        data-exo-slider="input"
        data-invalid={@errors != [] && ""}
        aria-invalid={if @errors != [], do: "true"}
        aria-describedby={@describedby}
        aria-valuetext={@computed_aria_value_text}
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

  defp slider_value_text(value, suffix) when suffix in [nil, ""], do: to_string(value)
  defp slider_value_text(value, suffix), do: "#{value}#{suffix}"

  defp slider_aria_value_text(assigns) do
    cond do
      present?(assigns[:aria_value_text]) ->
        assigns[:aria_value_text]

      present?(assigns[:value_suffix]) ->
        slider_value_text(assigns[:value] || 50, assigns[:value_suffix])

      true ->
        nil
    end
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
  attr :target, :any, default: nil, doc: "optional LiveView target for date select/month events"
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
        month_id: date_picker_month_id(assigns[:id]),
        month_label: Calendar.strftime(current, "%B %Y"),
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
            phx-target={@target}
            disabled={!@can_prev || @disabled}
            data-disabled={(!@can_prev || @disabled) && ""}
          >
            <.icon name="chevron-left" class="size-4" />
          </button>
          <span id={@month_id} data-exo="date-picker-month" aria-live="polite">
            {@month_label}
          </span>
          <button
            type="button"
            data-exo="date-picker-nav"
            aria-label="Next month"
            phx-click={@on_next_month}
            phx-target={@target}
            disabled={!@can_next || @disabled}
            data-disabled={(!@can_next || @disabled) && ""}
          >
            <.icon name="chevron-right" class="size-4" />
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
          aria-labelledby={@month_id}
          aria-label={unless @month_id, do: @month_label}
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
                phx-target={@target}
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

  defp date_picker_month_id(nil), do: nil
  defp date_picker_month_id(id), do: "#{id}-month"

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
          <.icon name="star" />
        </label>
        <span
          :if={@readonly}
          data-exo="rating-star"
          data-active={star <= @value || nil}
          aria-hidden="true"
        >
          <.icon name="star" />
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
  attr :show_selected, :boolean, default: false
  attr :empty_label, :string, default: "No file selected"
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
    assigns =
      assigns
      |> prepare_basic_field()
      |> prepare_file_input()

    ~H"""
    <div
      id={if @show_selected && @id, do: "#{@id}-file-field"}
      data-exo="field"
      phx-hook={if @show_selected && @id, do: "ExoFileInput"}
    >
      <label :if={@label} data-exo="label" for={@id}>{@label}</label>
      <input
        type="file"
        id={@id}
        name={@name}
        accept={@accept}
        multiple={@multiple}
        data-exo="file-input"
        data-exo-file-input="input"
        data-invalid={@errors != [] && ""}
        aria-invalid={if @errors != [], do: "true"}
        aria-describedby={@describedby}
        class={@class}
        {@rest}
      />
      <output
        :if={@show_selected}
        id={@selected_id}
        data-exo="file-input-selected"
        data-exo-file-input="selected"
        data-empty-label={@empty_label}
        for={@id}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {@empty_label}
      </output>
      <p :if={@description} id={@description_id} data-exo="field-description">{@description}</p>
      <.field_errors id={@error_id} errors={@errors} />
    </div>
    """
  end

  defp prepare_file_input(assigns) do
    selected_id = if assigns.show_selected && present?(assigns.id), do: "#{assigns.id}-selected"

    assign(assigns,
      selected_id: selected_id,
      describedby: describedby([assigns.description_id, selected_id, assigns.error_id])
    )
  end

  @doc """
  Translates an error message.

  Delegates to `ExoUI.Utils.translate_error/1`. Configure a custom
  translate function via:

      config :exo_ui, :translate_function, {MyAppWeb.CoreComponents, :translate_error}
  """
  defdelegate translate_error(msg_opts), to: ExoUI.Utils
end
