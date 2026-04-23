# Native Popover Components Design

> **Status (April 23, 2026):** Historical design record. The current source of
> truth is the codebase, [README](../../README.md), and the
> [improvement roadmap](../plans/2026-04-22-exo-ui-improvement-roadmap.md).
> Sections that describe `select/1` or `combobox/1` `multiple` support are
> superseded; the shipped API currently supports single selection only.

ExoUI floating components rebuilt on the native HTML Popover API + CSS Anchor Positioning. Zero custom JS for popover mechanics — browser handles dismiss, escape, z-index, overflow escape, and viewport-aware positioning natively.

## Decision Record

- **Approach:** Popover as standalone base primitive. Dropdown, Select, Combobox, Tooltip built on top.
- **Why native Popover API:** Eliminates all custom JS for open/close/dismiss. Top layer escapes overflow and z-index. Light dismiss, escape key, focus management built-in. No Phoenix/LiveView library has adopted this yet.
- **Why CSS Anchor Positioning:** Viewport-aware flip without JS. `position-area` + `position-try-fallbacks: flip-block`. Baseline since January 2026 (Firefox 147 was last holdout, ~82% global support). Fallback for older browsers included.
- **JS hooks:** Minimal, only where HTML/CSS can't cover — `aria-expanded` toggle, arrow key navigation, form integration, WCAG escape dismissal. No JS for positioning/dismiss. The combobox input-trigger variant is the one exception: `popovertarget` is invalid on `<input type="text">`, so the hook calls `.showPopover()` / `.hidePopover()` for that variant.
- **Anchor name uniqueness:** Every component instance generates unique anchor names via inline styles using its `id` attr. Hardcoded CSS anchor names would collide with multiple instances on the same page.

## Browser Support

| API                     | Support | Status                  |
| ----------------------- | ------- | ----------------------- |
| `popover="auto"`        | ~90%    | Baseline April 2025     |
| CSS Anchor Positioning  | ~82%    | Baseline January 2026   |
| `@starting-style`       | Same    | Works                   |
| `:has()` selector       | ~93%    | Baseline December 2023  |

**Known gotcha:** iOS Safari 17.0-18.2 did not dismiss popovers on outside tap. Fixed in 18.3+.

## Position-Area Mapping

All components share the same mapping from `data-side` + `data-align` to CSS `position-area` values. This mapping lives in `popover.css` and is reused by tooltip:

| side    | align    | position-area             |
| ------- | -------- | ------------------------- |
| bottom  | start    | block-end span-inline-end |
| bottom  | center   | block-end                 |
| bottom  | end      | block-end span-inline-start |
| top     | start    | block-start span-inline-end |
| top     | center   | block-start               |
| top     | end      | block-start span-inline-start |
| left    | start    | inline-start              |
| left    | center   | inline-start              |
| left    | end      | inline-start              |
| right   | start    | inline-end                |
| right   | center   | inline-end                |
| right   | end      | inline-end                |

All use `position-try-fallbacks: flip-block` for viewport-edge flipping.

---

## 1. Popover (Base Primitive)

Standalone floating container. All other floating components compose on this.

### Popover API

```elixir
<.popover id="my-pop" side="bottom" align="start">
  <:trigger>
    <.button>Open</.button>
  </:trigger>
  Content here.
</.popover>
```

### Popover Attributes

| Attr   | Type      | Default    | Description                                |
| ------ | --------- | ---------- | ------------------------------------------ |
| `id`   | `:string` | required   | Unique ID for popovertarget binding        |
| `side` | `:string` | `"bottom"` | `top \| bottom \| left \| right`           |
| `align`| `:string` | `"center"` | `start \| center \| end`                   |
| `mode` | `:string` | `"auto"`   | `auto` (light dismiss) \| `manual`         |
| `class`| `:string` | `nil`      | On content div                             |
| `rest` | `:global` | --         | Forwarded to content div                   |

### Popover Slots

| Slot           | Required | Description                                          |
| -------------- | -------- | ---------------------------------------------------- |
| `:trigger`     | no       | Element that opens popover. Wrapped in button with `popovertarget`. Optional for sub-menu patterns where trigger lives in another component. |
| `:inner_block` | yes      | Popover content                                      |

