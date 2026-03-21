# ExoUI Phase 1: Repo Scaffold, Tokens, Build Pipeline & Storybook

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `exo_ui` repository with project structure, CSS design tokens, Lightning CSS build pipeline, and Phoenix Storybook for visual development.

**Architecture:** Elixir component library with CSS assets. Storybook runs as a minimal Phoenix app within the repo (under `storybook/`) that depends on the lib via `path:`. Lightning CSS compiles source CSS to `priv/static/exo.css`.

**Tech Stack:** Elixir 1.18, Phoenix 1.8, Phoenix LiveView 1.1, Phoenix Storybook 1.0, Lightning CSS, PostCSS (none — Lightning CSS replaces it).

**Spec:** `docs/superpowers/specs/2026-03-21-exo-ui-design.md`

**Working directory:** `/Users/miso/Developer/exo_ui` (new repo, sibling to `dinaric-hub`)

---

## File Structure

```
exo_ui/
  lib/
    exo_ui.ex                           # Main module, version, docs
    exo_ui/
      components.ex                     # Placeholder — exports empty __components__/0
  assets/
    js/
      index.js                          # Hook exports (empty for now)
    css/
      src/
        tokens.css                      # CSS custom properties (light theme)
        themes/
          dark.css                      # Dark mode overrides
        components/                     # Empty dir — components added in Phase 2+
        layouts/                        # Empty dir — layouts added in Phase 3
      exo.css                           # Barrel import of all CSS source files
  priv/
    static/
      exo.css                           # Compiled output (built by Lightning CSS)
      exo.tokens.css                    # Tokens-only output
  storybook/
    lib/
      storybook.ex                      # Application module
      storybook_web.ex                  # Web module helpers
      storybook_web/
        endpoint.ex                     # Phoenix Endpoint
        router.ex                       # Router with storybook macros
        storybook.ex                    # PhoenixStorybook backend config
    config/
      config.exs                        # Storybook app config
      dev.exs                           # Dev config (watchers, live_reload)
    assets/
      js/
        storybook.js                    # Storybook JS entry point
      css/
        storybook.css                   # Storybook CSS (imports exo.css)
    stories/
      _root.index.exs                   # Root sidebar config
      welcome.story.exs                 # Welcome page
      tokens/
        _tokens.index.exs               # Tokens section config
        colors.story.exs                # Color token showcase
        typography.story.exs            # Typography token showcase
        spacing.story.exs               # Spacing token showcase
    mix.exs                             # Storybook app mix.exs
    mix.lock
  mix.exs                               # Main library mix.exs
  mix.lock
  package.json                          # Lightning CSS dev dependency
  .formatter.exs
  .gitignore
  README.md
  CHANGELOG.md
  LICENSE
```

---

### Task 1: Initialize Git Repo and Elixir Project

**Files:**
- Create: `mix.exs`
- Create: `.formatter.exs`
- Create: `.gitignore`
- Create: `README.md`
- Create: `CHANGELOG.md`
- Create: `LICENSE`

- [ ] **Step 1: Create project directory and init git**

```bash
mkdir -p /Users/miso/Developer/exo_ui
cd /Users/miso/Developer/exo_ui
git init
```

- [ ] **Step 2: Create mix.exs**

```elixir
# mix.exs
defmodule ExoUI.MixProject do
  use Mix.Project

  @version "0.1.0"
  @source_url "https://github.com/USERNAME/exo_ui"

  def project do
    [
      app: :exo_ui,
      version: @version,
      elixir: "~> 1.18",
      deps: deps(),
      name: "ExoUI",
      description: "Headless LiveView component library with default CSS theme",
      source_url: @source_url,
      docs: docs()
    ]
  end

  def application do
    [
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      {:phoenix, "~> 1.8"},
      {:phoenix_html, "~> 4.1"},
      {:phoenix_live_view, "~> 1.1"},
      {:gettext, "~> 0.26"},
      {:ex_doc, "~> 0.35", only: :dev, runtime: false}
    ]
  end

  defp docs do
    [
      main: "ExoUI",
      extras: ["README.md", "CHANGELOG.md"]
    ]
  end
end
```

