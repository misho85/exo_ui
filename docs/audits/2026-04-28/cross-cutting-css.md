# Cross-Cutting CSS Architecture & Tokens Audit

**Date:** 2026-04-28
**Scope:** `assets/css/**`, `priv/static/exo*.css`, all 49 component CSS files, layouts CSS, dark theme.
**Verdict:** The CSS layer is functional but riddled with dead selectors, missing component stylesheets, hardcoded colors, zero motion-safety, and zero RTL support. Tokens are partially applied: critical namespaces (charts, overlay backdrops, ratings) do not exist.

## TL;DR

1. Eight emitted components ship **no CSS at all** (`navbar`, `footer`, `bottom-nav`, `indicator`, `swap`, `hero`, `chat-bubble`, `radial-progress`); 60+ orphan `data-exo` attributes have zero rules in the built bundle.
2. `cartesian.ex:162` emits `data-exo="h-bar-chart"` but `charts.css:73` selects `[data-exo="horizontal-bar-chart"]` — horizontal bar charts inherit no font/color tokens.
3. `data-exo="progress-bar"` is **double-claimed** by `feedback.ex:153` (progress fill) and `charts/primitives.ex:134` (chart root) — CSS load order silently decides the winner.
4. Zero `prefers-reduced-motion` guards, zero logical properties (`*-inline-*`), zero per-component dark overrides — RTL is broken, motion-sensitive users get unguarded transitions everywhere.
5. Token namespaces missing: `--exo-chart-*`, `--exo-overlay-backdrop`, `--exo-topbar-height`, `--exo-rating-active`. `carousel.css:46` references undefined `--exo-accent`. Backdrops hardcode three different syntaxes across `modal/drawer/sheet/sidebar/command-palette`.

## Build output verification

| Artifact | Path | Size | Lines | Status |
|---|---|---|---|---|
| Bundled CSS | `priv/static/exo.css` | 79141 B | 1 (minified) | 🟢 fresh, 602 rules, 260 unique `data-exo` selectors |
| Token shim | `priv/static/exo.tokens.css` | 1867 B | 1 (minified) | 🟢 fresh |
| Source root | `assets/css/exo.css` | — | 53 | 🟢 imports tokens + dark + 49 component files + 1 layout |

Per-category audits (`01-core`, `02-form`, etc.) repeatedly claim `exo.css` is `0 bytes`. **That is wrong.** `wc -l` reports `0` because the bundle is single-line minified; `wc -c` and `stat` confirm 79141 bytes. Every category report containing the "0 bytes" claim should be corrected.

## Import graph

`assets/css/exo.css` imports in this order:

1. `./src/tokens.css`
2. `./src/themes/dark.css`
3. 49 component files alphabetical (`accordion` → `wizard`)
4. `./src/layouts/sidebar.css`

**Not imported, not present:** `navbar.css`, `footer.css`, `bottom-nav.css`, `indicator.css`, `swap.css`, `hero.css`, `chat-bubble.css`, `radial-progress.css`, `toast.css`. Source files for these components do not exist. Cascade order is therefore: tokens → dark theme → components alphabetically → sidebar layout. Sidebar last is correct (it must override component defaults inside the sidebar shell).

## Component CSS coverage

49 CSS source files for 57 component modules in `lib/exo_ui/components/`. The following modules emit `data-exo` attributes but have **no matching CSS source file**:

| Module | data-exo emitted | CSS source | Selector in build? |
|---|---|---|---|
| `navigation.ex` `navbar*` | `navbar`, `navbar-brand`, `navbar-menu`, `navbar-link` | none | 🔴 no |
| `navigation.ex` `footer*` | `footer`, `footer-section`, `footer-heading`, `footer-link`, `footer-bottom` | none | 🔴 no |
| `navigation.ex` `bottom-nav*` | `bottom-nav`, `bottom-nav-item`, `bottom-nav-icon`, `bottom-nav-label` | none | 🔴 no |
| `feedback.ex` `indicator*` | `indicator`, `indicator-item` | none | 🔴 no |
| `interactive.ex` `swap*` | `swap`, `swap-input`, `swap-on`, `swap-off` | none | 🔴 no |
| `layout.ex` `hero*` | `hero`, `hero-content`, `hero-title`, `hero-subtitle`, `hero-cta` | none | 🔴 no |
| `chat.ex` `chat-bubble*` | `chat-bubble`, `chat-bubble-avatar`, `chat-bubble-header`, `chat-bubble-message`, `chat-bubble-footer`, `chat-bubble-time` | none | 🔴 no |
| `feedback.ex` `radial-progress*` | `radial-progress`, `radial-progress-track`, `radial-progress-fill`, `radial-progress-value` | none | 🔴 no |

