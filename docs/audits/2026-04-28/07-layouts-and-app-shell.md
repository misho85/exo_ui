# Audit: Layouts & app shell

**Date:** 2026-04-28
**Auditor:** Claude Opus 4.7 (subagent)
**Score:** 🔴 critical
**Maturity:** ~25% (vs shadcn `sidebar` block + daisyUI `drawer`)

## TL;DR

`ExoUI.Layouts` ships exactly two functions — `sidebar_layout/1` and
`sidebar_item/1` — and that is the entire "app shell" surface. The shell uses
the classic CSS-only checkbox-hack with `<label role="button">` to drive
collapse, which is a known anti-pattern: roles lie, no `aria-expanded`, no real
keyboard activation, no focus management when the mobile drawer opens. The
sidebar item is hardcoded to `<.link navigate={...}>` — no `patch`, no
`href`-only mode, no `aria-current`, and the `icon` prop is a raw string
interpolated as text (no `ExoUI.Lucide` integration). There is no skip link, no
page-title slot, no nav-group primitive, and zero browser tests; the
`sidebar.js` hook silently swallows `localStorage.setItem` errors as
`QuotaExceededError` (private mode) is uncaught.

## Surface map

### Public functions

- `ExoUI.Layouts.sidebar_layout/1` — `lib/exo_ui/layouts.ex:22` — app shell
  with collapsible sidebar, topbar, content area
- `ExoUI.Layouts.sidebar_item/1` — `lib/exo_ui/layouts.ex:107` — nav `<li>`
  wrapping a `<.link navigate>`

That is the entire `ExoUI.Layouts` namespace. No `app_shell`, no `page_header`,
no `topbar`, no `nav_group`, no `skip_link`, no `breadcrumbs_layout` —
everything else expected of an "app shell" lives in other modules
(`breadcrumb`, `header`, `theme_toggle`) or does not exist.

### Source modules

- `lib/exo_ui/layouts.ex` (123 lines) — both functions
- `assets/js/hooks/sidebar.js` (50 lines) — desktop persist + mobile reset
- `assets/js/hooks/theme_toggle.js` (42 lines) — co-resident in app shell stories
- `assets/css/src/layouts/sidebar.css` (231 lines) — all visual rules

Only one CSS file under `assets/css/src/layouts/`
(`assets/css/src/layouts/sidebar.css`). Imported once at
`assets/css/exo.css:16`.

`ExoUI.Layouts` is registered into `use ExoUI` at `lib/exo_ui.ex:87`. No skip
flag, no opt-out — always on.

### Tests

- `test/exo_ui/layouts_test.exs` — 24 tests; pure render assertions on
  `data-exo` attributes, slot presence, `id` propagation, badge thresholds.
  Does not test ARIA, does not assert link kind (`navigate` vs `patch`), does
  not assert active-state semantics, does not exercise `phx-update="ignore"`
  contract.
- `test/exo_ui/components/structural_test.exs:1` — covers `header`, `list`,
  `content_card`, `stat_card`, `metric_card`. Not the sidebar.
- `test/exo_ui/components/visual_test.exs:1` — `avatar`, `skeleton`,
  `empty_state`, `alert`. Not the sidebar.
- No `test/browser/sidebar.spec.js`. No Playwright spec touches
  `sidebar_layout` (verified via `ls test/browser/`). The hamburger toggle,
  overlay-close, mobile breakpoint, localStorage persistence, and FOUC
  prevention are entirely unverified at the browser level.

### Storybook

- `storybook/stories/layouts/sidebar_layout.story.exs` — single `:page` story,
  fully delegated to `ExoUI.Layouts.sidebar_layout` and `ExoUI.Layouts.sidebar_item`,
  forced to a `height: 500px` iframe-style container.
- `storybook/stories/layouts/_layouts.index.exs` — folder index.

That is all. No "with brand", "collapsed", "mobile", "no-icons", "long-list",
"dark-mode", or "active-route" variant. The story is `:page` (not
`:component`), so attribute introspection is unavailable by design.

## What works (with proofs)

- **CSS-only collapse on cold render** — `sidebar.css:9-15` zeroes the
  checkbox visually but keeps it interactive, then `sidebar.css:188-223`
  drives width/visibility from `:checked` selectors. The shell renders a
  correct expanded/collapsed shape before JS attaches.
