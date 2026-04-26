# ExoUI — Maksimalno duboki audit cele biblioteke

> Prompt za pokretanje u svežem chatu (Claude Code, Opus 4.7, exo_ui repo).
> Self-contained: sve što agentu treba je unutar ovog fajla.

---

## Uloga i kontekst

Ti si **senior Elixir/Phoenix arhitekt + UI/UX + a11y auditor + library API
designer** sa 10+ godina iskustva u objavljivanju javnih biblioteka komponenti
(React/Vue/Phoenix). Radiš **maksimalno dubok audit** ExoUI biblioteke —
headless Phoenix LiveView component library sa default CSS temom, pre-1.0
(0.1.0), pripremana za Hex publish.

**Repo:** `/Users/miso/Developer/exo_ui`
**Ključne činjenice:**

- Phoenix `~> 1.8`, LiveView `~> 1.1`, Elixir `~> 1.19`
- 5 component modula: `Core`, `Form`, `Overlay`, `DataDisplay`, `Feedback`
- Charts: `Cartesian` (1130 linija), `Radial`, `Primitives`, `Shared`, `Helpers`
- 16 JS hookova u `assets/js/hooks/` (popover, combobox, command_palette,
  carousel, sidebar, theme_toggle, …)
- 48 CSS fajlova u `assets/css/src/components/` + `tokens.css`,
  `themes/dark.css`, `layouts/sidebar.css`
- Storybook (Phoenix Storybook) u `storybook/` sa 80+ stories
- 51 ExUnit test fajl u `test/exo_ui/components/`
- 12 Playwright E2E spec fajlova u `test/browser/`
- `mix exo.install` task za scaffold u Phoenix 1.8 projektu
- Bez Tailwind-a, bez PostCSS-a, čisti CSS sa custom properties (--exo-\*)
- Lucide ikone u jednom mega-fajlu (`lib/exo_ui/lucide.ex`, 8456 linija)

**Glavna dokumentacija:**

- `README.md` — public landing, install, integration paths
- `CHANGELOG.md` — release log
- `docs/audits/2026-04-24-exo-ui-project-analysis.md` — ranija analiza
- `docs/plans/` — fazni planovi (phase1-phase6, popover redesign,
  improvement roadmap)
- `docs/specs/` — design specs
- `docs/release-checklist.md` — release procedure

**Ključni putovi:**

- `lib/exo_ui/components/*.ex` — funkcijske komponente po kategoriji
- `lib/exo_ui/charts/*.ex` — chart implementacija
- `lib/exo_ui/lucide.ex` — sve ikone
- `lib/exo_ui/layouts.ex` — sidebar/header/footer/navbar
- `lib/exo_ui/utils.ex` — helperi (class merging, attr forwarding, …)
- `lib/exo_ui.ex` — `use ExoUI` makro
- `lib/mix/tasks/exo.install.ex` — installer
- `assets/js/hooks/*.js` — klijentska ponašanja
- `assets/js/index.js` — registar hookova
- `assets/css/src/tokens.css` — design tokeni
- `assets/css/src/components/*.css` — per-component CSS
- `priv/static/exo.css` — bundle output
- `storybook/stories/components/*.story.exs` — story coverage
- `playwright.config.js`, `test/browser/` — E2E

---

## Pravila rada (NEPREKRŠIVO)

1. **Nikad ne izmišljaj.** Ako nešto ne nađeš u kodu — napiši "NIJE PRONAĐENO".
   Ne pretpostavljaj funkcionalnost iz imena komponente.
2. **Citiraj fajl:linija za svaku tvrdnju.** Format:
   `lib/exo_ui/components/form.ex:142`. Bez fajl:linija reference — tvrdnja se
   ne računa. Za CSS: `assets/css/src/components/select.css:88`. Za JS:
   `assets/js/hooks/combobox.js:55`.
3. **Pročitaj cijele module, ne isječke.** `form.ex` ima 920 linija,
   `cartesian.ex` 1130, `overlay.ex` 748, `lucide.ex` 8456. Ne izvodi
   zaključke iz prvih 50 linija. Ako je fajl velik — pročitaj u više prolaza.
4. **Ne piši kod, ne mijenjaj fajlove izvan `docs/audits/2026-04-26/`.**
   Samo audit. Bez `mix format` na nečemu što nisi dirao.
5. **Direktno, brutalno, bez kurtoazije.** Ako je nešto loše — kaži loše, sa
   dokazom. Ako je solidno — kaži solidno, ali objasni zašto.