- [ ] **Step 3: Create .formatter.exs**

```elixir
# .formatter.exs
[
  import_deps: [:phoenix, :phoenix_live_view],
  plugins: [Phoenix.LiveView.HTMLFormatter],
  inputs: [
    "*.{ex,exs}",
    "{config,lib,test}/**/*.{ex,exs}"
  ]
]
```

- [ ] **Step 4: Create .gitignore**

```gitignore
# .gitignore
/_build/
/deps/
*.beam
*.ez
erl_crash.dump

# Node
/node_modules/
npm-debug.log

# Storybook build artifacts
/storybook/_build/
/storybook/deps/

# IDE
.elixir_ls/
.vscode/
.idea/

# NOTE: priv/static/exo.css is COMMITTED (compiled CSS output)
# NOTE: priv/static/exo.tokens.css is COMMITTED
```

- [ ] **Step 5: Create README.md**

```markdown
# ExoUI

Headless Phoenix LiveView component library with a default CSS theme.

## Installation

Add to your `mix.exs`:

\```elixir
{:exo_ui, git: "git@github.com:USERNAME/exo_ui.git", tag: "v0.1.0"}
\```

Import CSS in your `assets/css/app.css`:

\```css
@import "../../deps/exo_ui/priv/static/exo.css";
\```

Import hooks in your `assets/js/app.js`:

\```js
import { hooks as exoHooks } from "../../deps/exo_ui/assets/js/index.js"
\```
```

- [ ] **Step 6: Create CHANGELOG.md and LICENSE**

```markdown
# Changelog

## 0.1.0 — Unreleased

- Initial release: repo scaffold, CSS tokens, build pipeline, Storybook
```

LICENSE: use MIT or your preferred license.

- [ ] **Step 7: Run mix deps.get**

```bash
cd /Users/miso/Developer/exo_ui
mise exec -- mix deps.get
```

Expected: Dependencies fetched successfully.

- [ ] **Step 8: Commit**

```bash
git add mix.exs mix.lock .formatter.exs .gitignore README.md CHANGELOG.md LICENSE
git commit -m "feat: initialize exo_ui project"
```

---

### Task 2: Create Main Module and Components Placeholder

**Files:**
- Create: `lib/exo_ui.ex`
- Create: `lib/exo_ui/components.ex`

- [ ] **Step 1: Create lib/exo_ui.ex**

```elixir
defmodule ExoUI do
  @moduledoc """
  ExoUI — Headless LiveView component library with default CSS theme.

  Components emit semantic HTML with `data-exo` attributes.
  Styling is done via CSS custom properties in a shipped theme file.
  """

  @version Mix.Project.config()[:version]

  @doc "Returns the current ExoUI version."
  def version, do: @version
end
```

- [ ] **Step 2: Create lib/exo_ui/components.ex**

```elixir
defmodule ExoUI.Components do
  @moduledoc """
  Headless LiveView components.

  All components emit semantic HTML with `data-exo` attributes.
  No CSS classes are applied — styling is handled by the theme CSS file.
  """

  use Phoenix.Component
end
```

- [ ] **Step 3: Verify compilation**

```bash
cd /Users/miso/Developer/exo_ui
mise exec -- mix compile --warnings-as-errors
```

Expected: Compilation succeeds with zero warnings.

- [ ] **Step 4: Commit**

```bash
git add lib/
git commit -m "feat: add ExoUI and ExoUI.Components modules"
```

---

### Task 3: Create CSS Design Tokens

**Files:**
- Create: `assets/css/src/tokens.css`
- Create: `assets/css/src/themes/dark.css`
- Create: `assets/css/exo.css`

- [ ] **Step 1: Create tokens.css**

```css
/* assets/css/src/tokens.css */
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
```

- [ ] **Step 2: Create dark.css**

```css
/* assets/css/src/themes/dark.css */

/* Explicit dark mode toggle */
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

- [ ] **Step 3: Create barrel import exo.css**

```css
/* assets/css/exo.css */
@import "./src/tokens.css";
@import "./src/themes/dark.css";

