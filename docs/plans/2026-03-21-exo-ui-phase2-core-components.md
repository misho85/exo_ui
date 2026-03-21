# ExoUI Phase 2: Core Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the first batch of headless components with CSS theme and Storybook stories.

**Architecture:** Each component: Elixir function in `ExoUI.Components` emitting `data-exo` attributes → CSS file using `:where()` selectors → Storybook story → ExUnit test.

**Spec:** `docs/superpowers/specs/2026-03-21-exo-ui-design.md`

**Working directory:** `/Users/miso/Developer/exo_ui`

---

## Pattern for Every Component

1. Add component function to `lib/exo_ui/components.ex`
2. Create `assets/css/src/components/<name>.css` with `:where()` selectors
3. Add `@import` to `assets/css/exo.css`
4. Run `npm run build` to rebuild `priv/static/exo.css`
5. Create `test/exo_ui/components/<name>_test.exs` — render test verifying data attributes
6. Create `storybook/stories/components/<name>.story.exs`
7. Commit

---

### Task 1: Button + Separator (simple components, establish pattern)

**Files:**
- Modify: `lib/exo_ui/components.ex`
- Create: `assets/css/src/components/button.css`
- Create: `assets/css/src/components/separator.css`
- Modify: `assets/css/exo.css`
- Create: `test/exo_ui/components/button_test.exs`
- Create: `test/exo_ui/components/separator_test.exs`
- Create: `storybook/stories/components/_components.index.exs`
- Create: `storybook/stories/components/button.story.exs`
- Create: `storybook/stories/components/separator.story.exs`

#### Button Component

```elixir
attr :variant, :string, values: ~w(primary secondary ghost danger outline), default: nil
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
```

#### Button CSS (`assets/css/src/components/button.css`)

```css
:where([data-exo="btn"]) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--exo-space-2);
  border-radius: var(--exo-radius);
  font-family: var(--exo-font);
  font-size: var(--exo-text-sm);
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
  transition: background var(--exo-duration) var(--exo-easing),
              color var(--exo-duration) var(--exo-easing),
              border-color var(--exo-duration) var(--exo-easing);
}

:where([data-exo="btn"][data-disabled]) {
  opacity: 0.5;
  pointer-events: none;
}

/* Sizes */
:where([data-exo="btn"][data-size="xs"]) { padding: var(--exo-space-1) var(--exo-space-2); font-size: var(--exo-text-xs); }
:where([data-exo="btn"][data-size="sm"]) { padding: var(--exo-space-1) var(--exo-space-3); font-size: var(--exo-text-sm); }
:where([data-exo="btn"][data-size="md"]) { padding: var(--exo-space-2) var(--exo-space-4); font-size: var(--exo-text-sm); }
:where([data-exo="btn"][data-size="lg"]) { padding: var(--exo-space-3) var(--exo-space-6); font-size: var(--exo-text-base); }

/* Variants */
:where([data-exo="btn"][data-variant="primary"]) {
  background: var(--exo-primary);
  color: var(--exo-primary-foreground);
}
:where([data-exo="btn"][data-variant="primary"]):hover {
  filter: brightness(0.9);
}

:where([data-exo="btn"][data-variant="secondary"]) {
  background: var(--exo-secondary);
  color: var(--exo-secondary-foreground);
}
:where([data-exo="btn"][data-variant="secondary"]):hover {
  filter: brightness(0.95);
}

:where([data-exo="btn"][data-variant="danger"]) {
  background: var(--exo-danger);
  color: var(--exo-danger-foreground);
}
:where([data-exo="btn"][data-variant="danger"]):hover {
  filter: brightness(0.9);
}

:where([data-exo="btn"][data-variant="outline"]) {
  background: transparent;
  color: var(--exo-foreground);
  border-color: var(--exo-border);
}
:where([data-exo="btn"][data-variant="outline"]):hover {
  background: var(--exo-muted);
}

:where([data-exo="btn"][data-variant="ghost"]) {
  background: transparent;
  color: var(--exo-foreground);
}
:where([data-exo="btn"][data-variant="ghost"]):hover {
  background: var(--exo-muted);
}

/* Default (no variant) */
:where([data-exo="btn"]:not([data-variant])) {
  background: var(--exo-primary);
  color: var(--exo-primary-foreground);
}
:where([data-exo="btn"]:not([data-variant])):hover {
  filter: brightness(0.9);
}

/* Focus */
:where([data-exo="btn"]):focus-visible {
  outline: 2px solid var(--exo-ring);
  outline-offset: 2px;
}
```

