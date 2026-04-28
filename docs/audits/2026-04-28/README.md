# ExoUI Deep Audit — Master Report

**Date:** 2026-04-28
**Repo SHA:** f602b4e056ef2b6fb5c6e14faa44acec3793760e
**Auditor:** Claude Opus 4.7 (orchestrator + 11 parallel subagents)
**Method:** Static analysis of `lib/`, `assets/`, `test/`, `storybook/`, `priv/static/` against the prompt at `docs/audits/exo-ui-project-audit.md`. Mix toolchain (Hex on OTP 28) was broken at audit time — `mix test` and `mix compile` were unavailable. CSS bundling (`bun run build:all`) succeeded.

## Verification baseline

| Step | Command | Result |
| --- | --- | --- |
| Compile | `mix compile --warnings-as-errors` | 🔴 BLOCKED — `Hex.Repo.build_hex_core_config/3` fails to load on Erlang/OTP 28; environment, not code |
| Format | `mix format --check-formatted` | ⚪ not run (same blocker) |
| Tests (Elixir) | `mix test` | ⚪ not run (same blocker) |
| Browser tests | `bun run test:browser` | ⚪ not exercised in this audit (server requires `mix phx.server` for storybook) |
| CSS build | `bun run build:all` | 🟢 PASS — produces `priv/static/exo.css` (79141 B, single-line minified, 602 rules, 260 unique `data-exo` selectors) |
| Token build | (lightningcss) | 🟢 PASS — `priv/static/exo.tokens.css` (1867 B) |

> Per-category audits (`01-core`, `04-data-display`, `05-feedback`, `07-layouts`) wrote that `priv/static/exo.css` is **0 bytes**. That claim is incorrect — the file is 79141 bytes; `wc -l` returns `0` only because the bundle is minified to a single line. Treat the CSS cross-cutting report as authoritative on bundle size.

## Executive summary

ExoUI ships a broad, ambitious surface (60+ components across 7 categories) with a coherent token system, a clean public façade (`ExoUI.Components` re-exports via `defdelegate`), and several genuinely solid pieces — popover composition, the new shared `ExoOverlay` hook, menubar keyboard nav, command palette filtering, chart math (Decimal support, range-collapse guards). But the library is **not yet production-quality** as a `shadcn`/`daisyUI` peer:

- **Accessibility is the worst dimension** (29 🔴 / 32 🟡 / 11 🟢 across 7 categories) — no `aria-invalid`/`aria-describedby` anywhere in forms, dialogs claim `aria-modal` without `inert`, charts ship zero ARIA, `tabs/1` is not a tabs widget, sidebar shell uses a `<label role="button">` checkbox-hack.
- **Eight components ship no CSS at all** — `navbar`, `footer`, `bottom_nav`, `indicator`, `swap`, `hero`, `chat_bubble`, `radial_progress`. The HEEx renders, the data-attrs are emitted, the styling is absent.
- **Zero `prefers-reduced-motion` rules** exist anywhere in `assets/css/src/` despite ~40 transitions/animations.
- **Storybook introspection is broken** in all 11 `:component`-mode stories — `function:` points at `defdelegate` shims, so attribute panels are empty. The other 71 stories are `:page` mode (handcrafted markup, no playground).
- **Mix toolchain is broken on this machine** (Hex/OTP 28); fix Hex/rebar before any further verification.

## Category scorecard

| # | Category | Score | Maturity | Public fns | Headline failure |
| --- | --- | --- | --- | --- | --- |
| 01 | Core components | 🔴 critical | ~35% | 17 | 5 components have no CSS; `icon/1` raises on typos; `button/1` has no `type="button"` default |
| 02 | Form components | 🟡 problems | ~55% | 11 | Zero `aria-invalid`/`aria-describedby`; `toggle` has no `role="switch"`; slider/date_picker/rating/file_input ignore `Phoenix.HTML.FormField` |
| 03 | Overlay & menu | 🟡 problems | ~70% | 13 | Dialogs never `inert` outside content; `command_palette` has no focus trap or restore; `show_modal/1` is private |
| 04 | Data display & nav | 🔴 critical | ~35% | 15 | `tabs/1` is not a real tabs widget; pagination disabled = `<span>`; hero/chat-bubble have no CSS; zero browser tests |
| 05 | Feedback | 🔴 critical | ~30% | 6 | Every flash/toast/alert is hardcoded `role="alert"`; `radial_progress` has no CSS; no auto-dismiss/pause-on-hover; missing `alert_test`/`toast_container_test` |
| 06 | Charts | 🟡 problems | ~45% | 18 | Zero accessibility (no `role="img"`, no `aria-label`); `data-exo="progress-bar"` collides with feedback; `h-bar-chart` selector mismatch |
| 07 | Layouts & app shell | 🔴 critical | ~25% | 2 | Only `sidebar_layout`+`sidebar_item`; checkbox-hack collapse; `localStorage` uncaught; no skip link, no nav groups, no app shell |