/* Component CSS files will be added here as components are built */
/* @import "./src/components/button.css"; */
/* @import "./src/components/input.css"; */
/* etc. */
```

- [ ] **Step 4: Create empty component/layout CSS directories**

```bash
mkdir -p assets/css/src/components
mkdir -p assets/css/src/layouts
```

- [ ] **Step 5: Commit**

```bash
git add assets/css/
git commit -m "feat: add CSS design tokens and dark theme"
```

---

### Task 4: Set Up Lightning CSS Build Pipeline

**Files:**
- Create: `package.json`
- Create: `priv/static/exo.css` (built output)
- Create: `priv/static/exo.tokens.css` (built output)

- [ ] **Step 1: Create package.json**

```json
{
  "name": "exo_ui",
  "version": "0.1.0",
  "private": true,
  "devDependencies": {
    "lightningcss-cli": "^1.0",
    "nodemon": "^3.0"
  },
  "scripts": {
    "build": "lightningcss --bundle --minify assets/css/exo.css -o priv/static/exo.css",
    "build:tokens": "lightningcss --bundle --minify assets/css/src/tokens.css -o priv/static/exo.tokens.css",
    "build:all": "npm run build && npm run build:tokens",
    "watch": "nodemon --watch assets/css -e css --exec 'npm run build'"
  }
}
```

- [ ] **Step 2: Install npm dependencies**

```bash
cd /Users/miso/Developer/exo_ui
npm install
```

Expected: `lightningcss-cli` installed, `node_modules/` created.

- [ ] **Step 3: Create priv/static directory**

```bash
mkdir -p priv/static
```

- [ ] **Step 4: Run CSS build**

```bash
npm run build:all
```

Expected: `priv/static/exo.css` and `priv/static/exo.tokens.css` created. Verify content:

```bash
cat priv/static/exo.css
```

Should contain all tokens + dark theme in one minified file.

- [ ] **Step 5: Verify tokens-only file**

```bash
cat priv/static/exo.tokens.css
```

Should contain only `:root { ... }` with token variables, no dark theme.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json priv/static/exo.css priv/static/exo.tokens.css
git commit -m "feat: add Lightning CSS build pipeline"
```

---

### Task 5: Create JS Hook Exports

**Files:**
- Create: `assets/js/index.js`
- Create: `assets/js/hooks/` (empty dir with .gitkeep)

- [ ] **Step 1: Create assets/js/index.js**

```js
// assets/js/index.js
// ExoUI LiveView hooks
// Hooks will be added as components are built

const hooks = {}

export { hooks }
```

- [ ] **Step 2: Create hooks directory**

```bash
mkdir -p assets/js/hooks
touch assets/js/hooks/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add assets/js/
git commit -m "feat: add JS hook export scaffold"
```

---

### Task 6: Set Up Phoenix Storybook App

**Files:**
- Create: `storybook/mix.exs`
- Create: `storybook/config/config.exs`
- Create: `storybook/config/dev.exs`
- Create: `storybook/lib/storybook.ex`
- Create: `storybook/lib/storybook_web.ex`
- Create: `storybook/lib/storybook_web/endpoint.ex`
- Create: `storybook/lib/storybook_web/router.ex`
- Create: `storybook/lib/storybook_web/storybook.ex`
- Create: `storybook/assets/js/storybook.js`
- Create: `storybook/assets/css/storybook.css`

- [ ] **Step 1: Create storybook/mix.exs**

