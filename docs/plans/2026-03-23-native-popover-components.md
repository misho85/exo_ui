# Native Popover Components Implementation Plan

> **Status (April 23, 2026):** Historical implementation plan. Use
> [README](../../README.md), the live tests, and
> [2026-04-22-exo-ui-improvement-roadmap.md](./2026-04-22-exo-ui-improvement-roadmap.md)
> as the current source of truth. Sections in this plan that mention
> `multiple` select/combobox behavior are superseded by the current
> single-select contract.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild all floating UI components (popover, dropdown, select, combobox, tooltip) on native HTML Popover API + CSS Anchor Positioning with minimal JS hooks.

**Architecture:** Popover is the base primitive — a standalone component emitting `<button popovertarget>` + `<div popover>`. Dropdown, Select, and Combobox compose on it. Tooltip uses CSS anchor positioning without Popover API (hover/focus trigger). All positioning via CSS `position-area` with `flip-block` fallback. JS hooks only for keyboard nav, form integration, and WCAG compliance (~103 lines total).

**Tech Stack:** Phoenix LiveView 1.1+, native HTML Popover API, CSS Anchor Positioning, LightningCSS

**Spec:** `docs/specs/2026-03-23-native-popover-components-design.md`

---

## Key Design Decisions (from review)

These deviations from the original spec API are required because of Phoenix LiveView slot limitations:

1. **Dropdown uses single `:entry` slot** — Phoenix does not track insertion order across different slot names. The spec's separate `:item`, `:separator`, `:label` slots cannot be interleaved in document order. Solution: a single `:entry` polymorphic slot with a `type` attr. Phoenix preserves order within one slot name.

2. **Select groups via `group` attr on options** — HEEx does not support nested slots (`<:option>` inside `<:group>`). Solution: options carry a `group` string attr. The component groups options with the same `group` value and renders group labels automatically.

3. **Popover has `haspopup` attr** — Dropdown needs `aria-haspopup="menu"`, select needs `"listbox"`, generic popover uses `"true"`. The popover component accepts a `haspopup` attr to let consumers override.

---

## File Map

### New files

| File | Responsibility |
| ---- | -------------- |
| `assets/css/src/components/popover.css` | Base positioning, animations, `position-area` mapping, anchor fallback |
| `assets/js/hooks/popover.js` | `ExoPopover` — `aria-expanded` toggle |
| `assets/js/hooks/dropdown_menu.js` | `ExoDropdownMenu` — arrow key navigation |
| `assets/js/hooks/select.js` | `ExoSelect` — arrow keys, type-ahead, hidden input, form integration |
| `assets/js/hooks/combobox.js` | `ExoCombobox` — client filter, search focus, debounced server push, input-trigger |
| `assets/js/hooks/tooltip.js` | `ExoTooltip` — escape dismissal |
| `test/exo_ui/components/popover_test.exs` | Popover tests |
| `test/exo_ui/components/dropdown_menu_test.exs` | Dropdown menu tests |
| `test/exo_ui/components/select_test.exs` | Select tests |
| `test/exo_ui/components/combobox_test.exs` | Combobox tests |
| `storybook/stories/components/popover.story.exs` | Popover storybook |
| `storybook/stories/components/select.story.exs` | Select storybook |
| `storybook/stories/components/combobox.story.exs` | Combobox storybook |

### Modified files

| File | Changes |
| ---- | ------- |
| `lib/exo_ui/components.ex` | Add `popover/1`, `dropdown_menu/1`, `select/1`, `combobox/1`. Rewrite `tooltip/1`. Deprecate old `dropdown/1`. |
| `assets/css/src/components/dropdown.css` | Rewrite — menu styling, separators, labels, groups, item icons/shortcuts |
| `assets/css/src/components/select.css` | Rewrite — trigger, option list, checkmarks, groups, width matching |
| `assets/css/src/components/tooltip.css` | Rewrite — anchor positioning, opacity transitions, arrow |
| `assets/css/src/components/combobox.css` | New file — search input, options, pills/tags, loading, create option |
| `assets/css/src/tokens.css` | Add `--exo-tooltip-bg`, `--exo-tooltip-fg` |
| `assets/css/exo.css` | Add `popover.css` and `combobox.css` imports |
| `assets/js/index.js` | Import and export all 5 new hooks |
| `storybook/stories/components/dropdown.story.exs` | Rewrite for `dropdown_menu/1` |
| `storybook/stories/components/tooltip.story.exs` | Rewrite for new tooltip |

---

## Task 1: Popover base — CSS

**Files:**
- Create: `assets/css/src/components/popover.css`
- Modify: `assets/css/exo.css`

