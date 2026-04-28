# Audit: Charts

**Date:** 2026-04-28
**Auditor:** Claude Opus 4.7 (subagent)
**Score:** 🟡 has problems
**Maturity:** ~45% vs shadcn/ui Charts (Recharts wrapper)

## TL;DR

Charts are pure SVG, no JS hooks, no Recharts dependency — solid for SSR. The public façade `ExoUI.Charts` exposes 18 functions and the cartesian/radial/primitives split is invisible to consumers. But the surface is below baseline: zero accessibility (no `role="img"`, no `aria-label`, no SR summaries), a hard `data-exo="progress-bar"` selector collision with the feedback `progress/1`, hardcoded HSL color palettes in pie/donut/radial stories, no `--exo-chart-*` tokens at all, and zero browser tests. The Elixir test suite at `test/exo_ui/charts_test.exs` covers smoke rendering for every public function but asserts nothing about empty/zero/negative edge behaviour beyond a single empty bar test.

## Surface map

### Public functions

All exposed via `ExoUI.Charts.*/1` (`lib/exo_ui/charts.ex:16-35`), auto-imported by `use ExoUI` (`lib/exo_ui.ex:86`).

Primitives (`lib/exo_ui/charts/primitives.ex`):
- `trend_badge/1` — up/down/flat percentage badge (`primitives.ex:12`)
- `sparkline/1` — inline SVG line + area (`primitives.ex:62`)
- `progress_bar/1` — labeled horizontal bar (`primitives.ex:128`)

Cartesian (`lib/exo_ui/charts/cartesian.ex`):
- `bar_chart/1` (`cartesian.ex:16`), `bar_chart_label/1` (`:588`), `bar_chart_multiple/1` (`:488`), `bar_chart_negative/1` (`:698`)
- `horizontal_bar_chart/1` (`:116`), `stacked_bar_chart/1` (`:310`)
- `line_chart/1` (`:807`), `line_chart_multiple/1` (`:895`)
- `area_chart/1` (`:202`), `area_chart_stacked/1` (`:1008`)

Radial (`lib/exo_ui/charts/radial.ex`):
- `pie_chart/1` (`:14`), `donut_chart/1` (`:47`), `donut_chart_text/1` (`:83`)
- `radar_chart/1` (`:137`), `radial_chart/1` (`:241`)

### Source modules

- `lib/exo_ui/charts.ex` — façade, 36 lines, delegates only
- `lib/exo_ui/charts/primitives.ex` — 145 lines, SR-friendly inline primitives
- `lib/exo_ui/charts/cartesian.ex` — 1131 lines, every bar/line/area variant
- `lib/exo_ui/charts/radial.ex` — 296 lines, pie/donut/radar/radial
- `lib/exo_ui/charts/helpers.ex` — 73 lines, public dimension/geometry helpers
- `lib/exo_ui/charts/shared.ex` — 241 lines, `__using__` macro injecting `to_number`, `format_tooltip`, `r/1`, catmull-rom path math, slice builders
- `assets/css/src/components/charts.css` — 83 lines, primitives-only styling
- `assets/js/index.js:1-37` — confirmed: zero chart hooks, charts are pure SVG SSR

### Tests

- `test/exo_ui/charts_test.exs` — 22 tests, smoke render checks (does HTML contain `data-exo="..."`, `<path>`, `<rect>`, the first label). Empty data covered for `bar_chart` (`:74`), `bar_chart_multiple` (`:93`), `bar_chart_label` (`:114`), `bar_chart_negative` (`:135`). Zero coverage for `area_chart`, `line_chart`, `line_chart_multiple`, `area_chart_stacked`, `horizontal_bar_chart`, `stacked_bar_chart`, all radials.
- `test/browser/*.spec.js` — none for charts (`ls test/browser/` confirms 11 specs, no `chart*.spec.js`).

### Storybook

- `storybook/stories/components/charts.story.exs` — umbrella `:page` story with all 16 chart variants in a 3-col grid (319 lines).
- One dedicated `:page` story per chart function (19 files). All use `<ExoUI.Charts.x ...>` direct module reference — no delegated `&ExoUI.Components.x/1` references means attribute introspection is a non-issue here.
- All stories are `use PhoenixStorybook.Story, :page` — none expose attribute panels (`Story, :component`), so consumers cannot tweak attrs in the UI.

## What works