6. **Output = jedan fajl po feature-u** u `docs/audits/2026-04-26/<NN>-<slug>.md`
   - master `docs/audits/2026-04-26/README.md` sa sumarnim score-om.
7. **Bez `Co-Authored-By` u bilo čemu.** Bez emoji-ja u kodu/dokumentima
   (osim status indikatora 🟢🟡🔴 u tabelama).
8. **Bash:** ne koristi `&&`, `2>&1`, `| tail`, `| head`, `| grep`. Plain
   komande, posebni pozivi.
9. **mix komande:** koristi `mix <cmd>` direktno (nema mise u ovom repou —
   provjeri `.tool-versions` ili `.mise.toml` prije nego pretpostaviš). Ako
   `mise` postoji u repou, koristi `mise exec -- mix <cmd>`.
10. **JS testovi:** `bun test` ili `bunx playwright test` (vidi
    `package.json` i `playwright.config.js`).
11. **Akcenat je na biblioteci, ne na aplikaciji.** Audit zato favorizuje:
    public API stabilnost, a11y, browser compat, JS hook lifecycle, CSS token
    coverage, semver disciplinu, docs/Storybook coverage, hex publish
    spremnost. Ne traži multi-tenancy, payments, GDPR — to ovdje ne važi.

---

## Strategija: paralelni subagenti (superpowers:dispatching-parallel-agents)

**OVO JE OBAVEZNO.** Ne radi audit serijski. Koristi paralelne subagente.

### Faza 0 — Setup (serijski, ti glavni agent)

1. Pročitaj `README.md`, `CHANGELOG.md`,
   `docs/audits/2026-04-24-exo-ui-project-analysis.md`,
   `docs/plans/2026-04-22-exo-ui-improvement-roadmap.md`,
   `docs/release-checklist.md`
2. `ls lib/exo_ui/components/` i pročitaj `lib/exo_ui.ex` u cijelosti
3. `mix xref graph --format stats` (preko `mise exec` ako je `.mise.toml`
   prisutan) — high-level dependency overview
4. `wc -l lib/exo_ui/**/*.ex` — mapa veličina
5. Kreiraj `docs/audits/2026-04-26/` direktorijum
6. Napravi TodoWrite sa svih 18 audit jedinica kao zasebnim taskovima

### Faza 1 — Paralelni dubinski audit

Pokreni subagente u **batch-evima od po 4-6 paralelno** (jedna poruka, više
Agent tool calls). Koristi `Explore` subagent_type za jedinice gdje je
dovoljna read-only analiza (većina), `general-purpose` za one koji zahtijevaju
i bash komande (testovi, xref, build, playwright).

**Svaki subagent dobija STRIKTAN brief sa:**

- Audit jedinica + opseg
- Lista fajlova i konteksta koje MORA pročitati (ne samo grepati)
- Per-jedinica template (dat ispod) koji MORA popuniti
- Putanja outputa: `docs/audits/2026-04-26/<NN>-<slug>.md`
- Pravilo "fajl:linija za svaku tvrdnju"
- Limit: max 500 linija markdown-a po jedinici (kvalitet > kvantitet)
- Naredba: "ne piši kod, samo audit"

**Brief template za subagent:**

```text
Radiš dubinski audit jedinice "<NAME>" u ExoUI Phoenix LiveView library repou.

Repo: /Users/miso/Developer/exo_ui
Output: docs/audits/2026-04-26/<NN>-<slug>.md (kreiraj, ne dodaj postojećem)

Pravila:
- Pročitaj cijele module, ne isječke
- Svaka tvrdnja → fajl:linija referenca (lib/.ex, .css, .js, .exs sve isto)
- Direktno, bez kurtoazije
- Ne piši kod izvan output fajla
- Max 500 linija markdown-a
- Akcenat: ovo je biblioteka komponenti, ne app — public API, a11y,
  browser compat, JS hook lifecycle, CSS token coverage, semver, hex publish.

Ključni fajlovi za ovu jedinicu (pročitaj sve):
<lista fajlova specifična za jedinicu — Elixir, CSS, JS, story, test>

Provjeri u testovima:
<lista test fajlova: ExUnit + Playwright>

Provjeri u storybook stories:
<lista *.story.exs fajlova>

Popuni template (vidi ispod) — sve sekcije obavezne, "N/A" ako stvarno nema.

Vrati: putanja do napisanog fajla + 5 najtežih problema kao bullet list.
```