- [ ] **Step 1: Create popover.css**

```css
/* --- Trigger --- */

:where([data-exo="popover-trigger"]) {
  cursor: pointer;
}

/* --- Content: reset popover defaults --- */

:where([data-exo="popover-content"]) {
  margin: 0;
  inset: auto;
  border: 1px solid var(--exo-border);
  border-radius: var(--exo-radius);
  background: var(--exo-card);
  color: var(--exo-card-foreground);
  box-shadow: var(--exo-shadow-md);
  padding: var(--exo-space-2);
  font-family: var(--exo-font);
  font-size: var(--exo-text-sm);
  position-try-fallbacks: flip-block;
}

/* --- Position-area mapping --- */

:where([data-exo="popover-content"][data-side="bottom"][data-align="start"]) { position-area: block-end span-inline-end; }
:where([data-exo="popover-content"][data-side="bottom"][data-align="center"]) { position-area: block-end; }
:where([data-exo="popover-content"][data-side="bottom"][data-align="end"]) { position-area: block-end span-inline-start; }
:where([data-exo="popover-content"][data-side="top"][data-align="start"]) { position-area: block-start span-inline-end; }
:where([data-exo="popover-content"][data-side="top"][data-align="center"]) { position-area: block-start; }
:where([data-exo="popover-content"][data-side="top"][data-align="end"]) { position-area: block-start span-inline-start; }
:where([data-exo="popover-content"][data-side="left"]) { position-area: inline-start; }
:where([data-exo="popover-content"][data-side="right"]) { position-area: inline-end; }

/* --- Animations --- */

:where([data-exo="popover-content"]):popover-open {
  opacity: 1;
  transform: scale(1);
}

:where([data-exo="popover-content"]) {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity var(--exo-duration) var(--exo-easing),
              transform var(--exo-duration) var(--exo-easing),
              overlay var(--exo-duration) allow-discrete,
              display var(--exo-duration) allow-discrete;
}

@starting-style {
  :where([data-exo="popover-content"]):popover-open {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* --- Trigger active state --- */

:where([data-exo="popover"]):has(:popover-open) :where([data-exo="popover-trigger"]) {
  /* consumers override */
}

/* --- Fallback: no anchor positioning --- */

@supports not (position-area: top) {
  :where([data-exo="popover"]) {
    position: relative;
  }
  :where([data-exo="popover-content"]) {
    position: absolute;
    left: 0;
    top: 100%;
    margin-top: var(--exo-space-1);
  }
  :where([data-exo="popover-content"][data-align="end"]) {
    left: auto;
    right: 0;
  }
  :where([data-exo="popover-content"][data-side="top"]) {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: var(--exo-space-1);
  }
}
```

Note: `position: relative` is only inside `@supports not` — with anchor positioning, the wrapper does not need to be a positioned ancestor.

- [ ] **Step 2: Add popover import to exo.css**

Insert `@import "./src/components/popover.css";` after line 12 (`dropdown.css`), since popover is the base for dropdown/select/combobox.

- [ ] **Step 3: Build CSS**

Run: `cd /Users/miso/Developer/exo_ui && npm run build`
Expected: success

- [ ] **Step 4: Commit**

```
git add assets/css/src/components/popover.css assets/css/exo.css
git commit -m "feat: add popover base CSS with anchor positioning and animations"
```

---

## Task 2: Popover base — Elixir component + hook

**Files:**
- Modify: `lib/exo_ui/components.ex`
- Create: `assets/js/hooks/popover.js`
- Modify: `assets/js/index.js`
- Create: `test/exo_ui/components/popover_test.exs`

- [ ] **Step 1: Write popover tests**

