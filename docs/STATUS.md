# Status

Newest first. Dated state of the repository: what was measured and where the evidence is.
Rules live in the guides and in `.woodpecker/`, not here.

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