### Popover Emitted HTML

Anchor names are generated per-instance using inline styles with the component `id`:

```html
<div data-exo="popover">
  <button type="button" popovertarget="my-pop" data-exo="popover-trigger"
          aria-haspopup="true"
          style="anchor-name: --popover-my-pop">
    Open
  </button>
  <div id="my-pop" popover="auto" data-exo="popover-content"
       data-side="bottom" data-align="start"
       style="position-anchor: --popover-my-pop">
    Content here.
  </div>
</div>
```

When `:trigger` slot is omitted (sub-menu pattern), only the content div is rendered.

### Popover CSS -- Positioning

```css
[data-exo="popover-content"] {
  margin: 0;
  inset: auto;
  /* position-anchor set via inline style per instance */
  /* position-area set per data-side/data-align via attribute selectors */
  position-try-fallbacks: flip-block;
}

/* Example: bottom + start */
[data-exo="popover-content"][data-side="bottom"][data-align="start"] {
  position-area: block-end span-inline-end;
}

/* Trigger styling when open */
[data-exo="popover"]:has(:popover-open) [data-exo="popover-trigger"] {
  /* active state styling */
}

/* Fallback without anchor positioning */
@supports not (position-area: top) {
  [data-exo="popover"] {
    position: relative;
  }
  [data-exo="popover-content"] {
    position: absolute;
    left: 0;
    top: 100%;
    margin-top: var(--exo-space-1);
  }
}
```

The fallback uses `position: relative` on the wrapper + `position: absolute` on the content. This only applies to browsers that support `popover` but NOT anchor positioning. Since `popover` elements in the top layer have `position: fixed` by default, the fallback explicitly overrides to `absolute` within a relatively-positioned parent.

### Popover CSS -- Animations

```css
[data-exo="popover-content"]:popover-open {
  opacity: 1;
  transform: scale(1);
}

[data-exo="popover-content"] {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.15s, transform 0.15s,
              overlay 0.15s allow-discrete,
              display 0.15s allow-discrete;
}

@starting-style {
  [data-exo="popover-content"]:popover-open {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

### Popover JS Hook: `ExoPopover`

~5 lines. Listens to `toggle` event on popover element, toggles `aria-expanded` on trigger.

Implements `mounted()` and `updated()` callbacks to handle LiveView DOM patching -- re-reads state from DOM after server pushes.

### Popover Close-from-within

Users place `<button type="button" popovertarget="id" popovertargetaction="hide">` inside content. The `type="button"` is critical inside forms to prevent form submission. Documented in component docs.

### Popover Form Gotcha

`<button popovertarget>` inside a `<form>` will submit the form unless `type="button"` is set. The component sets this automatically on the trigger. User-authored close buttons inside content must set `type="button"` themselves -- documented with a warning.

---

## 2. Dropdown Menu

Rebuilt on popover base. Replaces current `dropdown/1` component.

### Dropdown API

```elixir
<.dropdown_menu id="actions">
  <:trigger>
    <.button variant="ghost">Actions</.button>
  </:trigger>
  <:item click="edit" icon="pencil" shortcut="⌘E">Edit</:item>
  <:item click="duplicate" icon="copy">Duplicate</:item>
  <:separator />
  <:label>Danger zone</:label>
  <:item click="delete" variant="danger" icon="trash" shortcut="⌘⌫">Delete</:item>