```elixir
defmodule ExoUI.Storybook.MixProject do
  use Mix.Project

  def project do
    [
      app: :exo_ui_storybook,
      version: "0.1.0",
      elixir: "~> 1.18",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      aliases: aliases()
    ]
  end

  def application do
    [
      mod: {ExoUI.Storybook.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  defp deps do
    [
      {:exo_ui, path: ".."},
      {:phoenix, "~> 1.8"},
      {:phoenix_html, "~> 4.1"},
      {:phoenix_live_view, "~> 1.1"},
      {:phoenix_live_reload, "~> 1.5", only: :dev},
      {:phoenix_storybook, "~> 1.0"},
      {:esbuild, "~> 0.9", only: :dev},
      {:jason, "~> 1.4"},
      {:bandit, "~> 1.6"}
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "assets.setup", "assets.build"],
      "assets.setup": ["esbuild.install --if-missing"],
      "assets.build": ["esbuild storybook"]
    ]
  end
end
```

- [ ] **Step 2: Create storybook/config/config.exs**

```elixir
import Config

config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  pubsub_server: ExoUI.Storybook.PubSub,
  live_view: [signing_salt: "exo_storybook"]

config :esbuild,
  version: "0.24.2",
  storybook: [
    args: ~w(js/storybook.js --bundle --target=es2020 --outdir=../priv/static/assets),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => Path.expand("../../deps", __DIR__)}
  ]

config :phoenix_storybook, :gzip, false

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

import_config "#{config_env()}.exs"
```

- [ ] **Step 3: Create storybook/config/dev.exs**

```elixir
import Config

config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4100],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: String.duplicate("exo_storybook_dev_secret_key_", 3),
  watchers: [
    esbuild: {Esbuild, :install_and_run, [:storybook, ~w(--sourcemap=inline --watch)]}
  ]

config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/assets/.*(js|css)$",
      ~r"lib/storybook_web/.*(ex|heex)$",
      ~r"stories/.*(exs)$",
      ~r"../lib/.*(ex)$",
      ~r"../assets/css/.*(css)$"
    ]
  ]
```

- [ ] **Step 4: Create storybook/lib/storybook.ex (Application)**

```elixir
defmodule ExoUI.Storybook.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {Phoenix.PubSub, name: ExoUI.Storybook.PubSub},
      ExoUI.Storybook.Web.Endpoint
    ]

    opts = [strategy: :one_for_one, name: ExoUI.Storybook.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    ExoUI.Storybook.Web.Endpoint.config_change(changed, removed)
    :ok
  end
end
```

- [ ] **Step 5: Create storybook/lib/storybook_web.ex**

```elixir
defmodule ExoUI.Storybook.Web do
  def router do
    quote do
      use Phoenix.Router, helpers: false
      import Plug.Conn
      import Phoenix.Controller
      import Phoenix.LiveView.Router
    end
  end

  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
```

- [ ] **Step 6: Create storybook/lib/storybook_web/endpoint.ex**

```elixir
defmodule ExoUI.Storybook.Web.Endpoint do
  use Phoenix.Endpoint, otp_app: :exo_ui_storybook

  @session_options [
    store: :cookie,
    key: "_exo_storybook_key",
    signing_salt: "exo_storybook"
  ]

  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]],
    longpoll: false

  plug Plug.Static,
    at: "/",
    from: :exo_ui_storybook,
    gzip: false,
    only: ~w(assets)

  plug Plug.Static,
    at: "/exo",
    from: {:exo_ui, "priv/static"},
    gzip: false

  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId
  plug Plug.Parsers, parsers: [:urlencoded, :multipart, :json], json_decoder: Jason
  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug ExoUI.Storybook.Web.Router
end
```

- [ ] **Step 7: Create storybook/lib/storybook_web/router.ex**

```elixir
defmodule ExoUI.Storybook.Web.Router do
  use ExoUI.Storybook.Web, :router
  import PhoenixStorybook.Router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  scope "/" do
    storybook_assets()
  end

  scope "/", ExoUI.Storybook.Web do
    pipe_through :browser

    live_storybook "/",
      backend_module: ExoUI.Storybook.Web.StorybookConfig,
      live_socket_path: "/live"
  end
end
```

- [ ] **Step 8: Create storybook/lib/storybook_web/storybook.ex (backend config)**

