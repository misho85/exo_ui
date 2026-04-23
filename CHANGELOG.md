# Changelog

## 0.1.0 — Current pre-release development line

No stable `v0.1.0` tag has been cut yet. The latest historical tag in the repo
is `v0.1.0-alpha`.

Current state of the pre-release line:

- native popover-based floating primitives with minimal LiveView hooks
- `select/1` and `combobox/1` API hardening: unfinished `multiple` support was
  removed, grouped combobox rendering was completed, and public forwarding
  contracts are now regression-tested
- browser interaction coverage for `popover`, `select`, `combobox`, `tooltip`,
  `command_palette`, `hover_card`, and `context_menu`
- README/install/release workflow hardening, including a browser support matrix
  and release checklist
- `mix exo.install` now aligns with the documented `use ExoUI,
  core_components: false` integration path for standard Phoenix project layouts
- `ExoUI.Charts` has been split into smaller implementation modules while
  keeping the same public import surface

## v0.1.0-alpha — Historical scaffold tag

- initial repo scaffold
- CSS tokens and Lightning CSS build pipeline
- Phoenix Storybook setup