- **Façade discipline.** `lib/exo_ui/charts.ex:16-35` exposes 18 functions through `defdelegate` only. Internal `Primitives`/`Cartesian`/`Radial`/`Helpers`/`Shared` carry `@moduledoc false` (`primitives.ex:2`, `cartesian.ex:2`, `radial.ex:2`, `helpers.ex:1`, `shared.ex:2`) — split is invisible.
- **Empty-state branch in cartesian.** Every bar variant short-circuits on empty data with `<div data-exo="chart-empty">{@empty_text}</div>` (e.g. `cartesian.ex:17`, `:117`, `:206`, `:311`, `:489`, `:589`, `:699`). Styled by `charts.css:62-68`.
- **Division-by-zero guards.** `H.safe_max/1` (`helpers.ex:65-67`) clamps `0` and `+0.0` to `1`. Range collapse guarded in line/area (`cartesian.ex:215`, `:813`, `:907`).  `Enum.max(_, fn -> 1 end)` fallback used consistently.
- **Decimal support.** `shared.ex:9` accepts `%Decimal{}` via `apply(Decimal, :to_float, ...)` so finance-shaped values do not crash.
- **Pie/donut full-circle edge case.** `shared.ex:148` and `:180` detect `sweep >= 2π - 0.001` and emit a two-arc full circle path — single-slice `[{"All", 100, color}]` does not collapse to nothing.
- **Catmull-Rom smoothing reused.** `shared.ex:38-71` is shared by line, area, and area-stacked. Single source of truth.
- **No JS hooks.** Confirmed in `assets/js/index.js:1-37`. Pure SSR-rendered SVG. Tree-shake-friendly for consumers without LiveView socket.
- **Responsive viewBox + `width:100%`.** Cartesian SVGs use `viewBox=0 0 600 H` plus `style="width:100%;"` (`cartesian.ex:74-77`, `:163`, `:263`, `:401`) — they do shrink horizontally. Radial use fixed `width={@size} height={@size}` (`radial.ex:30`).
- **Per-shape tooltip via `<title>`.** Every `<rect>`/`<path>` slice/arc has a child `<title>` (14 occurrences in cartesian, 4 in radial). This is the SVG native tooltip — works on hover in every browser without JS.

## What is missing or half-done

- **No SVG `role="img"` anywhere.** `grep "role=" lib/exo_ui/charts/*.ex` returns zero matches across 1645 lines. WAI-ARIA SVG guidance: every chart SVG must have `role="img"` + `aria-label` (or `aria-labelledby` pointing to a visible title). Without it, screen readers either skip the SVG entirely or read every `<text>` element separately as a wall of unrelated numbers.
- **No `aria-label` attribute.** Same grep — zero. Charts are functionally invisible to AT.
- **No `<desc>` element / SR summary.** No data summary for non-sighted users. shadcn Charts (Recharts wrapper) at least emits a hidden table fallback.
- **No `--exo-chart-*` design tokens.** `grep "exo-chart" assets/css/src/tokens.css` returns nothing. shadcn ships `--chart-1`...`--chart-5`. ExoUI delegates color choice to caller (`color="var(--exo-primary)"` defaults), so multi-series stories like the umbrella `pie_data` (`charts.story.exs:39-44`) hardcode raw HSL: `hsl(220, 70%, 50%)`. There is no theme-aware palette — these colors will not respect dark mode and bypass token overrides entirely.
- **No legend API for cartesian charts except `stacked_bar_chart`.** Only `stacked_bar_chart` renders a legend (`cartesian.ex:458-477`). `bar_chart_multiple`, `line_chart_multiple`, `area_chart_stacked` have a `color1`/`color2` API and zero legend output. Two indistinguishable curves with no key.
- **No y-axis ticks/labels at all.** Module doc explicitly says "No y-axis labels anywhere" (`charts.ex:8`). Faithful to shadcn aesthetic but means a viewer cannot read absolute values without hovering each bar.
- **No tooltip API beyond native SVG `<title>`.** Native `<title>` shows after a 500ms hover delay, blocks selection, never appears on touch, never reads on focus. Real charts need a custom tooltip.
- **No `id` on chart roots.** `bar_chart`, `line_chart`, `radar_chart`, etc. do not accept an `id` attr. Only `area_chart`/`area_chart_stacked` do (`cartesian.ex:199`, `:1006`) — and only because gradients need unique URLs. Consumers cannot target a chart for `aria-labelledby` from a sibling heading.
- **No browser test for charts.** 11 specs in `test/browser/`, none chart-related.
- **No mobile or dark-mode variants in stories.** Every chart story is a single light-mode, fixed-width card.
- **No story for `area_chart_stacked` accepting an `:id`.** Stories never override `id`, so the `:erlang.phash2/1` derived id (`cartesian.ex:203`, `:1009`) is the only path under test — concurrent renders with identical data on the same page would collide on gradient `id`.