These render with **no exo styling whatsoever** — they rely on whatever Tailwind utility classes the consumer applies, contradicting the library's promise of unstyled-but-themed primitives.

### Orphan `data-exo` attributes (60+)

Modules with partial CSS coverage emit child attributes that the bundle never selects:

- `card-action` (`card.ex:138`) — no rule in `card.css`
- `combobox-spinner`, `combobox-create-query` — no rule in `combobox.css`
- `context-menu-trigger`, `dropdown-trigger` — no rule (only the surface is styled)
- `header-text` (`header.ex`) — no rule in `header.css`
- `sidebar-icon` — no rule in `sidebar.css`
- `rating-value` (`feedback.ex`) — no rule in `rating.css`
- `avatar-initials` — no rule in `avatar.css`
- `alert-action`, `alert-content` — no rule in `alert.css`
- `area-chart-stacked`, `bar-chart-label`, `bar-chart-multiple`, `bar-chart-negative`, `line-chart`, `line-chart-multiple`, `donut-chart`, `donut-chart-text`, `pie-chart`, `radar-chart`, `radial-chart` — no rules in `charts.css`
- `collapsible-body` — no rule in `collapsible.css`
- `select` root — no rule in `select.css` (only `select-trigger`/`select-content`)
- `toast-content`, `flash-content` — no rule in `flash.css`

### Selector mismatches (CSS source vs Elixir output)

| Elixir emits | CSS source selects | Result |
|---|---|---|
| `data-exo="h-bar-chart"` (`cartesian.ex:162`) | `[data-exo="horizontal-bar-chart"]` (`charts.css:73`) | 🔴 dead selector, dead emit |

Single confirmed mismatch — but it kills horizontal bar chart styling entirely.

### Selector collisions

| Selector | Emitter A | Emitter B | CSS A | CSS B |
|---|---|---|---|---|
| `data-exo="progress-bar"` | `feedback.ex:153` (progress fill) | `charts/primitives.ex:134` (chart root) | `progress.css` | `charts.css` |

Same attribute, two different semantic roles, two CSS files write conflicting rules. Whichever loads later wins. Lightningcss alphabetises imports, so `charts.css` < `progress.css` — progress bar styling overrides chart progress bar. Either rename one (`progress-fill`, `chart-progress`) or scope under a parent attribute.

## Tokens

`assets/css/src/tokens.css` (66 lines) defines:

- **Surfaces:** `--exo-background`, `-foreground`, `-muted`, `-muted-foreground`, `-card`, `-card-foreground`, `-popover`, `-popover-foreground`
- **Semantic:** `-primary`, `-secondary`, `-danger`, `-warning`, `-success`, `-info` (each with `-foreground`)
- **Borders/inputs:** `-border`, `-input`, `-ring`
- **Tooltip:** `-tooltip-bg`, `-tooltip-fg`
- **Radius:** `-radius`
- **Spacing:** `-space-1`, `-space-2`, `-space-3`, `-space-4`, `-space-6`, `-space-8` (🟡 missing 5, 7)
- **Typography:** `-font`, `-font-mono`, `-text-xs`, `-text-sm`, `-text-base`, `-text-lg`, `-text-xl`, `-text-2xl`
- **Shadows:** `-shadow-sm`, `-shadow-md`, `-shadow-lg`
- **Motion:** `-duration`, `-easing`

### Missing token namespaces

| Namespace | Used in | Status |
|---|---|---|
| `--exo-chart-1..5` | charts (currently hardcode HSL in stories) | 🔴 absent |
| `--exo-overlay-backdrop` | modal, drawer, sheet, command-palette, sidebar mobile | 🔴 absent |
| `--exo-overlay-shadow` | hover-card, context-menu, menubar, popover, command-palette, sheet | 🔴 absent |
| `--exo-topbar-height` | sidebar layout (hardcodes `4rem` at lines 28, 100) | 🔴 absent |
| `--exo-rating-active` | rating component (hardcodes `#f59e0b`) | 🔴 absent |
| `--exo-accent` | referenced in `carousel.css:46` | 🔴 broken — never defined |

### Hardcoded colors (file:line)

