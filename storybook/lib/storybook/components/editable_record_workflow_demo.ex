defmodule ExoUI.Storybook.Components.EditableRecordWorkflowDemo do
  @moduledoc """
  Production-style editable record workflow.

  Combines data display, dropdown and command menu actions, a drawer-hosted
  edit form, parent-controlled date picker state, validation errors, and a
  guarded confirm modal.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    records = records()
    selected = hd(records)

    {:ok,
     assign(socket,
       records: records,
       selected_id: selected.id,
       draft: draft_from_record(selected),
       errors: %{},
       calendar_month: Date.beginning_of_month(selected.renewal_date),
       save_state: "ready",
       pending_delete_id: selected.id,
       delete_error: nil
     )}
  end

  @impl true
  def handle_event("edit-record", %{"id" => id}, socket) do
    {:noreply, select_record(socket, id)}
  end

  def handle_event("validate-record", %{"record" => params}, socket) do
    draft = merge_record_params(socket.assigns.draft, params)

    {:noreply,
     assign(socket,
       draft: draft,
       errors: validate_draft(draft),
       save_state: "dirty"
     )}
  end

  def handle_event("save-record", %{"record" => params}, socket) do
    draft = merge_record_params(socket.assigns.draft, params)
    errors = validate_draft(draft)

    if map_size(errors) == 0 do
      records = Enum.map(socket.assigns.records, &replace_record(&1, draft))

      {:noreply,
       assign(socket,
         records: records,
         draft: draft,
         errors: %{},
         save_state: "saved",
         calendar_month: Date.beginning_of_month(draft.renewal_date)
       )}
    else
      {:noreply, assign(socket, draft: draft, errors: errors, save_state: "blocked")}
    end
  end

  def handle_event("editable-prev-month", _params, socket) do
    {:noreply, update(socket, :calendar_month, &previous_month/1)}
  end

  def handle_event("editable-next-month", _params, socket) do
    {:noreply, update(socket, :calendar_month, &next_month/1)}
  end

  def handle_event("editable-select-date", %{"date" => date}, socket) do
    renewal_date = Date.from_iso8601!(date)
    draft = %{socket.assigns.draft | renewal_date: renewal_date}

    {:noreply,
     assign(socket,
       draft: draft,
       errors: validate_draft(draft),
       calendar_month: Date.beginning_of_month(renewal_date),
       save_state: "dirty"
     )}
  end

  def handle_event("prepare-delete", %{"id" => id}, socket) do
    {:noreply, assign(socket, pending_delete_id: id, delete_error: nil)}
  end

  def handle_event("delete-record", _params, socket) do
    {:noreply,
     assign(socket,
       delete_error: "Cannot delete an active renewal record until ownership is reassigned."
     )}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div
      id={@id}
      data-exo="editable-record-workflow"
      style="min-height: 680px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Editable renewal records
        <:subtitle>
          Table rows, menu commands, drawer forms, validation, and guarded deletion.
        </:subtitle>
        <:actions>
          <.button
            type="button"
            variant="outline"
            phx-click={show_command_palette("editable-record-command")}
          >
            Open record commands
          </.button>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Renewals" value="3" subtitle="active records" />
        <.stat_card
          title="Needs owner"
          value="1"
          trend="+1"
          trend_direction="up"
          subtitle="before export"
        />
        <.stat_card title="Saved state" value={@save_state} subtitle="LiveComponent state" />
      </div>

      <.content_card title="Renewal queue">
        <:action>
          <.badge variant={if @save_state == "blocked", do: "danger", else: "success"}>
            {@save_state}
          </.badge>
        </:action>

        <.table
          id="editable-records-table"
          rows={@records}
          row_id={&row_id/1}
          row_label={&row_label/1}
          caption="Editable renewal records"
        >
          <:col :let={record} label="Account">{record.name}</:col>
          <:col :let={record} label="Owner">
            <span data-exo="editable-owner">{owner_label(record.owner)}</span>
          </:col>
          <:col :let={record} label="Stage">
            <.badge variant={record.stage_variant}>{record.stage}</.badge>
          </:col>
          <:col :let={record} label="Renewal" align="right">
            {Date.to_iso8601(record.renewal_date)}
          </:col>
          <:action :let={record}>
            <.dropdown_menu id={"editable-record-actions-#{record.id}"} align="end">
              <:trigger>
                <.button type="button" size="sm" variant="ghost">
                  Actions for {record.name}
                </.button>
              </:trigger>
              <:entry icon="pencil" click={open_record(record.id, @myself)}>Edit record</:entry>
              <:entry icon="copy" disabled>Duplicate record</:entry>
              <:entry type="separator" />
              <:entry
                icon="trash-2"
                variant="danger"
                click={confirm_delete(record.id, @myself)}
              >
                Delete record
              </:entry>
            </.dropdown_menu>
          </:action>
        </.table>
      </.content_card>

      <p
        id="editable-record-state"
        data-exo="editable-record-state"
        data-selected={@selected_id}
        data-save-state={@save_state}
      >
        Editing {selected_record(@records, @selected_id).name}.
      </p>

      <.command_palette
        id="editable-record-command"
        label="Editable record command palette"
        placeholder="Search records or actions..."
        shortcut="ctrl+shift+e"
      >
        <:item
          :for={record <- @records}
          label={"Edit #{record.name}"}
          value={"edit-#{record.id}"}
          search={"#{record.name} #{record.owner} #{record.stage} renewal edit"}
          shortcut="E"
          click={open_record(record.id, @myself)}
        />
        <:item
          label="Delete selected record"
          value="delete-selected"
          search="delete active renewal guarded confirm"
          shortcut="D"
          click={confirm_delete(@selected_id, @myself)}
        />
      </.command_palette>

      <.drawer id="editable-record-drawer" side="right">
        <:title>Edit {selected_record(@records, @selected_id).name}</:title>
        <ExoUI.Components.Form.form
          for={%{}}
          as={:record}
          phx-change="validate-record"
          phx-submit="save-record"
          phx-target={@myself}
          style="display: flex; flex-direction: column; gap: 1rem;"
        >
          <ExoUI.Components.Form.input
            id="editable-record-name"
            name="record[name]"
            label="Account name"
            value={@draft.name}
            errors={field_errors(@errors, :name)}
          />
          <ExoUI.Components.Form.input
            id="editable-record-owner"
            name="record[owner]"
            label="Owner"
            value={@draft.owner}
            description="Required before saving or deleting the record."
            errors={field_errors(@errors, :owner)}
          />
          <ExoUI.Components.Form.select
            id="editable-record-stage"
            name="record[stage]"
            label="Stage"
            value={@draft.stage}
            options={stage_options()}
          />
          <ExoUI.Components.Form.date_picker
            id="editable-record-renewal"
            name="record[renewal_date]"
            label="Renewal date"
            selected={@draft.renewal_date}
            current_month={@calendar_month}
            min={~D[2026-01-01]}
            max={~D[2026-12-31]}
            available_dates={available_dates(@calendar_month)}
            on_select="editable-select-date"
            on_prev_month="editable-prev-month"
            on_next_month="editable-next-month"
            target={@myself}
          />
          <ExoUI.Components.Form.input
            id="editable-record-notes"
            name="record[notes]"
            type="textarea"
            rows="5"
            label="Review notes"
            value={@draft.notes}
            errors={field_errors(@errors, :notes)}
          />

          <div style="display: flex; justify-content: space-between; gap: 0.5rem;">
            <.button
              type="button"
              variant="danger"
              phx-click={confirm_delete(@selected_id, @myself)}
            >
              Delete record
            </.button>
            <div style="display: flex; gap: 0.5rem;">
              <.button type="button" variant="ghost" phx-click={hide_drawer("editable-record-drawer")}>
                Cancel
              </.button>
              <.button type="submit">Save record</.button>
            </div>
          </div>
        </ExoUI.Components.Form.form>
      </.drawer>

      <.confirm_modal
        id="editable-record-delete-confirm"
        title="Delete renewal record"
        message="Deletion is server-guarded. The confirm action stays open when validation fails."
        confirm_text="Validate delete"
        cancel_text="Keep record"
        variant="danger"
        close_on_confirm={false}
        on_confirm={JS.push("delete-record", target: @myself)}
      />

      <p
        :if={@delete_error}
        id="editable-record-delete-error"
        data-exo="editable-record-delete-error"
        role="alert"
        style="color: var(--exo-danger);"
      >
        {@delete_error}
      </p>
    </div>
    """
  end

  def row_id(record), do: "editable-record-#{record.id}"
  def row_label(record), do: "Edit #{record.name}"

  defp open_record(id, target) do
    JS.push("edit-record", value: %{id: id}, target: target)
    |> show_drawer_js("editable-record-drawer")
    |> hide_command_palette("editable-record-command")
  end

  defp confirm_delete(id, target) do
    JS.push("prepare-delete", value: %{id: id}, target: target)
    |> show_modal_js("editable-record-delete-confirm")
    |> hide_command_palette("editable-record-command")
  end

  defp show_drawer_js(js, id) do
    js
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> JS.remove_attribute("inert", to: "##{id}")
    |> JS.focus_first(to: "##{id} [data-exo=\"drawer-content\"]")
  end

  defp show_modal_js(js, id) do
    js
    |> JS.set_attribute({"data-state", "open"}, to: "##{id}")
    |> JS.set_attribute({"aria-hidden", "false"}, to: "##{id}")
    |> JS.remove_attribute("inert", to: "##{id}")
    |> JS.show(to: "##{id}")
    |> JS.focus_first(to: "##{id} [data-exo=\"modal-content\"]")
  end

  defp select_record(socket, id) do
    record = selected_record(socket.assigns.records, id)

    assign(socket,
      selected_id: record.id,
      draft: draft_from_record(record),
      errors: %{},
      calendar_month: Date.beginning_of_month(record.renewal_date),
      save_state: "editing",
      pending_delete_id: record.id,
      delete_error: nil
    )
  end

  defp selected_record(records, id), do: Enum.find(records, &(to_string(&1.id) == to_string(id)))

  defp replace_record(%{id: id}, %{id: id} = draft), do: record_from_draft(draft)
  defp replace_record(record, _draft), do: record

  defp draft_from_record(record) do
    %{
      id: record.id,
      name: record.name,
      owner: record.owner,
      stage: record.stage,
      renewal_date: record.renewal_date,
      notes: record.notes
    }
  end

  defp record_from_draft(draft) do
    %{
      id: draft.id,
      name: draft.name,
      owner: draft.owner,
      stage: draft.stage,
      stage_variant: stage_variant(draft.stage),
      renewal_date: draft.renewal_date,
      notes: draft.notes
    }
  end

  defp merge_record_params(draft, params) do
    %{
      draft
      | name: string_param(params, "name", draft.name),
        owner: string_param(params, "owner", draft.owner),
        stage: string_param(params, "stage", draft.stage),
        renewal_date: date_param(params, "renewal_date", draft.renewal_date),
        notes: string_param(params, "notes", draft.notes)
    }
  end

  defp validate_draft(draft) do
    %{}
    |> maybe_error(:name, draft.name == "", "Account name is required.")
    |> maybe_error(:owner, draft.owner == "", "Owner is required before saving.")
    |> maybe_error(
      :notes,
      String.length(draft.notes) < 20,
      "Add at least 20 characters of review notes."
    )
  end

  defp maybe_error(errors, _key, false, _message), do: errors
  defp maybe_error(errors, key, true, message), do: Map.put(errors, key, [message])

  defp field_errors(errors, key), do: Map.get(errors, key, [])

  defp string_param(params, key, fallback),
    do: params |> Map.get(key, fallback) |> to_string() |> String.trim()

  defp date_param(params, key, fallback) do
    case Date.from_iso8601(Map.get(params, key, "")) do
      {:ok, date} -> date
      {:error, _reason} -> fallback
    end
  end

  defp previous_month(date) do
    date |> Date.beginning_of_month() |> Date.add(-1) |> Date.beginning_of_month()
  end

  defp next_month(date) do
    date |> Date.end_of_month() |> Date.add(1) |> Date.beginning_of_month()
  end

  defp available_dates(month) do
    month = Date.beginning_of_month(month)
    [5, 12, 19, 26] |> Enum.map(&Date.add(month, &1 - 1))
  end

  defp stage_options do
    [
      {"Discovery", "Discovery"},
      {"Renewal", "Renewal"},
      {"Legal review", "Legal review"},
      {"Blocked", "Blocked"}
    ]
  end

  defp stage_variant("Blocked"), do: "danger"
  defp stage_variant("Legal review"), do: "warning"
  defp stage_variant("Renewal"), do: "primary"
  defp stage_variant(_stage), do: "secondary"

  defp owner_label(""), do: "Unassigned"
  defp owner_label(owner), do: owner

  defp records do
    [
      %{
        id: "acme",
        name: "Acme Corp",
        owner: "Mina",
        stage: "Renewal",
        stage_variant: "primary",
        renewal_date: ~D[2026-06-12],
        notes: "Confirm security evidence and renewal owner before sending the final quote."
      },
      %{
        id: "northstar",
        name: "Northstar",
        owner: "",
        stage: "Blocked",
        stage_variant: "danger",
        renewal_date: ~D[2026-07-19],
        notes:
          "Customer is blocked until the commercial owner is assigned and legal review is complete."
      },
      %{
        id: "orbit",
        name: "Orbit Labs",
        owner: "Sara",
        stage: "Legal review",
        stage_variant: "warning",
        renewal_date: ~D[2026-08-05],
        notes: "Legal review is active; keep finance informed before moving the record forward."
      }
    ]
  end
end