## Top 15 critical findings

P0 = blocks adoption / breaks public API / accessibility crisis. P1 = significant defect.

| # | Finding | Severity | Locations |
| --- | --- | --- | --- |
| 1 | Eight components emit `data-exo` attributes with no CSS source — `navbar`, `footer`, `bottom_nav`, `indicator`, `swap`, `hero`, `chat_bubble`, `radial_progress`, plus `toast.css` is missing | P0 | `assets/css/src/components/` (absent files); `priv/static/exo.css` confirms via `grep -o 'data-exo=[^]]*'` |
| 2 | Forms emit zero `aria-invalid`, zero `aria-describedby`, zero stable description/error IDs across every input | P0 | `lib/exo_ui/components/form.ex:107-516` |
| 3 | Dialogs (`modal`, `sheet`, `drawer`, `command_palette`) set `aria-modal="true"` but never `inert` outside content | P0 | `lib/exo_ui/components/overlay.ex:39, 400, 471, 626`; focus trap is JS-only at `assets/js/hooks/overlay.js:139-162` |
| 4 | `command_palette` has no focus trap and no focus restore; registers a page-global `Cmd+K` listener with no opt-out | P0 | `assets/js/hooks/command_palette.js:55-67, 80` |
| 5 | Zero `@media (prefers-reduced-motion: reduce)` rules across ~40 animated surfaces | P0 | `assets/css/src/**` (none); `assets/js/hooks/carousel.js:24-32` `behavior:"smooth"` unconditional |
| 6 | `tabs/1` is not an ARIA tabs widget — no `tabpanel`, no `aria-controls`, no roving tabindex, no arrow keys | P0 | `lib/exo_ui/components/data_display.ex:250-279` |
| 7 | `swap/1` is keyboard-inaccessible — checkbox is `tabindex="-1" aria-hidden="true"` and there is no JS hook | P0 | `lib/exo_ui/components/core.ex:354-364` |
| 8 | `localStorage.set/getItem` calls are uncaught — Safari private mode crashes the hook on mount, killing LiveSocket | P0 | `assets/js/hooks/sidebar.js:22, 42`; `assets/js/hooks/theme_toggle.js:11, 24` |
| 9 | Toggle has no `role="switch"`/`aria-checked`; screen readers see a checkbox, not a switch | P0 | `lib/exo_ui/components/form.ex:203, 222` |
| 10 | `button/1` has no `type="button"` default — buttons inside a `<form>` submit on Enter; link variant ignores `disabled` | P0 | `lib/exo_ui/components/core.ex:18-42` |
| 11 | Charts ship zero accessibility metadata — 18 chart fns across 1645 LOC with no `role="img"`, no `aria-label`, no `<title>`/`<desc>`, no `:rest` global | P0 | `lib/exo_ui/charts/{cartesian,radial,primitives}.ex` |
| 12 | Pagination disabled buttons render as `<span aria-disabled>` — drops out of focus order vs surrounding links | P0 | `lib/exo_ui/components/data_display.ex:320-322, 348-350` |
| 13 | Sidebar shell uses checkbox-hack with `<label role="button">`; no `aria-expanded`, no Escape, no mobile focus trap, no skip link | P0 | `lib/exo_ui/layouts.ex:42-50, 49` |
| 14 | All 11 `:component` storybook stories point `function:` at `defdelegate` shims — attribute introspection is empty | P0 | `storybook/stories/components/{button,badge,separator,skeleton,input,toggle,slider,modal,tabs,alert,progress}.story.exs:4` |
| 15 | Selector mismatch: `cartesian.ex:162` emits `data-exo="h-bar-chart"`, `charts.css:73` selects `[data-exo="horizontal-bar-chart"]` — horizontal bar charts inherit no styling | P1 | `lib/exo_ui/charts/cartesian.ex:162` vs `assets/css/src/components/charts.css:73` |

## Cross-cutting summaries

### Accessibility (`cross-cutting-accessibility.md`) — 🔴 critical

