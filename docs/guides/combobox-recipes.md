# Combobox Recipes

Use this pattern when users need search plus a submitted value: client
filtering, server filtering, grouped options, clearable values, input-trigger
mode, creatable rows, disabled choices, and submit safety.

## Structure

```heex
<ExoUI.Components.Form.form
  for={%{}}
  as={:record}
  phx-change="change-record"
  phx-submit="save-record"
>
  <.combobox
    id="record-assignee"
    name="record[assignee]"
    value={@draft.assignee}
    label="Assignee"
    prompt="Find a teammate..."
    filter="client"
    description="Required for routing ownership."
    errors={Map.get(@errors, :assignee, [])}
  >
    <:option value="ana" group="Design">Ana Markovic</:option>
    <:option value="nikola" group="Engineering">Nikola Petrovic</:option>
    <:option value="stefan" group="Engineering" disabled>Stefan unavailable</:option>
    <:empty>No teammates found.</:empty>
  </.combobox>

  <.combobox
    id="record-remote-user"
    name="record[remote_user]"
    value={@draft.remote_user}
    label="Remote user"
    prompt="Search remote directory..."
    filter="server"
    on_filter="filter-users"
    on_filter_target={@myself}
    debounce={150}
    status={@remote_status}
    errors={Map.get(@errors, :remote_user, [])}
  >
    <:option :for={person <- @remote_options} value={person.id}>
      <span>{person.name}</span>
      <span style="margin-left:auto">{person.team}</span>
    </:option>
    <:empty>No remote users found.</:empty>
  </.combobox>

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

def handle_event("filter-users", %{"query" => query}, socket) do
  {:noreply,
   assign(socket,
     remote_query: query,
     remote_options: search_users(query),
     remote_status: status_for(query)
   )}
end
```

## Rules

- Use `combobox/1` when users need search and a hidden submitted value.
- Use `filter="client"` for short static lists; use `filter="server"` with
  `on_filter` for large or permission-scoped datasets.
- Keep selected values in assigns and re-render them through `value`; do not let
  the browser become the only source of truth.
- Give every combobox a stable `id`; it drives trigger, popover, listbox,
  status, description, and error wiring.
- Include an `:empty` slot for both client and server filtering.
- Mark unavailable choices with `disabled`; browser coverage should verify they
  do not commit.
- Use the clear button for optional values, but validate required hidden values
  on the server after clear.
- Use `trigger="input"` when typing is the primary interaction.
- Browser coverage should verify filtering, `aria-activedescendant`, status
  text, hidden input values, clear behavior, disabled options, disabled
  comboboxes, server-filtered results, and submit/reset state.
