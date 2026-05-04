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

## Update The Baseline

Only update the baseline after reviewing the generated `viewer.html` and confirming the visual change is intentional:

```sh
bun run visual:update -- --run output/playwright/exo-ui-components/<run-id>
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