29 🔴 / 32 🟡 / 11 🟢. Eight recurring patterns: form ARIA wiring absent, dialogs claim modality without `inert`, no reduced-motion guards, charts have no `role="img"`, misuse of `role="alert"` for non-urgent feedback, decorative SVGs leak into AT name computation, tabindex misuse (disabled controls dropped from tab order, redundant tab stops, swap is keyboard-inaccessible), live regions absent from async/dismiss surfaces. Single highest-leverage fix: introduce a `field/1` helper that owns stable IDs + `aria-invalid` + `aria-describedby`, refactor every form control to compose it.

### JS hooks (`cross-cutting-js-hooks.md`) — 🟡 problems

16 hooks audited. Lifecycle hygiene is good (every hook removes what it adds in `destroyed()`/`_unbind()`). Four cross-cutting failures: (1) uncaught `localStorage` in `sidebar.js`/`theme_toggle.js`, (2) `command_palette.js:80` registers a page-global `Cmd+K` with no opt-out, (3) `overlay.js` traps focus in JS only — no outside `inert`, (4) `tabs`/`swap`/`toast` are interactive surfaces with no hook at all. Minor: `popover.js:_findControl` mutates inner role/tabindex non-idempotently on `updated()`; `accordion`/`carousel`/`theme_toggle` predate the `_bind`/`_unbind` re-entry pattern.

### CSS architecture (`cross-cutting-css.md`)

Bundle is fresh (79141 B). Eight components have no CSS source. 60+ orphan `data-exo` attributes have no rule in the build. `data-exo="progress-bar"` is double-claimed by feedback `progress/1` and chart `progress_bar/1` — load order silently picks the winner. Token namespaces missing: `--exo-chart-*`, `--exo-overlay-backdrop`, `--exo-topbar-height`, `--exo-rating-active`. `carousel.css:46` references undefined `--exo-accent`. `rating.css:25, 33` hardcode `#f59e0b`. Backdrops use three different syntaxes across `modal/drawer/sheet/sidebar/command-palette`. Zero logical properties (`*-inline-*`) — RTL is broken. Zero per-component dark overrides beyond `themes/dark.css`.

### Storybook & docs (`cross-cutting-storybook-docs.md`)

83 stories total (82 components + 1 layout). Only 11 use `:component` mode and all 11 break introspection by referencing `defdelegate` shims. The other 71 are `:page` mode — handcrafted markup, no attribute matrix. State coverage gaps: dark mode and mobile viewports absent everywhere, RTL never demonstrated, `to_form/2`+`FormField` shown in exactly one story (`form.story.exs:11`). The capture script hardcodes `/components/` and skips `/layouts/`. README and CHANGELOG disagree on browser-test coverage (README:273 lists 5 hooks, CHANGELOG:11–12 lists 7). `lib/exo_ui/components.ex:39` deprecates `input/1` wholesale when only the `type="select"` subtype was migrated.

## Quick wins (low effort, high impact)

1. Default `<button type="button">` in `button/1` (`core.ex:18-42`) — one line, fixes accidental form submit.
2. Add `aria-hidden="true"` default in the Lucide icon template (`lucide.ex:3324-3338`) — silences AT for ~1700 decorative icons.
3. Wrap `localStorage.{get,set}Item` in `try/catch` in `sidebar.js`/`theme_toggle.js` — unblocks Safari private mode.
4. Add a single global reduced-motion rule in `tokens.css` (`@media (prefers-reduced-motion) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`) — covers ~40 animated surfaces.
5. Branch `role` on flash/toast/alert kind in `feedback.ex:28, 91, 119` — `:error` → `alert`, others → `status`.
6. Fix `data-exo="h-bar-chart"` → `"horizontal-bar-chart"` in `cartesian.ex:162` — restores horizontal bar styling.
7. Add `:rest, :global` and `role="img"`+`aria-label` attrs to every chart function — opens the surface to consumer ARIA.
8. Repoint the 11 `:component` storybook stories at `Components.{Core,Form,Overlay,DataDisplay,Feedback}.fn/1` — restores attribute introspection without an API change.
9. Drop `tabindex="-1" aria-hidden="true"` from the `swap` checkbox (`core.ex:359-360`); ship `swap.css` with `:checked` selectors.
10. Mount `ExoOverlay` on `command_palette` — single contract instead of bespoke focus handling.

## Strategic recommendations (medium-term)