## Per-component table

| Component | Status | Findings (file:line) | Recommended work |
| --- | --- | --- | --- |
| **Primitives** | | | |
| `trend_badge` | 🟡 P1 | No `aria-label` on the badge or its arrow svg (`primitives.ex:39-53`); flat case rendered as `&mdash;` only — SR reads "em dash" with no "no change" context | Add `aria-label={"#{direction} #{pct}%"}`; wrap arrow svg with `aria-hidden="true"`; flat case needs explicit text |
| `sparkline` | 🟡 P1 | Returns empty `<span></span>` for `length < 2` (`primitives.ex:64`) — silent dead pixel; no `role="img"`/`aria-label`; no `<title>` (`:95-117`) | Render placeholder with title for short data; add `role="img"` + `aria-label` derived from min/max/last value |
| `progress_bar` | 🔴 P0 | `data-exo="progress-bar"` (`primitives.ex:134`) **collides** with feedback `progress/1` inner bar at `feedback.ex:153`; CSS at `progress.css:28-33` applies `height:100%; background:var(--exo-primary)` to ANY `[data-exo="progress-bar"]` including the chart root div. Order of CSS load decides which wins. No `role="progressbar"`, no `aria-valuenow` (`primitives.ex:133-143`) | Rename chart attr to `data-exo="chart-progress-bar"` (or rename the feedback inner bar); add `role="progressbar"` + ARIA value attrs; expose `id` |
| **Cartesian** | | | |
| `bar_chart` | 🟡 P1 | No `role="img"`/`aria-label`; bar `<rect>` has no `tabindex` so keyboard users cannot reach tooltips (`cartesian.ex:82-92`) | Add chart-level a11y attrs; consider `<rect tabindex="0">` for keyboard discovery |
| `bar_chart_label` | 🟡 P1 | Same a11y gap; value labels rendered as floating `<text>` overlap on dense bars (`cartesian.ex:664-673`) — no collision detection | a11y attrs; rotate or skip overlapping labels |
| `bar_chart_multiple` | 🟡 P1 | No legend rendered (`cartesian.ex:548-578`) — two colored bars with no key. `empty_text` not declared as `attr` so callers passing it will get a Phoenix warning (`:489-491` uses `assign_new`) | Render legend; declare `attr :empty_text` |
| `bar_chart_negative` | 🟡 P1 | No a11y; zero baseline line (`cartesian.ex:766-773`) is good; positive labels rendered above chart (`pt - 6` in `:786-794`) — no per-bar value, only category label appears for both pos and neg | Add a11y; render value label per bar |
| `horizontal_bar_chart` | 🔴 P0 | CSS shared selector `[data-exo="horizontal-bar-chart"]` exists at `charts.css:73`, but the component emits `data-exo="h-bar-chart"` (`cartesian.ex:162`) — selectors never match. Same a11y gap | Pick one name and align CSS+HEEx |
| `stacked_bar_chart` | 🟡 P1 | Legend layout uses fixed 100px columns (`cartesian.ex:381-382, :458-475`) — labels longer than ~14ch overflow neighbour; legend positioned in SVG coord space, not HTML — cannot wrap or word-break | Move legend out of SVG into a sibling `<ul>` |
| `line_chart` | 🟡 P1 | No `empty_text` branch — empty data falls through to `Enum.min/max` defaults (`cartesian.ex:811-812`) which produce 0/1 range and a one-point degenerate curve, no error but visually "empty" with no message | Add empty-data short-circuit to match cartesian convention |
| `line_chart_multiple` | 🟡 P1 | Same: no empty-data branch (`cartesian.ex:895-1000`); no legend; default `color2` is 50%-alpha primary, near-invisible against light bg | Add empty branch; render legend; pick a distinguishable default |
| `area_chart` | 🟡 P1 | Empty branch present (`cartesian.ex:206`); gradient id derived from data hash (`:203`) — collision risk with same data on same page; no a11y | Allow `aria-label`; document id collision |
| `area_chart_stacked` | 🟡 P1 | No empty-data short-circuit (`cartesian.ex:1008-1019`); first series drawn ON TOP of second (`:1096-1113` reverse-stacks) — looks correct visually but fill-opacity 0.4 means series 2's area shows through; no legend | Empty branch; legend; document stacking semantics |
| **Radial** | | | |
| `pie_chart` | 🟡 P1 | No empty-data branch (`radial.ex:14-40`) — empty list reduces to total=1 then renders zero `<path>`s, blank SVG; no a11y | Empty state; `role="img"` + summary |
| `donut_chart` | 🟡 P1 | Same as pie; `inner_radius` not clamped against `outer_r` — passing `inner_radius={300}` with `size={250}` produces inverted donut (negative band) | Clamp `inner_r ≤ outer_r - 4` |
| `donut_chart_text` | 🟡 P1 | Same; center `<text>` has no `aria-live` or font-size scaling against size — at `size=120` 24px text overflows ring | Scale center text; treat as labelled region |
| `radar_chart` | 🟡 P1 | No empty branch — `count=0` makes `2π/count` blow up at `radial.ex:158`; labels positioned by trig at `(max_radius+16) * cos(angle)` (`:182-185`) without alignment per-quadrant — labels at 90° clip vs. labels at 0°; no a11y | Empty branch; per-quadrant `text-anchor`; a11y |
| `radial_chart` | 🟡 P1 | Sweep capped at 0.85 of full circle (`radial.ex:268`) — magic constant, undocumented; values exceeding `max_val` not clamped | Document; expose `max_sweep` attr |