</.dropdown_menu>
```

### Dropdown Attributes

| Attr   | Type      | Default    | Description              |
| ------ | --------- | ---------- | ------------------------ |
| `id`   | `:string` | required   | ID for popover binding   |
| `side` | `:string` | `"bottom"` | Forwarded to popover     |
| `align`| `:string` | `"end"`    | Forwarded to popover     |
| `class`| `:string` | `nil`      | On menu container        |
| `rest` | `:global` | --         |                          |

### Dropdown Slots

| Slot             | Attrs                                                                        | Description                     |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------- |
| `:trigger`       | --                                                                           | Trigger element (optional for sub-menus) |
| `:item`          | `click`, `href`, `navigate`, `patch`, `icon`, `shortcut`, `variant`, `disabled` | Menu item -- link or button  |
| `:item_trigger`  | `target`, `icon`, `shortcut`, `disabled`                                     | Item that opens a sub-menu      |
| `:separator`     | --                                                                           | Visual divider                  |
| `:label`         | --                                                                           | Non-interactive group label     |
| `:checkbox_item` | `name`, `value`, `checked`, `icon`                                           | Checkbox item                   |
| `:radio_group`   | `name`, `value`, `options`                                                   | Radio group inside menu         |

### Dropdown Item Rendering Logic

- Has `click` -> `<button type="button" popovertarget={id} popovertargetaction="hide" phx-click={click}>`
- Has `navigate`/`patch`/`href` -> `<.link>` (popover closes when page navigates; `<a>` elements cannot carry `popovertarget`, so there is a brief visual flash before navigation completes -- acceptable)
- Neither -> `<button type="button" popovertarget={id} popovertargetaction="hide">`

### Dropdown Emitted HTML

```html
<div data-exo="popover">
  <button type="button" popovertarget="actions" data-exo="popover-trigger"
          aria-haspopup="menu" aria-expanded="false"
          style="anchor-name: --popover-actions">
    Actions
  </button>
  <div id="actions" popover="auto" data-exo="popover-content"
       data-side="bottom" data-align="end"
       style="position-anchor: --popover-actions">
    <div data-exo="dropdown-menu" role="menu" aria-label="Actions">
      <button data-exo="dropdown-item" role="menuitem"
              type="button" popovertarget="actions" popovertargetaction="hide"
              phx-click="edit">
        <svg data-exo="dropdown-item-icon"><!-- pencil --></svg>
        <span data-exo="dropdown-item-label">Edit</span>
        <kbd data-exo="dropdown-item-shortcut">⌘E</kbd>
      </button>
      <div data-exo="dropdown-separator" role="separator"></div>
      <div role="group" aria-labelledby="actions-label-0">
        <span data-exo="dropdown-label" id="actions-label-0">Danger zone</span>
        <button data-exo="dropdown-item" data-variant="danger" role="menuitem"
                type="button" popovertarget="actions" popovertargetaction="hide"
                phx-click="delete">
          <svg data-exo="dropdown-item-icon"><!-- trash --></svg>
          <span data-exo="dropdown-item-label">Delete</span>
          <kbd data-exo="dropdown-item-shortcut">⌘⌫</kbd>
        </button>
      </div>
    </div>
  </div>
</div>
```

Items following a `:label` slot are wrapped in `role="group"` with `aria-labelledby` pointing to the label. The label gets an auto-generated ID based on the menu ID and label index.

### Dropdown Sub-menus

Composition pattern -- `:item_trigger` slot opens a separate `dropdown_menu`:

```elixir
<.dropdown_menu id="actions">
  <:trigger><.button>Actions</.button></:trigger>
  <:item click="edit" icon="pencil">Edit</:item>
  <:item_trigger target="share-sub" icon="share">Share via...</:item_trigger>
</.dropdown_menu>

<.dropdown_menu id="share-sub" side="right" align="start">
  <:item click="copy-link" icon="link">Copy Link</:item>
  <:item click="email" icon="mail">Email</:item>
</.dropdown_menu>
```

`item_trigger` renders a button with `popovertarget="share-sub"` inside the parent menu. The second `dropdown_menu` omits `:trigger` -- only the popover content div is rendered. Browser natively stacks nested popovers (closing parent closes children).

### Dropdown JS Hook: `ExoDropdownMenu`

~15 lines. Arrow up/down navigation between `role="menuitem"` elements. Enter to activate. Home/End to jump to first/last.

### Dropdown Deleted Code

- `JS.toggle` call
- `phx-click-away` binding
- `style="display: none;"` on menu
- `position: absolute` + `z-index: 40` from CSS
- `data-position` attribute (replaced by `data-side` + `data-align`)

---

## 3. Select

Custom select replacing native `<select>`. Full rendering control.

### Select API

```elixir
<%-- Basic --%>
<.select id="status" name="status" value="active" prompt="Choose status">
  <:option value="active">Active</:option>
  <:option value="inactive">Inactive</:option>
  <:option value="archived" disabled>Archived</:option>
