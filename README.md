# ExoUI

Headless Phoenix LiveView component library with a default CSS theme.

## Installation

Add to your `mix.exs`:

```elixir
{:exo_ui, git: "git@github.com:USERNAME/exo_ui.git", tag: "v0.1.0"}
```

Import CSS in your `assets/css/app.css`:

```css
@import "../../deps/exo_ui/priv/static/exo.css";
```

Import hooks in your `assets/js/app.js`:

```js
import { hooks as exoHooks } from "../../deps/exo_ui/assets/js/index.js"
```
