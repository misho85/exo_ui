# Changelog

## Unreleased

- `table/1`: the wrapper is `position: relative`, so it is the containing
  block of an absolutely positioned descendant such as the visually hidden
  actions header. That header escaped the wrapper's horizontal scroll and
  widened the page itself: on a 390px phone, an admin list with an actions
  column scrolled the whole page sideways into empty space (698px on spojka's
  waitlist, 829px on its venues), while the table already scrolled in its own
  wrapper (SPO-555).

- `sidebar_item/1`: an `active` item's link carries `aria-current="page"`.
  The current page was marked only by `data-active` and its fill, so a screen
  reader heard every item of the menu the same (SPO-555).

- `sidebar_layout/1` takes `toggle_label` and `close_label`, and
  `theme_toggle/1` takes `light_label`, `dark_label` and `system_label`, for
  the accessible names that were fixed in English ("Toggle sidebar", "Close
  sidebar", "Light theme", …). Defaults are unchanged (SPO-555).

- `pagination/1` takes `status_label` (`%{page}` and `%{total}` replaced) and
  `current_page_label` (`%{page}` replaced) for the two texts that were fixed
  in English: the visually hidden "Page 2 of 5" and ", current page" after the
  current page's label. Without `current_page_label` the suffix stays, so a
  caller that set only `page_label` hears the same as before (SPO-1043).

- `select/1` docs: `phx-change` works only from inside a form. The select
  still has to be in a `<form>`, or name one with `form`: LiveView's client
  refuses a change from a control that has no form ("form events require the
  input to be inside a form") and sends the server nothing, while the trigger
  already shows the new value, and `Phoenix.LiveViewTest.render_change/2` on
  the element sends the event anyway. The docs said "`phx-change` works"
  without that condition, and trg24 had three selects that relied on it,
  dead in the browser behind green tests (TRG-580, TRG-589).

- `radio_group/1`, `checkbox/1` (and `input type="checkbox"`) and `slider/1`:
  keyboard focus is a solid ring of `--exo-ring`. A radio's and a checkbox's
  indicator takes a 2px outline 2px off it, as a toggle, a button or a tab
  does; a slider's thumb a 2px ring around its border. All three were marked
  only by a 2px shadow of `--exo-ring` at 25%, which is 1.43:1 and 1.36:1
  against the card under trg24's light and dark tokens, where WCAG 1.4.11 asks
  3:1 of a focus indicator, so the option the keyboard reached looked like
  every other one. Firefox's slider thumb had no focus sign at all. A focused
  checked radio no longer repeats its fill in the focus rule, since the ring
  is not a shadow any more. With ExoUI's tokens the ring is 5.02:1 on the
  light page and 5.15:1 on its card, 3.82:1 and 3.63:1 on the dark ones.

- `select/1`: `labelledby` takes the `id` of a label the caller draws
  outside the component, for a label `label` cannot carry as a string (a
  field name followed by a surcharge or a state mark). The trigger is then
  named by that label and the selected value, and the listbox by the label,
  the same pair `label` gives. Before this such a caller had two bad
  choices: a trigger with no name at all (a screen reader heard only
  "button"), or `aria_label` repeating text already on screen as a hidden
  duplicate. `label` still wins over `labelledby`, and `labelledby` over
  `aria_label`.

- `select/1` and `combobox/1`: the option the keyboard reached carries the
  same 2px ring in `--exo-ring` inside it as a menu item. Its only sign was
  the hover fill, with `outline: none`, and `--exo-secondary` on the list's
  `--exo-card` is 1.12:1 and 1.08:1 under trg24's light and dark tokens. A
  select option takes real focus, so its ring follows `:focus-visible` and a
  pointer still sees only the fill. A combobox keeps focus in its search
  field and points at the option through `aria-activedescendant`, so its ring
  follows `[data-active]`; the hover rule no longer sets `outline: none`,
  which took the ring away while the mouse rested on the active option. With
  ExoUI's tokens the ring is 5.15:1 on the light list, 3.63:1 on the dark one
  and 4.47:1 on the option's own fill.

- `dropdown_menu/1` and every `data-exo="dropdown-item"`: the item that has
  keyboard focus carries a 2px ring in `--exo-ring`, drawn inside the item
  (`outline-offset: -2px`). Focus was shown only by the hover fill, with
  `outline: none`, and `--exo-muted` on the menu's `--exo-card` is about
  1.1:1 (1.12:1 and 1.08:1 under trg24's light and dark tokens), so the item
  the arrow keys reached looked like every other item. The ring follows
  `:focus-visible`, so a pointer still sees only the fill. With ExoUI's tokens
  it is 5.15:1 on the light menu and 3.63:1 on the dark one.

- `steps/1`: a horizontal list in a narrow container no longer overflows it.
  A step did not shrink below its circle, title and connector, so five
  checkout steps were 555px wide and pushed a 360px phone page sideways, with
  the last two steps off screen; four order statuses in a card did the same.
  Below about 8.5rem a step the list is compact: the circles and connectors
  span its width, first circle at the start and last at the end, and one
  title is shown on a line under them, the current step's or, in a list
  without one, the last complete step's. The other titles and the
  descriptions stay in the list as visually hidden text, so a screen reader
  reads every step with its status at any width. The list is a size container
  (`container: exo-steps / inline-size`), so it follows the space it has, not
  the viewport, and takes the width of its container: in a shrink-to-fit
  context give it a width. The list carries `data-count`, the number of steps
  drawn, which the stylesheet needs for the width. Above that width the list
  is drawn as before.

- `select/1`, `combobox/1`: the check of the chosen option is drawn in the
  option's own text colour. It was `--exo-primary` on the list. A theme that
  sets one brand colour for light and dark, as a storefront does, cannot keep
  that colour visible on both: the check was 1.06:1 for `#111827` on the dark
  list and 2.15:1 for amber on the light one, so which language, currency or
  variant was chosen showed only in the weight of its label. In the option's
  colour the check reads as well as the label, on the list and under the
  pointer.

- `radio_group/1`: a checked radio is filled with `--exo-primary` and keeps a
  dot of `--exo-primary-foreground`, as a checked checkbox keeps its check.
  It was a ring and a dot of `--exo-primary` with the page between them, so
  under one brand colour the chosen option vanished in one theme: the dot was
  1.11:1 for `#111827` in dark and 2.09:1 for amber in light. A focused
  checked radio keeps the same look: the focus ring is a box-shadow too, and
  used to replace the inner ring.

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