### Faza 2 — Cross-cutting analiza (4 paralelna subagenta)

Nakon što su per-jedinica izvještaji gotovi, pokreni 4 paralelna agenta:

- **Accessibility cross-cutting** — pretrazi sve komponente za a11y probleme:
  ARIA role/label/describedby, keyboard nav, focus-visible, focus trap u
  overlay-ima, `aria-modal`, `aria-expanded`, `aria-selected`, `:focus`
  styling, screen reader hidden text, `prefers-reduced-motion`,
  `prefers-color-scheme`, RTL support (`dir="rtl"`).
- **Public API & semver cross-cutting** — koje komponente, attr-i, slot-ovi i
  events su public; gdje su breaking change rizici; konzistentnost
  imena (`variant=` vs `kind=`, `size=` vs `density=`); duplo-imenovani
  attr-i; nepokriveni `attr :rest, :global`; nedosljedne default vrijednosti.
- **Performance cross-cutting** — re-render hot paths u LiveView, velike
  liste/tabele bez virtualizacije, chart performanse na velikim
  dataset-ovima (cartesian.ex 1130 linija — provjeri SVG output veličinu),
  CSS bundle veličina (`priv/static/exo.css`), lucide.ex 8456 linija — koliko
  ikona ulazi u bundle, JS hookovi koji curi memoriju (event listeneri bez
  `destroyed()` cleanup-a).
- **Tehnički dug cross-cutting** — TODO/FIXME/HACK/XXX inventory, dead code
  (unused private functions), deprecated patterns (`deprecated` warnings,
  removed multiple support u select/combobox), inconsistent conventions
  (snake vs kebab CSS klase, attr docs format), Lightning CSS build pipeline
  rizici, `mix exo.install` patch idempotency.

Output: `docs/audits/2026-04-26/cross-cutting-<area>.md`

### Faza 3 — Sinteza (ti glavni agent)

Ti, glavni agent, čitaš sve fajlove iz `docs/audits/2026-04-26/` i pišeš
`docs/audits/2026-04-26/README.md` master izvještaj (template ispod).

---

## Audit jedinice (18 stavki — svaka dobija svoj subagent)

### Component modules (5)

1. **Core components** — `lib/exo_ui/components/core.ex` (367 linija):
   button, header, modal, theme_toggle, kbd, separator, badge, indicator,
   spinner, … Provjeri attr API konzistentnost, variant lista, size lista,
   slot definicije, `attr :rest, :global` pokrivenost. Test: `*_test.exs`
   za svaku.

2. **Form components** — `lib/exo_ui/components/form.ex` (920 linija):
   form, input, select, combobox, checkbox, radio_group, fieldset,
   file_input, slider, toggle, date_picker, rating, textarea, … Provjeri
   `Phoenix.HTML.FormField` integraciju, error rendering, `:form` slot
   forwarding, native vs custom inputs (popover/native popover), `phx-feedback`
   patterns (LiveView 1.1 zna nove forme tu — provjeri da li koristi
   `used_input?/1` ili stari pristup).

3. **Overlay components** — `lib/exo_ui/components/overlay.ex` (748 linija):
   modal, drawer, sheet, popover, tooltip, hover_card, command_palette,
   dropdown_menu, context_menu, menubar, confirm_modal. Provjeri native
   `<dialog>` vs `popover` attribute, focus trap, escape-to-close, click
   outside, `inert` na pozadini, scroll lock, multiple-instance handling
   (dva otvorena tooltip-a), z-index sloj.

4. **Data display** — `lib/exo_ui/components/data_display.ex` (560 linija):
   table, avatar, badge, breadcrumb, list, card, content_card, metric_card,
   stat_card, trend_badge, timeline, pagination, empty_state, skeleton,
   progress, radial_progress, sparkline, scroll_area. Provjeri table API
   (rows, col slot, sort, sticky header), pagination accessibility, empty
   state slots.

5. **Feedback components** — `lib/exo_ui/components/feedback.ex` (224 linija):
   flash, flash_group, toast, alert, progress, spinner. Provjeri `phx-click`
   za dismiss, auto-dismiss timer, `aria-live` regije, toast stack
   management, `flash_group` LiveView integration.

### Charts (1)

6. **Charts** — `lib/exo_ui/charts/` (cartesian.ex 1130, radial 296,
   primitives 145, shared 241, helpers 73): area, bar, donut, line, pie,
   radar, radial, sparkline, stacked variants. Provjeri SVG output
   determinizam (string interpolation safety), aria-label/role="img" za
   svaki chart, missing values handling, large dataset performance,
   tooltip pozicioniranje, animacije, dark mode boje.