Status legend: P0 (incorrect/misleading public API), P1 (works but below shadcn bar), P2 (polish), OK (acceptable).

## Problems by severity

### 🔴 Critical

#### 1. `data-exo="progress-bar"` selector collision

- **Where:** chart root at `lib/exo_ui/charts/primitives.ex:134` vs. feedback inner fill at `lib/exo_ui/components/feedback.ex:153`. CSS rules at `assets/css/src/components/charts.css:27-30` and `assets/css/src/components/progress.css:28-33`.
- **What happens:** Both components emit identical `data-exo="progress-bar"`. `progress.css:28-33` declares `height:100%; background:var(--exo-primary)` — applied to the chart's root `<div>` regardless of context. CSS load order in `priv/static/exo.css` decides which wins; one of the two components is always visually broken.
- **Why critical:** Public, shipped, breaks rendering depending on bundle order. Users cannot debug without reading source.
- **Reproduction:** drop `<.progress value={50} />` and `<ExoUI.Charts.progress_bar label="x" count={1} max={2} />` in the same page; inspect — chart root will inherit feedback's fill styles.
- **Fix:** rename chart selector to `data-exo="chart-progress"` (and children `chart-progress-track`, `chart-progress-fill`, etc.) — feedback owns the canonical `progress-bar` name.

#### 2. `horizontal_bar_chart` CSS dead selector

- **Where:** `assets/css/src/components/charts.css:73` selects `[data-exo="horizontal-bar-chart"]` but `lib/exo_ui/charts/cartesian.ex:162` emits `data-exo="h-bar-chart"`.
- **What happens:** the `font-family`/`color` rule never applies to horizontal bars; they inherit page font and `currentColor` only. Visual drift vs other cartesian charts.
- **Why critical:** silently broken, visible, and the asymmetry confuses any consumer trying to override.
- **Fix:** rename HEEx attribute to `horizontal-bar-chart` to match the other variants (`bar-chart`, `area-chart`, `stacked-bar-chart`).

#### 3. Zero accessibility across all 18 functions

- **Where:** every SVG root in `cartesian.ex`, `radial.ex`, `primitives.ex`. `grep "role=\|aria-label" lib/exo_ui/charts/*.ex` returns zero results.
- **What happens:** screen readers either silently skip the SVG or read every `<text>` element as orphan content. There is no chart-level summary, no labelled-by, no role.
- **Why critical:** WCAG 1.1.1 (non-text content) failure on every chart. shadcn's Recharts wrapper at least exposes `role="application"` and a hidden `<table>` fallback.
- **Fix:** add `attr :title, :string` and `attr :description, :string` to every chart, render `role="img" aria-labelledby="..."` with internal `<title>`/`<desc>` elements derived from data summary (min/max/sum/series count).