#### Separator Component

```elixir
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
```

#### Separator CSS (`assets/css/src/components/separator.css`)

```css
:where([data-exo="separator"]) {
  background: var(--exo-border);
  flex-shrink: 0;
}

:where([data-exo="separator"][data-orientation="horizontal"]) {
  height: 1px;
  width: 100%;
}

:where([data-exo="separator"][data-orientation="vertical"]) {
  width: 1px;
  height: 100%;
}
```

#### Button Test

```elixir
defmodule ExoUI.Components.ButtonTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import ExoUI.Components

  test "renders button with data-exo attribute" do
    html = render_component(&button/1, %{inner_block: [%{__slot__: :inner_block, inner_block: fn _, _ -> "Click" end}]})
    assert html =~ ~s(data-exo="btn")
  end

  test "renders button with variant" do
    assigns = %{variant: "primary", inner_block: [%{__slot__: :inner_block, inner_block: fn _, _ -> "Click" end}]}
    html = render_component(&button/1, assigns)
    assert html =~ ~s(data-variant="primary")
  end

  test "renders button with size" do
    assigns = %{size: "sm", inner_block: [%{__slot__: :inner_block, inner_block: fn _, _ -> "Click" end}]}
    html = render_component(&button/1, assigns)
    assert html =~ ~s(data-size="sm")
  end
end
```

- [ ] Step 1: Add button and separator components to `lib/exo_ui/components.ex`
- [ ] Step 2: Create CSS files and update barrel import
- [ ] Step 3: Run `npm run build`
- [ ] Step 4: Write tests, run `mise exec -- mix test`
- [ ] Step 5: Create storybook component index and stories
- [ ] Step 6: Commit: `feat: add button and separator components`

---

### Task 2: Badge + Form (simple, no JS)

**Files:**
- Modify: `lib/exo_ui/components.ex`
- Create: `assets/css/src/components/badge.css`
- Create: `assets/css/src/components/form.css`
- Modify: `assets/css/exo.css`
- Create: `test/exo_ui/components/badge_test.exs`
- Create: `storybook/stories/components/badge.story.exs`

#### Badge Component

```elixir
attr :variant, :string,
  values: ~w(primary secondary danger warning success info),
  default: "primary"
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
```

#### Badge CSS

```css
:where([data-exo="badge"]) {
  display: inline-flex;
  align-items: center;
  border-radius: calc(var(--exo-radius) * 3);
  padding: var(--exo-space-1) var(--exo-space-3);
  font-family: var(--exo-font);
  font-size: var(--exo-text-xs);
  font-weight: 600;
  line-height: 1;
}

:where([data-exo="badge"][data-variant="primary"]) {
  background: var(--exo-primary);
  color: var(--exo-primary-foreground);
}
:where([data-exo="badge"][data-variant="secondary"]) {
  background: var(--exo-secondary);
  color: var(--exo-secondary-foreground);
}
:where([data-exo="badge"][data-variant="danger"]) {
  background: var(--exo-danger);
  color: var(--exo-danger-foreground);
}
:where([data-exo="badge"][data-variant="warning"]) {
  background: var(--exo-warning);
  color: var(--exo-warning-foreground);
}
:where([data-exo="badge"][data-variant="success"]) {
  background: var(--exo-success);
  color: var(--exo-success-foreground);
}
:where([data-exo="badge"][data-variant="info"]) {
  background: var(--exo-info);
  color: var(--exo-info-foreground);
}
```

#### Form Component

```elixir
attr :for, :any, required: true, doc: "the datastructure for the form"
attr :as, :any, default: nil, doc: "the server side parameter to collect all input under"
attr :class, :string, default: nil
attr :rest, :global, include: ~w(autocomplete name rel action enctype method novalidate target multipart)
slot :inner_block, required: true

def form(assigns) do
  ~H"""
  <.form for={@for} as={@as} data-exo="form" class={@class} {@rest}>
    {render_slot(@inner_block)}
  </.form>
  """
end
```

#### Form CSS

```css
:where([data-exo="form"]) {
  display: flex;
  flex-direction: column;
  gap: var(--exo-space-4);
}
```