</.select>

<%-- With groups --%>
<.select id="role" field={@form[:role]} label="Role">
  <:group label="Admin">
    <:option value="super_admin">Super Admin</:option>
    <:option value="admin">Admin</:option>
  </:group>
  <:group label="User">
    <:option value="editor">Editor</:option>
    <:option value="viewer">Viewer</:option>
  </:group>
</.select>

<%-- With icons, multiple --%>
<.select id="tags" name="tags[]" value={@selected} label="Tags" multiple>
  <:option value="elixir" icon="code">Elixir</:option>
  <:option value="phoenix" icon="flame">Phoenix</:option>
</.select>
```

### Select Attributes

| Attr       | Type        | Default    | Description                          |
| ---------- | ----------- | ---------- | ------------------------------------ |
| `id`       | `:string`   | required   |                                      |
| `name`     | `:string`   | --         | Auto from field                      |
| `value`    | `:any`      | `nil`      | Selected value or list               |
| `field`    | `FormField` | `nil`      | Form field struct (extracts name/value/errors) |
| `label`    | `:string`   | `nil`      |                                      |
| `prompt`   | `:string`   | `nil`      | Placeholder when nothing selected    |
| `multiple` | `:boolean`  | `false`    | Multi-select mode                    |
| `errors`   | `:list`     | `[]`       |                                      |
| `disabled` | `:boolean`  | `false`    |                                      |
| `side`     | `:string`   | `"bottom"` |                                      |
| `align`    | `:string`   | `"start"`  |                                      |
| `class`    | `:string`   | `nil`      |                                      |
| `rest`     | `:global`   | --         |                                      |

### Select Slots

| Slot      | Attrs                                | Description  |
| --------- | ------------------------------------ | ------------ |
| `:option` | `value` (required), `icon`, `disabled` | One option |
| `:group`  | `label` (required)                   | Option group |

### Select Emitted HTML

```html
<div data-exo="field">
  <label data-exo="label" id="role-label">Role</label>
  <div data-exo="popover" phx-hook="ExoSelect" id="role-select">
    <button type="button" popovertarget="role" data-exo="popover-trigger"
            data-exo-select="trigger" data-invalid=""
            aria-haspopup="listbox" aria-expanded="false"
            aria-labelledby="role-label"
            style="anchor-name: --select-role">
      <span data-exo="select-value">Editor</span>
      <svg data-exo="select-icon"><!-- chevron-down --></svg>
    </button>
    <div id="role" popover="auto" data-exo="popover-content"
         data-side="bottom" data-align="start"
         style="position-anchor: --select-role">
      <div data-exo="select-menu" role="listbox"
           aria-labelledby="role-label">
        <div data-exo="select-group" role="group" aria-label="Admin">
          <span data-exo="select-group-label">Admin</span>
          <div data-exo="select-option" role="option" data-value="super_admin"
               aria-selected="false" tabindex="-1">
            Super Admin
          </div>
          <div data-exo="select-option" role="option" data-value="admin"
               aria-selected="true" data-selected="" tabindex="-1">
            <svg><!-- check --></svg>
            Admin
          </div>
        </div>
      </div>
    </div>
  </div>
  <input type="hidden" name="role" value="admin" />
  <div data-exo="field-error">can't be blank</div>
</div>
```

The `data-exo-select="trigger"` attribute is additional to `data-exo="popover-trigger"` -- it provides a hook for select-specific CSS (width matching, chevron icon) that differs from generic popover trigger styling.

### Select How Selection Works

Hook updates hidden input value and dispatches `input` event. Parent form's `phx-change` fires automatically -- no custom `handle_event` needed:

```elixir
<.form for={@form} phx-change="validate" phx-submit="save">
  <.select field={@form[:role]} prompt="Choose role">
    <:option value="admin">Admin</:option>
  </.select>