### 🟡 Medium

#### 4. No `--exo-chart-*` token namespace; multi-series stories hardcode HSL

- **Where:** `assets/css/src/tokens.css` has no chart tokens; `storybook/stories/components/charts.story.exs:39-44, :51-55`, `donut_chart.story.exs:9-13`, `pie_chart.story.exs:9-13`, `radial_chart.story.exs:8-12`, `donut_chart_text.story.exs:9-13` use literal `hsl(220, 70%, 50%)` etc.
- **What happens:** in dark mode these saturated HSLs do not adjust. There is no documented palette to override.
- **Fix:** ship `--exo-chart-1`...`--exo-chart-8` (light + dark) in `tokens.css`, document in README, switch stories to use them.

#### 5. Missing legend API for grouped/multi-series cartesian

- **Where:** `bar_chart_multiple` (`cartesian.ex:488-580`), `line_chart_multiple` (`:895-999`), `area_chart_stacked` (`:1008-1129`).
- **What happens:** two colored series, no caption — caller must build their own legend HTML. Inconsistent with `stacked_bar_chart` which does render one (`:458-477`).
- **Fix:** add `attr :legend, :list, default: nil` (list of `{label, color}`); render below chart.

#### 6. No empty-data branch for line/area/radial variants

- **Where:** `line_chart` (`cartesian.ex:807`), `line_chart_multiple` (`:895`), `area_chart_stacked` (`:1008`), `pie_chart` (`radial.ex:14`), `donut_chart` (`:47`), `donut_chart_text` (`:83`), `radar_chart` (`:137` — also DivByZero risk on `count=0`), `radial_chart` (`:241`).
- **What happens:** silent blank SVG or DivByZero on empty input. Cartesian bar variants do this correctly already (`cartesian.ex:17, 117, 206, 311, 489, 589, 699`) — convention exists, six functions deviate from it.
- **Fix:** `if Enum.empty?(@data) do <div data-exo="chart-empty">{@empty_text}</div> else ...` in each.

#### 7. Negative-data path only formally supported by `bar_chart_negative`

- **Where:** `bar_chart`, `bar_chart_label`, `bar_chart_multiple`, `horizontal_bar_chart`, `stacked_bar_chart`, area/line variants. With negatives, `Enum.max` is still positive, but bars compute `value/max * ch` — negative values produce negative `bar_height`, wrapped by `max(bar.height, 0)` (`cartesian.ex:86, 181, 559, 562, 657, 779`) — so bars silently disappear.
- **What happens:** caller passing `[{"Q1", -10}, {"Q2", 50}]` to `bar_chart` sees a single bar — no warning.
- **Fix:** document the contract; raise or warn on negatives in non-negative-aware variants, or auto-route to `bar_chart_negative`.

#### 8. Stories use `:page` mode — no attribute introspection panel

- **Where:** every chart story (`grep ":component" storybook/stories/components/{...chart...}.story.exs` returns zero).
- **What happens:** consumers cannot tweak `data`, `height`, `colors` from the Storybook UI. They get a static screenshot.
- **Fix:** convert single-variant stories (sparkline, trend_badge, progress_bar, area_chart, line_chart, pie_chart) to `:component` mode with `variations`.

#### 9. `bar_chart_multiple` `empty_text` not declared as attr

- **Where:** `cartesian.ex:489-491`. The function uses `assign_new(assigns, :empty_text, fn -> "No data" end)` because the empty branch was retrofitted, but no `attr :empty_text, :string, default: "No data"` declaration exists.
- **What happens:** Phoenix attribute introspection warns "undeclared attribute"; CI with `--warnings-as-errors` would fail.
- **Fix:** add the `attr` declaration alongside the others.

### 🟢 Minor

#### 10. `format_pct/1` (`shared.ex:33-34`) only emits "n" for whole percents — no `%` sign appended in trend_badge flat path

`primitives.ex:44`/`:50` outputs "{format_pct(@pct)}%" so the suffix is added — works, but the pattern is brittle and `format_pct(50)` returns `"50"` (string of integer), not "50.0". Fine.

#### 11. `:erlang.phash2/1` derived gradient ids

