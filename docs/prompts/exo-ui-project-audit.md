# ExoUI — Deep Project And Component Audit (Prompt)

> **Version:** v2 (2026-11-09: the round's procedure moved to the fleet standard and a
> round now ends as a Pogon project — EXO-1; v1 2026-04-28, output in
> `docs/audits/2026-04-28/`) — run against the HEAD you start on.
>
> **This prompt says WHAT is audited in exo_ui.** HOW a round runs and what it MUST leave
> behind (Pogon project, mirrored documents in `docs/audit/<krug>/`, LEDGER plan,
> remediation tasks, adversarial verdict on every finding, finding format, severity and
> verdict, the `audit-ledger.py` gate, working rules, final answer) is the fleet standard
> **Tehnički standardi › [Deep audit — krug na platformi](https://app.pogon.me/krafter/docs/9a313aa6-e2c8-41a8-a62a-c5e73f7d0fa3)**
> (mirror `krafter-infra/standards/tehnicki-standardi/deep-audit.md`; written in Serbian,
> the procedure applies regardless of this prompt's language). Read it IN FULL before
> phase 0 (`get_document`); where the two differ on procedure, the standard wins.
>
> **Code is read-only** — a round writes only to the platform and one entry at the top of
> `docs/STATUS.md`.
>
> **Before you start:** a clean copy of the audited commit (standard, phase 0), then
> **MEASURE the surface** with the commands below, from the repo root. The prompt carries
> no counts on purpose: v1 named counts of CSS files, test files, tests and browser specs
> and a fixed list of hooks, and by 2026-11-09 every one of them was short of the
> tree. A number in a prompt becomes the auditor's expectation. Command, never a number.
>
> ```bash
> ls lib/exo_ui lib/exo_ui/components lib/exo_ui/charts assets/js/hooks assets/css/src/components storybook/stories/components  # structure
> rg -o '^\s+def [a-z_]+\(assigns\)' lib/exo_ui/components lib/exo_ui/charts lib/exo_ui/layouts.ex | wc -l  # function components
> rg -c 'defdelegate' lib/exo_ui/components.ex                                  # ExoUI.Components delegates
> ls assets/js/hooks/*.js | wc -l                                               # hook files
> rg -c '^\s+Exo[A-Za-z]+,?$' assets/js/index.js                                # hooks registered in the index
> ls assets/css/src/components/*.css | wc -l                                    # component CSS sources
> rg -o 'data-exo="[a-z0-9-]+"' -N --no-filename lib | sort -u | wc -l          # data-exo values emitted
> ls test/exo_ui/components/*_test.exs | wc -l                                  # component test files
> rg -c '^\s*test "' test --glob '*.exs' | awk -F: '{s+=$2} END {print s}'      # ExUnit tests (library)
> ls test/browser/*.spec.js | wc -l                                             # browser spec files
> find storybook/stories/components -name '*.story.exs' | wc -l                 # component stories
> ls test/visual-baselines/exo-ui-components/screenshots | wc -l                # committed visual baselines
> ```

---

## 0. Values for the standard

| Value | exo_ui |
| --- | --- |
| workspace | `krafter` |
| team | `EXO` |
| repo | `misho85/exo_ui` |
| round project | `ExoUI deep audit <YYYY-MM-DD>` |
| `<krug>` | `<YYYY-MM-DD>-deep-audit` → `docs/audit/<krug>/` (the standard's path; `docs/audits/` is the history before the platform — it is neither moved nor written to) |
| must-read | per dimension, the **Must read** line in §2 — whole files. For every dimension also `README.md`, `lib/exo_ui.ex`, `lib/exo_ui/components.ex` and `docs/specs/2026-03-21-exo-ui-design.md` (the `data-exo` / `:where()` CSS contract) |
| targeted tests | `mix test test/exo_ui/components/<name>_test.exs` (or any one file under `test/exo_ui/`) · `cd storybook && mix test test/storybook_web/<name>_test.exs` · `bunx playwright test test/browser/<name>.spec.js` (`playwright.config.js` builds the Storybook assets and boots its Phoenix server first, so this is a heavy run) · `bun run check:css` · `bash test/advisories_schedule_test.sh`. Where `mix`/`bun` are not on PATH (non-interactive shell), prefix `mise x --` |
| measures (dimension 00) | component × states × a11y role · `data-exo` × CSS × tokens · JS hook × registration × teardown · public API × docs × story × test (§2, dimension 00) |
| gate | standard §7, from the repo root at `origin/main` after export: `python3 ~/Developer/pogon/scripts/lib/audit-ledger.py --check docs/audit/<krug>`. Not copied into this repo and not added to its CI (standard §7) |
| fake emails | `@test.krafter.dev` (the project is served under `krafter.dev` — README: Storybook at `exo-ui.krafter.dev`). The repo's demo data uses `@example.com` — a candidate for dimension 12 |

The standard's three mandatory dimensions are, in this repo: **regressions** = dimension 13,
**house rules without a guard** = dimension 12, **docs-truth** = dimension 11 (together with
Storybook and visual coverage) — each with exo_ui-specific candidates below.

---

## 1. Role and context

You are a **senior Phoenix/LiveView library architect + accessibility/UX auditor** with deep
experience building component libraries comparable to shadcn/ui, daisyUI, Radix and
Headless UI. You are running a **maximum-depth audit** of ExoUI — a headless Phoenix
LiveView component library with a default CSS theme (`mix.exs` description): HEEx function
components, a token-driven CSS theme (daisyUI 5's tokens under `--exo-*`, README › Theme And
CSS Modes) and small LiveView JS hooks. The goal is to honestly map where ExoUI stands
relative to a "minimum shadcn/daisyUI" bar.

ExoUI is a UI library: no multi-tenancy, no auth, no payments. Consumers take it as a git or
path dependency (README › Installation) — trg24 as a vendored snapshot (`.woodpecker/ci.yaml`
header) — so a defect in a component ships into every app that uses it. The audit
dimensions are: public API quality, accessibility, composition/HTML correctness, form
integration, browser/keyboard behavior, Storybook coverage, CSS architecture, JS hook
quality, and comparison vs shadcn/daisyUI. The one deployed surface is the public
Storybook (`storybook/`, https://exo-ui.krafter.dev).

**Repo:** `misho85/exo_ui`, run in a clean copy of the audited commit (standard, phase 0).

### Key paths (measure their contents with the commands in the header)

- `lib/exo_ui.ex` — `ExoUI` and the `use ExoUI` macro (`core_components: false` skips
  `button/1`, `header/1`, `form/1`, `input/1`, `flash/1`, `flash_group/1`, `table/1`).
- `lib/exo_ui/components.ex` — `ExoUI.Components`, `defdelegate` re-exports of the
  component sub-modules (kept for backward compatibility, per its moduledoc).
- `lib/exo_ui/components/` — `core.ex`, `form.ex`, `overlay.ex`, `feedback.ex`,
  `data_display.ex`, `resource_list.ex` (`ExoUI.Components.*`).
- `lib/exo_ui/charts.ex` — `ExoUI.Charts` public façade; `lib/exo_ui/charts/` —
  `cartesian.ex`, `radial.ex`, `primitives.ex`, `helpers.ex`, `shared.ex`.
- `lib/exo_ui/layouts.ex` (`ExoUI.Layouts`), `lib/exo_ui/utils.ex` (`ExoUI.Utils`),
  `lib/exo_ui/lucide.ex` (`ExoUI.Lucide`, the icon set behind `<.icon>`).
- `lib/mix/tasks/exo.install.ex` — `mix exo.install`, patches a consumer's `app.css`,
  `app.js` and `html_helpers/0` (README › Installation); its test is
  `test/mix/tasks/exo.install_test.exs`.
- `assets/js/index.js` — the hook registry consumers import (README › Wire JS hooks);
  `assets/js/hooks/` — one file per hook.
- `assets/css/exo.css` — bundle entry; `assets/css/src/` — `tokens.css`, `themes/`
  (`dark.css`, `daisy.css`), `layouts/`, `components/*.css`.
- `priv/static/exo.css`, `priv/static/exo.tokens.css`, `priv/static/exo.themes.css` —
  committed build artifacts (lightningcss, `package.json` scripts).
- `test/exo_ui/` — ExUnit: `components/*_test.exs` plus repo guards (§2, dimension 12);
  `test/support/component_case.ex`.
- `test/browser/*.spec.js` — Playwright against the local Storybook;
  `test/browser/helpers/` (`storybook.js`, `focus.js`, `hooks.js`).
- `test/visual-baselines/exo-ui-components/` — committed screenshot baselines + `manifest.json`.
- `storybook/` — a separate Phoenix app (own `mix.exs`, `mix.lock`, `config/`, `lib/`,
  `test/`); stories under `storybook/stories/components/<group>/*.story.exs`, recipe and
  workflow demos under `storybook/lib/storybook/components/`.
- `scripts/` — `capture_storybook_components.js`, `visual_regression.js`, `check_css.js`,
  `import_daisy_themes.js`, release checks.
- `.woodpecker/ci.yaml`, `.woodpecker/advisories.yaml` — CI; `docs/release-checklist.md`.
- `docs/guides/` (component usage, recipes, workflows, theme tokens, visual regression),
  `docs/specs/`, `docs/plans/`, `README.md`, `CHANGELOG.md`.

### Commands the repo defines

From `package.json`, README and `.woodpecker/ci.yaml`: `mix test`,
`mix compile --warnings-as-errors`, `mix format --check-formatted`, `mix hex.audit` (root and
`storybook/`), `bun run build:all` (builds `exo.css`, `exo.tokens.css` and `exo.themes.css`),
`bun run check:css`, `bun run test:browser`, `bun run capture:components`,
`bun run capture:validate`, `bun run visual:check`, and the Storybook:
`cd storybook && mix setup && mix phx.server`. The full suites run in CI
(`.woodpecker/ci.yaml` › `test`); a round runs only the targeted ones in §0.

### Read before the audit

`README.md`, `CHANGELOG.md`, `mix.exs`, `package.json`, `playwright.config.js`,
`storybook/mix.exs`, `.woodpecker/ci.yaml`, `docs/release-checklist.md`, and the earlier
rounds — **context, not conclusions**; verify everything against the audited SHA:

- `.claude/audit/` — health audit of 2026-03-26 (`summaries/project-health-2026-03-26.md`,
  `reports/`).
- `docs/audits/2026-04-28/` — the v1 round of this prompt: seven category reports, four
  cross-cutting reports and `README.md` (scorecard, top 15 findings). No ledger.
- `docs/audits/2026-05-04/component-library-status.md` — status after remediation (updated
  2026-05-06): what it says improved is the input of dimension 13.

---

## 2. What you audit — by DIMENSION

Each dimension is one subagent and one document `NN-<area>.md` (NN = the number below).
Bullets are **candidates and lenses**, not conclusions — confirm each against the audited
SHA before reporting it.

**00 Measures** (orchestrator, before the fan-out; document `00-mere.md`). Build these
matrices and compare them with the earlier rounds (`docs/audits/2026-04-28/README.md`
scorecard, the table in `docs/audits/2026-05-04/component-library-status.md`). The delta —
what is new since and covered by nothing — is a source of findings for the other dimensions.

- **Component × states × a11y role** — rows: every
  `rg -o '^\s+def ([a-z_]+)\(assigns\)' -r '$1' lib/exo_ui/components lib/exo_ui/charts lib/exo_ui/layouts.ex`;
  columns: `role` and `aria-*` it renders (`rg -n 'role="|aria-[a-z]+=' <module>`), states it
  supports (disabled, invalid/error, loading, open/closed, empty), whether it attaches a hook
  and so needs an `id`, its unit test, browser spec and story.
- **`data-exo` × CSS × tokens** — emitted values
  `rg -o 'data-exo="[a-z0-9-]+"' -N --no-filename lib | sort -u` vs styled values
  `rg -o 'data-exo="?[a-z0-9-]+' -N --no-filename assets/css/src | sort -u` (emitted without a
  selector = unstyled component; selector without an emitter = dead CSS); tokens used
  `rg -o 'var\(--exo-[a-z0-9-]+' -N --no-filename assets/css/src | sort -u` vs defined
  `rg -o '^\s+--exo-[a-z0-9-]+' -N --no-filename assets/css/src/tokens.css assets/css/src/themes | sort -u`;
  literal colours outside the token files
  `rg -n '#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?|oklch)\(' assets/css/src/components assets/css/src/layouts`.
- **JS hook × registration × teardown** — `ls assets/js/hooks/` vs the keys of `hooks` in
  `assets/js/index.js` vs `rg -o 'phx-hook="Exo[A-Za-z]+"' -N --no-filename lib | sort -u`
  (and dynamic `rg -n 'phx-hook=\{' lib`); per hook `rg -c 'addEventListener' assets/js/hooks`
  vs `rg -c 'removeEventListener' assets/js/hooks`, and
  `rg --files-without-match 'destroyed\(' assets/js/hooks`.
- **Public API × docs × story × test** — delegates in `lib/exo_ui/components.ex` vs `def` in
  the sub-modules; per component: `@doc` / `attr … doc:`, a section in
  `docs/guides/component-usage.md` (`rg -n '^#+ ' docs/guides/component-usage.md`), a story
  under `storybook/stories/components/`, a test under `test/exo_ui/components/`, a spec under
  `test/browser/`, a route in `test/visual-baselines/exo-ui-components/manifest.json`.

### Component dimensions (one subagent each)

**01 Core components** — `button`, `badge`, `separator`, `icon`, `theme_toggle`, `header`,
`avatar`, `skeleton`, `empty_state`, `spinner`, `kbd`, `scroll_area`, `navbar`, `footer`,
`bottom_nav`, `indicator`, `swap`.
*Must read:* `lib/exo_ui/components/core.ex`, `lib/exo_ui/lucide.ex` (the part `icon/1`
uses), `assets/js/hooks/theme_toggle.js`, `assets/js/hooks/swap.js`,
`assets/js/hooks/header.js`.

**02 Form components** — `form`, `input` (text/checkbox/textarea/select), `toggle`, `select`,
`combobox`, `radio_group`, `slider`, `date_picker`, `rating`, `fieldset`, `file_input`,
`form_layout`, `optional_field`, `required_marker`, `save_bar`. Verify field-struct
integration, `aria-invalid`/`aria-describedby` wiring, error and description ID stability,
form submission values (including disabled and hidden submitted values).
*Must read:* `lib/exo_ui/components/form.ex`,
`assets/js/hooks/{select,combobox,date_picker,rating,slider,file_input}.js`,
`docs/guides/combobox.md`, `docs/specs/2026-03-23-native-popover-components-design.md`.

**03 Overlay & menu** — `modal`, `confirm_modal`, `popover`, `dropdown_menu`, `dropdown`
(deprecated — `rg -n 'deprecated' lib`), `tooltip`, `collapsible`, `drawer`, `sheet`,
`hover_card`, `context_menu`, `command_palette`, `menubar`, and the `show_*`/`hide_*` JS
commands. Verify the dialog contract: focus trap, escape close, required title, outside
`inert`, focus restore, `aria-modal`; the Popover API contract (README › Browser support).
*Must read:* `lib/exo_ui/components/overlay.ex`,
`assets/js/hooks/{popover,dropdown_menu,hover_card,context_menu,command_palette,menubar,overlay,collapsible,tooltip}.js`,
`docs/specs/2026-03-23-native-popover-components-design.md`.

**04 Data display & navigation** — `table`, `list`, `content_card`, `stat_card`,
`metric_card`, `settings_list`, `wizard_sidebar`, `breadcrumb`, `tabs`, `pagination`, `steps`,
`timeline`, `carousel`, `accordion`, `hero`, `chat_bubble`, `resource_list`. Verify
`table` keeps `phx-update="stream"` support (`docs/specs/2026-03-21-exo-ui-design.md`).
*Must read:* `lib/exo_ui/components/data_display.ex`,
`lib/exo_ui/components/resource_list.ex`,
`assets/js/hooks/{accordion,carousel,tabs,table,resource_list}.js`.

**05 Feedback** — `flash`, `flash_group`, `toast_container`, `alert`, `progress`,
`radial_progress`. Verify `toast_container` keeps `phx-update="stream"` support (design
spec), live-region roles per severity, auto-dismiss and pause-on-hover.
*Must read:* `lib/exo_ui/components/feedback.ex`, `assets/js/hooks/toast.js`.

**06 Charts** — primitives (`trend_badge`, `sparkline`, `progress_bar`), cartesian
(`bar_chart*`, `stacked_bar_chart`, `line_chart*`, `area_chart*`, `horizontal_bar_chart`),
radial (`donut_chart*`, `pie_chart`, `radial_chart`, `radar_chart`). Verify `role="img"` +
`aria-label`, empty/zero/negative data, legends, screen-reader summaries, `data-exo` names
that collide with other components.
*Must read:* `lib/exo_ui/charts.ex`, every file in `lib/exo_ui/charts/`,
`assets/css/src/components/charts.css`.

**07 Layouts & app shell** — `sidebar_layout`, `sidebar_item`, and any layout helper in
`ExoUI.Layouts`. Verify the localStorage state contract, skip link, mobile focus,
`aria-expanded` sync.
*Must read:* `lib/exo_ui/layouts.ex`, `assets/js/hooks/sidebar.js`,
`assets/css/src/layouts/sidebar.css`.

### Cross-cutting dimensions

**08 Accessibility** — sweep every component for: focus trap, escape close, roving
tabindex, `aria-*` wiring, `role` accuracy, keyboard parity, screen-reader labels,
reduced motion, `inert` usage.
*Must read:* every module in `lib/exo_ui/components/`, `assets/js/hooks/overlay.js`,
`test/browser/helpers/focus.js`.

**09 JS hooks & client architecture** — every file under `assets/js/hooks/` and
`assets/js/index.js`: hook lifecycle (`mounted`/`updated`/`destroyed`), event listener
leaks, `phx-update="ignore"` consistency, server↔client state contracts, server events a
hook depends on, idempotence on `updated()`.
*Must read:* `assets/js/index.js`, all of `assets/js/hooks/`, `test/browser/helpers/hooks.js`.

**10 CSS architecture & tokens** — `assets/css/src/tokens.css`, `themes/`, `layouts/`, all
`components/*.css`: token coverage, dark-mode parity (`[data-theme="dark"]`, `.exo-dark` and
the `prefers-color-scheme` block in `themes/dark.css`), `:where()` specificity discipline,
dead CSS, RTL, `prefers-reduced-motion`, `color-scheme`, override surface; the committed
bundles against their sources.
*Must read:* `assets/css/exo.css`, `assets/css/src/tokens.css`, `assets/css/src/themes/dark.css`,
`docs/guides/theme-tokens.md`, `scripts/check_css.js`, `test/exo_ui/built_css_test.exs`,
`test/exo_ui/color_mix_test.exs`.

**11 Storybook, visual coverage & docs-truth** — Storybook story quality (`function:`
pointing at the defining module vs an `ExoUI.Components` delegate, missing states, dark mode,
mobile width), recipe and workflow demos, capture and visual-regression pipeline, the
public deployment of the Storybook (its `config/runtime.exs`, `Dockerfile`, the `release`
step of `.woodpecker/ci.yaml`). **Docs-truth:** README, CHANGELOG, `docs/guides/`,
`docs/release-checklist.md`, moduledocs and this prompt against the code — a doc that
promises a contract the code does not keep, a dead path, a count that no longer holds.
*Must read:* `storybook/mix.exs`, `storybook/config/`, `storybook/lib/storybook_web/storybook.ex`,
`playwright.config.js`, `test/browser/helpers/storybook.js`, `docs/guides/visual-regression.md`,
`scripts/capture_storybook_components.js`, `scripts/visual_regression.js`, `README.md`,
`CHANGELOG.md`, `docs/release-checklist.md`, `.woodpecker/ci.yaml`.

- README › Development says `build:all` "builds exo.css and exo.tokens.css" —
  `package.json` also builds `exo.themes.css`; `rg -n "bundles|exo\." scripts/check_css.js`:
  which bundles does `check:css` compare?
- README › Highlights ("60+ components") and › Theme ("All 35 daisyUI themes") vs
  `rg -c 'defdelegate' lib/exo_ui/components.ex` and
  `rg -c '^\[data-theme=' assets/css/src/themes/daisy.css`.
- `docs/release-checklist.md` › Verification vs the commands in `.woodpecker/ci.yaml` › `test`.
- `ExoUI.Components` moduledoc (sub-module list) vs what `use ExoUI` imports in `lib/exo_ui.ex`.

**12 House rules without a guard.** This repo has no `CLAUDE.md`, `AGENTS.md` or
contributing doc. Its rules live in two places: the anti-pattern list below, and the
contracts the docs state — `docs/specs/2026-03-21-exo-ui-design.md` (theme selectors use
`:where([data-exo="…"])`; `data-variant`/`data-size` always scoped to `[data-exo]`; compiled
CSS is committed; `table` and `toast_container` keep `phx-update="stream"`),
`docs/specs/2026-03-23-native-popover-components-design.md` (popover triggers set
`type="button"`; `role="combobox"` on the search input), `docs/guides/visual-regression.md`
(the baseline is a CI capture). For each rule with a greppable shape: is there a guard (a
test or script that `.woodpecker/ci.yaml` runs)? The guards that exist carry their reason in
the moduledoc — `test/exo_ui/built_css_test.exs`, `test/exo_ui/color_mix_test.exs`,
`test/exo_ui/regex_end_anchor_test.exs`, `test/exo_ui/tracked_ignored_files_test.exs`,
`test/exo_ui/ci_mix_home_test.exs`, `test/exo_ui/components/icon_truth_test.exs`,
`test/exo_ui/components/storybook_primitive_usage_test.exs`,
`test/exo_ui/components/interactive_forwarding_test.exs`, `scripts/check_css.js`,
`test/advisories_schedule_test.sh`,
`storybook/test/storybook_web/release_distribution_test.exs`. A rule without a guard plus a
violation found = a finding with a task for the guard; without a violation = a line in
"checked", not a finding. Fake emails (§0) are one such rule:
`rg -o '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}' -N --no-filename lib test storybook docs/guides | sort | uniq -c`.

**13 Regressions of earlier rounds.** No earlier round has a `LEDGER.md` or findings in the
standard's heading format, so `audit-ledger.py` has nothing to check there and the first
round under the standard sets the ledger baseline. The regression pass still runs: for every
row of the "Top 15 critical findings" table in `docs/audits/2026-04-28/README.md` and every
fix `docs/audits/2026-05-04/component-library-status.md` › "What improved" claims, re-verify
against the audited SHA (they cite `file:line`, not `Verify:` — derive the command from the
cited code and record it). A finding that came back is titled `REGRESIJA 2026-04-28 <n>: …`
(the standard's literal form) and its task carries a guard. From the next round on, this dimension re-runs the `Verify:` of every
SECURITY and BUG finding a ledger in `docs/audit/` closed (standard, phase 1).

### Lenses every component dimension (01–07) applies

- **Accessibility:** roles and semantics; keyboard (Tab/Shift+Tab/Arrows/Enter/Escape parity
  per component); focus management (trap, restore, initial focus, visible focus ring); ARIA
  wiring (`aria-expanded`, `aria-controls`, `aria-describedby`, `aria-invalid`,
  `aria-pressed`, `aria-current`, `aria-modal`); screen reader (label sources, live
  regions, hidden text); reduced motion.
- **Composition & HTML correctness:** does a trigger slot wrap user content in a hard-coded
  `<button>` (nested-button bug)? Do slots accept rest attrs; is there an `as_child`-like
  escape hatch? Does a form control submit the right value, accept a
  `Phoenix.HTML.FormField` and surface its errors?
- **Browser & visual coverage:** which interactive components have a Playwright spec; which
  paths are untested (keyboard, disabled, error, empty, loading); is the route in the visual
  baseline?
- **CSS surface:** which `--exo-*` tokens it depends on; dark-mode parity verified per
  component or only assumed; can a consumer override a variant without `!important`; dead
  selectors and orphan keyframes.
- **JS hook quality (if any):** lifecycle leaks; listeners added and removed; events the
  hook emits and expects; `phx-update="ignore"` where needed.
- **Storybook quality:** a story per public function; states covered (default, hover,
  focus, disabled, error, loading, long content, dark mode, mobile width); attribute
  introspection; Phoenix form examples.
- **Test coverage:** happy path, edge and error cases covered; concrete gaps; flakiness
  signals (`Process.sleep`, `setTimeout`, `waitForTimeout`, racy assertions).
- **Tech debt:** `TODO`/`FIXME`, dead code, deprecated functions
  (`rg -n 'deprecated' lib`), commented-out blocks, convention drift from the rest of the
  library.
- **Public API & build:** exposed through `use ExoUI`, `ExoUI.Components`, or only the
  sub-module; contributes to `priv/static/exo.css`?
- **Documentation:** moduledoc, `@doc` and `attr … doc:`, its section in
  `docs/guides/component-usage.md`, README references; where docs and code disagree.
- **Comparison vs shadcn/daisyUI:** where ExoUI matches; the 3–5 most impactful behaviors
  shadcn/daisyUI provide that ExoUI does not. A gap is a finding only when it names a
  concrete behavior a consumer gets wrong or cannot get.

### Depth hints (do not skip)

- **Read `lib/exo_ui.ex` and `lib/exo_ui/components.ex` in full.** The public API is what
  `use ExoUI` imports — the component sub-modules, `ExoUI.Components.ResourceList`,
  `ExoUI.Charts`, `ExoUI.Layouts`, `ExoUI.Utils.classes/1` and `maybe_add_class/2` — plus the
  `ExoUI.Components` delegates and `mix exo.install`; README › Usage lists the sub-modules as
  explicit imports, so they are public too.
- **Read `assets/js/index.js` in full** — every hook ExoUI ships must be registered there.
  A hook file missing from the index is dead code; a `phx-hook="Exo…"` in `lib/` with no
  registered hook is a broken component.
- **Read `assets/css/src/tokens.css`** — the single source of design tokens. Cross-check
  that `components/*.css` only consumes `--exo-*` tokens (no hard-coded colors).
- **Read `assets/css/src/themes/`** — dark-mode parity through `[data-theme="dark"]`,
  `.exo-dark` and the `prefers-color-scheme` block; `daisy.css` is generated
  (`scripts/import_daisy_themes.js`).
- **Read `playwright.config.js`** — base URL, `webServer`, retries only under `CI`.
- **Read `storybook/mix.exs` and `storybook/config/`** — the Storybook is its own Phoenix
  app, not a sub-project of the root mix project.
- **`priv/static/exo.css`** — verify the build output contains every component CSS source
  (lightningcss bundles `assets/css/exo.css`). It is minified to one line: `wc -l` returns 0
  (the 2026-04-28 round mistook that for an empty file).
- **`mix xref graph --format stats`** — dependency view of `lib/exo_ui/`, cycles between
  component modules. It compiles; run it only when the machine allows (standard §5).
- **Grep `<button`, `<input` and `<select` in `lib/exo_ui/components/`** — trigger
  composition issues and raw HTML where ExoUI primitives should be used.
- **Grep `phx-click` and `phx-change` in `lib/exo_ui/components/`** — events bound on the
  wrong element (e.g. a whole flash as the dismiss target).
- **Grep `aria-` and `data-exo` in `lib/exo_ui/components/`** — ARIA inventory; every
  component should emit a stable `data-exo` attribute (the CSS hook).
- **Grep `Phoenix.HTML.FormField` in `lib/exo_ui/components/form.ex`** — which form controls
  accept a field struct and which do not.
- **Read `test/browser/helpers/storybook.js`** — the contract of Storybook-driven browser
  tests.
- **Visual capture** (`bun run capture:components`, then `capture:validate` and
  `visual:check`) needs a running Storybook and writes to `output/playwright/` (ignored). The
  committed baseline is a Linux CI capture: a macOS capture differs from it on every route
  (`docs/guides/visual-regression.md`), so a local diff is not a finding.
- **Read `CHANGELOG.md` and the earlier rounds** — a claim made there that the current code
  contradicts is drift (dimension 11 or 13).

### Anti-patterns to actively flag (each with its first Verify)

- `<button>` inside another `<button>`, `<a href>` inside `<button>`, slots that wrap user
  content in a hard-coded `<button>` or `<div role="button">` —
  `rg -n '<button|role="button"' lib/exo_ui`.
- `phx-click` on a whole flash/alert when a dedicated close button exists —
  `rg -n 'phx-click' lib/exo_ui/components/feedback.ex`.
- A component that owns interactive state (a hook) but does not require an `id` —
  `rg -n 'phx-hook=' lib` against the `attr :id` of the same component.
- Hooks that call `addEventListener` without a matching `removeEventListener` in
  `destroyed()`, and global listeners with no cleanup —
  `rg -n '(window|document)\.addEventListener' assets/js/hooks`.
- `localStorage`/`sessionStorage` access that can throw (private mode) or that decides
  anything security-relevant — `rg -n -C2 'localStorage|sessionStorage' assets/js/hooks`.
- CSS that hard-codes colors instead of `--exo-*` tokens, or overrides with `!important` —
  `rg -n '!important' assets/css/src`.
- No `prefers-reduced-motion` handling where there is motion —
  `rg -n 'prefers-reduced-motion' assets/css/src assets/js/hooks` against
  `rg -n 'transition|animation|behavior: .smooth' assets/css/src assets/js/hooks`.
- Form controls that do not surface `Phoenix.HTML.FormField` errors or lack a stable
  description/error ID for `aria-describedby` —
  `rg -n 'aria-describedby|aria-invalid' lib/exo_ui/components/form.ex`.
- Modals, sheets, drawers, command palette without focus trap, escape handler, outside
  `inert` or focus restore — `rg -n 'Escape|inert|focus' assets/js/hooks/overlay.js assets/js/hooks/command_palette.js`.
- Menus without roving tabindex / `aria-activedescendant` and arrow keys —
  `rg -n 'aria-activedescendant|tabindex|ArrowDown' assets/js/hooks/{dropdown_menu,menubar,context_menu,select,combobox,command_palette}.js`.
- Charts without `role="img"` + `aria-label` and a screen-reader summary —
  `rg -n 'role="img"|aria-label' lib/exo_ui/charts`.
- Stories whose `function:` is an `ExoUI.Components` delegate (breaks attribute
  introspection) instead of the defining module —
  `rg -n 'function: &ExoUI\.Components\.[a-z_]+/1' storybook/stories`.
- `IO.inspect`, `dbg(`, `console.log` in shipped code — `rg -n 'IO\.inspect|dbg\(|console\.log' lib assets/js`.
- Hard-coded URLs, paths or asset references that should come from config —
  `rg -n 'https?://' lib assets/js --glob '!lib/exo_ui/lucide.ex' | rg -v 'www\.w3\.org'`
  (the icon set carries the SVG namespace on every icon).
- Components that raise on unknown input (e.g. an unknown icon name) where a graceful
  fallback is safer for consumers — `rg -n 'raise' lib/exo_ui`.
- Missing `aria-pressed` / `aria-expanded` / `aria-current` where the component has a
  controlled state — `rg -n 'aria-(pressed|expanded|current)' lib/exo_ui`.

---

## 3. Specific to exo_ui (alongside the standard's working rules)

- `mix` and `bun` come from mise (`.tool-versions` pins Erlang and Elixir); in a
  non-interactive shell where they are not on PATH, run `mise x -- mix …` /
  `mise x -- bun …`. The Storybook has its own deps: `cd storybook && mix deps.get` before
  anything there.
- The full verdict (ExUnit for the library and the Storybook, browser suite, capture and
  visual check, release boot) is the CI pipeline of the audited SHA on Woodpecker
  (`ci.krafter.dev`, `.woodpecker/ci.yaml`; `docs/STATUS.md` records the last one). Read it,
  do not re-run it.
- A claim about CSS is checked against the committed bundle `priv/static/exo.css` as well as
  the sources; a claim about a hook against `assets/js/index.js`, which is what consumers
  import (README › Wire JS hooks) — `priv/static/` holds no JS.
- Production is the public Storybook at https://exo-ui.krafter.dev: unauthenticated
  read-only GET only (standard §5).
- `docs/audits/` and `.claude/audit/` stay where they are as pre-platform history; a new
  round lives only in `docs/audit/<krug>/`.

> **Summary:** what is audited in exo_ui — the public component API, accessibility,
> composition and form integration, JS hooks, CSS tokens and theme, Storybook and visual
> coverage, docs-truth, house rules without a guard, and regressions of the 2026-04-28 and
> 2026-05-04 rounds — following the fleet standard "Deep audit — krug na platformi": a project
> `ExoUI deep audit <date>` with mirrored documents in `docs/audit/<krug>/` and remediation
> tasks in team `EXO`. Update this prompt as the codebase grows (version + date).