</.form>
```

### Select Multiple Mode

- Selection does not close popover (no `hidePopover()`)
- Selected options show checkmarks
- Trigger shows pills/tags with X for removal
- Hidden inputs emit list: `<input type="hidden" name="tags[]" value="elixir" />`

### Select Popover Width Matching

```css
[data-exo="select-menu"] {
  min-width: anchor-size(width);
}
```

### Select JS Hook: `ExoSelect`

~30 lines:

- Arrow up/down navigation between options
- Type-ahead (character search -- jump to first option starting with typed char)
- Enter to select
- Update hidden input + dispatch `input` event (form integration)
- Call `.hidePopover()` after selection (unless multiple)
- Toggle `aria-expanded`
- `mounted()` and `updated()` callbacks -- `updated()` re-reads hidden input value after LiveView patches the DOM, keeping displayed selection in sync with server state

### Select Deleted Code

- Native `<select>` element
- `Phoenix.HTML.Form.options_for_select/2` usage
- `appearance: none` CSS hack with SVG background-image arrow
- `select.css` rewritten entirely

---

## 4. Combobox

Select + text search. Two modes: client-side filter and server-side filter. Two trigger styles: button and input.

### Combobox API

```elixir
<%-- Client-side filter, button trigger (enhanced select) --%>
<.combobox id="country" name="country" value="rs" label="Country"
           prompt="Search countries..." filter="client">
  <:option value="rs">Serbia</:option>
  <:option value="hr">Croatia</:option>
  <:option value="ba">Bosnia</:option>
</.combobox>

<%-- Server-side filter --%>
<.combobox id="user" field={@form[:user_id]} prompt="Search users..."
           filter="server" on_filter="search-users" loading={@searching}>
  <:option :for={user <- @user_results} value={user.id} icon="user">
    {user.name}
  </:option>
  <:empty>No users found</:empty>
</.combobox>

<%-- Input trigger (autocomplete style) --%>
<.combobox id="city" name="city" prompt="Type a city..." trigger="input"
           filter="server" on_filter="search-cities">
  <:option :for={city <- @city_results} value={city.id}>{city.name}</:option>
</.combobox>

<%-- Multiple + creatable --%>
<.combobox id="tags" name="tags[]" value={@tags} label="Tags"
           prompt="Add tags..." filter="client" multiple creatable
           on_create="create-tag">
  <:option :for={tag <- @tags} value={tag}>{tag}</:option>
</.combobox>
```

### Combobox Attributes

| Attr        | Type        | Default             | Description                              |
| ----------- | ----------- | ------------------- | ---------------------------------------- |
| `id`        | `:string`   | required            |                                          |
| `name`      | `:string`   | --                  | Auto from field                          |
| `value`     | `:any`      | `nil`               | Selected value or list                   |
| `field`     | `FormField` | `nil`               | Form field struct                        |
| `label`     | `:string`   | `nil`               |                                          |
| `prompt`    | `:string`   | `nil`               | Placeholder for search input             |
| `trigger`   | `:string`   | `"button"`          | `"button"` (enhanced select) \| `"input"` (autocomplete) |
| `filter`    | `:string`   | `"server"`          | `"client"` \| `"server"`                |
| `on_filter` | `:string`   | `"combobox-filter"` | Server filter event name                 |
| `debounce`  | `:integer`  | `300`               | Debounce ms for server filter            |
| `multiple`  | `:boolean`  | `false`             |                                          |
| `creatable` | `:boolean`  | `false`             | Allow new values                         |
| `on_create` | `:string`   | `"combobox-create"` | Create event name                        |
| `clearable` | `:boolean`  | `true`              | Show X to clear selection                |
| `loading`   | `:boolean`  | `false`             | Loading state for server filter          |
| `errors`    | `:list`     | `[]`                |                                          |
| `disabled`  | `:boolean`  | `false`             |                                          |
| `side`      | `:string`   | `"bottom"`          |                                          |
| `align`     | `:string`   | `"start"`           |                                          |
| `class`     | `:string`   | `nil`               |                                          |
| `rest`      | `:global`   | --                  |                                          |

### Combobox Slots

| Slot      | Attrs                                    | Description                    |
| --------- | ---------------------------------------- | ------------------------------ |
| `:option` | `value` (required), `icon`, `disabled`   | One option                     |
| `:group`  | `label`                                  | Option group                   |
| `:empty`  | --                                       | Shown when no results match    |

### Combobox Emitted HTML -- Button Trigger

```html
<div data-exo="field">
  <label data-exo="label">Country</label>
  <div data-exo="popover" phx-hook="ExoCombobox" id="country-combobox"
       data-filter="client">
    <button type="button" popovertarget="country" data-exo="popover-trigger"
            data-exo-combobox="trigger"
            aria-haspopup="listbox" aria-expanded="false"
            style="anchor-name: --combobox-country">
      <span data-exo="combobox-value">Serbia</span>
      <svg data-exo="combobox-icon"><!-- chevrons-up-down --></svg>
    </button>
    <div id="country" popover="auto" data-exo="popover-content"
         data-side="bottom" data-align="start"
         style="position-anchor: --combobox-country">
      <input type="text" data-exo="combobox-search" role="combobox"
             placeholder="Search countries..."
             aria-controls="country-listbox"
             aria-expanded="true" autocomplete="off" />
      <div id="country-listbox" data-exo="combobox-list" role="listbox">
        <div data-exo="combobox-option" role="option" data-value="rs"
             aria-selected="true" data-selected="" tabindex="-1">
          <svg><!-- check --></svg>
          Serbia
        </div>
        <div data-exo="combobox-option" role="option" data-value="hr"
             aria-selected="false" tabindex="-1">
          Croatia
        </div>
      </div>
      <div data-exo="combobox-empty" hidden>No results found</div>
    </div>
  </div>
  <input type="hidden" name="country" value="rs" />
