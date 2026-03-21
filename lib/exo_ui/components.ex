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