- [ ] Step 1: Add badge and form components
- [ ] Step 2: Create CSS files and update barrel import
- [ ] Step 3: Run `npm run build`
- [ ] Step 4: Write tests, run `mise exec -- mix test`
- [ ] Step 5: Create storybook stories
- [ ] Step 6: Commit: `feat: add badge and form components`

---

### Task 3: Input + Toggle (form inputs)

**Files:**
- Modify: `lib/exo_ui/components.ex`
- Create: `assets/css/src/components/input.css`
- Create: `assets/css/src/components/toggle.css`
- Modify: `assets/css/exo.css`
- Create: `test/exo_ui/components/input_test.exs`
- Create: `storybook/stories/components/input.story.exs`
- Create: `storybook/stories/components/toggle.story.exs`

#### Input Component

Multi-clause dispatch matching KrafterUI pattern. Types: text, email, password, number, tel, url, date, datetime-local, time, month, week, search, color, hidden, textarea, checkbox, select.

The `input` for type="select" delegates to `select/1` (Task 4).
The `input` for type="checkbox" renders a checkbox.
Default renders a text-like input.

All inputs have: `field`, `type`, `name`, `value`, `label`, `errors`, `class`, `rest` attrs.

```elixir
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
```

#### Toggle Component

```elixir
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
```

#### Input CSS

```css
:where([data-exo="field"]) {
  display: flex;
  flex-direction: column;
  gap: var(--exo-space-1);
}

:where([data-exo="label"]) {
  font-family: var(--exo-font);
  font-size: var(--exo-text-sm);
  font-weight: 500;
  color: var(--exo-foreground);
}

:where([data-exo="input"]) {
  font-family: var(--exo-font);
  font-size: var(--exo-text-sm);
  padding: var(--exo-space-2) var(--exo-space-3);
  border: 1px solid var(--exo-input);
  border-radius: var(--exo-radius);
  background: var(--exo-background);
  color: var(--exo-foreground);
  outline: none;
  transition: border-color var(--exo-duration) var(--exo-easing),
              box-shadow var(--exo-duration) var(--exo-easing);
}

:where([data-exo="input"]):focus {
  border-color: var(--exo-ring);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--exo-ring) 25%, transparent);
}

:where([data-exo="input"][data-invalid]) {
  border-color: var(--exo-danger);
}

:where([data-exo="input"][data-invalid]):focus {
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--exo-danger) 25%, transparent);
}

:where(textarea[data-exo="input"]) {
  min-height: 5rem;
  resize: vertical;
}

:where([data-exo="field-error"]) {
  font-family: var(--exo-font);
  font-size: var(--exo-text-xs);
  color: var(--exo-danger);
}
```

#### Toggle CSS

```css
:where([data-exo="toggle"]) {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

:where([data-exo="toggle"] input) {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

:where([data-exo="toggle-track"]) {
  position: relative;
  width: 2.5rem;
  height: 1.5rem;
  background: var(--exo-muted);
  border-radius: var(--exo-radius-full, 9999px);
  transition: background var(--exo-duration) var(--exo-easing);
}

:where([data-exo="toggle"][data-checked] [data-exo="toggle-track"]) {
  background: var(--exo-primary);
}

:where([data-exo="toggle-thumb"]) {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(1.5rem - 4px);
  height: calc(1.5rem - 4px);
  background: white;
  border-radius: var(--exo-radius-full, 9999px);
  transition: transform var(--exo-duration) var(--exo-easing);
}

:where([data-exo="toggle"][data-checked] [data-exo="toggle-thumb"]) {
  transform: translateX(1rem);
}
```

- [ ] Step 1: Add input, toggle, and field_errors components
- [ ] Step 2: Create CSS files and update barrel import
- [ ] Step 3: Run `npm run build`
- [ ] Step 4: Write tests, run `mise exec -- mix test`
- [ ] Step 5: Create storybook stories
- [ ] Step 6: Commit: `feat: add input and toggle components`

---

### Task 4: Modal + Confirm Modal (interactive)

**Files:**
- Modify: `lib/exo_ui/components.ex`
- Create: `assets/css/src/components/modal.css`
- Modify: `assets/css/exo.css`
- Create: `test/exo_ui/components/modal_test.exs`
- Create: `storybook/stories/components/modal.story.exs`

#### Modal Component