```elixir
defmodule ExoUI.Components.PopoverTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders popover with trigger and content" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.popover id="test-pop">
      <:trigger>Open</:trigger>
      Content here
    </.popover>
    """)
    assert html =~ ~s(data-exo="popover")
    assert html =~ ~s(popovertarget="test-pop")
    assert html =~ ~s(data-exo="popover-trigger")
    assert html =~ ~s(data-exo="popover-content")
    assert html =~ ~s(popover="auto")
    assert html =~ ~s(id="test-pop")
    assert html =~ "Open"
    assert html =~ "Content here"
  end

  test "renders with side and align" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.popover id="pos" side="top" align="end">
      <:trigger>Open</:trigger>
      Content
    </.popover>
    """)
    assert html =~ ~s(data-side="top")
    assert html =~ ~s(data-align="end")
  end

  test "renders with manual mode" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.popover id="man" mode="manual">
      <:trigger>Open</:trigger>
      Content
    </.popover>
    """)
    assert html =~ ~s(popover="manual")
  end

  test "renders without trigger for sub-menu pattern" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.popover id="sub">
      Sub content
    </.popover>
    """)
    refute html =~ ~s(data-exo="popover-trigger")
    assert html =~ ~s(id="sub")
  end

  test "generates unique inline anchor names from id" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.popover id="anc">
      <:trigger>Open</:trigger>
      Content
    </.popover>
    """)
    assert html =~ ~s(anchor-name: --popover-anc)
    assert html =~ ~s(position-anchor: --popover-anc)
  end

  test "sets type=button and aria-haspopup on trigger" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.popover id="aria">
      <:trigger>Open</:trigger>
      Content
    </.popover>
    """)
    assert html =~ ~s(type="button")
    assert html =~ ~s(aria-haspopup="true")
  end

  test "allows haspopup override" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.popover id="hp" haspopup="menu">
      <:trigger>Open</:trigger>
      Content
    </.popover>
    """)
    assert html =~ ~s(aria-haspopup="menu")
  end

  test "applies class to content div" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.popover id="cls" class="custom">
      <:trigger>Open</:trigger>
      Content
    </.popover>
    """)
    assert html =~ ~s(class="custom")
  end
end
```

- [ ] **Step 2: Run tests — expect fail**

Run: `cd /Users/miso/Developer/exo_ui && mix test test/exo_ui/components/popover_test.exs`

- [ ] **Step 3: Write popover component**

Add to `lib/exo_ui/components.ex` before the existing `dropdown/1`:

```elixir
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
  <div data-exo="popover">
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
```

- [ ] **Step 4: Run tests — expect pass**

Run: `cd /Users/miso/Developer/exo_ui && mix test test/exo_ui/components/popover_test.exs`

- [ ] **Step 5: Write ExoPopover hook**

Create `assets/js/hooks/popover.js`:

```javascript
const ExoPopover = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },
  _bind() {
    this._unbind()
    const trigger = this.el.querySelector('[data-exo="popover-trigger"]')
    const id = trigger?.getAttribute('popovertarget')
    this._popover = id ? document.getElementById(id) : null
    if (!this._popover) return
    this._onToggle = () => {
      const open = this._popover.matches(':popover-open')
      trigger.setAttribute('aria-expanded', String(open))
    }
    this._popover.addEventListener('toggle', this._onToggle)
  },
  _unbind() {
    if (this._popover && this._onToggle) {
      this._popover.removeEventListener('toggle', this._onToggle)
    }
    this._popover = null
    this._onToggle = null
  }
}

export { ExoPopover }
```

- [ ] **Step 6: Register hook in index.js**

Add `ExoPopover` import and export.

- [ ] **Step 7: Commit**

```
git add lib/exo_ui/components.ex assets/js/hooks/popover.js assets/js/index.js test/exo_ui/components/popover_test.exs
git commit -m "feat: add popover base component with ExoPopover hook"
```

---

## Task 3: Dropdown menu

**Files:**
- Modify: `lib/exo_ui/components.ex`
- Rewrite: `assets/css/src/components/dropdown.css`
- Create: `assets/js/hooks/dropdown_menu.js`
- Create: `test/exo_ui/components/dropdown_menu_test.exs`

The old `test/exo_ui/components/dropdown_test.exs` stays as-is — it tests the deprecated `dropdown/1`.

### Dropdown API (revised from spec)

Uses single `:entry` polymorphic slot to preserve insertion order:

```elixir
<.dropdown_menu id="actions">
  <:trigger>Actions</:trigger>
  <:entry click="edit" icon="pencil" shortcut="⌘E">Edit</:entry>
  <:entry click="duplicate" icon="copy">Duplicate</:entry>
  <:entry type="separator" />
  <:entry type="label">Danger zone</:entry>
  <:entry click="delete" variant="danger" icon="trash" shortcut="⌘⌫">Delete</:entry>
  <:entry type="sub_trigger" target="share-sub" icon="share">Share</:entry>
</.dropdown_menu>
```

- [ ] **Step 1: Write dropdown_menu tests**

