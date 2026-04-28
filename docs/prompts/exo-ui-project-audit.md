# ExoUI — Deep Project And Component Audit (Prompt)

> Run this prompt in a fresh Claude Code session (Opus 4.7) inside the
> `/Users/miso/Developer/exo_ui` repo. Self-contained — everything the agent
> needs is in this file.

---

## Role and context

You are a **senior Phoenix/LiveView library architect + accessibility/UX auditor**
with 10+ years of experience building component libraries comparable to
shadcn/ui, daisyUI, Radix, Headless UI. You are running a **maximum-depth audit**
of ExoUI — a Phoenix LiveView UI component library that ships HEEx components,
token-driven CSS, and small JS hooks. The goal is to honestly map where ExoUI
stands relative to a "minimum shadcn/daisyUI" bar.

**Repo:** `/Users/miso/Developer/exo_ui`

**Key paths:**

- `lib/exo_ui/` — top-level public API (`ExoUI`, `ExoUI.Components`, `ExoUI.Layouts`, `ExoUI.Charts`, `ExoUI.Lucide`, `ExoUI.Utils`)
- `lib/exo_ui/components/` — `core.ex`, `data_display.ex`, `feedback.ex`, `form.ex`, `overlay.ex`
- `lib/exo_ui/components/charts/` — `cartesian.ex`, `radial.ex`, `primitives.ex`, `helpers.ex`, `shared.ex`
- `assets/js/hooks/` — JS hooks (accordion, carousel, collapsible, combobox, command_palette, context_menu, dropdown_menu, hover_card, menubar, overlay, popover, rating, select, sidebar, theme_toggle, tooltip)
- `assets/js/index.js` — hook registration entry
- `assets/css/src/` — `tokens.css`, `themes/`, `layouts/`, `components/*.css` (~46 files)
- `priv/static/exo.css` and `priv/static/exo.tokens.css` — built artifacts
- `test/exo_ui/components/*_test.exs` — Elixir render/unit tests (~50 files, 431+ tests)
- `test/browser/*.spec.js` — Playwright browser tests (12 files)
- `storybook/` — separate Phoenix Storybook app (own `mix.exs`, own `stories/`)
- `storybook/stories/components/*.story.exs` — Storybook stories
- `scripts/capture_storybook_components.js` — artifact capture script
- `mix.exs`, `package.json` — root build config
- `playwright.config.js` — browser test config
- `README.md`, `CHANGELOG.md`

**Build & test commands:**

- `mix test` — Elixir tests
- `mix compile --warnings-as-errors` — strict compile
- `bun run build:all` — rebuild `priv/static/exo.css` + `exo.tokens.css`
- `bun run test:browser` — Playwright browser tests
- `bun run capture:components` — Storybook artifact capture (screenshots + videos)
- Storybook itself: `cd storybook && mix phx.server`

**Reference baseline:** the previous audit at
`docs/audits/2026-04-24-exo-ui-project-analysis.md` is your **starting reference
only** — read it once for context, then verify everything against current code.
Do not copy its conclusions; many components have been touched since
(see git status: `command_palette`, `menubar`, `rating`, `context_menu`, hooks,
overlay, form, etc.). Today is **2026-04-28**.

---

## Operating rules (NON-NEGOTIABLE)

1. **Never invent.** If something is not in the code, write "NOT FOUND".
   Do not infer behavior from a module name.
2. **Cite `file:line` for every claim.** Format: `lib/exo_ui/components/form.ex:142`.
   No file:line reference → the claim does not count.
3. **Read whole modules, not snippets.** Do not draw conclusions from the first
   50 lines of an 800-line file. Re-read in two or three passes if needed.
4. **Do not write code outside `docs/audits/2026-04-28/`.** Audit only.
5. **Direct, brutal, no flattery.** If something is bad — say bad, with proof.
   If something is solid — say solid, with the reason. No softening.
6. **Output = one file per category** in `docs/audits/2026-04-28/<NN>-<slug>.md`,
   plus master `docs/audits/2026-04-28/README.md`.
7. **No `Co-Authored-By` lines anywhere.** No emojis in code or docs (except
   `🟢🟡🔴` status indicators in tables, which are required).
8. **Bash:** no `&&`, `2>&1`, `| tail`, `| head`. Plain commands, separate calls.
9. **mix commands:** plain `mix <cmd>` is fine here (no `mise exec` required).
10. **Verify with the build before claiming "broken".** If you say a hook is
    missing, grep `assets/js/index.js` and `priv/static/`. If you say a test
    fails, name the spec.