```elixir
defmodule ExoUI.Storybook.Web.StorybookConfig do
  use PhoenixStorybook,
    otp_app: :exo_ui_storybook,
    content_path: Path.expand("../../stories", __DIR__),
    css_path: "/exo/exo.css",
    js_path: "/assets/storybook.js",
    sandbox_class: "exo-sandbox",
    title: "ExoUI",
    themes: [
      default: [name: "Light", dropdown_class: ""],
      dark: [name: "Dark", dropdown_class: ""]
    ],
    themes_strategies: [
      sandbox_class: fn theme ->
        case theme do
          :dark -> "exo-sandbox exo-dark"
          _ -> "exo-sandbox"
        end
      end
    ]
end
```

- [ ] **Step 9: Create storybook/assets/js/storybook.js**

```js
// storybook/assets/js/storybook.js
import { hooks as exoHooks } from "../../../assets/js/index.js"

window.storybook = {
  Hooks: exoHooks,
  Params: {},
  Uploaders: {}
}
```

- [ ] **Step 10: Create storybook/assets/css/storybook.css**

```css
/* storybook/assets/css/storybook.css */
/* Storybook sandbox styling — wraps component previews */
.exo-sandbox {
  font-family: var(--exo-font, system-ui, sans-serif);
  color: var(--exo-foreground);
  background: var(--exo-background);
  padding: 1rem;
}

/* Bridge Storybook theme class to ExoUI data-theme attribute */
.exo-sandbox.exo-dark {
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
```

- [ ] **Step 11: Install storybook deps**

```bash
cd /Users/miso/Developer/exo_ui/storybook
mise exec -- mix deps.get
```

Expected: Dependencies fetched.

- [ ] **Step 12: Commit**

```bash
cd /Users/miso/Developer/exo_ui
git add storybook/
git commit -m "feat: add Phoenix Storybook app"
```

---

### Task 7: Create Storybook Stories for Tokens

**Files:**
- Create: `storybook/stories/_root.index.exs`
- Create: `storybook/stories/welcome.story.exs`
- Create: `storybook/stories/tokens/_tokens.index.exs`
- Create: `storybook/stories/tokens/colors.story.exs`

- [ ] **Step 1: Create _root.index.exs**

```elixir
# storybook/stories/_root.index.exs
defmodule Storybook.Root do
  use PhoenixStorybook.Index

  def folder_name, do: "ExoUI"
end
```

- [ ] **Step 2: Create welcome.story.exs**

```elixir
# storybook/stories/welcome.story.exs
defmodule Storybook.Welcome do
  use PhoenixStorybook.Story, :page

  def doc do
    """
    ExoUI — Headless LiveView component library with default CSS theme.

    Browse components in the sidebar. Each component shows all variants,
    sizes, and states.
    """
  end

  def render(assigns) do
    ~H"""
    <div style="max-width: 600px; font-family: system-ui, sans-serif;">
      <h1>ExoUI</h1>
      <p>Headless LiveView components with CSS custom property theming.</p>
      <h2>Quick Start</h2>
      <pre><code>{:exo_ui, git: "..."}</code></pre>
      <pre><code>@import "../../deps/exo_ui/priv/static/exo.css";</code></pre>
    </div>
    """
  end
end
```

- [ ] **Step 3: Create tokens index**

```elixir
# storybook/stories/tokens/_tokens.index.exs
defmodule Storybook.Tokens do
  use PhoenixStorybook.Index

  def folder_name, do: "Design Tokens"
end
```

- [ ] **Step 4: Create colors.story.exs**