- **FOUC guard** — `sidebar.js:15-17` sets `data-sidebar-ready` on `<html>`
  via `requestAnimationFrame` after applying initial state, and
  `sidebar.css:226-229` only enables width transitions inside
  `html[data-sidebar-ready]`. This avoids the snap-from-expanded-to-collapsed
  flash on first paint.
- **Listener cleanup is correct** — `sidebar.js:28-32` removes the change
  listener on `destroyed`. `theme_toggle.js:17-21` does the same for its click
  handlers. No leak in this surface.
- **Mobile/desktop switch is media-query driven** — `sidebar.js:21,40`
  branches on `(min-width: 768px)`. Desktop reads localStorage, mobile always
  starts closed. Reasonable behavior.
- **Tokens consumed everywhere** — `sidebar.css` references only
  `--exo-card`, `--exo-border`, `--exo-muted`, `--exo-foreground`,
  `--exo-muted-foreground`, `--exo-primary`, `--exo-primary-foreground`,
  `--exo-warning`, `--exo-warning-foreground`, `--exo-radius`, `--exo-space-*`,
  `--exo-text-*`, `--exo-font`, `--exo-duration`, `--exo-easing`. One hardcoded
  color: `oklch(0% 0 0 / 0.4)` for the mobile overlay scrim
  (`sidebar.css:177`). Otherwise clean.
- **Default expanded** — checkbox renders with `checked` attribute
  (`layouts.ex:34`), so server-rendered HTML is "expanded" before JS reads
  localStorage. Matches the SSR-then-rehydrate pattern.

## What is missing or half-done

- **No skip link.** Nothing in `lib/exo_ui/layouts.ex` emits
  `<a href="#main">Skip to content</a>`. The `<main data-exo="sidebar-main">`
  at `layouts.ex:64` has no `id`. WCAG 2.1 SC 2.4.1 ("bypass blocks") is
  unmet.
- **No `aria-expanded` sync.** The hamburger label
  (`layouts.ex:42-50`) is a `<label role="button">` with no `aria-expanded`,
  no `aria-controls`. The hook never sets either. Screen readers cannot tell
  whether the sidebar is open.
- **`role="button"` on a `<label>`** — `layouts.ex:46` and `layouts.ex:77`. A
  `<label for>` already activates the checkbox on Space/click; adding
  `role="button"` makes assistive tech announce "button" but the underlying
  semantics are still "label", and Enter does not toggle a checkbox by default.
  The `tabindex="0"` adds it to the tab order without keyboard activation
  parity. This is the canonical CSS-checkbox-hack accessibility hole.
- **No mobile focus management.** When the drawer opens on mobile (the
  `<aside>` slides in via `sidebar.css:182-184`), focus stays on the
  hamburger label. There is no `inert` on the `<main>`, no focus trap inside
  the aside, no focus restore on close, no `Escape` to close. Tab-key cycles
  out of the drawer back into the main content underneath.
- **No `aria-current="page"`.** `sidebar_item/1` accepts `active`
  (`layouts.ex:102`) but only emits `data-active` (`layouts.ex:109`). Screen
  readers get nothing. shadcn/ui's `SidebarMenuButton` sets
  `aria-current="page"` when `isActive`.
- **Active is a manual prop, not derived.** Consumers must compute
  `active={@current_path == "/users"}` for every item. No
  `current_path`/`current_uri` helper, no exact/prefix matching strategy.
- **Icon prop is a raw string.** `layouts.ex:111` — `{@icon}` interpolates
  the string as text content. There is no `ExoUI.Lucide` integration, no
  `icon/1` component bridge, no slot for arbitrary SVG. The Storybook story
  works around this with emoji (`storybook/stories/layouts/sidebar_layout.story.exs:16-19`).
- **No `navigate`/`patch`/`href` choice.** `layouts.ex:110` hardcodes
  `<.link navigate={@href}>`. A LiveView using `live_patch` cannot. The prop
  is named `href` but is used as `navigate` — confusing.
- **No nested nav groups.** The `:nav` slot is a single
  `render_slot` (`layouts.ex:86`). No primitive for "Group title + items",
  no collapsible groups, no separator-in-nav.
- **No page title / breadcrumb slot.** `topbar_start` is a free-form slot
  (`layouts.ex:52-55`); there is no semantic page-title region, no
  `<h1>` anywhere. Pages must roll their own.