```elixir
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
      aria-labelledby={"#{@id}-title"}
      tabindex="-1"
    >
      <div :if={@title != []} data-exo="modal-header">
        <h2 id={"#{@id}-title"} data-exo="modal-title">
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

defp show_modal(id) do
  %Phoenix.LiveView.JS{}
  |> Phoenix.LiveView.JS.show(to: "##{id}")
  |> Phoenix.LiveView.JS.add_class("overflow-hidden", to: "body")
  |> Phoenix.LiveView.JS.focus_first(to: "##{id} [data-exo=\"modal-content\"]")
end

defp hide_modal(js \\ %Phoenix.LiveView.JS{}, id) do
  js
  |> Phoenix.LiveView.JS.hide(to: "##{id}")
  |> Phoenix.LiveView.JS.remove_class("overflow-hidden", to: "body")
  |> Phoenix.LiveView.JS.pop_focus()
end
```

#### Confirm Modal Component

```elixir
attr :id, :string, default: "confirm-modal"
attr :show, :boolean, default: false
attr :title, :string, default: "Confirm"
attr :message, :string, required: true
attr :confirm_text, :string, default: "Confirm"
attr :cancel_text, :string, default: "Cancel"
attr :variant, :string, values: ~w(primary warning danger success), default: "danger"
attr :on_confirm, Phoenix.LiveView.JS, default: %Phoenix.LiveView.JS{}
attr :on_cancel, Phoenix.LiveView.JS, default: %Phoenix.LiveView.JS{}

def confirm_modal(assigns) do
  ~H"""
  <.modal id={@id} show={@show} on_cancel={@on_cancel}>
    <:title>{@title}</:title>
    <p>{@message}</p>
    <:actions>
      <.button variant="ghost" phx-click={@on_cancel |> hide_modal(@id)}>{@cancel_text}</.button>
      <.button variant={@variant} phx-click={@on_confirm}>{@confirm_text}</.button>
    </:actions>
  </.modal>
  """
end
```

#### Modal CSS

```css
:where([data-exo="modal"]) {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: none;
}

:where([data-exo="modal"][data-state="open"]) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:where([data-exo="modal-backdrop"]) {
  position: fixed;
  inset: 0;
  background: oklch(0% 0 0 / 0.4);
}

:where([data-exo="modal-content"]) {
  position: relative;
  background: var(--exo-card);
  color: var(--exo-card-foreground);
  border-radius: var(--exo-radius);
  box-shadow: var(--exo-shadow-lg);
  padding: var(--exo-space-6);
  max-width: 32rem;
  width: calc(100% - var(--exo-space-8));
  max-height: 85vh;
  overflow-y: auto;
}

:where([data-exo="modal-header"]) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--exo-space-4);
}

:where([data-exo="modal-title"]) {
  font-family: var(--exo-font);
  font-size: var(--exo-text-lg);
  font-weight: 600;
  margin: 0;
}

:where([data-exo="modal-close"]) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: var(--exo-muted-foreground);
  border-radius: var(--exo-radius);
  cursor: pointer;
  font-size: var(--exo-text-base);
}
:where([data-exo="modal-close"]):hover {
  background: var(--exo-muted);
  color: var(--exo-foreground);
}

:where([data-exo="modal-body"]) {
  font-family: var(--exo-font);
  font-size: var(--exo-text-sm);
  color: var(--exo-muted-foreground);
}

:where([data-exo="modal-actions"]) {
  display: flex;
  justify-content: flex-end;
  gap: var(--exo-space-2);
  margin-top: var(--exo-space-6);
}
```

- [ ] Step 1: Add modal and confirm_modal components
- [ ] Step 2: Create CSS file and update barrel import
- [ ] Step 3: Run `npm run build`
- [ ] Step 4: Write tests, run `mise exec -- mix test`
- [ ] Step 5: Create storybook stories
- [ ] Step 6: Commit: `feat: add modal and confirm_modal components`

---

## Summary

| Task | Components | Complexity |
|------|-----------|-----------|
| 1 | button, separator | Simple — establish pattern |
| 2 | badge, form | Simple — no JS |
| 3 | input, toggle | Medium — multi-clause, form field integration |
| 4 | modal, confirm_modal | Medium — JS interactions, accessibility |

After Phase 2: 9 core components implemented with CSS themes, tests, and Storybook stories.

**Next:** Phase 3 — Layout + navigation components