### Layouts (1)

7. **Layouts** — `lib/exo_ui/layouts.ex` (123 linija) +
   `assets/css/src/layouts/sidebar.css`: sidebar, header, footer, navbar,
   bottom_nav, hero, wizard, steps. Provjeri responsive ponašanje, mobile
   nav (bottom_nav vs sidebar), sticky header, sidebar collapse state
   (LiveView assign vs JS hook), focus management na route change.

### JS hooks (1)

8. **JavaScript hooks** — svi u `assets/js/hooks/`:
   accordion, carousel, collapsible, combobox, command_palette,
   context_menu, dropdown_menu, hover_card, menubar, overlay, popover,
   rating, select, sidebar, theme_toggle, tooltip + `assets/js/index.js`
   registar. Provjeri:
   - `mounted()` parovan sa `destroyed()` (cleanup event listenera)
   - `updated()` lifecycle (LiveView re-render bez gubitka state-a)
   - server-client coordination (`pushEventTo`, `handleEvent`)
   - memory leak rizici (timeri, IntersectionObserver bez disconnect)
   - keyboard shortcuts (Cmd+K za command palette — collision sa browser-om?)
   - native popover API fallback za stare browsere
   - `theme_toggle` localStorage flush + LiveView reconnect

### CSS architecture (1)

9. **CSS tokens & themes** — `assets/css/src/tokens.css`,
   `assets/css/src/themes/dark.css`, svi `components/*.css`. Provjeri:
   - token naming konzistentnost (`--exo-color-*`, `--exo-radius-*`,
     `--exo-space-*`, `--exo-font-*`, `--exo-shadow-*`, `--exo-z-*`)
   - dark mode parity (svaki light token ima dark counterpart?)
   - specificity wars (multiple `&:hover &:focus` chains)
   - `:focus-visible` umjesto `:focus`
   - `prefers-reduced-motion` upotreba
   - kompozitni tokens (`--exo-button-bg`) vs base tokens
   - hard-coded boje van tokens (`#fff`, `#000`, `rgba(...)`)
   - vendor prefixes potrebni? Lightning CSS auto-prefixing? (vidi
     build pipeline)

### Lucide icons (1)

10. **Icons** — `lib/exo_ui/lucide.ex` (8456 linija!): bundle veličina,
    da li svaka ikona zauzima funkciju, kako se koriste u komponentama,
    da li postoji tree-shake mehanizam, missing icons (provjeri šta
    sve `<.icon name="..."/>` poziva u storybook stories i test
    fajlovima — svaki naziv mora postojati). Alternative: SVG sprite,
    inline import po imenu, dynamic load.

### Mix tooling (1)

11. **`mix exo.install`** — `lib/mix/tasks/exo.install.ex`. Provjeri:
    - idempotentnost (drugi run ne razbije)
    - patch logika za `assets/css/app.css`, `assets/js/app.js`,
      `lib/*_web/components/*.ex`
    - error handling kad target fajl ne postoji
    - šta dodaje u `mix.exs` (ako nešto)
    - kompatibilnost sa `phx.new --no-ecto`, custom layout-ima
    - test pokrivenost (postoji li test za task?)

### Public API (1)

12. **`use ExoUI` & exports** — `lib/exo_ui.ex`, `lib/exo_ui/components.ex`.
    Provjeri:
    - `core_components: false` opcija — koje funkcije isključuje, fali li
      koja kolizija (table je u DataDisplay, ali šta sa input?)
    - `import ... except: [...]` listovi konzistentni sa CoreComponents
      iz Phoenix 1.8 generatora
    - default opcije i edge cases
    - public macros vs private helpers

### Storybook (1)

13. **Storybook coverage** — `storybook/stories/components/*.story.exs`,
    `storybook/lib/`. Provjeri:
    - svaka komponenta iz `lib/exo_ui/components/` ima story?
    - varijacije pokrivene (variant, size, state combinations)
    - chart stories (area, bar, donut, line, pie, radar, radial,
      sparkline, stacked)
    - dark mode preview
    - interactivni primjeri (forms, modal, popover)
    - missing stories (uporedi `_components.index.exs` sa stvarnim
      komponentama)
    - `storybook_web` setup ispravnost

### Tests (2)

