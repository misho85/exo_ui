# Visual Regression

ExoUI keeps CI-friendly visual baselines for the Storybook component capture under `test/visual-baselines/exo-ui-components`.

The baseline contains one PNG per captured Storybook route plus a manifest with dimensions and file hashes. The generated capture output stays ignored under `output/playwright/`; only the reviewed baseline is committed.

## Check A Capture Against The Baseline

Start Storybook, capture every route, then compare the screenshots:

```sh
cd storybook
PLAYWRIGHT=1 mix phx.server
```

In another shell:

```sh
bun run capture:components
bun run capture:validate
bun run visual:check
```

`visual:check` uses the latest capture run from `output/playwright/exo-ui-components/latest.json` when available. If that pointer is missing, it falls back to the newest capture directory with a `manifest.json`.

To compare a specific run:

```sh
bun run visual:check -- --run output/playwright/exo-ui-components/<run-id>
```

## The Baseline Is A CI Capture

CI renders on Linux (`ubuntu-latest`, Playwright's Chromium). A capture made on macOS
differs from it on every route, even when nothing changed, because fonts and
anti-aliasing differ: the first baseline was a macOS capture, and CI failed on 114
of 114 routes by 1.4–5% until it was replaced (KRF-284). So a local check can only
tell you what changed *relative to a local capture*, and a local run never produces
the committed baseline.

## Update The Baseline

Only update the baseline after reviewing the capture and confirming the visual change is intentional.

1. Push the change. CI's **Visual regression** step fails and uploads the capture it
   compared as the `browser-artifacts` artifact.
2. Download it into the ignored `output/` tree, so the manifest records a repo-relative
   `sourceRun`:

   ```sh
   gh run download <run-id> -n browser-artifacts -D /tmp/exo-ci
   cp -R /tmp/exo-ci/output/playwright/exo-ui-components/<capture-id> output/playwright/exo-ui-components/
   ```

3. Review `output/playwright/exo-ui-components/<capture-id>/viewer.html`. The
   `dataExoCount` of each route in its `manifest.json` must match a local capture of
   the same commit — equal counts mean the same content, rendered by another platform.
4. Write and commit the baseline:

   ```sh
   bun run visual:update -- --run output/playwright/exo-ui-components/<capture-id>
   ```

   Then commit the changed files under `test/visual-baselines/exo-ui-components`.

## Tolerances

The check allows a small image diff by default:

- `VISUAL_PIXEL_THRESHOLD=0.1`
- `VISUAL_MAX_DIFF_RATIO=0.005`

Override them when debugging:

```sh
VISUAL_MAX_DIFF_RATIO=0 bun run visual:check
```

When a screenshot exceeds the diff threshold, the script writes PNG diffs to `output/playwright/exo-ui-visual-diffs/<timestamp>`.
