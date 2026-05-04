# Audit: Core components

**Date:** 2026-04-28
**Auditor:** Claude Opus 4.7 (subagent)
**Score:** 🔴 critical
**Maturity:** ~35% (subjective vs shadcn/daisyUI)

## TL;DR (max 5 lines)

Five of the seventeen public components ship with **zero CSS** (`navbar`, `footer`, `bottom_nav`, `indicator`, `swap`) — verified absent from both `assets/css/src/components/` and the built `priv/static/exo.css`. `swap` is also a keyboard-inaccessible dead control. `icon/1` defaults `class` to `"size-4"` for which the library ships no rule, so icons render at 24×24 unless consumers add Tailwind. `String.to_existing_atom` in `icon/1` raises on typos. The `<button>` has no default `type="button"` and the link variant ignores the `disabled` attribute entirely. Tests exist for navbar/footer/bottom_nav/indicator/swap (DOM only) but **no tests at all** for `avatar`, `skeleton`, `empty_state`, `header`, and **no browser tests** for `theme_toggle` despite it being the only JS hook in this surface.

## Surface map

### Public functions

`ExoUI.Components.button/1`, `badge/1`, `separator/1`, `icon/1`, `theme_toggle/1`, `header/1`, `avatar/1`, `skeleton/1`, `empty_state/1`, `spinner/1`, `kbd/1`, `scroll_area/1`, `navbar/1`, `footer/1`, `bottom_nav/1`, `indicator/1`, `swap/1` — all `defdelegate` from `lib/exo_ui/components.ex:18-34`.

### Source modules

- `lib/exo_ui/components/core.ex` — 367 lines, 17 components, single file
- `lib/exo_ui/components.ex` — re-export shim (`defdelegate`) at lines 18-34
- `lib/exo_ui/lucide.ex` — auto-generated, 1701 icons, `render/2` at line 3311
- `lib/exo_ui/utils.ex` — shared helpers (`classes/1`, `colors/0`, etc.); not used by any core component despite existing

### Tests

- Tests exist: `button`, `badge`, `icon` (incl. `theme_toggle`), `separator`, `spinner`, `kbd`, `scroll_area`, `navbar`, `footer`, `bottom_nav`, `indicator`, `swap`.
- Tests **missing entirely**: `avatar`, `skeleton`, `empty_state`, `header` (verified via `find /Users/miso/Developer/exo_ui/test -iname "avatar*" -o ...` returning nothing).
- Browser tests: **none** for any core component (`/Users/miso/Developer/exo_ui/test/browser/` has no theme_toggle spec).

### Storybook

All 17 components have stories; only 4 use `function: &ExoUI.Components.x/1` (delegated form) — `button`, `badge`, `skeleton`, `separator`. The rest use `:page` stories with raw markup, which means the storybook attribute table introspection breaks for everything else.

## What works (with proofs)

- Every component emits a stable `data-exo` root attribute (`core.ex:22, 52, 66, 91, 108, 137, 154, 188, 205, 232, 244, 261, 281, 308, 337, 354`).
- `bottom_nav` correctly handles `aria-current="page"` on the active link (`core.ex:316`).
- `separator` correctly emits `role="separator"` + `aria-orientation` (`core.ex:68-69`).
- `spinner` and `skeleton` have `role="status"` + `aria-label` (`core.ex:207-208`, `core.ex:156-157`).
- `theme_toggle` JS hook properly cleans up listeners in `destroyed()` (`assets/js/hooks/theme_toggle.js:17-21`) and is registered in `assets/js/index.js:6,24`.
- Tokens file (`assets/css/src/tokens.css`) is well-structured with OKLCH and a clean light/dark/sandbox split.

## What is missing or half-done