```elixir
defmodule ExoUI.Components.DropdownMenuTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders dropdown_menu with trigger and items" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd">
      <:trigger>Menu</:trigger>
      <:entry>Edit</:entry>
      <:entry>Delete</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(data-exo="popover")
    assert html =~ ~s(popovertarget="dd")
    assert html =~ ~s(role="menu")
    assert html =~ ~s(role="menuitem")
    assert html =~ ~s(popover="auto")
    assert html =~ "Menu"
    assert html =~ "Edit"
    assert html =~ "Delete"
  end

  test "renders item with icon and shortcut" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd2">
      <:trigger>Menu</:trigger>
      <:entry icon="pencil" shortcut="⌘E">Edit</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(data-exo="dropdown-item-icon")
    assert html =~ ~s(data-exo="dropdown-item-shortcut")
    assert html =~ "⌘E"
  end

  test "renders separator" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd3">
      <:trigger>Menu</:trigger>
      <:entry>Edit</:entry>
      <:entry type="separator" />
      <:entry>Delete</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(data-exo="dropdown-separator")
    assert html =~ ~s(role="separator")
  end

  test "renders label" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd4">
      <:trigger>Menu</:trigger>
      <:entry type="label">Actions</:entry>
      <:entry>Edit</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(data-exo="dropdown-label")
    assert html =~ "Actions"
  end

  test "renders item with click and popovertargetaction=hide" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd5">
      <:trigger>Menu</:trigger>
      <:entry click="do-edit">Edit</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(popovertarget="dd5")
    assert html =~ ~s(popovertargetaction="hide")
    assert html =~ ~s(phx-click="do-edit")
  end

  test "renders item with navigate as link" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd6">
      <:trigger>Menu</:trigger>
      <:entry navigate="/items/1">View</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(href="/items/1")
    refute html =~ ~s(popovertargetaction)
  end

  test "renders item with variant=danger" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd7">
      <:trigger>Menu</:trigger>
      <:entry variant="danger">Delete</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(data-variant="danger")
  end

  test "renders sub_trigger for sub-menu" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd8">
      <:trigger>Menu</:trigger>
      <:entry type="sub_trigger" target="sub-menu">Share</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(popovertarget="sub-menu")
    refute html =~ ~s(popovertargetaction="hide")
  end

  test "renders without trigger" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="sub">
      <:entry>Sub item</:entry>
    </.dropdown_menu>
    """)
    refute html =~ ~s(data-exo="popover-trigger")
    assert html =~ ~s(role="menu")
  end

  test "sets aria-haspopup=menu on trigger" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.dropdown_menu id="dd9">
      <:trigger>Menu</:trigger>
      <:entry>Edit</:entry>
    </.dropdown_menu>
    """)
    assert html =~ ~s(aria-haspopup="menu")
  end
end
```

- [ ] **Step 2: Run tests — expect fail**

Run: `cd /Users/miso/Developer/exo_ui && mix test test/exo_ui/components/dropdown_menu_test.exs`

- [ ] **Step 3: Write dropdown_menu component**

```elixir
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
  attr :name, :string
  attr :value, :string
  attr :checked, :boolean
end

def dropdown_menu(assigns) do
  ~H"""
  <.popover id={@id} side={@side} align={@align} haspopup="menu">
    <:trigger :if={@trigger != []}>
      {render_slot(@trigger)}
    </:trigger>
    <div data-exo="dropdown-menu" role="menu" class={@class} {@rest}>
      <%= for entry <- @entry do %>
        <%= cond do %>
          <% entry[:type] == "separator" -> %>
            <div data-exo="dropdown-separator" role="separator" />
          <% entry[:type] == "label" -> %>
            <span data-exo="dropdown-label">{render_slot(entry)}</span>
          <% entry[:type] == "sub_trigger" -> %>
            <button
              type="button"
              data-exo="dropdown-item"
              role="menuitem"
              popovertarget={entry.target}
              disabled={entry[:disabled]}
            >
              <.icon :if={entry[:icon]} name={entry.icon} class={nil} />
              <span data-exo="dropdown-item-label">{render_slot(entry)}</span>
              <svg data-exo="dropdown-item-chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          <% entry[:navigate] || entry[:patch] || entry[:href] -> %>
            <.link
              data-exo="dropdown-item"
              role="menuitem"
              data-variant={entry[:variant]}
              navigate={entry[:navigate]}
              patch={entry[:patch]}
              href={entry[:href]}
            >
              <.icon :if={entry[:icon]} name={entry.icon} class={nil} />
              <span data-exo="dropdown-item-label">{render_slot(entry)}</span>
              <kbd :if={entry[:shortcut]} data-exo="dropdown-item-shortcut">{entry.shortcut}</kbd>
            </.link>
          <% true -> %>
            <button
              type="button"
              data-exo="dropdown-item"
              role="menuitem"
              data-variant={entry[:variant]}
              popovertarget={@id}
              popovertargetaction="hide"
              phx-click={entry[:click]}
              disabled={entry[:disabled]}
            >
              <.icon :if={entry[:icon]} name={entry.icon} class={nil} />
              <span data-exo="dropdown-item-label">{render_slot(entry)}</span>
              <kbd :if={entry[:shortcut]} data-exo="dropdown-item-shortcut">{entry.shortcut}</kbd>
            </button>
        <% end %>
      <% end %>
    </div>
  </.popover>
  """
end
```