</div>
```

`role="combobox"` is on the search `<input>` element (not on a wrapper div) per WAI-ARIA 1.2 spec. The input that receives text input must carry the combobox role.

### Combobox Emitted HTML -- Input Trigger (Autocomplete)

**Important:** `popovertarget` is only valid on `<button>` and `<input type="button|submit|reset|image">`. It does NOT work on `<input type="text">`. The input-trigger variant uses `popover="manual"` and the hook calls `.showPopover()` on focus/input and `.hidePopover()` on blur/escape. This is the one place where JS handles open/close.

```html
<div data-exo="field">
  <label data-exo="label">City</label>
  <div data-exo="popover" phx-hook="ExoCombobox" id="city-combobox"
       data-filter="server" data-trigger="input" data-debounce="300">
    <input type="text" data-exo="popover-trigger"
           data-exo-combobox="input-trigger" role="combobox"
           placeholder="Type a city..." autocomplete="off"
           aria-haspopup="listbox" aria-expanded="false"
           aria-controls="city-listbox"
           style="anchor-name: --combobox-city" />
    <div id="city" popover="manual" data-exo="popover-content"
         data-side="bottom" data-align="start"
         style="position-anchor: --combobox-city">
      <div id="city-listbox" data-exo="combobox-list" role="listbox">
        <!-- options rendered by server -->
      </div>
      <div data-exo="combobox-empty" hidden>No results found</div>
    </div>
  </div>
  <input type="hidden" name="city" value="" />
</div>
```

No search input inside popover -- the trigger input IS the search. Uses `popover="manual"` instead of `auto` because the hook manages open/close. Light dismiss is handled by the hook's blur/escape listeners.

### Combobox Client-side Filter

Hook filters options by `el.textContent.trim()`. No `data-label` attribute needed -- the text content of the option element is used for matching. SVG icons have empty textContent so they don't interfere. Options that don't match get `hidden`. When none match, shows `:empty` slot (or create option if `creatable`).

### Combobox Server-side Filter

Hook debounces input (configurable via `debounce` attr, default 300ms) and pushes event to server. Server assigns new options, LiveView re-renders list.

```elixir
def handle_event("search-users", %{"query" => q}, socket) do
  send(self(), {:search_users, q})
  {:noreply, assign(socket, searching: true)}
end

def handle_info({:search_users, q}, socket) do
  users = Accounts.search_users(q)
  {:noreply, assign(socket, user_results: users, searching: false)}
end
```

### Combobox Creatable Mode

When `creatable` and no options match, shows create option:

```html
<button type="button" data-exo="combobox-create-option"
        phx-click="create-tag" phx-value-value="new-tag">
  Create "new-tag"