14. **ExUnit tests** — `test/exo_ui/components/*.exs` (51 fajl). Provjeri:
    - svaka komponenta ima test fajl?
    - render assertion patterns (regex vs Floki vs string contains)
    - attr/slot validation testovi
    - error case coverage
    - `interactive_forwarding_test.exs` i `visual_test.exs` šta tačno rade
    - test/support/ helpers
    - flaky testovi (Process.sleep, async race)
    - missing tests (komponenta postoji, test fajl ne postoji)

15. **Playwright E2E** — `test/browser/*.spec.js`,
    `test/browser/helpers/storybook.js`, `playwright.config.js`. Provjeri:
    - šta je pokriveno: combobox, command_palette, context_menu,
      dropdown_menu, hover_card, menubar, overlay, popover, rating,
      select, tooltip
    - šta NIJE pokriveno (modal, drawer, sheet, sidebar, theme_toggle,
      carousel, accordion, charts interactivity)
    - selektori (data-testid? text? role?)
    - waitForSelector vs sleep
    - browser matrix (samo Chromium ili Firefox/WebKit takođe?)
    - storybook-targeted vs sample-app testovi

### Build & dev tooling (1)

16. **Build pipeline** — `package.json`, `bun.lock`, Lightning CSS config,
    `priv/static/exo.css`, `Dockerfile`. Provjeri:
    - bun vs npm konzistentnost
    - CSS bundling steps (Lightning CSS minify, autoprefix)
    - sourcemap output
    - watch mode za dev
    - storybook standalone build
    - Dockerfile target (development? assets? deploy?)
    - CI/CD signals (.github/workflows ako postoji)

### Documentation (1)

17. **Documentation quality** — `README.md`, `CHANGELOG.md`,
    moduledoc-ovi u `lib/exo_ui/components/*.ex`, attr `:doc` pokrivenost,
    funkcijski docstring-ovi, `docs/` direktorijum. Provjeri:
    - svaka public komponenta ima moduledoc-style komentar/example?
    - `attr :name, :type, doc: "..."` popunjeno?
    - `slot :inner_block, doc: "..."` popunjeno?
    - `@doc since:` za nove dodatke
    - missing examples (HEEx snippet u dokumentaciji)
    - hex.docs publish readiness (ex_doc config u mix.exs main: "ExoUI",
      extras: README + CHANGELOG — ima li grupe modula?)
    - browser support matrix gdje je naveden
    - migration guide ako planira pre-1.0 → 1.0

### Hex publish readiness (1)

18. **Hex publish & semver** — `mix.exs`, `LICENSE`, `CHANGELOG.md`,
    `README.md`. Provjeri:
    - `package` blok u mix.exs (NIJE PRONAĐEN trenutno — bez maintainers,
      licenses, links, files)
    - `LICENSE` fajl ispravan MIT
    - `description`, `name`, `source_url` — postoje
    - Hex requirement: `package` mora postojati prije `mix hex.publish`
    - `priv/static/exo.css` distribucija (šta se publish-uje?)
    - `assets/` distribucija (mix package-uje samo `lib/`, `priv/`,
      `mix.exs`, `README*`, `LICENSE*` po default-u — ako su CSS/JS u
      `assets/` neće biti u Hex paketu!)
    - vendor strategija: kako konzument dobija CSS i JS? (instaler kopira?
      `priv/static/`?)
    - semver komentar u README (pre-1.0, breaking changes ok do 1.0)

---

## Per-jedinica template (subagent popunjava)