- **Five components have NO CSS at all.** Verified by `grep -o 'data-exo=[^]]*' priv/static/exo.css | sort -u` — no matches for `navbar`, `navbar-brand`, `navbar-center`, `navbar-end`, `footer`, `footer-columns`, `footer-column`, `footer-bottom`, `bottom-nav`, `bottom-nav-item`, `bottom-nav-icon`, `bottom-nav-label`, `indicator`, `indicator-badge`, `swap`, `swap-on`, `swap-off`, `swap-state`. The HEEx renders, but the components are visually unstyled and the `indicator` "position" data attribute does literally nothing.
- `avatar-initials` has no CSS rule even though `avatar.css` exists (`core.ex:139` emits the attribute, no selector in `assets/css/src/components/avatar.css`).
- `icon/1` default `class="size-4"` (`core.ex:78`) targets a Tailwind utility that the library does not ship; `grep '\.size-4' assets/ priv/` returns no matches — icons render unconstrained at 24×24 SVG default.
- `--exo-font-mono` is declared in `tokens.css:33` and used by **zero** components. `kbd` (the obvious customer) uses `--exo-font` (sans) at `assets/css/src/components/kbd.css:8` — dead token + miscoded component.
- No `aria-pressed` on any of the three theme buttons in `theme_toggle/1` (`core.ex:92-94`) despite `[data-active]` styling — screen readers cannot tell which theme is active.
- Lucide SVGs do not emit `aria-hidden` (`lucide.ex:3324-3338` — no `aria-hidden` in the template). Decorative icons leak text into AT name computation.
- Spinner SVG has no `aria-hidden` either (`core.ex:212-220`); the parent has `role="status"`+`aria-label`, so the inner SVG should be hidden.
- No `<button type="button">` default in `button/1` — when rendered inside a `<form>`, an icon button or "Cancel" button submits. Submit-on-Enter footgun.

## Per-component table