| File | Line | Value | Context |
|---|---|---|---|
| `command-palette.css` | 15 | `rgb(0 0 0 / 0.5)` | backdrop |
| `command-palette.css` | 28 | `rgb(0 0 0 / 0.25)` | shadow |
| `sheet.css` | 16 | `rgb(0 0 0 / 0.5)` | backdrop |
| `sheet.css` | 25 | `rgb(0 0 0 / 0.25)` | shadow |
| `hover-card.css` | 20 | `rgb(0 0 0 / 0.1)` | shadow |
| `context-menu.css` | 14 | `rgb(0 0 0 / 0.1)` | shadow |
| `carousel.css` | 37 | `rgb(0 0 0 / 0.1)` | shadow |
| `menubar.css` | 47 | `rgb(0 0 0 / 0.1)` | shadow |
| `rating.css` | 25 | `#f59e0b` | active star color |
| `rating.css` | 33 | `#f59e0b` | hover star color |
| `drawer.css` | 15 | `oklch(0% 0 0 / 0.5)` | backdrop |
| `modal.css` | 17 | `oklch(0% 0 0 / 0.4)` | backdrop |
| `layouts/sidebar.css` | 177 | `oklch(0% 0 0 / 0.4)` | mobile scrim |

Three different syntaxes for "translucent black backdrop" across overlays. Pick one (`--exo-overlay-backdrop`), define it in tokens, swap dark variant in `themes/dark.css`.

## Dark mode parity

`assets/css/src/themes/dark.css` (31 lines) overrides ~10 root tokens via `[data-theme="dark"]`. **Zero per-component dark rules anywhere.** Components rely entirely on the token cascade.

This is *fine in principle* but breaks for every hardcoded color above: backdrops at `rgb(0 0 0 / 0.5)` look correct on light but lack a dark-specific opacity bump; shadows at `rgb(0 0 0 / 0.1)` are nearly invisible on dark cards. No component re-declares for `[data-theme="dark"]` to compensate.

Also untested: there is **no automated visual diff** ensuring dark theme renders. The only validation is "tokens swap, hope for the best".

## Reduced motion

`grep -r "prefers-reduced-motion" assets/css/` → **0 matches.**

Components with transitions/animations:
- `accordion.css` (height transition)
- `collapsible.css`, `drawer.css`, `sheet.css`, `modal.css`, `command-palette.css`, `popover.css`, `hover-card.css`, `context-menu.css`, `dropdown.css`, `menubar.css`, `tooltip.css` (overlay open/close)
- `skeleton.css` (pulse animation)
- `spinner.css` (rotation animation)
- `progress.css` (indeterminate animation)
- `carousel.css`, `tabs.css` (slide transitions)
- `layouts/sidebar.css:226-229` (mobile drawer transition)

Every one of these violates WCAG 2.3.3. Wrap in `@media (prefers-reduced-motion: reduce) { ... transition: none; animation: none; }`.

## `!important` inventory

`grep -rn "!important" assets/css/` → **0 matches.**

🟢 The `:where()` zero-specificity strategy is honoured everywhere. Consumer overrides via Tailwind utilities or scoped CSS will always win.

## Selector specificity

All component rules use `:where([data-exo="..."])` (specificity 0,0,0). Verified by random sampling of `accordion.css`, `button.css`, `modal.css`, `charts.css`. 🟢

Layouts are an exception: `layouts/sidebar.css` uses bare `[data-exo="..."]` (specificity 0,1,0). Justified — layouts must beat component defaults inside their shell — but undocumented. Add a `/* layout: specificity 0,1,0 intentional */` comment.

## Dead CSS / orphan selectors

CSS source rules whose selector never matches any Elixir-emitted attribute:

| Selector | File:line | Reason |
|---|---|---|
| `[data-exo="horizontal-bar-chart"]` | `charts.css:73` | mismatch with `h-bar-chart` |
| `[data-exo="theme-toggle-icon"]` | `theme-toggle.css` | not emitted (verify) |

Sweep with `comm -23 <(css_selectors) <(elixir_emits)` after the `h-bar-chart` rename to find more.

## Layouts CSS

`assets/css/src/layouts/sidebar.css` (231 lines):

- 🔴 Line 28, 100 hardcode `4rem` topbar height — extract to `--exo-topbar-height`.
- 🔴 Line 177 hardcodes `oklch(0% 0 0 / 0.4)` mobile scrim — share `--exo-overlay-backdrop`.
- 🔴 Lines 226-229 transition with no reduced-motion guard.
- 🟡 Specificity 0,1,0 (no `:where()` wrapper) — intentional but undocumented.
- 🟡 Physical properties (`left`, `right`, `padding-left`) throughout — RTL broken.

