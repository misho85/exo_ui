# Drawer Recipes

Use this pattern when a side panel owns a secondary workflow: record review,
navigation, filters, validation, or a long form that should scroll inside the
drawer instead of the document.

## Right Drawer Form

```heex
<.button type="button" phx-click={show_drawer("account-drawer")}>
  Open review drawer
</.button>

<.drawer
  id="account-drawer"
  side="right"
  on_cancel={JS.push("drawer-cancelled")}
>
  <:title>Review account</:title>

  <.form
    for={%{}}
    as={:account}
    phx-change="change-account-draft"
    phx-target={@myself}
  >
    <.input name="account[owner]" label="Account owner" value={@owner} errors={@owner_errors} />
    <.input name="account[note]" label="Review note" type="textarea" value={@note} />
  </.form>

  <.button variant="ghost" phx-click={hide_drawer("account-drawer")}>Cancel</.button>
  <.button phx-click={JS.push("save-account") |> hide_drawer("account-drawer")}>
    Save review
  </.button>
</.drawer>
```

For server validation that can reject the save, push the validation event
without `hide_drawer/2` while the draft is invalid. Re-render the same button
with `hide_drawer/2` only when the server state is valid.

## Left Navigation Drawer

```heex
<.drawer id="navigation-drawer" side="left">
  <:title>Navigation</:title>
  <nav aria-label="Workspace sections">
    <.button phx-click={JS.push("select-section", value: %{section: "billing"}) |> hide_drawer("navigation-drawer")}>
      Open billing queue
    </.button>
  </nav>
</.drawer>
```

## Labelled Drawer Without Title

When the drawer has no visible title, pass `label` so the dialog still has an
accessible name.

```heex
<.drawer id="filter-drawer" side="right" label="Segment filters drawer">
  <.input name="filters[segment]" label="Account segment" type="select" options={@segments} />
  <.input name="filters[archived]" label="Include archived accounts" type="checkbox" />
</.drawer>
```

## Rules

- Use `show_drawer/1` and `hide_drawer/1` for client-side open/close behavior.
- Pass `side="right"` for task panels and `side="left"` for navigation panels.
- Provide either a `:title` slot or `label`; every drawer needs a dialog name.
- Keep long workflows inside the drawer body so the body scrolls, not the page.
- Keep form draft and validation state in LiveView assigns when drawer buttons
  are outside the form element.
- Keep a drawer open on failed validation by omitting `hide_drawer/2` from that
  invalid submit path.
- Browser coverage should verify side, accessible title/label, focus movement,
  inert outside content, validation that keeps the drawer open, body scrolling,
  close callbacks, and focus restoration.