</button>
```

### Combobox Multiple Mode

- Selection does not close popover
- Trigger shows pills/tags with X for removal
- Multiple hidden inputs: `<input type="hidden" name="tags[]" value="elixir" />`

### Combobox Loading State

When `loading` is true, shows spinner inside popover instead of list/empty.

### Combobox Clear Button

When `clearable` and has selection, shows X button on trigger.

### Combobox JS Hook: `ExoCombobox`

~45 lines. Extends select hook behavior:

- Client-side filter by `textContent`
- Focus search input on popover open
- Clear search on popover close
- Debounced server push for server filter mode (debounce value read from `data-debounce`)
- For input-trigger variant: `.showPopover()` on focus/input, `.hidePopover()` on blur/escape
- All select behavior (arrow keys, enter, hidden input update, `input` event dispatch, `aria-expanded`)
- `mounted()` and `updated()` callbacks for LiveView DOM patch sync

---

## 5. Tooltip

Rebuilt with CSS Anchor Positioning. Hover/focus based -- does NOT use Popover API (tooltips need hover trigger, not click).

### Tooltip API

```elixir
<%-- Basic --%>
<.tooltip id="copy-tip" text="Copy to clipboard">
  <.button variant="ghost" icon="copy">Copy</.button>
</.tooltip>

<%-- Position --%>
<.tooltip id="settings-tip" text="Settings" side="right">
  <.icon name="settings" />
</.tooltip>

<%-- Rich content --%>
<.tooltip id="pro-tip" side="top">
  <:content>
    <strong>Pro tip:</strong> Use keyboard shortcuts for faster navigation.
  </:content>
  <.icon name="info" />
</.tooltip>
```

### Tooltip Attributes

| Attr    | Type       | Default    | Description                     |
| ------- | ---------- | ---------- | ------------------------------- |
| `id`    | `:string`  | required   | Unique ID for anchor name       |
| `text`  | `:string`  | `nil`      | Plain text (or use `:content`)  |
| `side`  | `:string`  | `"top"`    | `top \| bottom \| left \| right` |
| `align` | `:string`  | `"center"` | `start \| center \| end`        |
| `delay` | `:integer` | `500`      | Show delay in ms                |
| `arrow` | `:boolean` | `true`     | Show arrow pointing to trigger  |
| `class` | `:string`  | `nil`      |                                 |
| `rest`  | `:global`  | --         |                                 |

### Tooltip Slots

| Slot           | Description                                |
| -------------- | ------------------------------------------ |
| `:inner_block` | Element that triggers tooltip              |
| `:content`     | Rich content (alternative to `text` attr)  |

### Tooltip Emitted HTML

```html
<span data-exo="tooltip" phx-hook="ExoTooltip" id="copy-tip">
  <span data-exo="tooltip-anchor" aria-describedby="copy-tip-content"
        style="anchor-name: --tooltip-copy-tip">
    <button data-exo="btn">Copy</button>
  </span>
  <span id="copy-tip-content" data-exo="tooltip-content" data-side="top"
        data-align="center" data-arrow="" role="tooltip"
        style="position-anchor: --tooltip-copy-tip;">
    Copy to clipboard
  </span>
</span>
```

Inline `anchor-name` / `position-anchor` styles use the `id` to generate unique names per tooltip instance.

The tooltip-anchor wrapper does NOT add `tabindex="0"`. If the inner content is already focusable (button, link, input), the wrapper should not create a double tab-stop. If the inner content is not focusable (e.g., plain text or an icon span), the component adds `tabindex="0"` to the anchor wrapper. This is determined by checking if the `:inner_block` contains a naturally focusable element -- in practice, we add `tabindex="0"` by default and let naturally focusable children handle focus (the wrapper's tabindex is harmless when a focusable child exists, as keyboard users will focus the child directly).

### Tooltip CSS

```css
[data-exo="tooltip-content"] {
  position: fixed;
  /* position-anchor set via inline style per instance */
  /* position-area set per data-side via attribute selectors (shared mapping) */
  position-try-fallbacks: flip-block;
  margin: 0;
  inset: auto;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
  /* transition-delay: 0 by default (fast hide) */
}

