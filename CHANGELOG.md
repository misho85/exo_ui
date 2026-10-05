# Changelog

## Unreleased

- `steps/1`: the current step is filled like a complete one and keeps its
  number, and its title is semibold. It was an outline with the number in
  `--exo-primary` on the page background. A theme that sets one brand colour
  for light and dark, as a storefront does, cannot keep that number readable
  in both: of twelve common brand colours none reached 4.5:1 on both
  backgrounds, black was 1.12:1 and navy 1.81:1 in dark. On the fill the
  number is `--exo-primary-foreground`, the pair a theme keeps readable for
  its primary buttons: eleven of the twelve reach 4.5:1, and the twelfth
  (4.48:1) is as weak on every primary button.

- `steps/1`: a step is read from its content, and its status is the caller's
  text. Every step carried `aria-label="Step 2, Shipping, complete"`, which
  replaced what the step contains, so on a page in any other language a
  screen reader read the translated title inside an English sentence, with
  the status as an English keyword, and nothing could change that. The label
  is gone: a complete step carries `complete_label` (default "Completed") and
  an upcoming one `upcoming_label` (default "Not completed") as visually
  hidden text after the title, and the current step keeps
  `aria-current="step"`, which the screen reader announces in its own
  language. The list has `role="list"`, because WebKit drops the list role of
  an `<ol>` with `list-style: none`, and the position ("2 of 4") the label
  used to give now comes from the list.

- `rating/1`: `value_label`, a `fn value, max -> label end`, names a read-only
  rating, a rating without `label`, and each star. They were `"3 out of 5"`
  with no way to replace it. A function rather than a `%{value}` template,
  so the caller can pick the plural form for the number. The default is
  unchanged.

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
- Fail captures on browser errors and remove redundant raw video files after
  saving the named recordings. Preserve the current Linux CI visual references
  when integrating the latest Storybook updates.

- `ExoDropdownMenu`: `menuitemradio` and `menuitemcheckbox` are items of the
  menu. The hook took only `role="menuitem"`, so a choice or a toggle inside a
  menu (a theme, a density, "show grid") stayed in the tab order while the
  other items left it, the arrow keys and `Home`/`End` skipped it, and a
  disabled one was not marked `aria-disabled`. A screen reader user who opens
  the menu and moves with the arrows, as a menu asks, never reached it. A new
  example story, Menus › Dropdown Menu Choices, holds a named group of
  `menuitemradio` items and a `menuitemcheckbox`, and a browser test walks it
  with the keyboard.

- `modal/1`, `confirm_modal/1`, `drawer/1`, `sheet/1`: the close button takes
  `close_label`. It was the only text in these overlays a caller could not
  replace (`aria-label="Close"`), so on a page in any other language a screen
  reader announced the way out of the dialog in English. The default stays
  "Close".

- `radio_group/1`: an option's description goes under its label. The
  `radio-description` span had no rule, so in the one-row flex item it became
  a third column next to the label, and in a narrow card the label broke into
  a column one or two words wide. An item with a description is now a grid:
  the indicator in the first column, the label and the description in the
  second, and the indicator centred on the label's row. The description is
  `--exo-text-xs` in `--exo-muted-foreground`, like a field description, and
  stays linked to its radio through `aria-describedby`. An item without a
  description is unchanged. `checkbox` and `toggle/1` have no per-option
  description; their `description` is a field description under the control.
  A browser test measures the layout under `content-box` and `border-box`.

- Themes set `color-scheme`: `light` on `:root` and on
  `[data-theme="light"], .exo-default`, `dark` on `[data-theme="dark"],
  .exo-dark` and in the `prefers-color-scheme: dark` block. Before, no ExoUI
  CSS set it, so the browser drew the parts of a control it paints itself
  (calendar icon of `<input type="date">`, number spinners, scrollbars, the
  list of a native `<select>`, autofill) in the light scheme under the dark
  theme too: the calendar icon was 1.45:1 on the dark field, now 19.68:1 (the
  light theme is unchanged at 20.47:1). The property inherits, so a themed
  wrapper switches what is inside it. If you replace the dark tokens with your
  own, set `color-scheme: dark` there as well. A browser test checks the
  computed `color-scheme` for the system theme, a theme pinned on `<html>` and
  a themed wrapper.

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
