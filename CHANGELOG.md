# Changelog

## Unreleased

- `alert/1`: text is now the kind colour mixed 50/50 with `--exo-foreground`
  instead of the kind colour itself, and the message no longer carries
  `opacity: 0.9`. On its own 10% tint the pure colour failed WCAG AA for body
  text (warning 1.9:1 in the light theme, error 2.9:1 in the dark one, message
  text, default tokens); every kind is now above 6.9:1 in both themes. Border
  and background are unchanged. A browser test measures the ratio per kind.

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
