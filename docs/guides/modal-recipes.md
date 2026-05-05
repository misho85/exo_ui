# Modal Recipes

Use this pattern when a dialog needs accessible naming, focus restoration,
server-owned form state, guarded destructive confirmation, and deterministic
browser coverage.

## Structure

```heex
<.button type="button" phx-click={show_modal("workspace-modal")}>
  Open editor modal
</.button>

<.modal
  id="workspace-modal"
  on_cancel={JS.push("modal-cancelled")}
>
  <:title>Review workspace access</:title>

  <.form
    for={%{}}
    as={:workspace}
    phx-change="change-workspace-draft"
    phx-target={@myself}
  >
    <.input name="workspace[name]" label="Workspace name" value={@name} />
    <.input name="workspace[owner]" label="Workspace owner" value={@owner} />
  </.form>

  <:actions>
    <.button variant="ghost" phx-click={hide_modal("workspace-modal")}>Cancel</.button>
    <.button phx-click={JS.push("save-workspace") |> hide_modal("workspace-modal")}>
      Save changes
    </.button>
  </:actions>
</.modal>
```

## Labelled Without Title

When a modal has no visible title, pass `label` so the dialog still has an
accessible name.

```heex
<.modal id="invite-modal" label="Invite teammate dialog">
  <.input name="invite[email]" label="Invite email" type="email" />
</.modal>
```

## Guarded Confirm

Use `close_on_confirm={false}` when the server must validate before closing the
dialog. The confirm button can push a LiveView event and the dialog remains open
until the server sends an explicit close command or the user cancels.

```heex
<.confirm_modal
  id="archive-confirm"
  title="Archive workspace"
  message="Archive permissions are validated on the server."
  confirm_text="Validate archive"
  cancel_text="Keep workspace"
  close_on_confirm={false}
  on_confirm={JS.push("validate-archive")}
/>
```

## Rules

- Use `show_modal/1` and `hide_modal/1` for client-side open/close behavior.
- Provide either a `:title` slot or a `label`; every dialog needs a name.
- Put primary and cancel controls in the `:actions` slot.
- Keep form draft values in LiveView assigns when action buttons live outside
  the form element.
- Use `confirm_modal/1` with `role="alertdialog"` for destructive or
  irreversible decisions.
- Set `close_on_confirm={false}` for server-validated destructive flows.
- Browser coverage should verify `data-state`, accessible title/label,
  focus movement, form state updates, close callbacks, and guarded confirms.