No `app-shell.css`, no `topbar.css`, no `dashboard.css`. Sidebar is the only layout shipped. The `07-layouts-and-app-shell.md` audit confirms this matches the Elixir surface.

## RTL / logical properties

`grep -rE "(margin|padding|inset)-inline" assets/css/` → **0 matches.**

Every component using directional spacing (`margin-left`, `padding-right`, `left:`, `right:`) breaks under `dir="rtl"`. Affected files (non-exhaustive): `tooltip.css`, `popover.css`, `accordion.css`, `wizard.css`, `hover-card.css`, `file-input.css`, `card.css`, `charts.css`, `empty-state.css`, `radio.css`, `date-picker.css`, `breadcrumb.css`, `pagination.css`, `steps.css`, `timeline.css`. Wholesale migration to `margin-inline-*`, `padding-inline-*`, `inset-inline-*` is the only fix.

## Top 10 critical issues

1. **8 components ship no CSS** (`navbar`, `footer`, `bottom-nav`, `indicator`, `swap`, `hero`, `chat-bubble`, `radial-progress`). Add stylesheets or document them as headless.
2. **`h-bar-chart` selector mismatch** (`cartesian.ex:162` vs `charts.css:73`). Rename one to match.
3. **`progress-bar` collision** between feedback and charts surfaces. Rename one of the two emitters.
4. **Zero `prefers-reduced-motion` guards** across 50 CSS files. Add a shared reduced-motion mixin.
5. **Zero logical properties** — RTL fundamentally broken. Migrate all directional rules.
6. **Hardcoded backdrops/shadows** in 9 files using 3 different syntaxes. Define `--exo-overlay-backdrop`, `--exo-overlay-shadow`.
7. **Hardcoded `#f59e0b` in `rating.css:25,33`**. Define `--exo-rating-active`.
8. **`carousel.css:46` references undefined `--exo-accent`**. Either define the token or remove the reference.
9. **No `--exo-chart-*` token namespace.** Charts cannot be themed; storybook hardcodes HSL.
10. **60+ orphan `data-exo` attributes** in built bundle. Either add CSS rules or stop emitting them.

## Quick wins (≤1 day each)

- Rename `h-bar-chart` → `horizontal-bar-chart` in `cartesian.ex:162`. (15 min)
- Rename chart `progress-bar` → `chart-progress` in `charts/primitives.ex:134` + update `charts.css`. (30 min)
- Define `--exo-overlay-backdrop`, `--exo-overlay-shadow`, `--exo-rating-active`, `--exo-topbar-height` in `tokens.css`; replace 13 hardcoded values. (2 h)
- Fix `--exo-accent` reference in `carousel.css:46` (define or remove). (5 min)
- Add `--exo-space-5`, `--exo-space-7` for completeness. (5 min)
- Document layout specificity exception with a comment in `layouts/sidebar.css`. (5 min)
- Delete `[data-exo="horizontal-bar-chart"]` after rename or alternatively keep both for a deprecation cycle. (15 min)

## Strategic recommendations

1. **Reduced motion shared partial.** Create `assets/css/src/_motion.css` with `@media (prefers-reduced-motion: reduce) { :where([data-exo]) { transition: none !important; animation: none !important; } }` (sole acceptable `!important` use) and `@import` it after components.
2. **RTL migration.** Mechanical sweep replacing `margin-left/right`, `padding-left/right`, `left/right`, `text-align: left/right` with logical equivalents. Add a Storybook RTL toggle to verify.
3. **Build-time selector audit.** Add a mix task that diffs Elixir-emitted `data-exo` values against bundled selectors and fails CI on orphans/mismatches. Would have caught `h-bar-chart` instantly.
4. **Add dark-mode visual regression.** Even a Storybook screenshot-diff loop would catch the invisible-shadow problem on dark backgrounds.
5. **Decide: headless or styled?** The 8 zero-CSS components are an unstated headless tier. Either add stylesheets to match library promise, or document the headless contract explicitly so consumers know what to expect.

## Open questions

- Are the 8 component groups without CSS (`navbar`, `footer`, etc.) intentionally headless, or did the CSS layer never get written? Affects whether to add stylesheets or update documentation.
- Should `--exo-chart-*` follow the shadcn convention (`--chart-1` → `--chart-5`) or use semantic names (`--exo-chart-primary`, `--exo-chart-positive`)?
- Is RTL a stated goal? If so, a sweep is mandatory; if not, it should be explicit in the README.
- Layouts beyond sidebar (topbar-only, dashboard, marketing) — planned, deferred, or out of scope?