---

## Strategy: parallel subagents (superpowers:dispatching-parallel-agents)

**MANDATORY.** Do not run the audit serially. Use parallel subagents.

### Phase 0 — Setup (serial, you the main agent)

1. Read `README.md`, `CHANGELOG.md`, `mix.exs`, `package.json`, `playwright.config.js`,
   `storybook/mix.exs`, and the previous audit at
   `docs/audits/2026-04-24-exo-ui-project-analysis.md` (context only).
2. `ls lib/exo_ui/components/` and `ls lib/exo_ui/components/charts/` — map current modules.
3. `ls assets/js/hooks/` and read `assets/js/index.js` — map hook surface.
4. `ls assets/css/src/components/` — map CSS surface.
5. `ls test/exo_ui/components/` and `ls test/browser/` — map test surface.
6. `ls storybook/stories/components/` — map Storybook surface.
7. Run baseline: `mix test`, `mix compile --warnings-as-errors`, `bun run build:all`,
   `bun run test:browser`. Record pass/fail counts in your scratch.
8. Create `docs/audits/2026-04-28/` directory.
9. Create a TodoWrite list with the 8 categories below as tasks.

### Phase 1 — Parallel deep audit (one subagent per category)

Dispatch all 8 in batches of 4-6 parallel (one message, multiple Agent tool
calls). Use `Explore` subagent_type for read-only categories;
`general-purpose` only when the agent needs to run bash (e.g. tests,
`mix xref`).

**Each subagent gets a STRICT brief with:**

- Category name + scope
- List of files and contexts the subagent MUST read in full (not just grep)
- Per-category template (below) which it MUST fill in
- Output path: `docs/audits/2026-04-28/<NN>-<slug>.md`
- Rule: "file:line for every claim"
- Limit: max 600 lines of markdown per category (quality > quantity)
- Order: "do not write code, audit only"

**Subagent brief template:**

```text
You are doing a deep audit of the "<CATEGORY>" surface of the ExoUI
Phoenix LiveView UI component library.

Repo: /Users/miso/Developer/exo_ui
Output: docs/audits/2026-04-28/<NN>-<slug>.md (create new, do not append)

Rules:
- Read whole modules, not snippets
- Every claim → file:line reference
- Direct, no softening
- Do not write code outside the output file
- Max 600 lines of markdown
- ExoUI is a UI library (no multi-tenancy, no auth, no payments) —
  audit dimensions are: public API quality, accessibility,
  composition/HTML correctness, form integration, browser/keyboard
  behavior, Storybook coverage, CSS architecture, JS hook quality,
  comparison vs shadcn/daisyUI

Files you MUST read (in full):
<category-specific list>

Tests you MUST review:
<category-specific list>

Storybook stories you MUST review:
<category-specific list>

Fill the template (below) — every section is mandatory, "N/A" only if
genuinely empty.

Return: path to the written file + 5 hardest problems as a bullet list.
```

### Phase 2 — Cross-cutting analysis (4 parallel subagents)

After per-category reports are written, dispatch 4 parallel agents:

- **Accessibility cross-cutting** — sweep all categories for missing a11y:
  focus trap, escape close, roving tabindex, `aria-*` wiring, `role` accuracy,
  keyboard parity, screen-reader labels, reduced-motion, `inert` usage.
- **JS hook & client architecture cross-cutting** — read every file under
  `assets/js/hooks/` and `assets/js/index.js`. Check: hook lifecycle
  (`mounted/destroyed/updated`), event listener leaks, `phx-update="ignore"`
  consistency, server↔client state contracts, server events the hook depends on.
- **CSS architecture & tokens cross-cutting** — `assets/css/src/tokens.css`,
  `themes/`, `layouts/`, all `components/*.css`. Check: token coverage,
  dark mode parity, `:where()` specificity discipline, dead CSS, RTL,
  `prefers-reduced-motion`, `prefers-color-scheme`, override surface.
- **Storybook & docs cross-cutting** — Storybook story quality (delegated vs
  direct module references, missing states, dark mode, mobile width),
  README/CHANGELOG drift vs current code, attribute introspection warnings,
  capture script output.

Output: `docs/audits/2026-04-28/cross-cutting-<area>.md` (max 400 lines each).

### Phase 3 — Synthesis (you, the main agent)

Read every file in `docs/audits/2026-04-28/` and write
`docs/audits/2026-04-28/README.md` master report (template below). Max 300
lines. Concrete, no generic advice.

