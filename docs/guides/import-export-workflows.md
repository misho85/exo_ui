# Import Export Workflows

Use this pattern when users need to stage imported rows, review validation
warnings, commit server-owned records, and prepare an export package.

## Structure

```heex
<ExoUI.Components.Form.file_input
  id="import-file"
  name="import[file]"
  label="Import file"
  description="CSV files are staged for review before commit."
  accept=".csv,text/csv"
/>

<.button type="button" phx-click="review-import" phx-target={@myself}>
  Review import
</.button>

<.progress value={@import_progress} label="Import progress" />

<.table
  id="import-review-table"
  rows={@review_rows}
  row_id={&row_id/1}
  row_label={&row_label/1}
  empty_label="No import rows are staged for review."
>
  <:col :let={row} label="Account">{row.account}</:col>
  <:col :let={row} label="Status">{row.status}</:col>
  <:col :let={row} label="Issue">{row.issue}</:col>
</.table>
```

## Event Shape

```elixir
def handle_event("validate-import", _params, socket) do
  {:noreply,
   assign(socket,
     import_state: "validated",
     import_progress: 75,
     review_rows: Enum.map(socket.assigns.review_rows, &validate_row/1)
   )}
end

def handle_event("prepare-export", _params, socket) do
  {:noreply,
   assign(socket,
     export_state: "ready",
     export_filename: export_filename(socket.assigns.export_format)
   )}
end
```

## Rules

- Treat uploaded files as staged input until the server validates rows.
- Keep review rows, validation warnings, progress, export format, and export
  filename in server state.
- Keep a visible empty state before a file is staged or when parsing returns no
  rows.
- Keep validation warnings visible after commit if the workflow allows importing
  with warnings.
- Disable commit/export actions until the prerequisite state exists.
- Browser coverage should verify file input selection, review row count,
  validation warnings, commit state, progress, export format, and export file
  name.