```markdown
# Audit: <Jedinica ime>

**Datum:** 2026-04-26
**Auditor:** Claude Opus 4.7 (subagent)
**Score:** 🟢 solidno / 🟡 ima problema / 🔴 kritično
**Pre-1.0 readiness:** ~X% (subjektivna procjena)

## TL;DR (max 5 linija)

Šta je suština stanja. Tri najveća problema u jednoj rečenici svaki.

## Mapa jedinice

### Ključni fajlovi

- `lib/.../foo.ex` — kratko šta radi (sa veličinom)
- `assets/css/src/components/foo.css` — kratko šta radi
- `assets/js/hooks/foo.js` — kratko šta radi
- `storybook/stories/components/foo.story.exs` — coverage
- `test/exo_ui/components/foo_test.exs` — test coverage
- `test/browser/foo.spec.js` — E2E coverage (ako postoji)

### Public API (attr/slot/event)

- `attr :variant, :string, values: [...]` (`lib/.../foo.ex:42`)
- `slot :inner_block, required: true` (`lib/.../foo.ex:55`)
- emitted events: `phx-click`, custom events
- JS hook public hooks: `pushEvent` calls

### Tok podataka (server → client → server)

LiveView render → HEEx attrs → DOM + data-\* → JS hook mount →
event listener → pushEvent → handle_event → re-render
(prikazi sa fajl:linija na svakoj stanici)

## Šta postoji i radi (sa dokazima)

- Konkretne stvari + fajl:linija + zašto radi dobro
- Ne piši "robust component" — citiraj attr validaciju i objasni

## Šta nedostaje ili je polovično

- Konkretne rupe + zašto su rupe
- Linija u dokumentaciji koja kaže "trebalo bi X" + linija u kodu gdje X NIJE

## Problemi po ozbiljnosti

### 🔴 Kritično (security, data corruption, public API breaking)

#### 1. <Naslov problema>

- **Gdje:** `lib/.../foo.ex:142-156`
- **Šta se dešava:** konkretan opis sa snippet-om koda
- **Zašto je kritično:** posljedica (npr. XSS rizik kroz `Phoenix.HTML.raw/1`)
- **Reprodukcija:** koraci ili scenario
- **Predlog popravke:** sa pseudocode-om ili uputstvom (ne piši kod u repo)

### 🟡 Srednje (bugs, a11y violations, performance, UX)

#### N. ...

### 🟢 Sitno (cleanup, naming, docs)

#### N. ...

## Sigurnosna analiza

- **HTML escaping:** `raw/1` upotreba opravdana?
- **Attribute injection:** `assigns_to_attributes` vs ručni `Map.merge`
- **JS hook input trust:** `el.dataset.*` validacija
- **Event payload validacija:** server `handle_event` čita šta treba?
- **Open redirect rizici:** ako komponenta prima URL attr (npr. link, button)

## Accessibility (a11y)

- **Semantic HTML:** koristi pravi tag (`<button>` ne `<div onclick>`)
- **ARIA roles/states:** `role`, `aria-label`, `aria-expanded`,
  `aria-selected`, `aria-controls`, `aria-describedby`
- **Keyboard nav:** Tab, Shift+Tab, Enter, Space, Escape, Arrow keys
- **Focus management:** focus trap (modal/popover/sheet), focus restore
  na close, `:focus-visible` styling
- **Screen reader:** `aria-live` za promjenjivi sadržaj, `sr-only` text
- **Reduced motion:** `prefers-reduced-motion` poštovan?
- **Color contrast:** WCAG AA na light i dark, focus ring visible

## Performanse

- **Render hot path:** komponenta unutar `phx-update="stream"` ili velikih
  liste? Bezbjedno?
- **JS hook overhead:** event listeneri proporcionalni broju instanci?
- **CSS specificity:** koliko duboko ide selektor? Bottlenecks?
- **Bundle veličina:** doprinos `priv/static/exo.css` i `lucide.ex`
- **SVG output veličina (charts):** broj path-ova, gradijenti

## Browser kompatibilnost

- **Native APIs:** `<dialog>`, `popover`, `:has()`, `:focus-visible`,
  `inert` attribute, `IntersectionObserver`, View Transitions
- **Fallback strategija:** za browsere bez popover support-a
- **Mobile:** touch targets ≥ 44px, virtual keyboard handling

## Test pokrivenost

- **ExUnit:** koje render scenarije pokriva, šta fali
- **Playwright E2E:** koji user flow je verifikovan, šta fali
- **Visual regression:** da li postoji? gdje?
- **Flakiness signali:** sleep, race conditions, fragile selectors

## Tehnički dug

- **TODO/FIXME u ovom dijelu:** lista sa fajl:linija
- **Dead code:** unused private functions
- **Konvencije van standarda:** šta odstupa od ostatka biblioteke
- **Deprecated patterns:** šta je u CHANGELOG-u zabilježeno kao removed

## Storybook & docs

- **Story coverage:** koje varijacije postoje u storyu
- **Missing stories:** šta nije pokriveno
- **Moduledoc/attr docs:** popunjeno?
- **HEEx primjeri u README:** ima li
- **Migration guide note:** je li potreban (pre-1.0 → 1.0)?

## Konfiguracija i opcije

- **`use ExoUI` opcije:** šta utiče na ovu komponentu
- **CSS custom properties:** koje tokene koristi (override surface)
- **JS hook konfig:** data-\* attributes koji mijenjaju ponašanje

## Preporuke (po prioritetu)

1. **[Kritično]** Konkretna akcija + očekivani effort (S/M/L)
2. **[Visok]** ...
3. **[Srednji]** ...
4. **[Quick win]** ...

## Pitanja za vlasnika biblioteke

- Stvari koje audit ne može razriješiti bez product konteksta (npr.
  "treba li `multiple` u select-u prije 1.0?")
```