---

## Categories (8 — each gets its own subagent)

### Core platform

1. **Core components** — `button`, `badge`, `separator`, `icon`, `theme_toggle`,
   `header`, `avatar`, `skeleton`, `empty_state`, `spinner`, `kbd`,
   `scroll_area`, `navbar`, `footer`, `bottom_nav`, `indicator`, `swap`.
   Source: `lib/exo_ui/components/core.ex` (and any imports it pulls).
2. **Form components** — `form`, `input` (text/checkbox/textarea/select),
   `toggle`, `select`, `combobox`, `radio_group`, `slider`, `date_picker`,
   `rating`, `fieldset`, `file_input`. Source: `lib/exo_ui/components/form.ex`.
   Verify field-struct integration, `aria-invalid`/`aria-describedby` wiring,
   error and description ID stability, form submission values.
3. **Overlay & menu** — `modal`, `confirm_modal`, `popover`, `dropdown_menu`,
   `dropdown` (deprecated?), `tooltip`, `collapsible`, `drawer`, `sheet`,
   `hover_card`, `context_menu`, `command_palette`, `menubar`. Source:
   `lib/exo_ui/components/overlay.ex` plus `assets/js/hooks/{popover,dropdown_menu,hover_card,context_menu,command_palette,menubar,overlay,collapsible,tooltip}.js`.
   Verify dialog contract: focus trap, escape close, required title, outside
   inert, focus restore, `aria-modal`.
4. **Data display & navigation** — `table`, `list`, `content_card`, `stat_card`,
   `metric_card`, `wizard_sidebar`, `breadcrumb`, `tabs`, `pagination`,
   `steps`, `timeline`, `carousel`, `accordion`, `hero`, `chat_bubble`. Source:
   `lib/exo_ui/components/data_display.ex` plus `assets/js/hooks/{accordion,carousel,sidebar}.js`.
5. **Feedback** — `flash`, `flash_group`, `toast_container`, `alert`,
   `progress`, `radial_progress`. Source:
   `lib/exo_ui/components/feedback.ex`.
6. **Charts** — primitives (`trend_badge`, `sparkline`, `progress_bar`),
   cartesian (`bar_chart*`, `line_chart*`, `area_chart*`, `horizontal_bar_chart`),
   radial (`donut_chart*`, pie, radial). Source:
   `lib/exo_ui/components/charts/{primitives,cartesian,radial,helpers,shared}.ex`
   and the `ExoUI.Charts` public façade. Verify `aria-label`, empty/zero/negative
   data, legends, screen-reader summaries.
7. **Layouts & app shell** — `sidebar_layout`, `sidebar_item`, plus any layout
   helpers in `ExoUI.Layouts`. Source: `lib/exo_ui/layouts.ex` and
   `assets/css/src/layouts/`. Verify localStorage state contract, skip link,
   mobile focus, `aria-expanded` sync.

### Cross-cutting (Phase 2 — separate subagents)

8. **Cross-cutting** is split into four parallel reports — see Phase 2 above
   (accessibility, JS hooks, CSS, Storybook/docs).

> Total expected output: 7 category reports + 4 cross-cutting reports + 1
> master README = **12 files**.

---

## Per-category template (subagent fills in)

