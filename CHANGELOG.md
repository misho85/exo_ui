# Changelog

## Unreleased

- Fix nested accordion/collapsible state isolation, hidden component visibility,
  mixed link/action navigation order, and missing breadcrumb labels.
- Improve combobox input keyboard selection, initial labels, focus restoration,
  and boolean option values across form choice controls.
- Make carousel controls follow LiveView updates, container resizing, RTL, and
  reduced-motion preferences without intercepting text input keys.
- Preserve toast pause state across updates and overlapping hover/focus; clean up
  removed notifications, deferred menu/tooltip work, and event listeners.
- Synchronize theme controls and native form resets for sliders, file summaries,
  and ratings; avoid duplicate rating change notifications.
- Correct outdated Storybook examples and browser checks. Replace timestamp-based
  CSS freshness checks with deterministic source/bundle comparison (`check:css`).
- Refresh 28 visually reviewed Storybook references to match current component
  styling and corrected examples. Fail captures on browser errors and remove
  redundant raw video files after saving the named recordings.

## 0.1.0 — 2026-04-24

Initial public `0.1.0` release:

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
