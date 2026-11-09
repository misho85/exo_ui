# Status

Newest first. Dated state of the repository: what was measured and where the evidence is.
Rules live in the guides and in `.woodpecker/`, not here.

## 2026-11-09 — The deep audit prompt follows the fleet standard (EXO-1)

- **`docs/prompts/exo-ui-project-audit.md` is v2.** It says WHAT is audited here; HOW a round
  runs and what it leaves behind is the fleet standard "Deep audit — krug na platformi"
  (Pogon › Tehnički standardi, mirrored in `krafter-infra/standards/tehnicki-standardi/deep-audit.md`).
  A round now ends as a Pogon project `ExoUI deep audit <date>` in team `EXO`, with its documents
  mirrored to `docs/audit/<krug>/` and closed when its LEDGER plan ships.
- **Removed from the prompt** because the standard owns them: output location and templates,
  finding format, severity, orchestration phases, final answer. The v1 output in
  `docs/audits/2026-04-28/` and the status in `docs/audits/2026-05-04/` stay where they are, as
  history before the platform.
- **Fixed in the prompt:** charts live in `lib/exo_ui/charts/`, stories in
  `storybook/stories/components/<group>/`; the missing reference audit
  `docs/audits/2026-04-24-exo-ui-project-analysis.md`, `mix credo` and `mix dialyzer` (no such
  deps) are gone; counts of files, tests and hooks became the commands that measure them.
- **Added:** dimension 00 (measures), 11 docs-truth, 12 house rules without a guard, 13
  regressions of the 2026-04-28 and 2026-05-04 rounds. No code changed.

## 2026-11-09 — CI back on, `main` green at `ac62821` (KRF-744)

- **Woodpecker repo 17 is active again.** It was switched off on 2026-10-29 together with
  the whole fleet, by the owner's decision to pause CI until launch (KRF-739). It was switched
  back on on 2026-11-07, when the GitHub webhook was re-created at 16:09 UTC. Pull requests
  get a pipeline again: #60 got pipeline 13. Merging still does not wait for CI.
- **Merged while CI was off:** #55–#59, with no pipeline at all.
- **The first runs after the return were red on an advisory, not on code.** The `advisories`
  cron failed in pipelines 11 and 12, on 2026-11-08 and 2026-11-09, at `2ae5d1b`. The cause
  was `phoenix_html` 4.3.0 (EEF-CVE-2026-117645) in `mix.lock` and `storybook/mix.lock`.
  `ci.yaml` runs the same `mix hex.audit` before ExUnit, so a full pipeline on that commit
  could not have judged any test.
- **Fix:** #60 bumps `phoenix_html` to 4.4.0 in both locks (merge `ac62821`).
- **Verdict on `ac62821`**, which is `2ae5d1b` plus those two lock lines:
  - push pipeline 14 is green in every step: `test` (ExUnit for the library and the storybook,
    browser suite, visual regression), `artifacts`, `release` and `notify`. That covers
    #55–#59.
  - The `advisories` cron, run by hand as pipeline 15, is green, and the Kuma monitor
    `exo_ui-advisories` reported `up`.
- **Storybook in production:** deployed at `ac62821`. It runs `phoenix_html-4.4.0`, and
  `/welcome` returns 200.