```markdown
# Audit: <Category name>

**Date:** 2026-04-28
**Auditor:** Claude Opus 4.7 (subagent)
**Score:** 🟢 solid / 🟡 has problems / 🔴 critical
**Maturity:** ~X% (subjective vs shadcn/daisyUI)

## TL;DR (max 5 lines)

State of this category in one paragraph. Three biggest problems, one
sentence each.

## Surface map

### Public functions

- `ExoUI.Components.foo/1` — one line description
- `ExoUI.Layouts.bar/1` — one line description

### Source modules

- `lib/exo_ui/components/foo.ex` — what it owns
- `assets/js/hooks/foo.js` — what the hook does
- `assets/css/src/components/foo.css` — visual surface

### Tests

- `test/exo_ui/components/foo_test.exs` — N tests, what they assert
- `test/browser/foo.spec.js` — N specs, what they verify

### Storybook

- `storybook/stories/components/foo.story.exs` — variants covered

## What works (with proofs)

- Concrete things + file:line + why this is good
- Do not write "robust error handling" — quote the relevant code

## What is missing or half-done

- Concrete gaps + why they are gaps
- "Should be X" line in docs/baseline + line in code where X is NOT

## Per-component table

| Component | Status | Findings (file:line) | Recommended work |
| --- | --- | --- | --- |
| `foo` | 🔴 P0 | concrete issue + ref | concrete fix |
| `bar` | 🟡 P1 | ... | ... |
| `baz` | 🟢 OK | ... | minor polish |

Status legend: P0 (incorrect/misleading public API), P1 (works but below
shadcn/daisyUI bar), P2 (polish), OK (acceptable for current role).

## Problems by severity

### 🔴 Critical (broken public API, invalid HTML, accessibility blockers)

#### 1. <Title>

- **Where:** `lib/exo_ui/components/foo.ex:142-156`
- **What happens:** concrete description with code snippet
- **Why critical:** consequence (e.g. "renders `<button>` inside `<button>` —
  invalid HTML, real browsers handle it differently")
- **Reproduction:** steps or scenario (Storybook page, browser test)
- **Suggested fix:** pseudocode/instructions only — do NOT write code in repo

### 🟡 Medium (UX problems, missing variants, incomplete a11y)

#### N. ...

### 🟢 Minor (cleanup, naming, docs)

#### N. ...

## Accessibility analysis

- **Roles & semantics:** what is correct, what is wrong (file:line)
- **Keyboard:** Tab/Shift+Tab/Arrows/Enter/Escape parity per component
- **Focus management:** trap, restore, initial focus, visible focus ring
- **ARIA wiring:** `aria-expanded`, `aria-controls`, `aria-describedby`,
  `aria-invalid`, `aria-pressed`, `aria-current`, `aria-modal` — gaps
- **Screen reader:** label sources, live regions, hidden text
- **Reduced motion:** `prefers-reduced-motion` respected?

## Composition & HTML correctness

- **Trigger composition:** does the trigger slot wrap user content in a
  hardcoded `<button>` (creates nested-button bug)?
- **Slot contracts:** do slots accept rest attrs? Is there an `as_child`-like
  escape hatch?
- **Form integration:** does the control submit the right value? Does it
  accept a `Phoenix.HTML.FormField` struct and surface errors?

## Browser & visual coverage

- **Playwright spec coverage:** which interactive components have specs?
- **Untested paths:** keyboard, disabled, error, empty, loading
- **Visual regression:** is there a baseline? Capture script output?

## CSS surface

- **Tokens used:** which `--exo-*` custom properties this category depends on
- **Dark mode parity:** verified per component or only "should work"?
- **Override surface:** can a consumer override variants without `!important`?
- **Dead CSS:** unused selectors, orphan keyframes

## JS hook quality (if applicable)

- **Lifecycle:** `mounted`, `updated`, `destroyed` — leaks?
- **Event listeners:** added/removed correctly?
- **Server↔client contract:** what events does the hook emit/expect?
- **`phx-update="ignore"`:** used where needed?

## Storybook quality

- **Pages exist:** which functions have dedicated story routes?
- **States covered:** default, hover, focus, disabled, error, loading,
  long content, dark mode, mobile width
- **Attribute introspection:** "cannot load attributes" warnings? (caused by
  `function: &ExoUI.Components.x/1` delegated references — should be direct
  module function)
- **Phoenix form examples:** present?

## Test coverage

- **Existing test files:** list with one-line summary
- **Scenarios covered:** happy path, edge cases, error cases
- **NOT covered:** concrete gaps
- **Flakiness signals:** `Process.sleep`, `setTimeout`, racy assertions

## Tech debt

- **TODO/FIXME in this surface:** list with file:line
- **Dead code:** unused functions, deprecated modules, commented-out blocks
- **Convention drift:** what differs from the rest of the library

## Configuration & build

- **Public API exposure:** is the function exposed via `ExoUI.Components`,
  `ExoUI.Layouts`, or only via direct module?
- **Build artifacts:** does this category contribute to `priv/static/exo.css`?
  Is it tree-shakable?

## Documentation

- **Existing:** module docs, function docs, README references
- **Missing:** what should be documented
- **Out of date:** places where docs disagree with code

## Comparison vs shadcn/daisyUI

- **Where ExoUI matches:** concrete strengths
- **Where ExoUI lags:** concrete behaviors shadcn/daisyUI provide that ExoUI
  does not (do not list everything — pick the 3-5 most impactful)

## Recommendations (priority-ordered)

1. **[Critical]** Concrete action + estimated effort (S/M/L)
2. **[High]** ...
3. **[Medium]** ...
4. **[Quick win]** ...

## Open questions for the library owner

- Things the audit cannot resolve without product/design intent
```