- [ ] **Step 4: Run tests — expect pass**

Run: `cd /Users/miso/Developer/exo_ui && mix test test/exo_ui/components/dropdown_menu_test.exs`

- [ ] **Step 5: Rewrite dropdown.css**

Replace `assets/css/src/components/dropdown.css` — pure menu styling, no positioning/z-index. Styles for: `dropdown-menu`, `dropdown-item` (flex row, hover, disabled, danger variant), `dropdown-item-icon`, `dropdown-item-label`, `dropdown-item-shortcut`, `dropdown-separator`, `dropdown-label`.

See CSS listing in Task 3 of previous plan revision — same content applies.

- [ ] **Step 6: Write ExoDropdownMenu hook**

Create `assets/js/hooks/dropdown_menu.js`:

```javascript
const ExoDropdownMenu = {
  mounted() { this._bind() },
  updated() { this._bind() },
  destroyed() { this._unbind() },
  _bind() {
    this._unbind()
    this._menu = this.el.querySelector('[role="menu"]')
    if (!this._menu) return
    this._onKeydown = (e) => {
      const items = [...this._menu.querySelectorAll('[role="menuitem"]:not([disabled])')]
      if (!items.length) return
      const idx = items.indexOf(document.activeElement)
      let next = -1
      switch (e.key) {
        case 'ArrowDown': next = idx < items.length - 1 ? idx + 1 : 0; break
        case 'ArrowUp': next = idx > 0 ? idx - 1 : items.length - 1; break
        case 'Home': next = 0; break
        case 'End': next = items.length - 1; break
        default: return
      }
      e.preventDefault()
      items[next]?.focus()
    }
    this._menu.addEventListener('keydown', this._onKeydown)
  },
  _unbind() {
    if (this._menu && this._onKeydown) {
      this._menu.removeEventListener('keydown', this._onKeydown)
    }
    this._menu = null
    this._onKeydown = null
  }
}

export { ExoDropdownMenu }
```

- [ ] **Step 7: Register hook in index.js**

- [ ] **Step 8: Build CSS + run all tests**

Run: `cd /Users/miso/Developer/exo_ui && npm run build && mix test`

- [ ] **Step 9: Commit**

```
git add lib/exo_ui/components.ex assets/css/src/components/dropdown.css assets/js/hooks/dropdown_menu.js assets/js/index.js test/exo_ui/components/dropdown_menu_test.exs
git commit -m "feat: add dropdown_menu component on native popover"
```

---

## Task 4: Select component

**Files:**
- Modify: `lib/exo_ui/components.ex`
- Rewrite: `assets/css/src/components/select.css`
- Create: `assets/js/hooks/select.js`
- Create: `test/exo_ui/components/select_test.exs`

### Select groups (revised from spec)

Options carry a `group` attr instead of nesting inside a `:group` slot:

```elixir
<.select id="role" field={@form[:role]} label="Role">
  <:option value="super_admin" group="Admin">Super Admin</:option>
  <:option value="admin" group="Admin">Admin</:option>
  <:option value="editor" group="User">Editor</:option>
  <:option value="viewer" group="User">Viewer</:option>
</.select>
```

The component groups consecutive options with the same `group` value and renders group labels automatically.

- [ ] **Step 1: Write select tests**

Test coverage: basic render with options, prompt display, label + aria-labelledby, option with icon, disabled option, grouped options (via `group` attr), errors + data-invalid, field struct integration, anchor positioning inline styles, aria-selected true/false, hidden input, multiple mode.

- [ ] **Step 2: Run tests — expect fail**

- [ ] **Step 3: Write select component**

Key implementation details:
- Accept `field` attr with same extraction as `input/1` (name, value, errors from FormField)
- Pre-process options to group by `group` attr (preserving order)
- Render trigger button with selected option label (found by matching value)
- Render `role="listbox"` with `aria-labelledby` pointing to label
- Each option: `role="option"`, `aria-selected`, `data-selected`, `data-value`, `tabindex="-1"`
- Hidden `<input type="hidden">` for form submission
- Compose on `<.popover>` with `haspopup="listbox"`

- [ ] **Step 4: Run tests — expect pass**

- [ ] **Step 5: Rewrite select.css**

