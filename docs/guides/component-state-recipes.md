# Component State Recipes

Use these recipes when adding stories or app screens. They keep ExoUI closer to
the practical coverage expected from libraries such as shadcn/ui and daisyUI.

## Disabled

Render disabled state on the interactive control, not just on a wrapper.

```heex
<.button disabled>Save</.button>
<.input name="email" label="Email" disabled />
<.date_picker id="blocked-date" disabled current_month={Date.utc_today()} />
```

## Validation Error

Pass errors into the field component so `aria-invalid`, `aria-describedby`, and
`role="alert"` are generated consistently.

```heex
<.input
  name="account[owner]"
  label="Owner"
  value={@draft.owner}
  description="Required before the record can be saved."
  errors={@errors[:owner] || []}
/>
```

## Loading And Empty

Use explicit status text for async controls and real empty slots for lists.

```heex
<.combobox
  id="assignee"
  name="assignee"
  filter="server"
  loading={@loading}
  status={@status}
>
  <:option :for={user <- @users} value={user.id}>{user.name}</:option>
  <:empty>No users found.</:empty>
</.combobox>

<.table id="records" rows={@records}>
  <:col :let={record} label="Name">{record.name}</:col>
  <:empty>No records match the current filters.</:empty>
</.table>
```

## Long Content

Keep long forms inside `drawer` or `sheet` bodies. Let the overlay body scroll,
not the page behind it.

```heex
<.drawer id="review-drawer" side="right">
  <:title>Long review</:title>
  <.input name="review[notes]" type="textarea" rows="8" label="Notes" />
  <.input name="review[evidence]" type="textarea" rows="8" label="Evidence" />
</.drawer>
```

## Keyboard And Focus

- Use stable `id` values for every hook-backed component.
- Use public show/hide helpers for overlays so focus restore works.
- For nested LiveComponents, pass component event targets explicitly when the
  component exposes a target attribute, such as `date_picker target={@myself}`.