---

## Master README format

```markdown
# ExoUI Project Deep Audit — 2026-04-28

**Auditor:** Claude Opus 4.7 (parallel subagents + synthesis)
**Categories audited:** 7 + 4 cross-cutting
**Audit duration:** ~X hours real-time
**Repo SHA:** <output of `git rev-parse HEAD`>

## Verification baseline

| Check | Result | Notes |
| --- | --- | --- |
| `mix test` | Pass/Fail | N tests, M failures |
| `mix compile --warnings-as-errors` | ... | ... |
| `bun run build:all` | ... | ... |
| `bun run test:browser` | ... | ... |
| Storybook smoke | ... | ... |

## Executive summary (max 15 lines)

State of the library in three paragraphs: where ExoUI is solid, where it
bleeds, top 3 strategic risks vs the "minimum shadcn/daisyUI" bar. No
softening.

## Category score table

| #   | Category               | Score | 🔴  | 🟡  | 🟢  | Test cov     | Notes              |
| --- | ---------------------- | ----- | --- | --- | --- | ------------ | ------------------ |
| 1   | Core components        | 🟡    | 0   | 6   | 11  | unit ✓ / browser ✗ | icon/theme_toggle gaps |
| 2   | Form components        | ...   | ... | ... | ... | ...          | ...                |
| 3   | Overlay & menu         | ...   | ... | ... | ... | ...          | dialog contract    |
| 4   | Data display & nav     | ...   | ... | ... | ... | ...          | ...                |
| 5   | Feedback               | ...   | ... | ... | ... | ...          | ...                |
| 6   | Charts                 | ...   | ... | ... | ... | ...          | ...                |
| 7   | Layouts & app shell    | ...   | ... | ... | ... | ...          | ...                |

**Totals:** X 🔴 critical, Y 🟡 medium, Z 🟢 minor.

## Top 15 critical findings (whole library)

1. **[Category]** Title — `file:line` — consequence in one sentence
2. ...

## Cross-cutting findings

### Accessibility

(summary from `cross-cutting-accessibility.md`)

### JS hooks

(summary from `cross-cutting-js-hooks.md`)

### CSS architecture

(summary from `cross-cutting-css.md`)

### Storybook & docs

(summary from `cross-cutting-storybook-docs.md`)

## Quick wins (low effort, high impact)

1. ... (concrete, with effort estimate)

## Strategic recommendations (3-6 months)

1. **Priority 1:** ...
2. ...

## What is solid (so we don't break it)

- ...

## Open questions for the library owner

- ...

## Index of all reports

- [01-core-components.md](./01-core-components.md)
- [02-form-components.md](./02-form-components.md)
- [03-overlay-and-menu.md](./03-overlay-and-menu.md)
- [04-data-display-and-navigation.md](./04-data-display-and-navigation.md)
- [05-feedback.md](./05-feedback.md)
- [06-charts.md](./06-charts.md)
- [07-layouts-and-app-shell.md](./07-layouts-and-app-shell.md)
- [cross-cutting-accessibility.md](./cross-cutting-accessibility.md)
- [cross-cutting-js-hooks.md](./cross-cutting-js-hooks.md)
- [cross-cutting-css.md](./cross-cutting-css.md)
- [cross-cutting-storybook-docs.md](./cross-cutting-storybook-docs.md)
```

---

## Depth hints (do not skip)

- **Read `lib/exo_ui.ex` and `lib/exo_ui/components.ex` in full** — these define
  the public API and `use ExoUI` macro. Anything not exposed here is private.
- **Read `assets/js/index.js` in full** — every hook ExoUI ships must be
  registered here. Hooks present in `assets/js/hooks/` but missing from the
  index are dead code.
- **Read `assets/css/src/tokens.css`** — single source of truth for design
  tokens. Cross-check that `components/*.css` only consumes `--exo-*` tokens
  (no hardcoded colors).
- **Read `assets/css/src/themes/`** — verify dark mode parity by inspecting
  `[data-theme="dark"]` overrides.
- **Read `playwright.config.js`** — base URL, projects, retries.
- **Read `storybook/mix.exs` and `storybook/config/`** — Storybook is its own
  Phoenix app, not a sub-project of root mix.
- **Read `priv/static/exo.css`** — verify the build output actually contains
  every component CSS source (lightningcss bundles `assets/css/exo.css`).