Style trigger (looks like native input: border, padding, chevron, focus ring, invalid state), option list (scrollable), option items (hover, selected checkmark), group labels, width matching (`min-width: anchor-size(width)`).

- [ ] **Step 6: Write ExoSelect hook (~30 lines)**

```javascript
const ExoSelect = {
  mounted() { this._bind() },
  updated() { this._syncFromServer() },
  destroyed() { this._unbind() },
  _bind() {
    this._unbind()
    const trigger = this.el.querySelector('[data-exo-select="trigger"]')
    const id = trigger?.getAttribute('popovertarget')
    this._popover = id ? document.getElementById(id) : null
    this._hidden = this.el.closest('[data-exo="field"]')?.querySelector('input[type="hidden"]')
    if (!this._popover) return

    this._onToggle = () => {
      trigger.setAttribute('aria-expanded', String(this._popover.matches(':popover-open')))
    }
    this._popover.addEventListener('toggle', this._onToggle)

    this._onClick = (e) => {
      const opt = e.target.closest('[data-exo="select-option"]:not([data-disabled])')
      if (!opt) return
      this._selectOption(opt)
    }
    this._popover.addEventListener('click', this._onClick)

    this._onKeydown = (e) => {
      const opts = [...this._popover.querySelectorAll('[data-exo="select-option"]:not([data-disabled])')]
      if (!opts.length) return
      const current = opts.indexOf(document.activeElement)
      let next = -1
      switch (e.key) {
        case 'ArrowDown': next = current < opts.length - 1 ? current + 1 : 0; break
        case 'ArrowUp': next = current > 0 ? current - 1 : opts.length - 1; break
        case 'Home': next = 0; break
        case 'End': next = opts.length - 1; break
        case 'Enter':
          if (current >= 0) { this._selectOption(opts[current]); e.preventDefault() }
          return
        default:
          // Type-ahead: jump to first option starting with typed char
          if (e.key.length === 1) {
            const char = e.key.toLowerCase()
            const match = opts.find(o => o.textContent.trim().toLowerCase().startsWith(char))
            if (match) match.focus()
          }
          return
      }
      e.preventDefault()
      opts[next]?.focus()
    }
    this._popover.addEventListener('keydown', this._onKeydown)
  },
  _selectOption(opt) {
    const value = opt.dataset.value
    if (this._hidden) {
      this._hidden.value = value
      this._hidden.dispatchEvent(new Event('input', { bubbles: true }))
    }
    // Update visual state
    this._popover.querySelectorAll('[data-exo="select-option"]').forEach(o => {
      o.setAttribute('aria-selected', String(o.dataset.value === value))
      if (o.dataset.value === value) o.dataset.selected = ''
      else delete o.dataset.selected
    })
    // Update trigger display
    const trigger = this.el.querySelector('[data-exo="select-value"]')
    if (trigger) trigger.textContent = opt.textContent.trim()
    // Close popover
    if (!this.el.dataset.multiple) this._popover.hidePopover()
  },
  _syncFromServer() {
    // After LiveView patch, re-read server state
    this._bind()
  },
  _unbind() {
    if (this._popover) {
      if (this._onToggle) this._popover.removeEventListener('toggle', this._onToggle)
      if (this._onClick) this._popover.removeEventListener('click', this._onClick)
      if (this._onKeydown) this._popover.removeEventListener('keydown', this._onKeydown)
    }
    this._popover = null
  }
}

export { ExoSelect }
```

- [ ] **Step 7: Register hook in index.js**

- [ ] **Step 8: Build CSS + run all tests**

Run: `cd /Users/miso/Developer/exo_ui && npm run build && mix test`

- [ ] **Step 9: Commit**

```
git add lib/exo_ui/components.ex assets/css/src/components/select.css assets/js/hooks/select.js assets/js/index.js test/exo_ui/components/select_test.exs
git commit -m "feat: add custom select component on native popover"
```

---

## Task 5: Combobox component

**Files:**
- Modify: `lib/exo_ui/components.ex`
- Create: `assets/css/src/components/combobox.css`
- Modify: `assets/css/exo.css`
- Create: `assets/js/hooks/combobox.js`
- Create: `test/exo_ui/components/combobox_test.exs`

- [ ] **Step 1: Write combobox tests**

Coverage: button trigger with client filter, button trigger with server filter, input trigger (uses `popover="manual"`), `role="combobox"` on input element, creatable mode, multiple mode (pills, multiple hidden inputs), loading state, clearable, empty slot, grouped options (via `group` attr), field struct integration, anchor styles, `aria-controls` linking search to listbox.