`cartesian.ex:203`, `:1009`, `primitives.ex:90` use `phash2(values)` for SVG `<defs>` ids — collision-safe enough for unique data, but two charts on the same page with identical data emit the same `id`, and SVG gradient resolution is global per document.

#### 12. `to_number` returns `0.0` on unknown input (`shared.ex:11`)

Silent fallback — bad data renders as zero with no warning. Helpful for UI safety, hostile to debugging.

#### 13. `stacked_bar_chart` requires `:colors` map but never reuses chart token palette

Caller must provide colors (`cartesian.ex:306`). No default palette mapping. Combined with finding #4.

## Accessibility analysis

- **Roles & semantics:** zero. No `role="img"`, no `role="presentation"`, no `role="figure"`. Every chart SVG renders as anonymous graphical content. AT skips them by default.
- **Keyboard:** no `tabindex` on any element — bars/slices cannot receive focus, native `<title>` only fires on hover, never on focus or touch. Charts are inaccessible to keyboard-only users.
- **Focus management:** N/A — nothing is focusable.
- **ARIA wiring:** `aria-valuenow`/`aria-valuemin`/`aria-valuemax` would belong on `progress_bar/1` (chart) — not present (`primitives.ex:128-144`). Compare `feedback.ex:148-152` which gets it right for `progress/1`.
- **Screen reader summary:** no `<desc>`, no offscreen `<table>` fallback, no aria-describedby. shadcn's Recharts (which the moduledoc claims as inspiration) emits a hidden table with category/value pairs. ExoUI does not.
- **Reduced motion:** N/A (charts have no animation today). `primitives.ex:140` uses `transition: width 300ms` via CSS — `progress.css` does not honour `prefers-reduced-motion`. Cross-cutting CSS audit territory.
- **Trend badge `&mdash;`:** flat case (`primitives.ex:52`) reads as "em dash" — should read "no change".

## Composition & HTML correctness

- **No nested buttons / links.** Charts are pure SVG inside a `<svg>` root or `<div data-exo="...">` wrapper. Clean.
- **No slot contracts.** Charts do not accept `inner_block` or named slots — entirely data-driven. `area_chart` and friends accept only `data`/`height`/`color`/`id`. No `as_child` escape hatch.
- **No global rest attributes.** None of the chart `attr` declarations include `attr :rest, :global` — consumers cannot pass `class`, `style`, `id`, `aria-*` through to the SVG root. Compare to feedback `progress/1` (`feedback.ex:134`) which accepts `:rest`. **This is a hard barrier to fixing the a11y gap from outside.**
- **Form integration:** N/A.

## Browser & visual coverage

- **Playwright specs:** zero for charts. `ls test/browser/` confirms no `chart*.spec.js`. The 11 specs cover only interactive overlays.
- **Untested paths:** keyboard focus, hover tooltip, dark mode, mobile width, RTL, `prefers-reduced-motion`.
- **Visual regression:** no baseline. `scripts/capture_storybook_components.js` captures Storybook screenshots but charts use `:page` stories which produce one image each — no per-state matrix.

## CSS surface

- **Tokens consumed:** `--exo-font`, `--exo-text-sm`/`xs`, `--exo-foreground`, `--exo-muted-foreground`, `--exo-success`, `--exo-danger`, `--exo-muted`, `--exo-primary`, `--exo-space-2`/`8`, `--exo-easing` (`charts.css:1-83`).
- **Tokens missing:** no `--exo-chart-*`. Series colors come from caller-supplied `var(--exo-primary)` defaults or hardcoded HSL.
- **Dark mode parity:** charts inherit `currentColor` for grid lines (`cartesian.ex:79`, `:274`, etc.) and text fills (`fill="currentColor"`) — these auto-adapt. But the `[data-theme="dark"]` overrides at `tokens.css` (compiled to `priv/static/exo.css:1`) only flip the foreground/muted tokens, not any chart palette. Multi-series charts with hardcoded HSL stay light-saturated in dark mode.
- **Override surface:** consumers can override `--exo-primary` / `--exo-success` / `--exo-danger` to recolor single-series charts. They cannot recolor multi-series without rewriting the call site.
- **Dead CSS:** `charts.css:73` selects `[data-exo="horizontal-bar-chart"]` — never matches, see finding #2.
- **No `!important`** in `charts.css`. Good.
- **No `prefers-reduced-motion`** guard. The only animated property is `progress-bar-fill` width transition (`charts.css:56-60`).