- **No theme toggle slot.** There is `topbar_end` and that is it. README
  says the `<.theme_toggle />` component handles theming
  (`README.md:200-201`), but `sidebar_layout` does not embed it.
- **`localStorage` access uncaught.** `sidebar.js:22` and `sidebar.js:42`
  call `localStorage.setItem`/`getItem` without `try/catch`. Safari private
  mode and storage-disabled environments throw on `setItem` → mounted hook
  blows up the LiveSocket. This is the explicit anti-pattern in the brief.
- **CSS hides the icon when collapsed?** No — the collapsed-state rules
  (`sidebar.css:212-218`) hide `[data-exo="sidebar-label"]` and
  `[data-exo="sidebar-badge"]` but **not** the icon. Good. But because the
  icon is text, it visually centers as a single emoji/glyph; collapsed brand
  is centered by `sidebar.css:220-223`. Icon alignment is fragile when icon
  is a long string.
- **Hamburger always visible on desktop.** `sidebar.css:38-50` keeps the
  hamburger rendered at all breakpoints. Daisy/shadcn typically hide the
  hamburger on desktop because the sidebar is permanent. Visually noisy.
- **Topbar is height-locked at `4rem`.** `sidebar.css:28` — no token, no prop.
  Brand bar is also `4rem` (`sidebar.css:100`). Cannot be themed.
- **`sidebar_item` is `<li>` but the `:nav` slot is not a `<ul>`.** The
  `<nav>` (`layouts.ex:85`) wraps the slot directly. Consumer must remember
  to wrap items in `<ul>` themselves (Storybook does at line 15). If the
  consumer forgets, the markup is `<nav><li>...</li></nav>` — invalid HTML.

## Per-component table

| Component | Status | Findings (file:line) | Recommended work |
| --- | --- | --- | --- |
| `sidebar_layout/1` | 🔴 P0 | `<label role="button">` hamburger (`layouts.ex:46`); no `aria-expanded`/`aria-controls`; no skip link; no focus management when mobile drawer opens; `localStorage` uncaught (`sidebar.js:22,42`); no page-title slot; no `<ul>` wrapper for nav | Replace label-checkbox with `<button aria-expanded aria-controls>`; add focus trap + `Escape` handler in hook; add `<a href="#main">Skip</a>` and `id="main"` on `<main>`; wrap `try/catch` around storage I/O |
| `sidebar_item/1` | 🟡 P1 | hardcoded `<.link navigate>` (`layouts.ex:110`); no `aria-current` (`layouts.ex:109`); icon is raw text (`layouts.ex:111`); no `patch`/`href`-only; no nested-item slot | Add `navigate`/`patch`/`href` selection, default to `navigate`; emit `aria-current="page"` when `active`; accept icon slot or `ExoUI.Lucide` name; allow nested `:items` slot |
| `nav_group` | 🔴 NOT IMPLEMENTED | none | Section header + collapsible group of items |
| `app_shell` / page-title | 🔴 NOT IMPLEMENTED | none | Slot or attr for page title surfacing in topbar |
| `skip_link` | 🔴 NOT IMPLEMENTED | none | Visible-on-focus link to `#main` |

Status legend: P0 (broken/misleading public API), P1 (works but below
shadcn/daisyUI bar), P2 (polish), OK (acceptable).

## Problems by severity

### 🔴 Critical

#### 1. `<label role="button">` hamburger has no `aria-expanded` and lies about its role

- **Where:** `lib/exo_ui/layouts.ex:42-50` and `lib/exo_ui/layouts.ex:73-79`
  (overlay close button); `assets/js/hooks/sidebar.js` never sets aria.
- **What happens:** The toggle is a hidden checkbox at
  `layouts.ex:30-36`, controlled by two `<label for=...>` elements at
  `:42` and `:73`. Both labels have `role="button"` and `tabindex="0"` but
  no `aria-expanded`, no `aria-controls`, no keyboard activation handler.
  Screen readers announce "button" but Enter does not toggle the checkbox
  on a `<label>` (Space does, but only because the label forwards to the
  checkbox via the `for` association — and only on keyup of an actual
  click, not on Enter).
- **Why critical:** WCAG 4.1.2 (Name, Role, Value) is violated — role
  claims "button" with state, but no state is exposed. WCAG 2.1.1
  (Keyboard) requires Enter and Space to activate any button-role element.
  The label-checkbox hack does not deliver Enter parity.
