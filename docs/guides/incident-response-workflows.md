# Incident Response Workflows

Use this pattern for operations queues where responders filter incidents, open a
drawer for triage, validate escalation notes, acknowledge work, and resolve an
incident through a guarded confirmation.

## Structure

```heex
<.tabs id="incident-tabs" active={@active_tab} aria_label="Incident status">
  <:tab id="open" label="Open" click={JS.push("change-incident-tab", value: %{tab: "open"})} />
  <:tab id="resolved" label="Resolved" click={JS.push("change-incident-tab", value: %{tab: "resolved"})} />
</.tabs>

<.form for={%{}} as={:incident} phx-change="change-incident-filters">
  <.input name="incident[query]" label="Search incidents" value={@query} />
  <.input
    name="incident[severity]"
    type="select"
    label="Severity"
    value={@severity_filter}
    options={[
      {"All severities", "all"},
      {"Critical", "critical"},
      {"High", "high"},
      {"Medium", "medium"}
    ]}
  />
</.form>

<.table rows={@rows} row_id={&"incident-row-#{&1.id}"} caption="Incident response queue">
  <:col :let={incident} label="Incident">{incident.title}</:col>
  <:col :let={incident} label="Severity">
    <.badge variant={severity_variant(incident.severity)}>{incident.severity}</.badge>
  </:col>
  <:col :let={incident} label="Action">
    <.button phx-click={open_incident_drawer(incident.id, @myself)}>Open incident</.button>
  </:col>
</.table>
```

## Drawer Triage

Keep triage notes and validation state in LiveView assigns. Escalation should
leave the drawer open on validation failure. Resolution should close the confirm
modal and drawer only after the server event is pushed.

```heex
<.drawer id="incident-drawer" side="right">
  <:title>Triage {@selected_incident.title}</:title>

  <.timeline>
    <:event title="Detected" time={@selected_incident.started}>
      {@selected_incident.detection}
    </:event>
  </.timeline>

  <.input
    name="triage[note]"
    type="textarea"
    label="Triage note"
    value={@triage_note}
    errors={Map.get(@errors, :note, [])}
  />

  <.button phx-click="escalate-incident">Escalate incident</.button>
  <.button phx-click="acknowledge-incident">Acknowledge incident</.button>
  <.button variant="danger" phx-click={show_modal("resolve-incident-confirm")}>
    Prepare resolve
  </.button>
</.drawer>

<.confirm_modal
  id="resolve-incident-confirm"
  title="Resolve incident?"
  message="This moves the selected incident to the resolved tab."
  confirm_text="Resolve incident"
  close_on_confirm={false}
  on_confirm={
    JS.push("resolve-incident")
    |> hide_modal("resolve-incident-confirm")
    |> hide_drawer("incident-drawer")
  }
/>
```

## Rules

- Use status tabs for coarse routing and explicit filters for severity/search.
- In LiveComponents, target tab and command events with `target: @myself`.
- Route command-palette actions to the same state as visible filters, then close
  the palette explicitly after `JS.push`.
- Keep escalation validation inside the drawer and do not close on invalid
  notes.
- Guard resolution with `confirm_modal/1`; close the modal and drawer only in
  the confirmed path.
- Browser coverage should verify command routing, filters, drawer details,
  validation errors, escalation state, confirm-modal resolution, reset state,
  and live status attributes.