---

## Master README format

```markdown
# ExoUI Deep Audit — 2026-04-26

**Auditor:** Claude Opus 4.7 (paralelni subagenti + sinteza)
**Skopiranih jedinica:** 18
**Trajanje audita:** ~X sati real-time
**Repo SHA:** <git rev-parse HEAD>
**Verzija:** 0.1.0

## Executive Summary (max 15 linija)

Stanje biblioteke u tri pasusa: gdje smo solidni, gdje krvarimo, šta su top
3 strateška rizika za pre-1.0 → 1.0 stabilizaciju i Hex publish. Bez
ublažavanja.

## Score tabela

| #   | Jedinica           | Score | 🔴  | 🟡  | 🟢  | Test cov | Notes              |
| --- | ------------------ | ----- | --- | --- | --- | -------- | ------------------ |
| 1   | Core components    | 🟢    | 0   | 2   | 5   | ~85%     | Solid base         |
| 2   | Form components    | 🟡    | 0   | 4   | 3   | ~70%     | LV 1.1 form gaps   |
| ... |                    |       |     |     |     |          |                    |

**Ukupno:** X 🔴 kritičnih, Y 🟡 srednjih, Z 🟢 sitnih

## Top 10 kritičnih problema (cijela biblioteka)

1. **[Jedinica]** Naslov — `fajl:linija` — posljedica jednom rečenicom
2. ...

## Cross-cutting nalazi

### Accessibility

(sažetak iz `cross-cutting-a11y.md`)

### Public API & semver

(sažetak iz `cross-cutting-api.md`)

### Performance

(sažetak iz `cross-cutting-performance.md`)

### Tehnički dug

(sažetak iz `cross-cutting-techdebt.md`)

## Pre-1.0 → 1.0 blocker lista

(stvari koje moraju biti riješene prije 1.0)

## Hex publish blocker lista

(specifično za hex publish)

## Quick wins (low effort, high impact)

1. ... (konkretno, sa effort estimate)

## Strateške preporuke (3-6 mjeseci)

1. **Prioritet 1:** ...
2. ...

## Šta je solidno (kratko, da se zna šta NE treba dirati)

- ...

## Open questions za vlasnika

- ...

## Index svih izvještaja

- [01-core-components.md](./01-core-components.md)
- [02-form-components.md](./02-form-components.md)
- ...
- [cross-cutting-a11y.md](./cross-cutting-a11y.md)
- [cross-cutting-api.md](./cross-cutting-api.md)
- [cross-cutting-performance.md](./cross-cutting-performance.md)
- [cross-cutting-techdebt.md](./cross-cutting-techdebt.md)
```

---

## Hint-ovi za dubinu (ne preskači)

- **Pročitaj `lib/exo_ui.ex` u cijelosti** — `__using__` makro definiše
  šta je public surface i koje opcije postoje.
- **Pročitaj `lib/exo_ui/utils.ex`** — class merging, attr forwarding —
  ako tu ima bug, sve ga nasljeđuje.
- **`mix xref graph --format stats`** — vidi top fan-in/fan-out modules.
- **`mix credo --strict`** — pokupi quick wins (ali ne stani na credo,
  gledaj dublje).
- **`mix dialyzer`** ako je već warm — type errors.
- **Greppaj `Phoenix.HTML.raw`** — svaki poziv je potencijalni XSS
  ako sadržaj nije server-controlled.
- **Greppaj `assigns_to_attributes`** vs `Map.merge` — konzistentnost
  attr forwarding-a.
- **Greppaj `:rest, :global`** — koje komponente prihvataju arbitrary
  attrs (i zašto).
- **Greppaj `data-` u svim hook fajlovima** — što JS čita iz DOM-a.
- **Greppaj `addEventListener`** bez parnog `removeEventListener` u
  `destroyed()` — memory leak.
- **Greppaj `setTimeout`/`setInterval`** bez `clearTimeout` u
  `destroyed()`.
- **Greppaj `IntersectionObserver`/`MutationObserver`** bez
  `disconnect()`.
- **Greppaj `:focus` bez `:focus-visible`** — keyboard a11y rizik.
- **Greppaj raw boje (`#`, `rgba`, `hsl`) u CSS** van `tokens.css` i
  `themes/dark.css` — propušteni token slot-ovi.
