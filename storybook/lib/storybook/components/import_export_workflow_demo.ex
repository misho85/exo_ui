defmodule ExoUI.Storybook.Components.ImportExportWorkflowDemo do
  @moduledoc """
  Production-style import/export workflow.

  Demonstrates file input review, staged import rows, validation, commit
  status, export format selection, export preparation, progress, and live
  status text.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  @impl true
  def mount(socket) do
    {:ok,
     assign(socket,
       import_state: "idle",
       import_progress: 0,
       review_rows: [],
       committed_rows: [],
       export_format: "csv",
       export_state: "idle",
       export_filename: "not prepared",
       last_action: "waiting for import"
     )}
  end

  @impl true
  def handle_event("review-sample-import", _params, socket) do
    {:noreply,
     assign(socket,
       import_state: "reviewing",
       import_progress: 40,
       review_rows: sample_import_rows(),
       export_state: "idle",
       export_filename: "not prepared",
       last_action: "reviewed sample import"
     )}
  end

  def handle_event("validate-import", _params, socket) do
    {:noreply,
     assign(socket,
       import_state: "validated",
       import_progress: 75,
       review_rows: Enum.map(socket.assigns.review_rows, &validate_row/1),
       last_action: "validated import rows"
     )}
  end

  def handle_event("commit-import", _params, socket) do
    committed_rows =
      socket.assigns.review_rows
      |> Enum.map(&validate_row/1)
      |> Enum.map(&Map.put(&1, :status, "Imported"))

    {:noreply,
     assign(socket,
       import_state: "committed",
       import_progress: 100,
       review_rows: committed_rows,
       committed_rows: committed_rows,
       last_action: "committed import"
     )}
  end

  def handle_event("change-export-format", %{"export" => params}, socket) do
    {:noreply,
     assign(socket,
       export_format: string_param(params, "format", socket.assigns.export_format),
       export_state: "dirty",
       export_filename: "not prepared",
       last_action: "changed export format"
     )}
  end

  def handle_event("prepare-export", _params, socket) do
    {:noreply,
     assign(socket,
       export_state: "ready",
       export_filename: export_filename(socket.assigns.export_format),
       last_action: "prepared export"
     )}
  end

  def handle_event("reset-import-export", _params, socket) do
    {:noreply,
     assign(socket,
       import_state: "idle",
       import_progress: 0,
       review_rows: [],
       committed_rows: [],
       export_format: "csv",
       export_state: "idle",
       export_filename: "not prepared",
       last_action: "reset workflow"
     )}
  end

  @impl true
  def render(assigns) do
    assigns =
      assign(assigns,
        review_count: length(assigns.review_rows),
        committed_count: length(assigns.committed_rows),
        warning_count: Enum.count(assigns.review_rows, &(&1.issue != "")),
        valid_count: Enum.count(assigns.review_rows, &(&1.issue == ""))
      )

    ~H"""
    <div
      id={@id}
      data-exo="import-export-workflow"
      data-import-state={@import_state}
      data-import-progress={@import_progress}
      data-review-count={@review_count}
      data-valid-count={@valid_count}
      data-warning-count={@warning_count}
      data-committed-count={@committed_count}
      data-export-format={@export_format}
      data-export-state={@export_state}
      data-export-filename={@export_filename}
      data-last-action={@last_action}
      style="min-height: 720px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Import export workflow
        <:subtitle>
          Review a staged import, validate rows, commit records, and prepare an export package.
        </:subtitle>
        <:actions>
          <.badge variant={state_variant(@import_state)}>{@import_state}</.badge>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Review rows" value={@review_count} subtitle="staged import" />
        <.stat_card title="Valid rows" value={@valid_count} subtitle="after validation" />
        <.stat_card title="Warnings" value={@warning_count} subtitle="needs review" />
        <.stat_card title="Committed" value={@committed_count} subtitle="imported records" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 20rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Import review">
            <:action>
              <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
                <.button
                  type="button"
                  size="sm"
                  variant="outline"
                  phx-click="review-sample-import"
                  phx-target={@myself}
                >
                  Review sample import
                </.button>
                <.button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={@review_rows == []}
                  phx-click="reset-import-export"
                  phx-target={@myself}
                >
                  Reset workflow
                </.button>
              </div>
            </:action>

            <div style="display: grid; gap: 1rem;">
              <ExoUI.Components.Form.file_input
                id="import-export-file"
                name="import[file]"
                label="Import file"
                description="CSV files are staged for review before commit."
                accept=".csv,text/csv"
              />

              <.progress
                value={@import_progress}
                label="Import progress"
                aria_label="Import progress"
              />

              <.alert :if={@warning_count > 0} kind={:warning} title="Rows need review">
                {@warning_count} staged rows have warnings. They remain visible before commit.
              </.alert>

              <.table
                id="import-review-table"
                rows={@review_rows}
                row_id={&review_row_id/1}
                row_label={&review_row_label/1}
                caption="Staged import rows"
                empty_label="No import rows are staged for review."
              >
                <:col :let={row} label="Account">{row.account}</:col>
                <:col :let={row} label="Owner">{row.owner}</:col>
                <:col :let={row} label="Amount" align="right">{row.amount}</:col>
                <:col :let={row} label="Status">
                  <.badge variant={row_variant(row)}>{row.status}</.badge>
                </:col>
                <:col :let={row} label="Issue">{empty_issue(row.issue)}</:col>
              </.table>
            </div>
          </.content_card>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <.content_card title="Import actions">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <.button
                type="button"
                disabled={@review_rows == []}
                phx-click="validate-import"
                phx-target={@myself}
              >
                Validate import
              </.button>
              <.button
                type="button"
                variant="outline"
                disabled={@import_state not in ["validated", "committed"]}
                phx-click="commit-import"
                phx-target={@myself}
              >
                Commit import
              </.button>
            </div>
          </.content_card>

          <.content_card title="Export package">
            <:action>
              <.badge variant={if @export_state == "ready", do: "success", else: "secondary"}>
                {@export_state}
              </.badge>
            </:action>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <ExoUI.Components.Form.form
                for={%{}}
                as={:export}
                phx-change="change-export-format"
                phx-target={@myself}
              >
                <ExoUI.Components.Form.select
                  id="export-format"
                  name="export[format]"
                  label="Export format"
                  value={@export_format}
                  options={export_options()}
                />
              </ExoUI.Components.Form.form>

              <.button
                type="button"
                disabled={@committed_rows == []}
                phx-click="prepare-export"
                phx-target={@myself}
              >
                Prepare export
              </.button>

              <p
                id="export-package"
                data-exo="export-package"
                data-export-filename={@export_filename}
                style="margin: 0; color: var(--exo-muted-foreground); font-size: var(--exo-text-sm);"
              >
                {@export_filename}
              </p>
            </div>
          </.content_card>
        </div>
      </div>

      <p
        id="import-export-state"
        data-exo="import-export-state"
        data-import-state={@import_state}
        data-import-progress={@import_progress}
        data-review-count={@review_count}
        data-valid-count={@valid_count}
        data-warning-count={@warning_count}
        data-committed-count={@committed_count}
        data-export-format={@export_format}
        data-export-state={@export_state}
        data-export-filename={@export_filename}
        data-last-action={@last_action}
        role="status"
        aria-live="polite"
      >
        Import {@import_state}; export {@export_state}; {@last_action}.
      </p>
    </div>
    """
  end

  defp validate_row(row) do
    if row.issue == "" do
      %{row | status: "Valid"}
    else
      %{row | status: "Warning"}
    end
  end

  defp review_row_id(row), do: "import-review-row-#{row.id}"
  defp review_row_label(row), do: "Import row #{row.account}"

  defp row_variant(%{status: "Imported"}), do: "success"
  defp row_variant(%{status: "Valid"}), do: "success"
  defp row_variant(%{status: "Warning"}), do: "warning"
  defp row_variant(_row), do: "secondary"

  defp state_variant("committed"), do: "success"
  defp state_variant("validated"), do: "primary"
  defp state_variant("reviewing"), do: "warning"
  defp state_variant(_state), do: "secondary"

  defp empty_issue(""), do: "None"
  defp empty_issue(issue), do: issue

  defp export_filename("json"), do: "account-import-review.json"
  defp export_filename("xlsx"), do: "account-import-review.xlsx"
  defp export_filename(_format), do: "account-import-review.csv"

  defp string_param(params, key, fallback),
    do: params |> Map.get(key, fallback) |> to_string() |> String.trim()

  defp export_options do
    [
      {"CSV", "csv"},
      {"JSON", "json"},
      {"Excel", "xlsx"}
    ]
  end

  defp sample_import_rows do
    [
      %{
        id: "northstar",
        account: "Northstar",
        owner: "Iva",
        amount: "$18k",
        status: "Staged",
        issue: ""
      },
      %{
        id: "helio",
        account: "Helio Bank",
        owner: "Mina",
        amount: "$31k",
        status: "Staged",
        issue: "Duplicate domain"
      },
      %{
        id: "orbit",
        account: "Orbit Labs",
        owner: "Sara",
        amount: "$24k",
        status: "Staged",
        issue: ""
      }
    ]
  end
end
