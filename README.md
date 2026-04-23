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

<.combobox
  id="country"
  name="country"
  options={@countries}
  placeholder="Pick a country"
/>

<.theme_toggle />
```

<!-- MDOC -->

## Requirements

- Elixir `~> 1.19`
- Phoenix `~> 1.8`
- Phoenix LiveView `~> 1.1`

## Installation

Add the dep to `mix.exs`:

```elixir
def deps do
  [
    {:exo_ui, git: "https://github.com/misho85/exo_ui.git", tag: "v0.1.0"}
  ]
end
```

Import the CSS in `assets/css/app.css`:

```css
@import "../../deps/exo_ui/priv/static/exo.css";
```

If you only want the design tokens (to build a theme on top), import
`exo.tokens.css` instead.

Wire the JS hooks in `assets/js/app.js`:

```js
import { hooks as exoHooks } from "../../deps/exo_ui/assets/js/index.js"

const liveSocket = new LiveSocket("/live", Socket, {
  hooks: { ...exoHooks },
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

## Theming

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

## Storybook

The full Storybook app lives under [`storybook/`](storybook/) and powers the
public preview at https://exo-ui.krafter.dev. To run it locally:

```sh
cd storybook
mix setup
mix phx.server
```

## CSS build

The distributed CSS in `priv/static/` is generated from sources in
`assets/css/` using [lightningcss](https://lightningcss.dev/). Only needed
when contributing to ExoUI:

```sh
bun install
bun run build:all    # builds exo.css and exo.tokens.css
bun run watch        # rebuilds on change
```

## License

MIT — see [LICENSE](LICENSE).