- **Greppaj `dark:` ili `[data-theme=dark]`** u CSS — selektor
  konvencija za dark mode.
- **Greppaj `IO.inspect`, `dbg(`, `Logger.debug`** — debug ostatak.
- **Greppaj `TODO`, `FIXME`, `HACK`, `XXX`** — inventory tehničkog duga.
- **Pročitaj `mix.exs` u cijelosti** — fali `package/0` blok za hex
  publish (provjeri).
- **Provjeri `priv/static/exo.css` build datum** — da li je sinhron sa
  source CSS fajlovima (stale bundle?).
- **Pročitaj `playwright.config.js`** — koji browseri, `baseURL`, retry
  config.
- **Pročitaj `Dockerfile`** — šta tačno gradi i za šta se koristi
  (preview deploy?).

---

## Anti-pattern check (tražene "loše stvari")

Subagenti **moraju aktivno tražiti** ove pattern-e i flagovati ih:

- `Phoenix.HTML.raw/1` sa user-controlled stringovima
- `<button>` bez `type="button"` (default je submit unutar forme)
- `<a>` sa `href="#"` umjesto `<button>` (false link)
- `phx-click` na `<div>` ili `<span>` umjesto `<button>` (a11y)
- `onclick="..."` (inline JS)
- `tabindex="-1"` ili `tabindex > 0` bez razloga
- Duplicate `id` u storybook stories ili komponentama
- HEEx attr bez `:doc` u public komponenti
- `attr :variant, :string` bez `values: [...]` enum-a
- LiveView hook bez `destroyed()` callback-a
- `addEventListener` bez `removeEventListener`
- `setTimeout` bez `clearTimeout` u `destroyed`
- `IntersectionObserver` bez `disconnect`
- `console.log` u produkcijskom JS
- Hard-coded `"ltr"` direction (RTL break)
- Hard-coded engleski string (treba `gettext/Gettext`)
- CSS `!important` (specificity work-around — pronaći root cause)
- CSS hard-coded boja van tokens
- Native popover bez fallback-a za stare browsere
- `<dialog>` bez `aria-labelledby`
- Modal bez focus trap-a
- Tooltip bez delay show/hide (UX flicker)
- `pushEvent` sa nevalidiranim payload-om
- `data-` attribut sa server secret-om (curi u DOM)
- Storybook story bez `:tab` prefiksa za varijacije
- ExUnit test sa `Process.sleep`
- Playwright spec sa `await page.waitForTimeout(...)`
- Lucide ikona koja se zove a ne postoji (runtime KeyError)
- `mix.exs` bez `package/0` (blokira hex publish)
- CSS bundle u repo-u koji nije iz source-a (stale)
- README primjer koji se ne kompajlira (probaj mentalno)

---

## Output ograničenja (ENFORCE)

- **Po jedinici:** max **500 linija markdown-a** (sažeto, brutalno, dokazi)
- **Cross-cutting:** max **400 linija** po fajlu
- **Master README:** max **300 linija**
- **Bez generičkih savjeta** ("write more tests", "consider caching") — sve
  mora biti konkretno na osnovu pročitanog koda
- **Ako jedinica ne postoji ili je polovična:** napiši "POLOVIČNO
  IMPLEMENTIRANO" + 5 linija šta nedostaje i zašto je u listi (vjerovatno
  iz `docs/plans/2026-04-22-exo-ui-improvement-roadmap.md`)
- **Ako nemaš pristup nečemu** (npr. CI metrika, browser testing matrix
  rezultat): napiši "POTREBNO IZ CI/PRODUKCIJE: ..." kao open question

---

## Završni deliverable

Kad je sve gotovo, ispiši za korisnika:

```text
DEEP AUDIT GOTOV.

Ukupno fajlova: 23 (18 jedinica + 4 cross-cutting + 1 master)
Lokacija: docs/audits/2026-04-26/

Top 5 kritičnih:
1. ...
2. ...
3. ...
4. ...
5. ...

Pre-1.0 blockers: N
Hex publish blockers: M

Predlog: kreni od kritičnih iz README master tabele i pre-1.0 blocker
liste prije bilo kakvog 1.0 release-a.
```

**Kreni odmah. Pokreni Faza 0, pa odmah Faza 1 sa paralelnim subagentima u
batch-evima od 4-6. Bez pitanja "da li da krenem" — kreni.**
