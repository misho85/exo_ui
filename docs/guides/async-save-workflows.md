# Async Save Workflows

Use this pattern for form screens where the server validates a draft, queues a
save, disables duplicate submits, and reports a confirmed success state.

## Structure

```heex
<.form
  for={%{}}
  as={:record}
  phx-change="validate-record"
  phx-submit="save-record"
>
  <.input name="record[title]" label="Title" value={@draft.title} errors={@errors[:title] || []} />
  <.input name="record[owner]" label="Owner" value={@draft.owner} errors={@errors[:owner] || []} />
  <.input
    name="record[notes]"
    type="textarea"
    rows="5"
    label="Notes"
    value={@draft.notes}
    errors={@errors[:notes] || []}
  />

  <.button type="submit" disabled={@save_state == "saving"}>
    <%= if @save_state == "saving", do: "Saving...", else: "Save changes" %>
  </.button>
</.form>

<p
  id="save-state"
  role="status"
  aria-live="polite"
  data-save-state={@save_state}
>
  {save_status(@save_state, @draft, @saved)}
</p>
```

## Server Flow

```elixir
def handle_event("save-record", %{"record" => params}, socket) do
  draft = merge_params(socket.assigns.draft, params)
  errors = validate_draft(draft)

  if errors == %{} do
    request_ref = System.unique_integer([:positive])

    Process.send_after(
      self(),
      {__MODULE__, :save_complete, socket.assigns.id, request_ref, draft},
      650
    )

    {:noreply, assign(socket, draft: draft, errors: %{}, save_state: "saving", request_ref: request_ref)}
  else
    {:noreply, assign(socket, draft: draft, errors: errors, save_state: "blocked")}
  end
end

def handle_info({SaveDemo, :save_complete, id, request_ref, draft}, socket) do
  send_update(SaveDemo, id: id, async_result: {request_ref, draft})
  {:noreply, socket}
end
```

## Rules

- Keep a separate `draft` and `saved` record so users can see what is dirty.
- Move through explicit states such as `clean`, `dirty`, `invalid`, `saving`,
  `saved`, and `blocked`.
- Disable submit and reset controls while `save_state == "saving"`.
- Use `role="status"` with `aria-live="polite"` for save progress and success
  messages.
- Track an async request reference and ignore stale completions.
- Browser coverage should verify dirty state, disabled saving state, `aria-busy`,
  final saved state, and the updated persisted value.
