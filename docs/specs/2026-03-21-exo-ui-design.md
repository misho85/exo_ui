# ExoUI — Headless LiveView Component Library

> **Status (April 23, 2026):** Historical design record. The current source of
> truth is the codebase, [README](../../README.md), and the
> [improvement roadmap](../plans/2026-04-22-exo-ui-improvement-roadmap.md).
> Repo structure, build scripts, and some integration details in this document
> no longer match the current implementation exactly.

## Overview

**ExoUI** (`exo_ui`) is a headless Phoenix LiveView component library with a default CSS theme, designed to be shared across 6 Elixir/Phoenix projects. Extracted from KrafterUI (DinaricHub's internal component library).

**Core principle:** Separate behavior (Elixir components) from appearance (CSS). Components emit semantic HTML with `data-exo` attributes. Styling is done via a shipped CSS theme that consumers can use as-is, customize via CSS custom properties, or replace entirely.

## Architecture

### Two Layers

1. **Headless layer** (Elixir) — Components emit semantic HTML with `data-exo` attributes, ARIA attributes, and JS hooks. Zero CSS knowledge.
2. **Theme layer** (CSS) — A single compiled CSS file that styles components via `[data-exo="..."]` selectors. CSS custom properties for theming.

### Component API Pattern

Every component follows the same pattern:

```elixir
attr :variant, :string, values: ~w(primary secondary ghost danger outline), default: nil
attr :size, :string, values: ~w(xs sm md lg), default: "md"
attr :class, :string, default: nil
attr :rest, :global, include: ~w(href navigate patch method disabled name value)
slot :inner_block, required: true

def button(assigns) do
  ~H"""
  <button
    data-exo="btn"
    data-variant={@variant}
    data-size={@size}
    data-disabled={@rest[:disabled] && ""}
    class={@class}
    {@rest}
  >
    <%= render_slot(@inner_block) %>
  </button>
  """
end
```

**Conventions:**
- `data-exo="<component>"` — identifies the component type
- `data-variant`, `data-size` — modifier attributes (always combined with `[data-exo="..."]` in CSS selectors)
- `data-state="open|closed"` — for stateful components (modal, dropdown, select)
- `data-disabled`, `data-checked`, `data-invalid` — boolean states, presence-based (no value)
- `class` prop — allows consumers to add ad-hoc classes
- No gettext inside components — all strings as props (see Gettext Migration below)
- `button` renders `<.link>` when `href`, `navigate`, or `patch` is present, `<button>` otherwise

**CSS specificity:** Theme selectors use `:where([data-exo="..."])` for zero specificity (0-0-0), so consumer classes always win without source order concerns.

### CSS Theme Pattern

```css
/* Base — :where() for zero specificity, consumer classes always win */
:where([data-exo="btn"]) {
  display: inline-flex;
  align-items: center;
  gap: var(--exo-space-2);
  border-radius: var(--exo-radius);
  font-size: var(--exo-text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--exo-duration) var(--exo-easing);
}

/* Variants — always scoped to component */
:where([data-exo="btn"][data-variant="primary"]) {
  background: var(--exo-primary);
  color: var(--exo-primary-foreground);
}

/* States — presence-based */
:where([data-exo="btn"][data-disabled]) { opacity: 0.5; pointer-events: none; }
:where([data-exo="btn"]):hover { ... }
:where([data-exo="btn"]):focus-visible { ... }

/* Stateful components */
:where([data-exo="modal"][data-state="open"]) { ... }
:where([data-exo="modal"][data-state="closed"]) { ... }
```

## Repo Structure

```
exo_ui/
  lib/
    exo_ui/
      components.ex          # all headless components
      charts.ex              # chart components (sparkline, bar_chart, etc.)
      layouts.ex             # sidebar_layout, sidebar_item
      lucide.ex              # auto-generated ~1700 icons
      hooks.ex               # documents which components require JS hooks (reference only)
  assets/
    js/
      index.js               # exports hooks
      hooks/
        select.js
        drawer_state.js
        sidebar_collapsible.js
        tag_input.js
    css/
      src/
        tokens.css            # CSS custom properties
        themes/
          light.css           # default (included in tokens)
          dark.css            # dark mode overrides
        components/
          button.css
          input.css
          modal.css
          table.css
          ...                 # one file per component
        layouts/
          sidebar.css
      exo.css                 # barrel import of all files
  priv/
    static/
      exo.css                 # compiled + minified (committed to repo)
      exo.tokens.css          # tokens only (for full custom themes)
  storybook/                  # Phoenix Storybook for visual development
  mix.exs
  package.json                # lightningcss devDependency
  CHANGELOG.md
```

## CSS Design Tokens

Follows shadcn model: minimal, semantic, oklch color space, foreground pairs.

```css
:root {
  /* Semantic surfaces */
  --exo-background: oklch(99% 0 0);
  --exo-foreground: oklch(15% 0 0);
  --exo-muted: oklch(95% 0 0);
  --exo-muted-foreground: oklch(45% 0 0);
  --exo-card: oklch(100% 0 0);
  --exo-card-foreground: oklch(15% 0 0);
  --exo-border: oklch(90% 0 0);
  --exo-input: oklch(90% 0 0);
  --exo-ring: oklch(55% 0.24 262);

  /* Semantic colors — each with foreground pair */
  --exo-primary: oklch(55% 0.24 262);
  --exo-primary-foreground: oklch(100% 0 0);
  --exo-secondary: oklch(95% 0.02 250);
  --exo-secondary-foreground: oklch(20% 0 0);
  --exo-danger: oklch(55% 0.22 29);
  --exo-danger-foreground: oklch(100% 0 0);
  --exo-warning: oklch(75% 0.18 85);
  --exo-warning-foreground: oklch(20% 0 0);
  --exo-success: oklch(62% 0.19 155);
  --exo-success-foreground: oklch(100% 0 0);
  --exo-info: oklch(60% 0.18 250);
  --exo-info-foreground: oklch(100% 0 0);

  /* Radius — one value, derive the rest with calc() */
  --exo-radius: 0.5rem;

  /* Spacing */
  --exo-space-1: 0.25rem;
  --exo-space-2: 0.5rem;
  --exo-space-3: 0.75rem;
  --exo-space-4: 1rem;
  --exo-space-6: 1.5rem;
  --exo-space-8: 2rem;

  /* Typography */
  --exo-font: system-ui, -apple-system, sans-serif;
  --exo-font-mono: ui-monospace, monospace;
  --exo-text-xs: 0.75rem;
  --exo-text-sm: 0.875rem;
  --exo-text-base: 1rem;
  --exo-text-lg: 1.125rem;
  --exo-text-xl: 1.25rem;

  /* Shadows */
  --exo-shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.05);
  --exo-shadow-md: 0 4px 6px -1px oklch(0% 0 0 / 0.1);
  --exo-shadow-lg: 0 10px 15px -3px oklch(0% 0 0 / 0.1);

  /* Transitions */
  --exo-duration: 150ms;
  --exo-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark theme — explicit toggle */
[data-theme="dark"] {
  --exo-background: oklch(15% 0 0);
  --exo-foreground: oklch(90% 0 0);
  --exo-muted: oklch(20% 0 0);
  --exo-muted-foreground: oklch(60% 0 0);
  --exo-card: oklch(18% 0 0);
  --exo-card-foreground: oklch(90% 0 0);
  --exo-border: oklch(30% 0 0);
  --exo-input: oklch(30% 0 0);
  --exo-shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.3);
  --exo-shadow-md: 0 4px 6px -1px oklch(0% 0 0 / 0.4);
  --exo-shadow-lg: 0 10px 15px -3px oklch(0% 0 0 / 0.4);
}

/* System preference fallback — applies when no explicit data-theme is set */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --exo-background: oklch(15% 0 0);
    --exo-foreground: oklch(90% 0 0);
    --exo-muted: oklch(20% 0 0);
    --exo-muted-foreground: oklch(60% 0 0);
    --exo-card: oklch(18% 0 0);
    --exo-card-foreground: oklch(90% 0 0);
    --exo-border: oklch(30% 0 0);
    --exo-input: oklch(30% 0 0);
    --exo-shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.3);
    --exo-shadow-md: 0 4px 6px -1px oklch(0% 0 0 / 0.4);
    --exo-shadow-lg: 0 10px 15px -3px oklch(0% 0 0 / 0.4);
  }
}
```

## Component List

### ExoUI.Components (main module)

| # | Component | Data attr | Modifiers | JS Hook |
|---|-----------|-----------|-----------|---------|
| 1 | `button` | `data-exo="btn"` | variant, size, data-disabled | - |
| 2 | `input` | `data-exo="input"` | type, data-invalid | - |
| 3 | `select` | `data-exo="select"` | data-state, data-disabled | Select |
| 4 | `toggle` | `data-exo="toggle"` | data-checked | - |
| 5 | `checkbox_section` | `data-exo="checkbox-section"` | data-checked | - |
| 6 | `tag_input` | `data-exo="tag-input"` | - | TagInput |
| 7 | `modal` | `data-exo="modal"` | data-state | - |
| 8 | `confirm_modal` | `data-exo="confirm-modal"` | variant | - |
| 9 | `table` | `data-exo="table"` | variant | - |
| 10 | `header` | `data-exo="header"` | - | - |
| 11 | `list` | `data-exo="list"` | - | - |
| 12 | `content_card` | `data-exo="card"` | - | - |
| 13 | `stat_card` | `data-exo="stat-card"` | trend_direction | - |
| 14 | `metric_card` | `data-exo="metric-card"` | - | - |
| 15 | `badge` | `data-exo="badge"` | variant | - |
| 16 | `alert` | `data-exo="alert"` | kind | - |
| 17 | `flash` | `data-exo="flash"` | kind | - |
| 18 | `flash_group` | `data-exo="flash-group"` | - | - |
| 19 | `toast_container` | `data-exo="toast"` | kind | - |
| 20 | `avatar` | `data-exo="avatar"` | size, color | - |
| 21 | `tabs` | `data-exo="tabs"` | - | - |
| 22 | `pagination` | `data-exo="pagination"` | - | - |
| 23 | `dropdown` | `data-exo="dropdown"` | data-state | - |
| 24 | `tooltip` | `data-exo="tooltip"` | position | - |
| 25 | `date_picker` | `data-exo="date-picker"` | data-disabled | - |
| 26 | `skeleton` | `data-exo="skeleton"` | type | - |
| 27 | `empty_state` | `data-exo="empty-state"` | - | - |
| 28 | `icon` | - | - | - |
| 29 | `theme_toggle` | `data-exo="theme-toggle"` | - | - |
| 30 | `wizard_sidebar` | `data-exo="wizard"` | - | - |
| 31 | `form` | `data-exo="form"` | - | - |
| 32 | `separator` | `data-exo="separator"` | - | - |

### ExoUI.Charts

| # | Component | Data attr |
|---|-----------|-----------|
| 33 | `sparkline` | `data-exo="sparkline"` |
| 34 | `bar_chart` | `data-exo="bar-chart"` |
| 35 | `horizontal_bar_chart` | `data-exo="h-bar-chart"` |
| 36 | `area_chart` | `data-exo="area-chart"` |
| 37 | `stacked_bar_chart` | `data-exo="stacked-bar-chart"` |
| 38 | `progress_bar` | `data-exo="progress-bar"` |
| 39 | `trend_badge` | `data-exo="trend-badge"` |

### ExoUI.Layouts

| # | Component | Data attr | JS Hook |
|---|-----------|-----------|---------|
| 40 | `sidebar_layout` | `data-exo="sidebar"` | DrawerState, SidebarCollapsible |
| 41 | `sidebar_item` | `data-exo="sidebar-item"` | - |

### ExoUI.Lucide

Auto-generated ~1700 Lucide icons via `mix exo_ui.lucide.gen`.

### Utility Functions

- `show/2`, `hide/2` — JS transition helpers using `data-state` attributes (no Tailwind classes)
- `translate_error/1` — gettext error translation (configurable backend)

### Components Requiring LiveView Connection

The following components use JS hooks or `phx-*` bindings and will not function in dead views:
`select`, `tag_input`, `sidebar_layout`, `modal`, `confirm_modal`, `dropdown`, `date_picker`, `toast_container`, `theme_toggle`, `flash`, `flash_group`.

All other components render static HTML and work in any context.

### Planned (post-v1)

- `accordion` — collapsible sections
- `breadcrumb` — navigation trail
- `radio_group` — radio input group

## Consumer Integration

### mix.exs

```elixir
{:exo_ui, git: "git@github.com:username/exo_ui.git", tag: "v0.1.0"}
```

### CSS

```css
/* assets/css/app.css */
@import "../../deps/exo_ui/priv/static/exo.css";

/* Optional: customize */
:root {
  --exo-primary: oklch(65% 0.2 155);
  --exo-radius: 0.75rem;
}
```

### JS Hooks

```js
// assets/js/app.js
import { hooks as exoHooks } from "../../deps/exo_ui/assets/js/index.js"

let liveSocket = new LiveSocket("/live", Socket, {
  hooks: { ...exoHooks, ...myAppHooks }
})
```

### Component Delegation

```elixir
defmodule MyAppWeb.CoreComponents do
  use Phoenix.Component

  # Runtime delegation — avoids compile-time coupling and issues with
  # default args / multiple clauses that defdelegate can't handle
  def button(assigns), do: ExoUI.Components.button(assigns)
  def input(assigns), do: ExoUI.Components.input(assigns)
  def modal(assigns), do: ExoUI.Components.modal(assigns)
  def table(assigns), do: ExoUI.Components.table(assigns)
  # ... all ExoUI components

  # App-specific components
  def money(assigns), do: ...
  def status_badge(assigns), do: ...
end
```

### Gettext Config

```elixir
# config/config.exs
config :exo_ui, gettext_backend: MyAppWeb.Gettext
```

## Build Pipeline

### CSS Build (Lightning CSS)

```json
{
  "devDependencies": {
    "lightningcss-cli": "^1.0"
  },
  "scripts": {
    "build": "lightningcss --bundle --minify assets/css/exo.css -o priv/static/exo.css",
    "build:tokens": "lightningcss --bundle --minify assets/css/src/tokens.css -o priv/static/exo.tokens.css",
    "watch": "lightningcss --bundle assets/css/exo.css -o priv/static/exo.css --watch"
  }
}
```

Compiled CSS is committed to the repo — consumers don't need Node.js or Lightning CSS.

### Development

```bash
git clone git@github.com:username/exo_ui.git
cd exo_ui
mix deps.get
npm install
npm run watch      # CSS hot reload
mix phx.server     # Phoenix Storybook
```

### Visual Development — Phoenix Storybook

Phoenix Storybook integration for visual component development and documentation. Each component has a story file showing all variants, sizes, and states.

### CI

```yaml
- mix compile --warnings-as-errors
- mix format --check-formatted
- mix test
- npm run build (verify CSS compiles)
```

### Versioning

- Semantic versioning from the start
- `0.x` while API stabilizes — breaking changes allowed in minor bumps
- `1.0` when all 6 projects use the lib stably
- Git tags: `v0.1.0`, `v0.2.0`, ...
- CHANGELOG.md maintained

## Migration from KrafterUI

1. DaisyUI classes → `data-exo` attributes + pure CSS
2. Gettext calls inside components → string props (see below)
3. `standalone_checkbox` → `toggle`
4. `status_badge` + `role_badge` → generic `badge` with variant prop
5. `money`, `currency_symbol`, `currency_symbol_after?` → stay in consuming app
6. Config-driven color maps → stay in consuming app, use `badge` variant prop
7. Each consuming project creates `CoreComponents` with runtime delegation to ExoUI
8. JS hooks rewritten to use `data-*` attributes instead of DaisyUI/Tailwind classes
9. `show/2` and `hide/2` rewritten to use `data-state` transitions instead of Tailwind classes
10. Chart SVG templates: replace DaisyUI color classes with ExoUI CSS token references or inline `var()` styles

### Gettext Migration

Components with hardcoded gettext that must become props:

| Component | Current gettext | New prop (with default) |
|-----------|----------------|------------------------|
| `flash_group` | "We can't find the internet", "Attempting to reconnect", "Something went wrong!" | `disconnect_msg`, `reconnect_msg`, `error_msg` |
| `toast_container` | "close" | `close_label` (default: `"close"`) |
| `select` | "Select..." | `prompt` (already a prop, just remove internal gettext) |
| `skeleton` | "Loading..." | `label` (default: `"Loading..."`) |
| `pagination` | "Previous page", "Next page", "Pagination" | `prev_label`, `next_label`, `aria_label` |
| `table` | "Actions" | `actions_label` (default: `"Actions"`) |

### Input / Select Relationship

`input/1` has multi-clause dispatch: `<.input type="select">` delegates internally to `select/1`. This pattern continues in ExoUI — `input` remains the unified form field component, `select` can also be used standalone. No breaking change.

### New Components (not in KrafterUI)

| Component | Description |
|-----------|-------------|
| `badge` | Generic badge with `variant` prop (primary, secondary, danger, warning, success, info). Replaces `status_badge` and `role_badge` |
| `form` | Thin wrapper around Phoenix `<.form>` adding `data-exo="form"` for consistent field spacing and layout |
| `separator` | Horizontal/vertical divider with `data-exo="separator"` and optional `orientation` prop |
| `toggle` | Switch/toggle component (from `standalone_checkbox`), `data-exo="toggle"`, props: `checked`, `name`, `class` |

### Stream Compatibility

`table` and `toast_container` support `phx-update="stream"` for LiveView streams. This must be preserved in ExoUI.