## JS hook quality

N/A — confirmed by reading `assets/js/index.js:1-37`. Charts are pure SVG. This is a strength: SSR-only, no socket dependency, instant TTFB.

## Storybook quality

- **Pages exist:** every chart function has a dedicated story file (19 files including the umbrella `charts.story.exs`).
- **States covered:** default only. No empty, no negative, no large dataset, no dark mode, no mobile width, no narrow card.
- **Attribute introspection:** N/A — every story uses `:page` mode, no introspection panel anywhere.
- **Direct module reference:** all stories use `<ExoUI.Charts.x ...>` (e.g. `bar_chart.story.exs:27`). No delegated reference issue here.
- **Phoenix form examples:** N/A.
- **Card wrapping repetition:** every story copies the same `<div data-exo="card">...<card-header>...<card-body>` boilerplate. 19 copies of near-identical wrapper.
- **Umbrella story is unmaintainable:** `charts.story.exs` is 319 lines with copy-pasted footers (`Trending up by 5.2% this month` repeated 17 times verbatim — `:82, :97, :112, :127, :142, :157, :172, :187, :202, :217, :232, :247, :262, :277, :292, :311`).

## Test coverage

- **Existing test files:** `test/exo_ui/charts_test.exs` — 22 tests, 273 lines. All `~H` smoke-render assertions on `data-exo` attributes and presence of basic SVG tags.
- **Scenarios covered:** default render for all 18 public functions; empty-data branch for 4 of 7 cartesian variants (`bar_chart`, `bar_chart_multiple`, `bar_chart_label`, `bar_chart_negative`).
- **NOT covered:** empty data for line/area variants, all radials. Negative values (only `bar_chart_negative` test passes negatives — others not tested with negatives at all). Decimal values. Float values. Single-element data (degenerate range). Very large datasets (label step / overflow). Color override. Dark theme. Concurrency on `:erlang.phash2` id collision. `progress_bar` ARIA. Trend badge "flat" branch missing assertion (no test covers `current == previous`).
- **Flakiness signals:** none — synchronous render, no `Process.sleep` anywhere.

## Tech debt