- **`mix xref graph --format stats`** — high-level dependency view of
  `lib/exo_ui/`. Useful for confirming there are no cycles between component
  modules.
- **`mix credo --strict`** — quick wins, but do not stop at credo.
- **`mix dialyzer`** — only if PLT is already warm; otherwise skip.
- **Grep `<button` and `<input` and `<select` in `lib/exo_ui/components/`** —
  identify trigger composition issues and raw HTML where ExoUI primitives
  should be used.
- **Grep `phx-click` and `phx-change` in `lib/exo_ui/components/`** — identify
  components that bind events on the wrong element (e.g. whole flash dismiss).
- **Grep `aria-` in `lib/exo_ui/components/`** — inventory current ARIA usage.
- **Grep `data-exo` in `lib/exo_ui/components/`** — every component should
  emit a stable `data-exo` attribute (CSS hook).
- **Grep `Phoenix.HTML.FormField` in `lib/exo_ui/components/form.ex`** —
  identify which form controls accept a field struct and which do not.
- **Read `test/browser/helpers/storybook.js`** — Playwright helper, defines
  the contract for Storybook-driven browser tests.
- **Run `bun run capture:components`** if time permits — produces visual
  artifact set under `output/playwright/`. Inspect for visual regressions
  vs the previous run referenced in the 2026-04-24 audit.
- **Read `CHANGELOG.md` and the previous audit** — note any claim made there
  that current code contradicts (drift = bug).

---

## Anti-patterns to actively flag

Subagents **must actively look for** these patterns and flag them:

- `<button>` rendered inside another `<button>` (trigger composition bug)
- `<a href>` rendered inside `<button>` (invalid HTML)
- Interactive HEEx slots that wrap user content in a hardcoded `<button>` or
  `<div role="button">` (breaks `as_child`-style usage)
- `phx-click` on the whole flash/alert when a dedicated close button exists
- LiveView component that owns interactive state but has no `id` (LiveView
  cannot patch it correctly)
- JS hooks that call `addEventListener` without a matching `removeEventListener`
  in `destroyed()`
- JS hooks that rely on global `window` listeners with no cleanup
- CSS components that hardcode color values instead of consuming `--exo-*` tokens
- CSS components that override third-party styles using `!important`
- Form controls that do not surface `Phoenix.HTML.FormField` errors
- Form controls that do not generate a stable description/error ID for
  `aria-describedby`
- Modals/sheets/drawers without a focus trap or escape-key handler
- Menus without roving tabindex / `aria-activedescendant` and arrow-key support
- Charts without `role="img"` + `aria-label` (and no screen-reader summary)
- Storybook stories using `function: &ExoUI.Components.x/1` (delegated, breaks
  attribute introspection) instead of the direct module function reference
- `IO.inspect`, `dbg(`, `console.log` left in production code
- Hardcoded URLs, paths, or asset references that should come from config
- HEEx components that raise on unknown input (e.g. unknown icon names) when
  graceful fallback would be safer for consumers
- Missing `aria-pressed` / `aria-expanded` / `aria-current` where the
  component has a controlled state
- Components that consume client-side state for authorization decisions
  (rare here, but flag any leak)

---

## Output limits (ENFORCE)

- **Per category:** max **600 lines** of markdown (concise, brutal, with proofs)
- **Cross-cutting:** max **400 lines** per file
- **Master README:** max **300 lines**
- **No generic advice** ("write more tests", "consider caching") — every
  recommendation must be concrete and grounded in code you read
- **If a feature does not exist:** write "NOT IMPLEMENTED" + 5 lines on what
  is missing and why it appears in scope (likely from previous audit / README)
- **If you lack access to something** (e.g. real production usage data):
  write "REQUIRES PRODUCT INPUT: ..." as an open question
- **No `Co-Authored-By` lines.** No commit messages drafted unless asked.

---

## Final deliverable

When everything is done, print to the user:

```text
EXOUI DEEP AUDIT DONE.

Total files: 12 (7 categories + 4 cross-cutting + 1 master)
Location: docs/audits/2026-04-28/

Verification baseline:
- mix test: <result>
- bun run build:all: <result>
- bun run test:browser: <result>

Top 5 critical findings:
1. ...
2. ...
3. ...
4. ...
5. ...

Suggested next step: start from the critical row of the master score table.
```

**Start now. Run Phase 0, then immediately Phase 1 with parallel subagents in
batches of 4-6. Do not ask "should I begin" — begin.**