1. **Introduce `Components.Form.field/1`** — the helper that owns stable `#{id}-description`/`#{id}-error` IDs, `aria-invalid`, `aria-describedby`, `aria-required`. Refactor `input/1`, `select/1`, `combobox/1`, `radio_group/1`, `slider/1`, `date_picker/1`, `rating/1`, `file_input/1`, `toggle/1` to compose it. This single change closes most of the form-ARIA findings.
2. **Promote `show_modal/1` and friends to public + audit the dialog contract** — every dialog (`modal`, `confirm_modal`, `drawer`, `sheet`, `command_palette`) should mount `ExoOverlay`, set outside `inert`, require a title (or auto-render an SR-only `<h2>`), and restore focus to the activator on close.
3. **Ship the eight missing CSS files** — `navbar.css`, `footer.css`, `bottom-nav.css`, `indicator.css`, `swap.css`, `hero.css`, `chat-bubble.css`, `radial-progress.css`, plus `toast.css`. Until then, those components are vapor.
4. **Rebuild `tabs/1` against the WAI-ARIA APG tabs pattern** — `role="tab"`/`role="tabpanel"`, `aria-controls`, roving tabindex, arrow keys, `aria-selected` mirroring; ship `ExoTabs` hook.
5. **Charts: a11y + token namespace** — add `attr :title`, `attr :description`, `attr :rest, :global` and emit `role="img"` + `<title>`/`<desc>`. Introduce `--exo-chart-1..5`, `--exo-chart-grid`, `--exo-chart-axis`, `--exo-chart-tooltip-bg`. Resolve the `progress-bar` collision by renaming the chart primitive to `chart-progress-bar`.
6. **App shell completeness** — add `app_shell/1`, `topbar/1`, `nav_group/1`, `skip_link/1`, swap the checkbox-hack for `details`/`<dialog>` semantics, ship a real mobile drawer with focus trap.
7. **Storybook overhaul** — migrate the 71 `:page` stories to `:component` mode where attrs exist; add dark/mobile/RTL/long-text/reduced-motion variations via a shared `_root.index.exs` viewport+theme switcher; have one canonical `to_form/2`+`FormField` example per form control.
8. **Fix the Hex/OTP 28 toolchain** before publishing 0.2.0 — `mix compile`/`mix test`/`mix dialyzer` cannot run today.

## What is solid (do not break)

- Token system in `tokens.css` (OKLCH, light/dark/sandbox split, semantic naming).
- Public-façade discipline — every component flows through `ExoUI.Components.{fn}/1` `defdelegate`.
- Native Popover API + CSS anchor positioning for `popover`/`dropdown_menu`/`tooltip`.
- Trigger-composition pattern in `popover.js`/`dropdown_menu.js` (anchor wrapper + `_findControl`).
- Menubar keyboard navigation (`menubar.js`, full WAI-ARIA contract).
- Chart math: Decimal support (`shared.ex:9`), `safe_max/1` clamps zero (`helpers.ex:65-67`), empty-state branch in every cartesian variant.
- Lifecycle hygiene across hooks — paired `addEventListener`/`removeEventListener` everywhere.
- Element/data-attribute consistency — every component emits a stable `data-exo` root.

## Open questions

1. Is the Hex/OTP 28 breakage local to the auditor's machine or reproducible in CI? If the latter, version pin `:hex` or downgrade Erlang in `mix.exs`.
2. Does the project intend to support SSR-only consumers (no LiveView)? If yes, the "tabindex/role applied client-side" pattern in `command_palette`/`context_menu`/`menubar`/`popover` needs to move into HEEx.
3. Is RTL a v1 commitment? If yes, every margin/padding/positional rule needs to migrate to logical properties before 0.2.0.
4. Should `Charts` ship as a separate package (`exo_ui_charts`) given its 1645 LOC and the `progress-bar` selector collision?

## Index of all reports

| File | Score | Maturity |
| --- | --- | --- |
| [01-core-components.md](./01-core-components.md) | 🔴 | ~35% |
| [02-form-components.md](./02-form-components.md) | 🟡 | ~55% |
| [03-overlay-and-menu.md](./03-overlay-and-menu.md) | 🟡 | ~70% |
| [04-data-display-and-navigation.md](./04-data-display-and-navigation.md) | 🔴 | ~35% |
| [05-feedback.md](./05-feedback.md) | 🔴 | ~30% |
| [06-charts.md](./06-charts.md) | 🟡 | ~45% |
| [07-layouts-and-app-shell.md](./07-layouts-and-app-shell.md) | 🔴 | ~25% |
| [cross-cutting-accessibility.md](./cross-cutting-accessibility.md) | 🔴 | — |
| [cross-cutting-js-hooks.md](./cross-cutting-js-hooks.md) | 🟡 | — |
| [cross-cutting-css.md](./cross-cutting-css.md) | 🟡 | — |
| [cross-cutting-storybook-docs.md](./cross-cutting-storybook-docs.md) | 🟡 | — |
