# ExoUI Phase 6: DinaricHub Migration (KrafterUI → ExoUI)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace KrafterUI with ExoUI in DinaricHub while keeping everything working.

**Strategy:** Incremental — swap dependency, update delegations, keep DaisyUI for app-level styling. ExoUI CSS runs alongside DaisyUI initially. DaisyUI removal is a separate future effort.

**Working directory:** `/Users/miso/Developer/dinaric-hub`

**Branch:** `feat/exo-ui-migration`

---

### Task 1: Create branch, swap dependency

- Create `feat/exo-ui-migration` branch
- In `mix.exs`: replace `{:krafter_ui, path: "packages/krafter_ui"}` with `{:exo_ui, path: "../exo_ui"}`
- Run `mix deps.get`
- Add ExoUI CSS import to `assets/css/app.css`
- Add ExoUI JS hooks to `assets/js/app.js`
- Add `config :exo_ui, gettext_backend: DinaricHubWeb.Gettext` to config
- Verify compilation

### Task 2: Update CoreComponents delegations

- In `lib/dinaric_hub_web/components/core_components.ex`:
  - Change all `KrafterUI.Components.xxx(assigns)` → `ExoUI.Components.xxx(assigns)`
  - Keep app-specific components (money, stat_card override, format helpers) in CoreComponents
  - Handle renames: standalone_checkbox → toggle
  - Add badge component that maps status/role to ExoUI badge variant
  - Keep money/currency functions local

### Task 3: Update Layouts delegation

- In `lib/dinaric_hub_web/components/layouts.ex`:
  - Change `KrafterUI.Layouts` → `ExoUI.Layouts`
  - Update sidebar hook names if needed

### Task 4: Update JS hooks

- In `assets/js/app.js`:
  - Import ExoUI hooks instead of KrafterUI hooks
  - Map hook names (DrawerState → ExoSidebar, etc.)

### Task 5: Run tests, fix failures

- Run `mix test` and fix any test failures from HTML output changes
- The main changes: DaisyUI classes → data-exo attributes in rendered HTML

### Task 6: Verify Playwright E2E tests (manual)

- Run `bash scripts/e2e.sh` to verify visual correctness