- [ ] **Step 2: Run tests — expect fail**

- [ ] **Step 3: Write combobox component**

Two render paths based on `trigger` attr:

**Button trigger:** Popover with search input inside (`role="combobox"` on search input) + listbox. Uses `popover="auto"`.

**Input trigger:** Trigger IS the search input (`role="combobox"` on trigger). Uses `popover="manual"` because `popovertarget` is invalid on `<input type="text">`. The hook handles open/close via `.showPopover()`/`.hidePopover()`.

Shared: options render like select options. Hidden input for form. Empty slot. Create option when `creatable`. Loading spinner. Clear button. Pills/tags for multiple.

- [ ] **Step 4: Run tests — expect pass**

- [ ] **Step 5: Create combobox.css**

Style: search input (inside popover, border-bottom separator), option list, highlighted/selected, pills/tags (inline-flex, small, rounded, X button), loading spinner (centered), create option (italic, highlighted), clear button (absolute positioned in trigger).

- [ ] **Step 6: Add combobox.css import to exo.css**

Insert `@import "./src/components/combobox.css";` after the select.css import.

- [ ] **Step 7: Write ExoCombobox hook (~45 lines)**

Extends ExoSelect patterns:
- Client filter: listen to search input's `input` event, filter options by `textContent.includes(query)`, toggle `hidden`, show/hide empty element
- Server filter: debounce search input (read `data-debounce` attr), call `this.pushEvent(eventName, {query})`
- Input trigger: `showPopover()` on focus/input, `hidePopover()` on blur (200ms delay for click-through) and escape
- On popover open (`toggle` event): focus search input, clear search text
- Arrow keys, enter, hidden input update — same as ExoSelect
- `mounted()` and `updated()` callbacks

- [ ] **Step 8: Register hook in index.js**

- [ ] **Step 9: Build CSS + run all tests**

Run: `cd /Users/miso/Developer/exo_ui && npm run build && mix test`

- [ ] **Step 10: Commit**

```
git add lib/exo_ui/components.ex assets/css/src/components/combobox.css assets/css/exo.css assets/js/hooks/combobox.js assets/js/index.js test/exo_ui/components/combobox_test.exs
git commit -m "feat: add combobox with client/server filter and input trigger"
```

---

## Task 6: Tooltip rebuild

**Files:**
- Modify: `lib/exo_ui/components.ex`
- Rewrite: `assets/css/src/components/tooltip.css`
- Modify: `assets/css/src/tokens.css`
- Create: `assets/js/hooks/tooltip.js`
- Rewrite: `test/exo_ui/components/tooltip_test.exs`

Independent of tasks 3-5 (tooltip does not use popover API).

- [ ] **Step 1: Add tooltip tokens to tokens.css**

```css
--exo-tooltip-bg: var(--exo-foreground);
--exo-tooltip-fg: var(--exo-background);
```

- [ ] **Step 2: Rewrite tooltip tests**

```elixir
defmodule ExoUI.Components.TooltipTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders tooltip with text" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t1" text="Help">Hover</.tooltip>
    """)
    assert html =~ ~s(data-exo="tooltip")
    assert html =~ ~s(data-exo="tooltip-anchor")
    assert html =~ ~s(data-exo="tooltip-content")
    assert html =~ ~s(role="tooltip")
    assert html =~ ~s(aria-describedby="t1-content")
    assert html =~ "Help"
    assert html =~ "Hover"
  end

  test "renders with side" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t2" text="tip" side="bottom">X</.tooltip>
    """)
    assert html =~ ~s(data-side="bottom")
  end

  test "renders rich content slot" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t3">
      <:content><strong>Bold</strong></:content>
      Hover
    </.tooltip>
    """)
    assert html =~ "<strong>Bold</strong>"
  end

  test "generates unique anchor names" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t4" text="tip">X</.tooltip>
    """)
    assert html =~ ~s(anchor-name: --tooltip-t4)
    assert html =~ ~s(position-anchor: --tooltip-t4)
  end

  test "renders arrow by default" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t5" text="tip">X</.tooltip>
    """)
    assert html =~ ~s(data-arrow)
  end

  test "hides arrow when false" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t6" text="tip" arrow={false}>X</.tooltip>
    """)
    refute html =~ ~s(data-arrow)
  end

  test "renders custom delay" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t7" text="tip" delay={300}>X</.tooltip>
    """)
    assert html =~ ~s(--exo-tooltip-delay: 300ms)
  end

  test "includes ExoTooltip hook" do
    assigns = %{}
    html = rendered_to_string(~H"""
    <.tooltip id="t8" text="tip">X</.tooltip>
    """)
    assert html =~ ~s(phx-hook="ExoTooltip")
  end
end
```