| Component      | Status | Findings (file:line)                                                                                                                                                                                                      | Recommended work                                                                                                                                      |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button`       | 🔴 P0  | No `type="button"` default `core.ex:18-42`; link variant ignores `disabled` (`core.ex:21-29`); double rendering branches use `:if` rather than a guard, both nodes serialised                                             | Add `type="button"` default; add `aria-disabled`+`tabindex="-1"` for disabled link variant; collapse to single `assigns_to_attributes` path           |
| `badge`        | 🟡 P1  | No size variants in `badge.css`; `:span` only — no support for icon+text composition                                                                                                                                      | Add `size="sm/md/lg"`; add `data-icon` slot                                                                                                           |
| `separator`    | OK     | clean; `<div>` not `<hr>` but role is set `core.ex:64-73`                                                                                                                                                                 | Optional: render `<hr>` for horizontal in flow                                                                                                        |
| `icon`         | 🔴 P0  | `String.to_existing_atom` raises on unknown name `core.ex:82`; `class="size-4"` default with no shipped rule `core.ex:78`; no `aria-hidden` on SVG `lucide.ex:3324-3338`; `Code.ensure_loaded!/1` per render `core.ex:81` | Use a `Map.fetch` lookup with a graceful fallback; ship a `[data-exo="icon"]` rule with size variants; add `aria-hidden="true"` and `data-exo="icon"` |
| `theme_toggle` | 🔴 P0  | No `aria-pressed` `core.ex:92-94`; no `<noscript>` fallback; `_apply` toggles `data-active` but not `aria-pressed` `theme_toggle.js:30-32`; emoji glyphs as button content (no actual icons)                              | Add `aria-pressed` + sync in JS; use `<.icon>`; add `prefers-color-scheme` media listener so `system` actually reacts                                 |
| `header`       | 🟡 P1  | No `:title` slot — `inner_block` is forced into `<h1>` `core.ex:110`; no h-level override; no breadcrumb hook                                                                                                             | Add `level` attr; expose `:title` slot                                                                                                                |
| `avatar`       | 🟡 P1  | No image-fail fallback to initials `core.ex:138`; non-interactive `<span>` so cannot be a clickable link/menu trigger; `String.first("")` will raise `core.ex:130`; no `avatar-initials` CSS rule                         | Add `onerror` swap or `<img loading="lazy">` + JS fallback; allow `as="button"`/`as="a"`; guard empty name                                            |
| `skeleton`     | 🟡 P1  | Inline `style="height:..."` strings `core.ex:165,167,171,172` violate the "no hardcoded values" pattern; no test file                                                                                                     | Move sizing to CSS data attrs; add tests                                                                                                              |
| `empty_state`  | 🟡 P1  | `@icon` is rendered as raw text inside `<div>` `core.ex:189` — cannot pass a `<.icon>` component without leaking it as text; no test file                                                                                 | Convert to `:icon` slot                                                                                                                               |
| `spinner`      | 🟡 P1  | SVG has no `aria-hidden` `core.ex:212`; no variant for inline-with-text vs block                                                                                                                                          | Add `aria-hidden="true"` to `<svg>`; add `data-variant`                                                                                               |
| `kbd`          | 🟡 P1  | Uses `--exo-font` (sans) instead of `--exo-font-mono` `kbd.css:8`; no group/combo rendering for `Cmd+K`                                                                                                                   | Use mono font; add a `<.kbd_combo>` helper                                                                                                            |
| `scroll_area`  | 🟡 P1  | No fade/shadow indicators; no JS hook so `data-scrolled` etc. are not exposed; "both" orientation works but viewport has no max-height by default `scroll-area.css:7`                                                     | Match shadcn Radix pattern (corner div, scrollbar elements)                                                                                           |
| `navbar`       | 🔴 P0  | **NO CSS** — `data-exo="navbar"` not in built CSS; renders unstyled flexbox-less stack                                                                                                                                    | Ship `assets/css/src/components/navbar.css`                                                                                                           |
| `footer`       | 🔴 P0  | **NO CSS** — `footer-columns`, `footer-column`, `footer-bottom` all unstyled                                                                                                                                              | Ship `footer.css` with grid for columns                                                                                                               |
| `bottom_nav`   | 🔴 P0  | **NO CSS** — fixed-bottom mobile nav renders inline, mobile UX broken; no `<ul>`/`<li>` semantics                                                                                                                         | Ship `bottom-nav.css` (fixed + safe-area-inset-bottom); render as `<ul>`                                                                              |
| `indicator`    | 🔴 P0  | **NO CSS** — `data-position` does literally nothing; badge renders inline next to content                                                                                                                                 | Ship `indicator.css` with `position: relative` + 6 absolute variants                                                                                  |
| `swap`         | 🔴 P0  | **NO CSS**; checkbox is `aria-hidden="true"` + `tabindex="-1"` `core.ex:359-360` so cannot toggle by keyboard; no JS hook; both `<:on>` and `<:off>` slots render simultaneously without CSS to hide one                  | Remove `tabindex="-1"`/`aria-hidden`; ship `swap.css` with `:checked` selectors; add `aria-pressed` mirror                                            |

## Problems by severity

### 🔴 Critical (broken public API, invalid HTML, accessibility blockers)

1. **navbar / footer / bottom_nav / indicator / swap have ZERO CSS.** Files do not exist (`ls assets/css/src/components/` shows no navbar/footer/bottom-nav/indicator/swap.css), and built artifact `priv/static/exo.css` confirms absence (`grep -o 'data-exo=[^]]*' priv/static/exo.css | sort -u`). Public components shipping without styling is a P0 lie about the surface area.
2. **`swap/1` is keyboard-inaccessible.** `core.ex:359-360` sets `aria-hidden="true"` and `tabindex="-1"` on the only interactive element. Even if CSS existed, the user could not toggle it without a mouse. Plus no `phx-hook` registered (`assets/js/index.js` has no `ExoSwap`). The component is decorative-only.
3. **`button/1` has no default `type="button"`.** `core.ex:18-42` accepts `type` via `:rest` include, but with no default a `<button>` inside a `<form>` defaults to `type="submit"`. Cancel/secondary buttons will submit the form. Footgun across the entire library.
4. **`button/1` link variant ignores `disabled`.** `core.ex:21-29` renders an `<a>`/`<.link>` with `data-variant`/`data-size` but no `data-disabled`, no `aria-disabled`, no click guard. A "disabled" link button is fully clickable.
5. **`icon/1` raises on unknown names.** `core.ex:82` calls `String.to_existing_atom` on user-supplied data after `String.replace`. If the consumer passes `name="foo-bar"` and that atom isn't in the table, the LiveView crashes. Worse: `Lucide.render/2` itself raises `ArgumentError` for atoms that match an existing atom but aren't an icon (`lucide.ex:3318-3320`). Either way, a typo crashes the parent process.
6. **`icon/1` default class targets a non-existent rule.** `core.ex:78` defaults `class="size-4"`. The library ships no `.size-4` selector (`grep '\.size-4' assets/css priv/static` returns nothing). Out of the box, every icon renders at the SVG default 24×24, regardless of the documented small-icon expectation.
7. **`theme_toggle/1` lacks `aria-pressed`.** `core.ex:92-94` and `theme_toggle.js:30-32` toggle `data-active` only. Screen readers and keyboard users cannot perceive the active state semantically.
8. **Decorative SVGs miss `aria-hidden`.** `lucide.ex:3324-3338` and `core.ex:212-220` (spinner) — neither emits `aria-hidden="true"`. AT users get spurious announcements.

### 🟡 Medium (UX problems, missing variants, incomplete a11y)

9. **No tests for `avatar`, `skeleton`, `empty_state`, `header`.** Verified — `find test -iname avatar* -o -iname skeleton* -o -iname empty* -o -iname header*` returns empty.
10. **No browser tests for `theme_toggle`.** It is the only JS-bearing component in this surface; the system→light→dark transition is untested.
11. **`empty_state.@icon` is a string only.** `core.ex:189` renders `{@icon}` as raw text. To pass a `<.icon>` component, callers must build their own slot — but there is none.
12. **`avatar/1` is non-interactive.** `core.ex:137-141` always renders a `<span>`. Common pattern is a clickable avatar (link to profile, dropdown trigger) — no `as` attribute supported.
13. **`avatar/1` has no image-load fallback.** If `src` 404s, the broken-image icon shows. shadcn's avatar swaps to initials on `onerror`.
14. **`kbd` uses sans font.** `assets/css/src/components/kbd.css:8` uses `--exo-font` instead of `--exo-font-mono`. The token exists exclusively for this purpose.
15. **Skeleton width via inline `style`.** `core.ex:165, 167, 171, 172` hardcode heights/widths. Should be data attrs the CSS owns.
16. **Storybook stories use raw `:page` mode for 13/17 components.** Only 4 (`button`, `badge`, `skeleton`, `separator`) use the `:component` story pattern with a `function:` reference. The page-mode stories cannot show the attribute table, attribute introspection, or the playground panel.
17. **No long-text / overflow / truncation states in storybook.** None of the stories exercise long titles, long badges, RTL text, or 99+ counters truncating in indicator badges.
18. **`theme_toggle` doesn't react to `prefers-color-scheme` change.** When mode is `system` (`theme_toggle.js:34-38`), the OS theme switch at runtime is ignored. shadcn explicitly listens to `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)`.

### 🟢 Minor (cleanup, naming, docs)

19. **`Code.ensure_loaded!/1` per icon render** (`core.ex:81`). Negligible cost but unnecessary — `ExoUI.Lucide` is compiled into the app.
20. **`ExoUI.Utils` is unused by core.** `utils.ex:28-45` defines `classes/1` and `maybe_add_class/2` but `core.ex` never imports them.
21. **No `@moduledoc` examples.** `core.ex:2-4` is a single sentence; consumers see only `@doc "..."` on each function. shadcn-style "Why use this" / "Composition" sections missing.
22. **Public API uses `defdelegate` only.** `components.ex:18-34` re-exports `core.ex` functions verbatim. This is fine but means `function: &ExoUI.Components.button/1` in storybook routes through delegation; the same identity, but it's a maintenance smell that some stories use the delegated form (`button.story.exs:4`, `badge.story.exs:4`) and others import via `ExoUI.Components.x` inline (page-mode stories).
23. **`scroll_area` "both" orientation** (`core.ex:238`) — fine, but no `corner` element like Radix scroll-area exposes.
24. **`bottom_nav` not a list.** `core.ex:308-321` renders `<.link>` siblings inside `<nav>`. Semantic best practice: `<nav><ul><li><a>...`.
25. **`indicator/1` slot order.** `core.ex:338-339` renders `inner_block` first then `badge`. With CSS `position: absolute` this is fine; without CSS the badge appears AFTER the content as inline text — visible regression today.

## Accessibility analysis

| Component      | role/label                                  | states                             | keyboard                | proof             |
| -------------- | ------------------------------------------- | ---------------------------------- | ----------------------- | ----------------- |
| `button`       | native `<button>` / `<a>`                   | no `aria-disabled` on link variant | OK except link-disabled | `core.ex:21-40`   |
| `badge`        | none                                        | none                               | n/a                     | `core.ex:50-56`   |
| `separator`    | `role=separator`, `aria-orientation`        | n/a                                | n/a                     | `core.ex:64-73`   |
| `icon`         | none, no `aria-hidden`                      | n/a                                | n/a                     | `lucide.ex:3324`  |
| `theme_toggle` | buttons w/ `aria-label`                     | NO `aria-pressed`                  | tab+space works         | `core.ex:91-95`   |
| `header`       | semantic `<header>`/`<h1>`                  | n/a                                | n/a                     | `core.ex:108-115` |
| `avatar`       | `<img alt={name}>`                          | no fallback                        | n/a                     | `core.ex:138`     |
| `skeleton`     | `role=status`, `aria-label="Loading..."`    | n/a                                | n/a                     | `core.ex:156-157` |
| `empty_state`  | none                                        | n/a                                | n/a                     | `core.ex:188-194` |
| `spinner`      | `role=status`, `aria-label="Loading"`       | inner SVG NOT aria-hidden          | n/a                     | `core.ex:204-220` |
| `kbd`          | native `<kbd>`                              | n/a                                | n/a                     | `core.ex:232`     |
| `scroll_area`  | none                                        | none                               | OK (native overflow)    | `core.ex:244`     |
| `navbar`       | semantic `<nav>`                            | none                               | OK                      | `core.ex:261`     |
| `footer`       | semantic `<footer>`                         | none                               | n/a                     | `core.ex:281`     |
| `bottom_nav`   | `<nav>` + `aria-current="page"`             | OK                                 | OK                      | `core.ex:308-316` |
| `indicator`    | none — should expose `aria-label` for count | n/a                                | n/a                     | `core.ex:337`     |
| `swap`         | none — should have `aria-pressed`           | broken (hidden input)              | **none**                | `core.ex:354-364` |

## Composition & HTML correctness

- No `<button>` inside `<button>` violations in this surface.
- No `<a href>` inside `<button>` (the button uses `:if`/`:if-not` to render exactly one of `<.link>` or `<button>` — `core.ex:20-41`).
- `header/1` always emits `<h1>` (`core.ex:110`) — bad for nested headers below an existing h1; no `level` attribute.
- `bottom_nav/1` renders `<.link>` directly inside `<nav>` (`core.ex:308-321`), skipping `<ul>/<li>` semantics that AT users expect for nav lists.
- `swap/1` uses `<label>` wrapping a hidden `<input>` (`core.ex:354-361`). The `<label>` has no `for`, but as it wraps the input that's fine. However it has no `role="switch"` mirror despite being a binary toggle; daisyUI's swap handles this.
- `empty_state/1` renders `@icon` text directly inside a `<div>` (`core.ex:189`). If the consumer passes a string emoji it works; if they pass HEEx markup via `<:icon>` it does NOT — the slot does not exist.

## Browser & visual coverage

- **Zero browser tests** for the entire core surface (`ls test/browser/` lists 12 specs; none cover button/theme_toggle/swap/icon).
- The only client-side hook in this surface is `ExoThemeToggle`. Its `system → light → dark` transition is asserted only by an Elixir render test that checks the rendered HTML attributes (`icon_test.exs:20-27`); no actual browser-side toggling.
- Storybook stories cover happy-path appearances only; no disabled, error, loading, very-long-text, RTL, or focus-ring states.

## CSS surface

| File               | Tokens used               | Hardcoded values                                    | Notes                                         |
| ------------------ | ------------------------- | --------------------------------------------------- | --------------------------------------------- |
| `button.css`       | yes                       | 1 (`9999px` not used)                               | Clean, uses `:where()` for low specificity    |
| `badge.css`        | yes                       | none                                                | No size variants                              |
| `avatar.css`       | yes                       | `9999px` (radius full); `1.5rem`, `2rem`... (sizes) | OK; missing `avatar-initials` rule            |
| `empty-state.css`  | yes                       | none                                                | Clean                                         |
| `header.css`       | yes                       | none                                                | Clean                                         |
| `skeleton.css`     | yes                       | `2.5rem`, `9999px`, percentages                     | Animation shared via `@keyframes exo-pulse`   |
| `kbd.css`          | yes (`--exo-muted`, etc.) | `1.5rem`, `0.75rem`                                 | **Wrong font token: should be mono**          |
| `scroll-area.css`  | yes                       | `6px`, `3px`                                        | Chrome+FF scrollbar                           |
| `separator.css`    | yes                       | `1px`                                               | Clean                                         |
| `spinner.css`      | yes                       | sizes                                               | Clean                                         |
| `theme-toggle.css` | yes                       | `2rem`                                              | Clean                                         |
| `navbar.css`       | **MISSING**               | n/a                                                 | **Component ships unstyled**                  |
| `footer.css`       | **MISSING**               | n/a                                                 | **Component ships unstyled**                  |
| `bottom-nav.css`   | **MISSING**               | n/a                                                 | **Component ships unstyled**                  |
| `indicator.css`    | **MISSING**               | n/a                                                 | **Component ships unstyled**                  |
| `swap.css`         | **MISSING**               | n/a                                                 | **Component ships unstyled + non-functional** |

Token coverage: every defined `--exo-*` token in `tokens.css:1-44` appears in at least one component CSS file **except** `--exo-font-mono` (line 33), `--exo-tooltip-bg`/`--exo-tooltip-fg` (used only by `tooltip.css`), and `--exo-shadow-*` (used by overlay/feedback surfaces).

## JS hook quality (theme_toggle only — others N/A)

`assets/js/hooks/theme_toggle.js`:

- Pros: stores handlers in `this._handlers` and removes them in `destroyed()` (lines 5-21); reads from `localStorage`; uses `data-theme` on `<html>`.
- Cons:
  - No `prefers-color-scheme` listener — `system` mode is read-once at mount, never re-evaluated when OS theme changes.
  - No event dispatch — consumers cannot subscribe to theme changes.
  - `_apply` mutates `data-active` (line 31) but does not mirror to `aria-pressed`.
  - `localStorage.setItem` on every click without a try/catch — Safari private mode + cross-origin frames can throw.
  - No FOUC prevention — first paint with system mode is whatever CSS default `:root` was; consumers must add a manual `<script>` in `<head>` to set `data-theme` before stylesheet loads. Not documented.

## Storybook quality

- 17 stories present, 1:1 with public components.
- `:component` mode (introspection works): button, badge, skeleton, separator (4/17 = 24%).
- `:page` mode (no introspection, fixed markup): rest. This means the storybook playground panel — a key user benefit — works for 4 of 17.
- States covered:
  - Disabled: NONE.
  - Error: NONE (no error variant on button/badge anyway).
  - Loading: spinner story shows three sizes only; no inline-with-button example.
  - Dark mode: not exercised in any individual story. No dark-mode visual.
  - Long text: only `indicator.story.exs:18-20` shows `99+`; no extreme cases.

## Test coverage

| Component        | File                            | LOC | Tests                  | Key gaps                                           |
| ---------------- | ------------------------------- | --- | ---------------------- | -------------------------------------------------- |
| button           | `button_test.exs`               | 26  | 3                      | no link variant, no disabled, no `type` default    |
| badge            | `badge_test.exs`                | 20  | 2                      | no rest passthrough                                |
| icon             | `icon_test.exs`                 | 28  | 3 (incl. theme_toggle) | unknown-name behaviour untested                    |
| separator        | `separator_test.exs`            | 21  | 2                      | OK                                                 |
| spinner          | `spinner_test.exs`              | 20  | 2                      | no aria-hidden assertion                           |
| kbd              | `kbd_test.exs`                  | 14  | 1                      | minimal                                            |
| scroll_area      | `scroll_area_test.exs`          | 34  | 2                      | "both" orientation untested                        |
| navbar           | `navbar_test.exs`               | 130 | 9                      | `<nav>` semantics + slots — thorough               |
| footer           | `footer_test.exs`               | 110 | 7                      | thorough                                           |
| bottom_nav       | `bottom_nav_test.exs`           | 116 | 8                      | `<.link>` href fallback untested                   |
| indicator        | `indicator_test.exs`            | 143 | 10                     | every `data-position` exercised                    |
| swap             | `swap_test.exs`                 | 125 | 8                      | active state asserted but keyboard never simulated |
| **avatar**       | **MISSING**                     | 0   | 0                      | initials, src, sizes                               |
| **skeleton**     | **MISSING**                     | 0   | 0                      | type variants                                      |
| **empty_state**  | **MISSING**                     | 0   | 0                      | action slot                                        |
| **header**       | **MISSING**                     | 0   | 0                      | subtitle slot                                      |
| **theme_toggle** | covered indirectly in icon_test | —   | —                      | no JS-side test                                    |

## Tech debt

- `core.ex` is 367 lines for 17 components — manageable, but monolithic. Each component has a small footprint (~10-25 lines), so splitting has marginal value; however the lack of any private helper function means the module cannot evolve without copy-paste (e.g. avatar initials, button render-or-link branch).
- `Map.delete(assigns, :name)` in `icon/1` (`core.ex:83`) is a code smell — Phoenix.Component normally uses `assigns_to_attributes/2` with a drop list.
- `String.to_existing_atom/1` (`core.ex:82`) is the only such call in the surface — but it is in a render path and the user can supply the value, so it's worth fixing.
- `bottom_nav/1` `<.link>` renders even when no `href`/`navigate`/`patch` provided (`core.ex:309-320`) — `<.link>` defaults to `href="#"`, but a default-`#` link is a regression in screen-reader navigation and pollutes the focus order.

