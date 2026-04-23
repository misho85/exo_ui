# ExoUI

Headless Phoenix LiveView component library with a default CSS theme.

> **Status:** pre-1.0 (`0.1.0`). APIs may change before a stable release.

- **Live Storybook:** https://exo-ui.krafter.dev
- **Source:** https://github.com/misho85/exo_ui
- **License:** MIT

<!-- MDOC -->

ExoUI is a broad set of LiveView function components — forms, overlays, data
display, feedback, charts and layouts — paired with a self-contained CSS theme
built from design tokens. Server rendering stays pure LiveView; the few
components that need client behavior (popovers, combobox, command palette,
carousel, …) ship as LiveView JS hooks. No React, no Vue, no virtual DOM.

Styling is pure CSS with custom properties — no Tailwind, no PostCSS, no
build step in your application. Override any design token to restyle, or drop
in your own stylesheet and keep only the markup.

## Highlights

- **Broad surface.** 60+ components across Core, Form, Overlay, Feedback, Data
  display, Charts and Layouts. Full list in the
  [Storybook](https://exo-ui.krafter.dev).
- **Token-driven theme.** Colors, radii and typography are CSS variables
  (`--exo-*`). Dark mode is shipped; any theme is a token override away.
- **Headless when you want it.** Markup and behavior are decoupled from the
  default stylesheet — ship the full theme, just the tokens, or neither.
- **Drop-in for Phoenix 1.8.** `use ExoUI` imports everything; one option
  skips the components that collide with your `CoreComponents`.

## A quick look

```heex
<.button variant="primary" phx-click="save">Save</.button>

<.badge variant="success">Active</.badge>

<.select id="status" name="status" value="active" label="Status">
  <:option value="active">Active</:option>
  <:option value="inactive">Inactive</:option>
</.select>

<.theme_toggle />
```

<!-- MDOC -->

## Requirements

- Elixir `~> 1.19`
- Phoenix `~> 1.8`
- Phoenix LiveView `~> 1.1`

## Installation

ExoUI is currently consumed as a git or path dependency. Until a stable Hex
release exists, pin a known commit or tag.

### 1. Add the dependency

For a git dependency, pin a known `ref` (commit or release tag once you cut
one):

```elixir
def deps do
  [
    {:exo_ui, git: "https://github.com/misho85/exo_ui.git", ref: "<commit-or-tag>"}
  ]
end
```

For local sibling development:

```elixir
def deps do
  [
    {:exo_ui, path: "../exo_ui"}
  ]
end
```

### 2. Choose an integration path

You can either run the installer task or wire the pieces manually.

For the standard Phoenix 1.8 project layout, the fastest path is:

```sh
mix exo.install
```

`mix exo.install` is idempotent and tries to patch:

- `assets/css/app.css`
- `assets/js/app.js`
- your `html_helpers/0` block in `lib/<app>_web.ex`

Review the diff afterwards. If your project diverges from the default Phoenix
layout, manual integration is usually clearer.

### 3. Import CSS

Full default theme:

```css
@import "../../deps/exo_ui/priv/static/exo.css";
```

Tokens only, if you want to build your own component styles on top:

```css
@import "../../deps/exo_ui/priv/static/exo.tokens.css";
```

Or import neither file and style the emitted `data-exo="..."` markup yourself.

### 4. Wire JS hooks

JS hooks are only required for interactive components such as popovers,
dropdown menus, select, combobox, tooltip, hover card, carousel, sidebar, and
command palette.

In `assets/js/app.js`:

```js
import { hooks as exoHooks } from "../../deps/exo_ui/assets/js/index.js"

const liveSocket = new LiveSocket("/live", Socket, {
  hooks: { ...exoHooks },
  params: { _csrf_token: csrfToken }
})
```

If your app already has hooks, merge them instead of replacing them:

```js
const liveSocket = new LiveSocket("/live", Socket, {
  hooks: { ...exoHooks, ...appHooks },
  params: { _csrf_token: csrfToken }
})
```

## Usage

In your `MyAppWeb` helper, import all components into LiveViews and components:

```elixir
def html_helpers do
  quote do
    use ExoUI
    # ...
  end
end
```

If your app already defines its own `CoreComponents` (the default in a fresh
Phoenix 1.8 app), skip the components that would clash:

```elixir
use ExoUI, core_components: false
```

That excludes `button/1`, `header/1`, `form/1`, `input/1`, `flash/1`,
`flash_group/1` and `table/1` — everything else is still imported.

If you prefer explicit imports over `use ExoUI`, the lower-level modules remain
available:

- `ExoUI.Components.Core`
- `ExoUI.Components.Form`
- `ExoUI.Components.Overlay`
- `ExoUI.Components.Feedback`
- `ExoUI.Components.DataDisplay`
- `ExoUI.Charts`
- `ExoUI.Layouts`

## Theme And CSS Modes

All colors, borders, shadows and radii are defined as CSS custom properties on
`:root` in `exo.tokens.css`. Override them anywhere downstream to restyle
without touching ExoUI:

```css
:root {
  --exo-primary: oklch(62% 0.19 155);       /* brand green */
  --exo-primary-foreground: oklch(100% 0 0);
  --exo-radius: 0.25rem;
}
```

Dark mode is activated by setting `data-theme="dark"` (or the class
`.exo-dark`) on any ancestor — typically `<html>`. The `<.theme_toggle />`
component handles switching and persistence.

Practical integration modes:

- `exo.css`: ship ExoUI's default theme and component styles.
- `exo.tokens.css`: ship only the design tokens and write your own component
  CSS.
- no ExoUI CSS import: treat the library as purely headless HTML + hooks.

## Browser support

ExoUI targets modern evergreen browsers. The main contract is:

- Native Popover API is required for the interactive floating primitives.
- CSS anchor positioning is the preferred placement path; simpler fallback
  positioning exists where practical.
- `:has()` is used for visual state selectors and progressive enhancement, not
  for the core JS interaction path.

Support matrix, checked against MDN on April 23, 2026:

| Feature | Where ExoUI uses it | Policy | Fallback / note |
| --- | --- | --- | --- |
| [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) | `popover`, `dropdown_menu`, `select`, `combobox`, `command_palette`, JS-enhanced `tooltip` | Required | No supported fallback for browsers without the Popover API. |
| [`position-area`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-area) and [`position-anchor`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-anchor) | Floating placement and anchored sizing | Preferred modern path | `popover.css` and `tooltip.css` ship `@supports not (position-area: top)` fallback placement; combobox width matching falls back from `anchor-size(width)` to a fixed minimum width. |
| [`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has) | Trigger-open styling, icon rotation, CSS-only tooltip fallback | Optional / cosmetic | Unsupported selectors fail closed; primary JS interactions still work. |

MDN currently marks the Popover API as Baseline 2025, `position-area` as
Baseline 2026, and still shows `position-anchor` with a limited-availability
warning. ExoUI therefore treats the anchor-positioning family as a
modern-browser feature even where reduced fallback behavior exists.

## Storybook

The full Storybook app lives under [`storybook/`](storybook/) and powers the
public preview at https://exo-ui.krafter.dev. To run it locally:

```sh
cd storybook
mix setup
mix phx.server
```

For browser-test debugging, you can run Storybook without watcher processes:

```sh
cd storybook
PLAYWRIGHT=1 mix phx.server
```

## Browser tests

The browser interaction suite runs against the local Storybook and starts it
automatically:

```sh
bun install
bun run test:browser:install
bun run test:browser
```

Current browser coverage includes `popover`, `select`, `combobox`, `tooltip`,
and `command_palette`.

## Development

The distributed CSS in `priv/static/` is generated from sources in
`assets/css/` using [lightningcss](https://lightningcss.dev/). Only needed
when contributing to ExoUI:

```sh
bun install
bun run build:all    # builds exo.css and exo.tokens.css
bun run watch        # rebuilds on change
```

`bun run watch` rebuilds both compiled outputs, so token changes are no longer
easy to miss during local development.

## Release Workflow

Use [docs/release-checklist.md](docs/release-checklist.md) before cutting a
public tag. The short version is:

```sh
mix test
mix compile --warnings-as-errors
bun run build:all
bun run test:browser
cd storybook && mix compile --warnings-as-errors
```

## License

MIT — see [LICENSE](LICENSE).