- **Reproduction:** Open the Storybook page for `sidebar_layout`,
  Tab to the hamburger, press Enter — sidebar does not toggle. Press
  Space — toggles (because the `<label for>` clicks the checkbox).
- **Suggested fix:** Replace the checkbox + two labels with a real
  `<button aria-expanded={@open} aria-controls={"#{@id}-panel"}>` driven
  by the `ExoSidebar` hook; have the hook own the open/close state and
  dispatch `aria-expanded` on toggle. Keep CSS-only fallback in a
  `noscript` block if absolutely required.

#### 2. No skip link / no `id` on `<main>`

- **Where:** `lib/exo_ui/layouts.ex:64` (`<main data-exo="sidebar-main">`),
  no skip-link emission anywhere in the module.
- **What happens:** Keyboard and screen-reader users tabbing into the page
  must traverse every nav item before reaching content. WCAG 2.4.1 ("Bypass
  Blocks") fails.
- **Why critical:** This is the canonical app-shell accessibility
  baseline. shadcn/ui's `Sidebar` block ships `<a href="#main">` automatically;
  daisyUI documents it in their drawer recipe.
- **Suggested fix:** Render
  `<a href="#main" data-exo="skip-link">Skip to main content</a>` as the
  first child of the layout root, and set `id="main"` on the `<main>`
  element. CSS hides it visually until `:focus`/`:focus-visible`.

#### 3. Mobile drawer has no focus management, no Escape, no `inert`

- **Where:** `assets/js/hooks/sidebar.js` mounts a single `change`
  listener on the toggle (`sidebar.js:25`); never traps focus, never
  binds `keydown`, never sets `inert` on the `<main>`.
  `lib/exo_ui/layouts.ex:80-92` renders the `<aside>` without
  `aria-modal`, without `tabindex`, without auto-focus.
- **What happens:** On mobile, opening the drawer leaves focus on the
  hamburger. Tab moves to the first link inside the drawer, then keeps
  going into the still-tabbable `<main>` content underneath. Escape does
  not close the drawer. Closing the drawer does not restore focus to the
  hamburger.
- **Why critical:** A modal-like overlay without focus trap is unusable
  with a screen reader and confusing to all keyboard users. WCAG 2.4.3
  (Focus Order) and 2.1.2 (No Keyboard Trap, in reverse) implicated.
- **Suggested fix:** When the drawer opens on mobile, the hook should:
  add `inert` to `<main>`, focus the first focusable element in
  `<aside>`, listen for `Escape` and outside-click to close, restore
  focus to the hamburger on close. Same primitive `assets/js/hooks/overlay.js`
  already implements for modals — reuse it.

#### 4. `localStorage` access has no `try/catch`

- **Where:** `assets/js/hooks/sidebar.js:22` (`setItem`) and
  `assets/js/hooks/sidebar.js:42` (`getItem`).
  `assets/js/hooks/theme_toggle.js:11` and `:24` have the same problem.
- **What happens:** Safari private mode (older iOS), enterprise browsers
  with storage disabled, and some embedded webviews throw `SecurityError`
  or `QuotaExceededError` on `localStorage.setItem`. The exception
  propagates out of the change listener and out of the `mounted` callback,
  killing the LiveSocket hook on first paint.
- **Why critical:** Listed as an explicit anti-pattern in the audit
  brief; produces total layout failure for a non-trivial subset of users.
- **Suggested fix:** Wrap reads/writes in a small helper with
  `try/catch` that returns `null`/no-ops on error. Same change applies to
  `theme_toggle.js`.

### 🟡 Medium

#### 5. `sidebar_item` cannot emit `aria-current` and cannot use `patch`

- **Where:** `lib/exo_ui/layouts.ex:107-122`. `active` only flips
  `data-active`. `<.link>` is hardcoded to `navigate={@href}`.
- **Why:** Active route is a navigation primitive; screen readers expect
  `aria-current="page"`. shadcn ships it. Also, LiveView apps that use
  `live_patch` for in-LV navigation cannot use this component without
  forking.
- **Suggested fix:** Add `attr :navigate`, `attr :patch`, `attr :href`;
  pick the right `Phoenix.Component.link/1` shape based on which is set.
  Emit `aria-current="page"` when `@active` is true.

#### 6. `icon` prop is a raw string, no `ExoUI.Lucide` integration

- **Where:** `lib/exo_ui/layouts.ex:100` (`attr :icon, :string`),
  `:111` (`{@icon}`).
- **Why:** ExoUI ships 1701 Lucide icons in `lib/exo_ui/lucide.ex`; the
  rest of the library bridges them via the `icon/1` component. The
  sidebar item is the most visible icon-consumer in the library and is the
  one place that does not use them. Consumers are forced into emoji or
  inline SVG.
- **Suggested fix:** Either accept an icon name and call
  `ExoUI.Lucide` dynamically, or replace `attr :icon` with a `slot :icon`
  so consumers pass `<.icon name="users" />` directly.

#### 7. `:nav` slot does not provide a `<ul>` wrapper

- **Where:** `lib/exo_ui/layouts.ex:85-87` renders `<nav>{render_slot(@nav)}</nav>`.
  `sidebar_item/1` emits a top-level `<li>` (`layouts.ex:109`).
- **Why:** A naked `<li>` outside a `<ul>` or `<ol>` is invalid HTML.
  The Storybook story works because it manually wraps items in `<ul>`
  (`storybook/stories/layouts/sidebar_layout.story.exs:15`). If a
  consumer copies the docs without the manual `<ul>`, they get invalid
  markup.
- **Suggested fix:** Either render `<nav><ul>{render_slot(@nav)}</ul></nav>`
  or document the wrapper requirement loudly. The first option is
  consistent with daisyUI's `menu` recipe.

#### 8. No nested nav groups / no group separator

- **Where:** No primitive in `lib/exo_ui/layouts.ex`.
- **Why:** Real apps have grouped navigation (Workspace / Settings /
  Admin). Without a `nav_group` primitive consumers reach for raw HTML,
  bypassing tokens and accessibility.
- **Suggested fix:** Add `sidebar_group/1` with `:label` attr + `:inner_block`,
  rendering a labeled `<ul>` block; allow `:collapsible` mode that uses
  the existing collapsible hook.

#### 9. No page-title slot or topbar height token

- **Where:** `lib/exo_ui/layouts.ex` has no `:page_title` or `:title`
  attr. `sidebar.css:28` and `:100` hardcode `4rem`.
- **Why:** Page titles are the canonical first thing users want in a
  topbar. Hardcoded heights prevent design customization and conflict
  with sticky headers/breadcrumbs.
- **Suggested fix:** Add `slot :page_title` rendered between
  `topbar_start` and `topbar_end`; expose a token like
  `--exo-topbar-height` (default `4rem`) consumed by both rules.

#### 10. Storybook is `:page`, not `:component`

- **Where:** `storybook/stories/layouts/sidebar_layout.story.exs:2` —
  `use PhoenixStorybook.Story, :page`.
- **Why:** No attribute introspection, no variations panel, no playground.
  A library component should be a `:component` story with explicit
  variations (default, with brand, no icons, mobile width, dark mode,
  long list, active state).
- **Suggested fix:** Convert to `:component` with `def function, do:
  &ExoUI.Layouts.sidebar_layout/1`; add variations covering each state.

### 🟢 Minor

- **Hamburger glyph is raw `☰`** (`lib/exo_ui/layouts.ex:49`) — not a Lucide
  icon, not localized, font-fallback-dependent. Use `ExoUI.Lucide.menu/1`.
- **`data-active={@active && ""}`** (`layouts.ex:109`) — emits `data-active=""`
  rather than presence-only. Prefer `data-active={@active}` so HEEx omits when
  false.
- **Empty topbar placeholder divs** (`layouts.ex:55,60`) — always rendered to
  preserve flex layout. Wasted DOM; use `flex-grow` or gap rules instead.
- **README has no `sidebar_layout` recipe.** `README.md:128` mentions "sidebar"
  only in the hooks list. Add a "Building an app shell" section.

## Accessibility analysis

- **Roles & semantics:** `<label role="button">` (`layouts.ex:46`,
  `:77`) — incorrect, role does not match element semantics. `<aside>` is
  appropriate. `<main>` is appropriate. `<nav>` is appropriate. No
  `aria-label` on `<nav>` (`layouts.ex:85`) — multiple `<nav>` elements
  on a page (e.g. with breadcrumbs) become indistinguishable to screen
  readers.
- **Keyboard:** Tab into hamburger → focusable (good). Enter → does not
  toggle (bad; Space does). Inside `<aside>` → tabs through links
  normally. No `Escape` to close on mobile. No arrow-key navigation
  between items.
- **Focus management:** Mobile drawer opens without moving focus. No
  focus trap. No focus restore on close. Desktop collapse leaves focus
  wherever it was — fine because content remains tab-reachable.
- **ARIA wiring:** `aria-expanded` not present, `aria-controls` not
  present, `aria-current` not emitted on active item. Only
  `aria-label="Toggle sidebar"` (`layouts.ex:45`) and
  `aria-label="Close sidebar"` (`layouts.ex:76`).
- **Screen reader:** Hamburger announces "Toggle sidebar, button"; no
  state. Active item announces label only. Mobile overlay announces
  "Close sidebar, button" but does not communicate that an overlay is
  active.
- **Reduced motion:** `sidebar.css:226-229` enables a `200ms linear`
  width transition. No `@media (prefers-reduced-motion: reduce)` guard
  anywhere in the file.

## Composition & HTML correctness

- **Trigger composition:** Hamburger and overlay are `<label>` elements,
  not `<button>`. `<.link>` inside `<li>` is correct.
- **Slot contracts:** `slot :nav` accepts free content. `slot :brand`,
  `slot :topbar_start`, `slot :topbar_end`, `slot :footer`, `slot
  :inner_block` all free-form. No `as_child` escape hatch, but for an app
  shell that is fine.
- **Form integration:** N/A.
- **`<li>` outside `<ul>` risk:** Yes — the `:nav` slot does not impose a
  list wrapper; the Storybook story manually wraps in `<ul>`. Consumer
  forget = invalid HTML.
- **`phx-update="ignore"` on the toggle:** Yes, `layouts.ex:35`. Correct —
  prevents LiveView from clobbering the checkbox state on patches.

## Browser & visual coverage

- **Playwright coverage:** ZERO. No `test/browser/sidebar.spec.js` and no
  spec covers `sidebar_layout`. The hamburger toggle, mobile breakpoint
  switch, focus restoration, localStorage round-trip, FOUC prevention,
  and overlay-click-to-close are unverified at the browser level.
- **Untested paths:** keyboard activation, mobile drawer focus, escape
  close, dark mode visual, long-nav overflow scroll, badge edge cases,
  active-state highlight on real navigation.
- **Visual regression:** `scripts/capture_storybook_components.js`
  captures Storybook artifacts but the `sidebar_layout` story is `:page`
  with a fixed `500px` container — likely captured but not as a
  representative app-shell screenshot.

## CSS surface

- **Tokens used:** `--exo-card`, `--exo-border`, `--exo-muted`,
  `--exo-foreground`, `--exo-muted-foreground`, `--exo-primary`,
  `--exo-primary-foreground`, `--exo-warning`, `--exo-warning-foreground`,
  `--exo-radius`, `--exo-space-2/3/4`, `--exo-text-xs/sm/lg`, `--exo-font`,
  `--exo-duration`, `--exo-easing`. Only one hardcoded color:
  `oklch(0% 0 0 / 0.4)` for the mobile overlay scrim
  (`sidebar.css:177`).
- **Dark mode parity:** Inherits via tokens. No sidebar-specific dark
  override (verified — no `sidebar` match in
  `assets/css/src/themes/dark.css`). The hardcoded scrim is dark-mode
  appropriate by accident (it is black with 40% alpha, fine on both).
- **Override surface:** All selectors use `:where()` (zero specificity),
  so consumers can override with a flat class without `!important`.
  Solid.
- **Layout strategy:** Top-level `display: flex` with `order: -1` to
  flip the panel to the left (`sidebar.css:75`). On desktop the panel is
  `position: relative` with width transitions; on mobile it is
  `position: fixed` with `transform: translateX(-100%)` and slides in.
  The pattern works but is harder to reason about than the
  shadcn/daisyUI grid-based approach.
- **Dead CSS:** None in this file.
- **Reduced motion:** Missing — `sidebar.css:226-229` should be wrapped
  in `@media not (prefers-reduced-motion: reduce)`.
- **Topbar height token:** Missing — should expose
  `--exo-topbar-height` instead of `4rem` literal in two places.

## JS hook quality

- **Lifecycle:** `mounted` (`sidebar.js:8`), `updated` (`:34`),
  `destroyed` (`:28`). All three present.
- **Event listeners:** One `change` listener added in `mounted`
  (`sidebar.js:25`) and removed in `destroyed` (`:30`). Stored as
  `this._onChange` (`:20`) — pattern is correct.
- **Server↔client contract:** Hook reads `data-exo="sidebar-toggle"`
  child element (`sidebar.js:9`). On `updated` it re-applies state,
  which means a server patch can re-flip the checkbox; the
  `phx-update="ignore"` at `layouts.ex:35` prevents that. Slight
  contradiction between the `updated` callback re-running `_applyState`
  and `phx-update="ignore"` on the input — `_applyState` will still run
  on parent updates, but the only thing it does is set
  `this.toggle.checked`, which is fine.
- **`phx-update="ignore"`:** Used at `layouts.ex:35`. Correct.
- **Storage error handling:** Missing `try/catch` (see Critical #4).
- **`window.matchMedia`:** Used twice (`sidebar.js:21,40`), no listener
  on `media.onchange` — if the user resizes from desktop to mobile, the
  hook does not re-apply state. Minor; viewport-resize-mid-session is
  rare.
- **No `console.log`/`debugger`.**

## Storybook quality

- **Pages exist:** Single `:page` story at
  `storybook/stories/layouts/sidebar_layout.story.exs`.
- **States covered:** Default only — one variant. No collapsed-by-default,
  no active-route, no long-list, no without-icons, no without-brand, no
  mobile-width, no dark-mode.
- **Attribute introspection:** N/A — `:page` story type does not
  introspect attributes.
- **Phoenix form examples:** N/A.
- **Container hack:** Story wraps the layout in a `height: 500px;
  position: relative` shell so it does not eat the whole Storybook
  iframe (`sidebar_layout.story.exs:8`). Workable but reveals that the
  layout is `height: 100vh` (`sidebar.css:5`) — there is no "embed me
  in a container" mode.

## Test coverage

- **Existing test files:** `test/exo_ui/layouts_test.exs` — 24 tests:
  - 14 tests on `sidebar_layout/1` (renders root, slots, ids, classes,
    toggle checkbox, hamburger label, overlay label).
  - 10 tests on `sidebar_item/1` (basic render, link, active, badge,
    badge=0, icon, custom class, global attrs, combined props).
- **Scenarios covered:** Slot presence, attribute pass-through,
  `phx-hook="ExoSidebar"` registration, default vs custom id, link emits
  `data-phx-link="redirect"`.
- **NOT covered:**
  - `aria-expanded`/`aria-controls` (because they are missing from the
    code).
  - `aria-current="page"` (missing).
  - Skip link (missing).
  - Hamburger keyboard activation (cannot be tested at HEEx level —
    needs Playwright).
  - `localStorage` round-trip (needs Playwright).
  - Mobile breakpoint behavior (needs Playwright).
  - Focus trap and Escape close (missing).
  - Active-state vs current-route mapping (missing).
- **Flakiness signals:** None — all tests are pure render assertions.

## Tech debt

- **TODO/FIXME in surface:** None found in
  `lib/exo_ui/layouts.ex`, `assets/js/hooks/sidebar.js`,
  `assets/css/src/layouts/sidebar.css`.
- **Dead code:** None in this surface.
- **Convention drift:** The rest of the library uses `ExoUI.Lucide` and
  `<.icon name="...">` for icons; `sidebar_item` uses raw strings.
  `lib/exo_ui/layouts.ex` is the only public module under
  `lib/exo_ui/` that is not under `lib/exo_ui/components/`. This is a
  naming-vs-folder mismatch (works, but inconsistent).
- **Storybook story type:** Other components are `:component` stories;
  the only layout story is `:page`. Drift.

## Configuration & build

- **Public API exposure:** Both functions exposed via `import
  ExoUI.Layouts` from `use ExoUI` (`lib/exo_ui.ex:87`). Always-on; no
  opt-out flag (unlike `core_components: false`).
- **Build artifacts:** `assets/css/src/layouts/sidebar.css` is imported
  at `assets/css/exo.css:16` and bundled into `priv/static/exo.css`. The
  `ExoSidebar` hook is registered in `assets/js/index.js:5,23`.

## Documentation

- **Existing:** `@moduledoc` (`lib/exo_ui/layouts.ex:2-6`) is a single
  sentence. `@doc` for both functions is one line each (`:10`, `:98`).
  No usage example in module doc, no examples in function docs, no
  README section.
- **Missing:** Slot reference (only Storybook shows them), integration
  example with `theme_toggle`, behavior under `live_redirect` vs
  `live_patch`, mobile breakpoint, localStorage key
  (`exo-sidebar-collapsed`).
- **Out of date:** README claims layouts and hooks list (`README.md:128`)
  but does not surface `sidebar_layout` as a recipe.

## Comparison vs shadcn/daisyUI

- **Matches:** persistent collapse via localStorage, FOUC-free initial render
  via `data-sidebar-ready`, token-driven CSS, mobile drawer via single CSS
  strategy.
- **Lags:**
  1. shadcn `Sidebar` block ships skip link, focus trap, group primitives,
     `aria-current="page"`, keyboard parity, and a `useSidebar` hook
     (`open`/`setOpen`/`openMobile`/`isMobile`/`state`/`toggleSidebar`). ExoUI
     ships none of these.
  2. shadcn `SidebarMenuButton` integrates with tooltip for collapsed-icon
     mode. ExoUI hides labels when collapsed with no tooltip affordance.
  3. daisyUI `drawer` uses a real button with `aria-expanded`. ExoUI uses the
     label-checkbox hack.
  4. Both libraries support nested nav groups. ExoUI has no `nav_group`.
  5. shadcn ships `floating`/`inset`/`sidebar` variants. ExoUI ships one.

## Recommendations (priority-ordered)

1. **[Critical]** Replace the label-checkbox hamburger with
   `<button aria-expanded aria-controls>` driven by `ExoSidebar` — fixes
   `aria-expanded` sync, keyboard parity, and role accuracy in one change.
   **Effort: M.**
2. **[Critical]** Add focus management for the mobile drawer: trap focus in
   `<aside>`, `inert` on `<main>`, `Escape`/outside-click to close, restore
   focus on close. Reuse the primitive in `assets/js/hooks/overlay.js`.
   **Effort: M.**
3. **[Critical]** Wrap `localStorage.getItem`/`setItem` in `try/catch` in both
   `sidebar.js` and `theme_toggle.js`. **Effort: S.**
4. **[Critical]** Add a skip link as the first layout child; set `id="main"`
   on `<main>`; hide visually until `:focus`. **Effort: S.**
5. **[High]** `sidebar_item/1` — add `navigate`/`patch`/`href`; emit
   `aria-current="page"` when active; accept `slot :icon` for `<.icon name>`
   integration. **Effort: S.**
6. **[High]** Add `sidebar_group/1` (label + items, optionally collapsible).
   **Effort: M.**
7. **[High]** Wrap `:nav` slot in `<ul>` or drop the `<li>` from
   `sidebar_item` so consumers wrap explicitly. **Effort: S.**
8. **[Medium]** Add `slot :page_title` and expose `--exo-topbar-height` token.
   **Effort: S.**
9. **[Medium]** Add `@media (prefers-reduced-motion: reduce)` guard at
   `sidebar.css:226-229`. **Effort: S.**
10. **[Medium]** Convert the Storybook story from `:page` to `:component` with
    6+ variations (default, collapsed, active item, no icons, mobile width,
    long list, dark mode). **Effort: M.**
11. **[Medium]** Write `test/browser/sidebar.spec.js`: hamburger toggle, drawer
    open/close, Escape, focus trap, localStorage round-trip. **Effort: M.**
12. **[Quick win]** Replace `☰` (`layouts.ex:49`) with `ExoUI.Lucide.menu/1`
    and add `aria-label` to `<nav>` (`layouts.ex:85`). **Effort: S.**

## Open questions for the library owner

- Is `sidebar_layout` the canonical app shell, or one of several layouts
  (`topbar_layout`, `split_layout`)? If the latter, `ExoUI.Layouts` should be
  reorganized.
- Should active-state matching live in the component (with `current_path` +
  matching strategy) or stay derived by the consumer? shadcn keeps it derived.
- Should `sidebar_layout` auto-embed `<.theme_toggle />` in `topbar_end` when
  the slot is empty, or stay BYO?
- After replacing the label-checkbox with a real button, should a `noscript`
  CSS-only fallback be retained, or is JS-required acceptable given LiveView
  already requires JS?
- Is `sidebar_group` / nested nav planned for v0.2.x, or is the flat list
  considered sufficient?
