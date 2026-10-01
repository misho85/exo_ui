# Changelog

## Unreleased

- `alert/1`, `slider/1`: a mix with a neutral keeps the hue of its colour. The
  alert text (kind colour 50/50 with `--exo-foreground`) and the invalid
  slider track (`--exo-danger` 24% with `--exo-muted`) were mixed in `oklch`,
  which interpolates the hue angle, and the neutral's hue pulled them even at
  chroma 0 (Chromium takes the written hue). With the default tokens info text
  was purple (hue 305 instead of 250) and success text olive (78 instead of
  155); with a tinted foreground such as `oklch(20% 0.006 106)` error text was
  brown (66 instead of 27). Both mixes are now in `oklab`, so the text is a
  darker or lighter shade of its kind. Lightness is the same, and the lowest
  ratio with the default tokens is 6.80:1 (light warning, was 6.96:1). A
  browser test measures the alert text hue with the default and a tinted
  foreground, and `ExoUI.ColorMixTest` refuses a polar `color-mix()` with
  anything but `transparent`.

- `toggle/1`, `checkbox`, `radio_group/1`: the off state is visible. An off
  toggle was a `--exo-muted` track with a `--exo-background` thumb, about
  1.1:1 against the card in both themes, and an unchecked checkbox or radio
  had a `--exo-input` border, about 1.3:1; WCAG 1.4.11 asks 3:1. The off
  toggle is now an outlined track with a filled thumb, both
  `--exo-muted-foreground`; on, the track is `--exo-primary` and the thumb
  `--exo-background`, as before. Checkbox and radio borders are
  `--exo-muted-foreground`. The toggle keeps its size (the border is inside
  the box). A browser test measures every control in both themes.

- `select/1`: a `form` attribute now goes to the native `<select>`, next to the
  `phx-*` bindings. Before, `form` was not an accepted attribute (a compile
  warning), and passing it through `rest` would have put it on the wrapper
  `<div>`. A select in a side card can now belong to the main form: its value
  is submitted with that form and its changes fire that form's `phx-change`.

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
