# Select Recipes

Use this pattern when custom selects need server-owned state, prompt
validation, grouped options, icons, disabled options, and submit safety.

## Structure

```heex
<ExoUI.Components.Form.form
  for={%{}}
  as={:record}
  phx-change="change-record"
  phx-submit="save-record"
>
  <.select
    id="record-status"
    name="record[status]"
    value={@draft.status}
    label="Workflow status"
    prompt="Choose status"
    description="Required before saving."
    errors={Map.get(@errors, :status, [])}
  >
    <:option value="draft" icon="file" group="Visible">Draft</:option>
    <:option value="active" icon="check" group="Visible">Active</:option>
    <:option value="blocked" icon="octagon-alert" group="Needs attention">
      Blocked
    </:option>
    <:option value="archived" icon="archive" group="Hidden">Archived</:option>
    <:option value="deleted" icon="trash-2" group="Hidden" disabled>
      Deleted unavailable
    </:option>
  </.select>

  <.select
    id="record-owner"
    name="record[owner]"
    value={@draft.owner}
    label="Owner queue"
    prompt="Choose owner"
    errors={Map.get(@errors, :owner, [])}
  >
    <:option value="ops" group="Internal">Operations queue</:option>
    <:option value="support" group="Customer-facing">Support queue</:option>
  </.select>

  <.button type="submit" disabled={@errors != %{}}>
    Save record
  </.button>
</ExoUI.Components.Form.form>
```

## Event Shape

```elixir
def handle_event("change-record", %{"record" => params}, socket) do
  draft = merge_record(socket.assigns.draft, params)
  errors = validate_record(draft)

  {:noreply, assign(socket, draft: draft, errors: errors)}
end

def handle_event("save-record", %{"record" => params}, socket) do
  draft = merge_record(socket.assigns.draft, params)
  errors = validate_record(draft)

  if errors == %{} do
    {:noreply, assign(socket, draft: draft, saved: draft, errors: %{})}
  else
    {:noreply, assign(socket, draft: draft, errors: errors)}
  end
end
```

## Rules

- Give every select a stable `id`; it drives the trigger, popover, listbox,
  hidden input, description, and error wiring.
- Keep the parent LiveView as the source of truth by passing `value` from
  assigns and handling `phx-change` from the surrounding form.
- Use `prompt` for required-but-unselected state and validate the hidden value
  on the server.
- Use `group` for long option lists and `icon` only where it helps scanning;
  the submitted value should stay a plain string.
- Mark unavailable choices with `disabled` on the option. Browser coverage
  should verify disabled options do not commit or close the menu.
- Use `disabled` on the select for read-only workflow state that should not be
  interactive.
- Browser coverage should verify trigger ARIA state, `aria-describedby`,
  grouped/disabled options, hidden input values, server-owned data attributes,
  submit disabling, and reset behavior.