## Configuration & build

- `assets/js/index.js` exports `hooks` (`index.js:18-37`); `ExoThemeToggle` is registered (line 24). Good.
- No build-time validation that every `data-exo` attribute in `core.ex` has a corresponding CSS rule. A simple grep test would have caught the navbar/footer/bottom-nav/indicator/swap gap.
- `priv/static/exo.css` is committed. The current build is missing 5 components — either nobody re-built after adding them, or they were added without any CSS at all. Either way the publish artifact is broken.

## Documentation

- `core.ex:2-4` `@moduledoc`: 1 sentence.
- Each `def x` has a 1-line `@doc` (e.g. `core.ex:8`, `core.ex:44`). No examples, no slots usage hints, no a11y notes.
- `lucide.ex:8-22` is decent: shows two usage forms.
- No `data-exo` attribute reference table in module docs; consumers must read the source.
- `theme_toggle/1` says nothing about FOUC, `prefers-color-scheme`, or how to wire the hook (`core.ex:86`).

## Comparison vs shadcn/daisyUI

| Capability                                    | shadcn                                | daisyUI         | ExoUI core                                          |
| --------------------------------------------- | ------------------------------------- | --------------- | --------------------------------------------------- |
| Button: link/disabled/loading variants        | yes                                   | yes             | partial — link OK, disabled-link broken, no loading |
| Button: `asChild` / polymorphic root          | yes (`asChild`)                       | n/a             | partial via href detection                          |
| Badge: size variants                          | no (single size)                      | yes             | no                                                  |
| Avatar: image fallback to initials            | yes (Radix Avatar.Fallback)           | yes             | NO                                                  |
| Avatar: as link/button                        | yes                                   | yes             | NO                                                  |
| Theme toggle: a11y `aria-pressed`             | yes                                   | yes             | NO                                                  |
| Theme toggle: `prefers-color-scheme` reactive | yes                                   | yes             | NO                                                  |
| Indicator/badge overlay: positioned via CSS   | n/a                                   | yes             | data attr emitted, no CSS                           |
| Swap: keyboard accessible                     | yes (`role="switch"` + space toggles) | yes             | NO                                                  |
| Bottom nav: fixed mobile + safe-area          | n/a                                   | yes (`btm-nav`) | NO CSS                                              |
| Scroll area: shadow indicators                | yes                                   | no              | no                                                  |
| Icon: graceful fallback                       | yes (returns null)                    | n/a             | raises                                              |

