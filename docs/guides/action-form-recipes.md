# Action And Form Recipes

Use these recipes for the primitives that appear on almost every screen:
buttons, inputs, select, combobox, and date picker.

## Buttons

```heex
<.button type="button">Save</.button>
<.button type="button" variant="outline">Cancel</.button>
<.button type="button" variant="danger">Delete</.button>
<.button href={~p"/billing"} disabled>Billing disabled</.button>
```

Rules:

- Pass `type="button"` for non-submit actions.
- Disabled links render as `role="link"` with `aria-disabled="true"` and no
  navigation target.
- Use `variant="danger"` only for destructive actions and pair it with confirm
  flows when the action is irreversible.

## Inputs

```heex
<.input
  field={@form[:owner]}
  label="Owner"
  description="Required before saving."
  errors={@errors[:owner] || []}
/>
```

Rules:

- Prefer `field={@form[:field]}` when you have a Phoenix form.
- Pass `errors` into the component so `aria-invalid`, `aria-describedby`, and
  `role="alert"` stay consistent.
- Keep disabled state on the real input, not only on a wrapper.

## Select

```heex
<.select field={@form[:priority]} label="Priority" prompt="Choose priority">
  <:option value="low" icon="arrow-down">Low</:option>
  <:option value="medium" icon="minus">Medium</:option>
  <:option value="high" icon="arrow-up">High</:option>
  <:option value="blocked" disabled>Blocked by policy</:option>
</.select>
```

Rules:

- Use a stable `id` when the select is not field-backed.
- Disabled options stay visible but should never commit a hidden value.
- Add `description` and `errors` at the select component level, not inside an
  option.

## Combobox

Use client filtering for small static lists and server filtering for remote or
permission-scoped lists. See [Combobox Usage](combobox.md) for the full
LiveView and LiveComponent recipe.

```heex
<.combobox id="assignee" name="assignee_id" label="Assignee" filter="client">
  <:option :for={user <- @users} value={user.id}>{user.name}</:option>
  <:empty>No users found.</:empty>
</.combobox>
```

## Date Picker

The parent owns month and selected-date state.

```heex
<.date_picker
  id="renewal-date"
  name="record[renewal_date]"
  selected={@draft.renewal_date}
  current_month={@calendar_month}
  target={@myself}
  on_select="select-renewal-date"
  on_prev_month="previous-renewal-month"
  on_next_month="next-renewal-month"
/>
```

Rules:

- Pass `target={@myself}` inside LiveComponents.
- Keep `current_month` and `selected` in parent assigns.
- Browser coverage should click prev/next and verify both the visible month and
  hidden input value.