[data-exo="tooltip"]:has(:hover, :focus-visible) > [data-exo="tooltip-content"] {
  opacity: 1;
  transition-delay: var(--exo-tooltip-delay, 500ms);
  /* show delay only applies when transitioning TO visible */
}

/* Escape dismissed */
[data-exo="tooltip"][data-dismissed] > [data-exo="tooltip-content"] {
  opacity: 0 !important;
}

/* Arrow */
[data-exo="tooltip-content"][data-arrow]::after {
  content: "";
  position: absolute;
  border: 4px solid transparent;
  border-top-color: var(--exo-tooltip-bg);
  /* rotated per data-side */
}

/* Fallback without anchor positioning */
@supports not (position-area: top) {
  [data-exo="tooltip"] {
    position: relative;
  }
  [data-exo="tooltip-content"] {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: var(--exo-space-1);
  }
}
```

The `transition-delay` is set only on the `:has(:hover, :focus-visible)` state. When hover ends, the default state (no delay) kicks in, so hide transition is immediate (0.15s fade). Show transition is delayed. The delay value is set via CSS custom property `--exo-tooltip-delay`, injected as inline style from the `delay` attr.

### Tooltip Touch and Keyboard

Wrapper `<span data-exo="tooltip-anchor">` ensures hover target. `:focus-visible` triggers tooltip on keyboard focus. Disabled elements work because the wrapper receives hover, not the disabled child.

### Tooltip JS Hook: `ExoTooltip`

~8 lines. Escape key dismissal per WCAG 1.4.13:

```js
el.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    el.dataset.dismissed = ""
    el.addEventListener("mouseleave", () => {
      delete el.dataset.dismissed
    }, { once: true })
  }
})
```

---

## JS Hooks Summary

| Hook              | Lines | Purpose                                                                     |
| ----------------- | ----- | --------------------------------------------------------------------------- |
| `ExoPopover`      | ~5    | `aria-expanded` toggle via `toggle` event                                   |
| `ExoDropdownMenu` | ~15   | Arrow key navigation, Enter/Home/End                                        |
| `ExoSelect`       | ~30   | Arrow keys, type-ahead, hidden input update, `input` event dispatch, `hidePopover()`, `aria-expanded` |
| `ExoCombobox`     | ~45   | Extends select: client filter, focus/clear search, debounced server push, input-trigger open/close |
| `ExoTooltip`      | ~8    | Escape dismissal + `data-dismissed` attr                                    |

Total: ~103 lines of JS. No positioning logic, no dismiss logic (except combobox input-trigger) -- handled by browser.

All hooks implement `mounted()` and `updated()` callbacks to stay in sync after LiveView DOM patches.

## CSS Files

| File           | Content                                                                        |
| -------------- | ------------------------------------------------------------------------------ |
| `popover.css`  | Base positioning, animations, anchor fallback, `position-area` mapping for all `data-side`/`data-align` combinations |
| `dropdown.css` | Rewritten -- menu styling only, no positioning/z-index                         |
| `select.css`   | Rewritten -- trigger styling, option list, check marks, groups, width matching |
| `combobox.css` | Search input, option list, pills/tags for multiple, loading spinner, create option |
| `tooltip.css`  | Rewritten -- anchor positioning, opacity transitions, arrow, `:has(:hover, :focus-visible)` |

## Migration

### Breaking Changes

- `dropdown/1` renamed to `dropdown_menu/1` -- slot API completely different
- `input(%{type: "select"})` still works but deprecated -- use `select/1` instead
- `tooltip/1` -- `position` attr renamed to `side`, `text` attr unchanged
- `data-position` attribute replaced by `data-side` + `data-align` (affects custom CSS targeting old attributes)
- New `popover/1` and `combobox/1` components added

### Deleted Code

- `JS.toggle` / `JS.show` / `JS.hide` calls in dropdown
- `phx-click-away` bindings
- `Phoenix.HTML.Form.options_for_select/2` usage in select
- Native `<select>` element rendering
- `appearance: none` + SVG background-image CSS hack

### New Dependencies

None. Pure HTML + CSS + minimal LiveView hooks.