ExoUI core sits below daisyUI's bar on 8 of 11 axes and below shadcn on 6. Five components ship without any CSS — that alone disqualifies the surface from a "minimum shadcn/daisyUI" claim until fixed.

## Recommendations (priority-ordered)

1. **Ship CSS for navbar, footer, bottom_nav, indicator, swap** (`assets/css/src/components/{navbar,footer,bottom-nav,indicator,swap}.css`) and rebuild `priv/static/exo.css`. Without this, four documented components are dead on arrival and `swap` is doubly dead.
2. **Fix `swap/1` keyboard access.** Remove `aria-hidden="true"` and `tabindex="-1"` from the input (`core.ex:359-360`). Move visual hiding to CSS (`opacity:0; position:absolute`) so the input remains focusable. Add `aria-checked` mirror.
3. **Default `button/1` to `type="button"`.** Add `attr :type, :string, default: "button"` and stop relying on `:rest`. Stops accidental form submits.
4. **Fix link-variant disabled state in `button/1`.** When `@rest[:disabled]` is true on the link path, set `aria-disabled="true"`, `tabindex="-1"`, and intercept click with a `phx-click={JS.push(false)}` no-op. Or refuse: only `<button>` may be disabled — compile-time assert.
5. **Make `icon/1` graceful.** Replace `String.to_existing_atom` (`core.ex:82`) with a `Map.fetch(@icon_paths, name)` lookup; on miss return a stable placeholder (or render `<!-- exo:icon-missing name -->`) and log a warning. Drop `Code.ensure_loaded!`.
6. **Ship a `[data-exo="icon"]` CSS rule** with size variants, and stop defaulting `class="size-4"` to a Tailwind-only utility (`core.ex:78`). Either commit to Tailwind as a peer dep (with a documented stub of `.size-4` in tokens) or use `data-size`.
7. **`theme_toggle/1`:** add `aria-pressed` per button, mirror in `theme_toggle.js:30-32`. Add a `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)` listener for system mode. Document the FOUC mitigation script.
8. **Add `aria-hidden="true"`** to the spinner SVG (`core.ex:212`) and the Lucide template (`lucide.ex:3324-3338`). The Lucide change is one line in a generator.
9. **Add tests for `avatar`, `skeleton`, `empty_state`, `header`** — basic render + slot tests like `navbar_test.exs`. Bring them in line with the rest.
10. **Add a browser test for `theme_toggle`.** It is the only JS hook in this surface. Verify localStorage, `data-theme` flips, and `data-active` mirrors `aria-pressed` once added.
11. **Fix `kbd.css:8`** — `--exo-font-mono` instead of `--exo-font`.
12. **Add `:icon` slot to `empty_state/1`** so users can pass `<.icon>` rather than emoji strings (`core.ex:189`).
13. **Add `as` polymorphism to `avatar/1`** (default `<span>`, optional `<a>`, `<button>`); add image error fallback.
14. **Convert page-mode stories to component-mode** where viable (skeletons exist for badge/button — copy the pattern). Brings 13 components back into storybook's playground.

## Open questions for the library owner

1. Is Tailwind a documented peer dependency? If yes, `class="size-4"` is fine — but it must be in the README. If no, the library must ship its own size utility or stop defaulting `class`.
2. Is the `system` theme expected to track OS changes at runtime, or only at page load? Current behaviour is "page load only" (`theme_toggle.js:23-25`).
3. Why is `--exo-font-mono` defined in `tokens.css:33` but unused? Intent for `kbd` and code blocks?
4. Why does `swap/1` exist if `theme_toggle/1` already covers the icon-flip use case? The intended use needs a story or the component should be removed.
5. Are `navbar`/`footer`/`bottom_nav` ever expected to be used standalone, or only inside `Layouts.app/1`? If the latter, the `data-exo` selectors should be scoped under a layout selector — and that should be documented (and tested).