- **TODO/FIXME:** none in chart files.
- **Dead code:** `charts.css:73` rule (finding #2). `__moduledoc false` on `helpers.ex` while functions are technically public — public-but-undocumented is a small smell.
- **Convention drift:** four cartesian variants short-circuit on empty data, three do not. Eight functions accept `:color`, three accept `:color1`/`:color2`, one accepts `:color_positive`/`:color_negative`, one accepts `:colors` map — no unified series-color contract.
- **Magic constants:** `radial.ex:268-270` `0.85 * 2π` sweep limit; `helpers.ex:60` 3-character label slice; `charts.css` legend column width `100px` (`cartesian.ex:381`).

## Configuration & build

- **Public API exposure:** `ExoUI.Charts` only. NOT in `ExoUI.Components` (verified `lib/exo_ui/components.ex:1-100`). Imported by `use ExoUI` (`lib/exo_ui.ex:86`). Consumers wanting to skip charts have no `use ExoUI, charts: false` opt-out — `:core_components` flag (`lib/exo_ui.ex:34`) does not extend to charts.
- **Build artifacts:** `priv/static/exo.css` includes the chart styles (verified by grep `progress-bar` in compiled output — present).
- **Tree-shakability:** none. All 18 functions ship as one module set; consumers using only `sparkline` still load every chart helper.

## Documentation

- **Existing:** module-level `@moduledoc` on `ExoUI.Charts` (`charts.ex:2-12`) describing shadcn Recharts conventions; `@doc` lines on every public function (e.g. `cartesian.ex:10`, `:110`, `:195`, `:303`, `:482`, `:582`, `:691`, `:802`, `:889`, `:1001`).
- **Missing:** no docs on `data` shape contract per chart variant. `bar_chart` expects `[{label, value}]`; `bar_chart_multiple` expects `[{label, value1, value2}]`; `stacked_bar_chart` expects `[{label, %{key => value}}]`; `pie_chart` expects `[{label, value, color}]`. None of this is documented; users learn by crashing.
- **README:** mentions `ExoUI.Charts` as a namespace (`README.md:182`) — that is it.
- **CHANGELOG:** `0.1.0` notes the split (`CHANGELOG.md:17-18`) — accurate.
- **Out of date:** none material.

## Comparison vs shadcn/daisyUI

- **Where ExoUI matches:** identical visual conventions to shadcn Charts (no y-axis, subtle grid, 3-char x-axis labels, smooth catmull-rom curves) — moduledoc says so explicitly and the code follows. Pure-SSR is a real win over Recharts' client-only render.
- **Where ExoUI lags:**
  1. **Tooltip.** shadcn's `<ChartTooltip />` is a real interactive overlay with focus support. ExoUI relies on native SVG `<title>` — half-second hover delay, no focus, no touch.
  2. **Legend.** shadcn ships a `<ChartLegend />` slot. ExoUI has it only for `stacked_bar_chart`.
  3. **Theme palette.** shadcn ships `--chart-1` through `--chart-5` in light + dark (`globals.css`). ExoUI ships zero chart tokens.
  4. **Accessibility.** shadcn's chart container exposes `role="application"` and a hidden table fallback. ExoUI exposes nothing.
  5. **No grouped variants.** daisyUI doesn't ship charts (notable — shadcn does, ExoUI rightly tracks shadcn). But ExoUI's grouped variants (`bar_chart_multiple`, `line_chart_multiple`) max at 2 series — shadcn supports N.

## Recommendations (priority-ordered)

1. **[Critical, S]** Rename chart `data-exo="progress-bar"`/`progress-bar-track`/`progress-bar-fill` to `chart-progress*`. Update `lib/exo_ui/charts/primitives.ex:128-144` and `assets/css/src/components/charts.css:27-60`. Add a regression test asserting the chart root attribute.
2. **[Critical, S]** Fix the dead selector: rename `data-exo="h-bar-chart"` (`cartesian.ex:162`) to `horizontal-bar-chart` to match `charts.css:73`.
3. **[Critical, M]** Add `role="img"` and `aria-label` (or `aria-labelledby`) to every chart SVG root. Add an `attr :rest, :global` to every chart so consumers can pass `id`/`aria-*`/`class` from the call site. Add `attr :title, :string` and `attr :description, :string` rendered as internal `<title>`/`<desc>`.
4. **[High, M]** Ship `--exo-chart-1`..`--exo-chart-8` design tokens in `assets/css/src/tokens.css` for both light and dark. Switch stories that hardcode HSL to consume them. Document override.
5. **[High, S]** Add empty-data short-circuit to `line_chart`, `line_chart_multiple`, `area_chart_stacked`, `pie_chart`, `donut_chart`, `donut_chart_text`, `radar_chart`, `radial_chart`. Reuse the `chart-empty` div pattern.
6. **[High, S]** Declare missing `attr :empty_text` on `bar_chart_multiple` (`cartesian.ex:488-491`).
7. **[Medium, M]** Add a uniform `attr :legend, :list` to `bar_chart_multiple`, `line_chart_multiple`, `area_chart_stacked`. Render an HTML legend below the SVG (NOT inside the SVG — see stacked_bar_chart finding #5).
8. **[Medium, S]** Add `attr :id, :string, default: nil` to every chart that emits internal `<defs>`/gradient ids. Stop relying solely on `:erlang.phash2` collisions.
9. **[Medium, M]** Convert single-variant stories (sparkline, trend_badge, progress_bar, area_chart, line_chart, pie_chart) to `:component` mode with `variations` for empty/large/dark/negative.
10. **[Quick win, S]** Add browser test under `test/browser/charts.spec.js` with at least: render, hover-tooltip-visible, dark mode parity, mobile width.

## Open questions for the library owner

- **Tooltip strategy.** Is the project committing to native SVG `<title>` forever, or is a custom JS-driven tooltip on the roadmap? This affects every chart's a11y story.
- **Multi-series ceiling.** `bar_chart_multiple` is hardcoded to 2 series via `{label, v1, v2}`. Is a 3+ series API in scope, or is `stacked_bar_chart` the official escape hatch?
- **Dark mode palette ownership.** Should chart tokens be owned by ExoUI or pushed to consumer themes? shadcn ships defaults; this is a stylistic decision.
- **Accessibility commitment.** Are charts considered "informative" (need full SR support) or "decorative dashboards" (`aria-hidden="true"` is acceptable)? The current code is somewhere between, which is the worst of both.
