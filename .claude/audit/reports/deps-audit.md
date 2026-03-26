# Dependency Audit

## Score: 82/100

## Issues Found

- **[MEDIUM] Version pinning too tight for a library.** `{:phoenix, "~> 1.8.5"}` and `{:phoenix_live_view, "~> 1.1.27"}` use patch-level constraints, restricting consumers to narrow version ranges. Libraries should prefer minor-level constraints (e.g., `~> 1.8` and `~> 1.1`).

- **[LOW] `gettext` should be an optional dependency.** Only used when `:gettext_backend` is configured; falls back to string interpolation otherwise.

- **[LOW] `phoenix` may be droppable as a direct dependency.** Only usage is `Phoenix.Flash.get/2` in flash component. `phoenix_live_view` already depends on `phoenix` transitively.

- **[INFO] `jason` is test-only but may be unused.** Correctly scoped with `:only :test`, but verify tests actually need it.

## Clean Areas

- No retired or vulnerable packages (`mix hex.audit` clean)
- All dependencies up-to-date (`mix hex.outdated` -- all at latest)
- `mix.lock` present and committed
- `ex_doc` correctly scoped to `:dev` with `runtime: false`
- Minimal dependency count (6 direct, 20 transitive)
- All dependencies use permissive licenses (Apache 2.0 / MIT)

## Recommendations

1. Loosen version constraints to minor-level: `{:phoenix, "~> 1.8"}` and `{:phoenix_live_view, "~> 1.1"}`
2. Make gettext optional: `{:gettext, "~> 1.0", optional: true}`
3. Consider removing `phoenix` as a direct dep
4. Verify `jason` is actually needed in tests