- [ ] **Step 3: Run tests — expect fail**

- [ ] **Step 4: Rewrite tooltip component**

Replace existing `tooltip/1`:

```elixir
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
```

- [ ] **Step 5: Run tests — expect pass**

- [ ] **Step 6: Rewrite tooltip.css**

Full CSS with: anchor positioning per `data-side`, `:has(:hover, :focus-visible)` show, `transition-delay` only on hover state (fast hide), arrow per side, `data-dismissed` escape state, `@supports not` fallback.

Tooltip has its own `position-area` rules (separate selectors from popover since it uses `data-exo="tooltip-content"` not `data-exo="popover-content"`).

- [ ] **Step 7: Write ExoTooltip hook**

```javascript
const ExoTooltip = {
  mounted() {
    this._onKeydown = (e) => {
      if (e.key === 'Escape') {
        this.el.dataset.dismissed = ''
        this.el.addEventListener('mouseleave', () => {
          delete this.el.dataset.dismissed
        }, { once: true })
      }
    }
    this.el.addEventListener('keydown', this._onKeydown)
  },
  destroyed() {
    if (this._onKeydown) this.el.removeEventListener('keydown', this._onKeydown)
  }
}

export { ExoTooltip }
```

- [ ] **Step 8: Register hook in index.js**

- [ ] **Step 9: Build CSS + run all tests**

Run: `cd /Users/miso/Developer/exo_ui && npm run build && mix test`

- [ ] **Step 10: Commit**

```
git add lib/exo_ui/components.ex assets/css/src/components/tooltip.css assets/css/src/tokens.css assets/js/hooks/tooltip.js assets/js/index.js test/exo_ui/components/tooltip_test.exs
git commit -m "feat: rebuild tooltip with anchor positioning and escape dismissal"
```

---

## Task 7: Deprecation + storybook stories

**Files:**
- Modify: `lib/exo_ui/components.ex`
- Rewrite: `storybook/stories/components/dropdown.story.exs`
- Rewrite: `storybook/stories/components/tooltip.story.exs`
- Create: `storybook/stories/components/popover.story.exs`
- Create: `storybook/stories/components/select.story.exs`
- Create: `storybook/stories/components/combobox.story.exs`

- [ ] **Step 1: Add deprecation to old dropdown/1**

Add `@doc deprecated: "Use dropdown_menu/1 instead"` above the existing `dropdown/1` function. Keep it functional.

- [ ] **Step 2: Add deprecation comment to input(%{type: "select"})**

Add comment: `# Deprecated: use select/1 instead` above the `input(%{type: "select"})` clause.

- [ ] **Step 3: Write popover story** (`:page` type)

Show: basic (bottom/center), all 4 sides, manual mode, close-from-within button.

- [ ] **Step 4: Rewrite dropdown story**

Use `dropdown_menu/1` with: icons, shortcuts, separators, labels, danger variant, sub-menu composition.

- [ ] **Step 5: Write select story**

Show: basic, with groups (`group` attr), with icons, prompt, errors, multiple mode, disabled options.

- [ ] **Step 6: Write combobox story**

Show: client filter, server filter (with mock data), input trigger, multiple + creatable, loading state, clearable.

- [ ] **Step 7: Rewrite tooltip story**

Use new API with `id`, `side`, rich content, arrow toggle, custom delay.

- [ ] **Step 8: Run all tests**

Run: `cd /Users/miso/Developer/exo_ui && mix test`

- [ ] **Step 9: Commit**

```
git add lib/exo_ui/components.ex storybook/stories/components/
git commit -m "feat: add storybook stories, deprecate old dropdown and select"
```

---

## Task 8: Final verification

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/miso/Developer/exo_ui && mix test`

- [ ] **Step 2: Build all CSS**

Run: `cd /Users/miso/Developer/exo_ui && npm run build:all`

- [ ] **Step 3: Verify hooks export**

Read `assets/js/index.js` — must export: `ExoSidebar`, `ExoThemeToggle`, `ExoPopover`, `ExoDropdownMenu`, `ExoSelect`, `ExoCombobox`, `ExoTooltip` (7 total).

- [ ] **Step 4: Verify CSS imports**

Read `assets/css/exo.css` — must import `popover.css` and `combobox.css`.

- [ ] **Step 5: Start storybook for manual check**

Run: `cd /Users/miso/Developer/exo_ui && mix phx.server`
Verify each story renders in browser.

- [ ] **Step 6: Commit any fixes**
