# Button Recipes

Use this pattern when buttons need production state instead of only visual
variants: submit safety, loading, disabled links, icon composition, and
destructive confirmation.

## Structure

```heex
<.button
  type="button"
  variant={@selected_variant}
  disabled={@saving}
  aria-busy={@saving}
  phx-click="start-save"
>
  <.spinner :if={@saving} size="sm" label="Saving draft" />
  <.icon :if={!@saving} name="save" />
  <%= if @saving, do: "Saving draft", else: "Save draft" %>
</.button>

<.button type="button" variant="outline" disabled={!@saving} phx-click="finish-save">
  Finish save
</.button>

<.button type="button" variant="danger" phx-click={show_modal("delete-confirm")}>
  <.icon name="trash-2" />
  Delete draft
</.button>

<.button href="/billing" disabled variant="outline">
  Billing unavailable
</.button>
```

## Event Shape

```elixir
def handle_event("start-save", _params, socket) do
  {:noreply, assign(socket, saving: true)}
end

def handle_event("finish-save", _params, socket) do
  {:noreply,
   assign(socket,
     saving: false,
     saved_count: socket.assigns.saved_count + 1
   )}
end
```

## Rules

- Pass `type="button"` for non-submit actions. ExoUI defaults to `type="button"`,
  but explicit type keeps call sites clear.
- Use `variant="danger"` only for destructive actions, ideally behind a
  confirmation modal.
- Disable the primary action while a save is in flight and expose `aria-busy`.
- Put `<.spinner>` and `<.icon>` inside the button instead of drawing custom
  markup.
- Disabled links should render as inert link-like elements with
  `aria-disabled="true"`, no `href`, and `tabindex="-1"`.
- Browser coverage should verify the active variant, default button type,
  loading disabled state, spinner visibility, disabled link safety, destructive
  confirmation, and reset behavior.