```elixir
# storybook/stories/tokens/colors.story.exs
defmodule Storybook.Tokens.Colors do
  use PhoenixStorybook.Story, :page

  def doc, do: "ExoUI color token palette"

  def render(assigns) do
    ~H"""
    <div style="font-family: system-ui; display: flex; flex-direction: column; gap: 2rem;">
      <section>
        <h2>Semantic Colors</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
          <.color_swatch name="Primary" bg="var(--exo-primary)" fg="var(--exo-primary-foreground)" />
          <.color_swatch name="Secondary" bg="var(--exo-secondary)" fg="var(--exo-secondary-foreground)" />
          <.color_swatch name="Danger" bg="var(--exo-danger)" fg="var(--exo-danger-foreground)" />
          <.color_swatch name="Warning" bg="var(--exo-warning)" fg="var(--exo-warning-foreground)" />
          <.color_swatch name="Success" bg="var(--exo-success)" fg="var(--exo-success-foreground)" />
          <.color_swatch name="Info" bg="var(--exo-info)" fg="var(--exo-info-foreground)" />
        </div>
      </section>
      <section>
        <h2>Surfaces</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
          <.color_swatch name="Background" bg="var(--exo-background)" fg="var(--exo-foreground)" />
          <.color_swatch name="Card" bg="var(--exo-card)" fg="var(--exo-card-foreground)" />
          <.color_swatch name="Muted" bg="var(--exo-muted)" fg="var(--exo-muted-foreground)" />
        </div>
      </section>
    </div>
    """
  end

  defp color_swatch(assigns) do
    ~H"""
    <div style={"background: #{@bg}; color: #{@fg}; padding: 1rem; border-radius: var(--exo-radius); border: 1px solid var(--exo-border);"}>
      <div style="font-weight: 600;"><%= @name %></div>
      <div style="font-size: 0.75rem; opacity: 0.8;">foreground text</div>
    </div>
    """
  end
end
```

- [ ] **Step 5: Verify storybook starts**

```bash
cd /Users/miso/Developer/exo_ui/storybook
mise exec -- mix setup
mise exec -- mix phx.server
```

Expected: Server starts on `http://localhost:4100`. Browser shows ExoUI storybook with welcome page and color token swatches.

- [ ] **Step 6: Commit**

```bash
cd /Users/miso/Developer/exo_ui
git add storybook/stories/
git commit -m "feat: add storybook token stories"
```

---

### Task 8: Add ExUnit Test Scaffold

**Files:**
- Create: `test/test_helper.exs`
- Create: `test/exo_ui_test.exs`

- [ ] **Step 1: Create test/test_helper.exs**

```elixir
ExUnit.start()
```

- [ ] **Step 2: Create test/exo_ui_test.exs**

```elixir
defmodule ExoUITest do
  use ExUnit.Case

  test "version returns string" do
    assert is_binary(ExoUI.version())
  end
end
```

- [ ] **Step 3: Run tests**

```bash
cd /Users/miso/Developer/exo_ui
mise exec -- mix test
```

Expected: 1 test, 0 failures.

- [ ] **Step 4: Verify strict compilation**

```bash
mise exec -- mix compile --warnings-as-errors
```

Expected: Zero warnings.

- [ ] **Step 5: Verify formatting**

```bash
mise exec -- mix format --check-formatted
```

Expected: All files formatted.

- [ ] **Step 6: Commit**

```bash
git add test/
git commit -m "feat: add test scaffold"
```

---

### Task 9: Tag v0.1.0-alpha

- [ ] **Step 1: Verify everything works end-to-end**

```bash
cd /Users/miso/Developer/exo_ui
mise exec -- mix test
mise exec -- mix compile --warnings-as-errors
npm run build:all
ls -la priv/static/
```

Expected: Tests pass, no warnings, both CSS files exist.

- [ ] **Step 2: Create git tag**

```bash
git tag v0.1.0-alpha
```

- [ ] **Step 3: Create GitHub repo and push**

```bash
gh repo create exo_ui --private --source=. --push
```

Or if repo already exists:

```bash
git remote add origin git@github.com:USERNAME/exo_ui.git
git push -u origin main
git push --tags
```

---

## Phase 1 Complete

After this plan, the repo has:
- Elixir project with `ExoUI` and `ExoUI.Components` modules
- CSS design tokens (light + dark theme) with oklch colors
- Lightning CSS build pipeline producing `priv/static/exo.css`
- Phoenix Storybook on port 4100 with token showcase stories
- JS hook export scaffold
- ExUnit test scaffold
- Git repo tagged `v0.1.0-alpha`

**Next:** Phase 2 — Core components (button, input, select, toggle, badge, form, separator, modal, confirm_modal)
