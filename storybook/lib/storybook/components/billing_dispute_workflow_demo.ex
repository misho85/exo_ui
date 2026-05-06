defmodule ExoUI.Storybook.Components.BillingDisputeWorkflowDemo do
  @moduledoc """
  Production-style billing dispute workflow.

  Demonstrates a finance/support queue with status tabs, queue/search filters,
  command routing, table actions, drawer-hosted review validation, guarded
  credit confirmation, and live workflow state.
  """

  use Phoenix.LiveComponent

  import ExoUI.Components

  alias Phoenix.LiveView.JS

  @impl true
  def mount(socket) do
    {:ok, assign_initial(socket, "initial billing dispute review")}
  end

  @impl true
  def handle_event("change-billing-tab", %{"tab" => tab}, socket) do
    tab = normalize_tab(tab)

    {:noreply,
     assign(socket,
       active_tab: tab,
       selected_dispute_id: nil,
       last_action: "opened #{tab_label(tab)} disputes"
     )}
  end

  def handle_event("change-billing-filters", %{"billing" => params}, socket) do
    {:noreply,
     assign(socket,
       query: Map.get(params, "query", ""),
       queue_filter: normalize_queue(Map.get(params, "queue", "all")),
       selected_dispute_id: nil,
       last_action: "changed billing dispute filters"
     )}
  end

  def handle_event("run-billing-command", %{"command" => command}, socket) do
    {active_tab, queue_filter, query, label} =
      case command do
        "payments" -> {"open", "payments", "", "payments queue"}
        "high-value" -> {"open", "all", "charge", "high-value disputes"}
        "approved" -> {"approved", "all", "", "approved credits"}
        "denied" -> {"denied", "all", "", "denied disputes"}
        _ -> {"open", "all", "", "open disputes"}
      end

    {:noreply,
     assign(socket,
       active_tab: active_tab,
       queue_filter: queue_filter,
       query: query,
       selected_dispute_id: nil,
       command_count: socket.assigns.command_count + 1,
       last_action: "opened #{label} from command palette"
     )}
  end

  def handle_event("open-billing-dispute", %{"id" => id}, socket) do
    dispute = dispute_by_id(id, socket.assigns.decisions)

    {:noreply,
     assign(socket,
       selected_dispute_id: dispute.id,
       reviewer: "billing",
       review_note: "",
       errors: %{},
       last_action: "opened dispute for #{dispute.customer}"
     )}
  end

  def handle_event("change-billing-review", %{"review" => params}, socket) do
    {:noreply,
     assign(socket,
       reviewer: normalize_reviewer(Map.get(params, "reviewer", socket.assigns.reviewer)),
       review_note: Map.get(params, "note", ""),
       errors: %{},
       last_action: "edited billing review note"
     )}
  end

  def handle_event("prepare-billing-credit", _params, socket) do
    {:noreply, assign(socket, last_action: "opened guarded credit confirmation")}
  end

  def handle_event("request-billing-evidence", _params, socket) do
    note = String.trim(socket.assigns.review_note)

    if String.length(note) < 15 do
      {:noreply,
       assign(socket,
         errors: %{note: ["Add at least 15 characters before requesting evidence."]},
         validation_count: socket.assigns.validation_count + 1,
         last_action: "blocked evidence request"
       )}
    else
      selected = dispute_by_id(socket.assigns.selected_dispute_id, socket.assigns.decisions)

      decisions =
        Map.put(socket.assigns.decisions, selected.id, %{
          status: "evidence",
          reviewer: socket.assigns.reviewer,
          note: note
        })

      {:noreply,
       assign(socket,
         decisions: decisions,
         errors: %{},
         evidence_count: socket.assigns.evidence_count + 1,
         last_action: "requested evidence for #{selected.customer}"
       )}
    end
  end

  def handle_event("approve-billing-dispute", _params, socket) do
    socket
    |> decide_dispute("approved", "approved credit for", :approved_count)
    |> noreply()
  end

  def handle_event("deny-billing-dispute", _params, socket) do
    socket
    |> decide_dispute("denied", "denied dispute for", :denied_count)
    |> noreply()
  end

  def handle_event("reset-billing-disputes", _params, socket) do
    {:noreply, assign_initial(socket, "reset billing dispute review")}
  end

  @impl true
  def render(assigns) do
    disputes = decorate_disputes(disputes(), assigns.decisions)
    rows = visible_disputes(disputes, assigns)
    selected = selected_dispute(disputes, assigns.selected_dispute_id)
    credit_ready? = selected.id != "" && String.length(String.trim(assigns.review_note)) >= 15

    assigns =
      assign(assigns,
        disputes: disputes,
        rows: rows,
        selected_dispute: selected,
        visible_count: length(rows),
        open_count: count_open(disputes),
        approved_total: count_status(disputes, "approved"),
        denied_total: count_status(disputes, "denied"),
        evidence_total: count_status(disputes, "evidence"),
        high_value_visible_count: count_high_value(rows),
        visible_amount: visible_amount(rows),
        note_errors: field_errors(assigns.errors, :note),
        credit_ready?: credit_ready?,
        can_reset?: can_reset?(assigns)
      )

    ~H"""
    <div
      id={@id}
      data-exo="billing-dispute-workflow"
      data-active-tab={@active_tab}
      data-queue-filter={@queue_filter}
      data-query={@query}
      data-visible-count={@visible_count}
      data-open-count={@open_count}
      data-approved-total={@approved_total}
      data-denied-total={@denied_total}
      data-evidence-total={@evidence_total}
      data-high-value-visible-count={@high_value_visible_count}
      data-visible-amount={@visible_amount}
      data-selected-dispute={@selected_dispute.id}
      data-evidence-count={@evidence_count}
      data-approved-count={@approved_count}
      data-denied-count={@denied_count}
      data-validation-count={@validation_count}
      data-command-count={@command_count}
      data-last-action={@last_action}
      style="min-height: 800px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <.header>
        Billing dispute workflow
        <:subtitle>
          Finance queue with command routing, dispute review, guarded credits, evidence requests, and reset-safe state.
        </:subtitle>
        <:actions>
          <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem;">
            <.button
              id="billing-open-command"
              type="button"
              variant="outline"
              phx-click={show_command_palette("billing-command")}
            >
              <.icon name="search" /> Open billing commands
            </.button>
            <.button
              type="button"
              variant="ghost"
              disabled={!@can_reset?}
              phx-click="reset-billing-disputes"
              phx-target={@myself}
            >
              Reset disputes
            </.button>
          </div>
        </:actions>
      </.header>

      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem;">
        <.stat_card title="Open" value={@open_count} subtitle="active disputes" />
        <.stat_card title="Evidence" value={@evidence_total} subtitle="requested" />
        <.stat_card title="Approved" value={@approved_total} subtitle="credits issued" />
        <.stat_card title="Visible amount" value={"$#{@visible_amount}"} subtitle="filtered exposure" />
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
          <.content_card title="Dispute controls">
            <.tabs
              id="billing-dispute-tabs"
              active={@active_tab}
              aria_label="Billing dispute status"
              activation="automatic"
            >
              <:tab id="open" label="Open" icon="clock" click={tab_click("open", @myself)} />
              <:tab
                id="approved"
                label="Approved"
                icon="check"
                click={tab_click("approved", @myself)}
              />
              <:tab id="denied" label="Denied" icon="shield-x" click={tab_click("denied", @myself)} />
            </.tabs>

            <ExoUI.Components.Form.form
              for={%{}}
              as={:billing}
              phx-change="change-billing-filters"
              phx-target={@myself}
              style="margin-top: 1rem; display: grid; grid-template-columns: minmax(0, 1fr) 13rem; gap: 0.75rem; align-items: start;"
            >
              <ExoUI.Components.Form.input
                id="billing-query"
                name="billing[query]"
                label="Search disputes"
                value={@query}
                placeholder="Search customer, evidence, invoice..."
              />
              <ExoUI.Components.Form.input
                id="billing-queue"
                name="billing[queue]"
                type="select"
                label="Queue"
                value={@queue_filter}
                options={queue_options()}
              />
            </ExoUI.Components.Form.form>
          </.content_card>

          <.content_card title="Dispute queue">
            <:action>
              <.badge variant="secondary">{@visible_count} visible</.badge>
            </:action>
            <.table
              id="billing-dispute-table"
              rows={@rows}
              row_id={&row_id/1}
              row_label={&row_label/1}
              caption="Billing dispute queue"
              empty_label="No billing disputes match the active status and filters."
            >
              <:col :let={dispute} label="Customer">{dispute.customer}</:col>
              <:col :let={dispute} label="Queue">
                <span data-exo="billing-queue">{queue_label(dispute.queue)}</span>
              </:col>
              <:col :let={dispute} label="Risk">
                <.badge variant={risk_variant(dispute.risk)}>{risk_label(dispute.risk)}</.badge>
              </:col>
              <:col :let={dispute} label="Amount" align="right">
                {"$#{dispute.amount}"}
              </:col>
              <:col :let={dispute} label="Status">
                <.badge variant={status_variant(dispute.status)}>
                  {status_label(dispute.status)}
                </.badge>
              </:col>
              <:action :let={dispute}>
                <.button
                  type="button"
                  size="sm"
                  variant="outline"
                  phx-click={open_dispute(dispute.id, @myself)}
                >
                  Review {dispute.customer}
                </.button>
              </:action>
            </.table>
          </.content_card>
        </div>

        <.content_card title="Review policy">
          <.list>
            <:item title="High value visible">{@high_value_visible_count} disputes</:item>
            <:item title="Evidence requests">{@evidence_count} this session</:item>
            <:item title="Credits approved">{@approved_count} this session</:item>
            <:item title="Denied">{@denied_count} this session</:item>
          </.list>
          <.separator />
          <.timeline>
            <:event title="Review" meta="Owner">
              Assign the billing, fraud, or support reviewer before requesting evidence.
            </:event>
            <:event title="Evidence" meta="Customer">
              Keep disputes open while the customer or internal team provides proof.
            </:event>
            <:event title="Decision" meta="Guarded">
              Credit issuance is blocked until a review note is recorded.
            </:event>
          </.timeline>
        </.content_card>
      </div>

      <p
        id="billing-dispute-state"
        data-exo="billing-dispute-state"
        data-last-action={@last_action}
        data-selected-dispute={@selected_dispute.id}
        aria-live="polite"
        style="margin: 0; color: var(--exo-muted-foreground);"
      >
        Last action: {@last_action}.
      </p>

      <.command_palette
        id="billing-command"
        label="Billing dispute command palette"
        placeholder="Search billing actions..."
        shortcut="ctrl+shift+b"
      >
        <:item
          label="Open payments queue"
          value="payments"
          search="payments billing open duplicate charge invoice"
          shortcut="P"
          click={run_command("payments", @myself)}
        />
        <:item
          label="Open high-value charges"
          value="high-value"
          search="high value charge refund credit"
          shortcut="H"
          click={run_command("high-value", @myself)}
        />
        <:item
          label="Open approved credits"
          value="approved"
          search="approved credit issued"
          shortcut="A"
          click={run_command("approved", @myself)}
        />
        <:item
          label="Open denied disputes"
          value="denied"
          search="denied rejected fraud"
          shortcut="D"
          click={run_command("denied", @myself)}
        />
      </.command_palette>

      <.drawer id="billing-dispute-drawer" side="right">
        <:title>Review {@selected_dispute.customer}</:title>
        <div
          id="billing-dispute-detail"
          data-exo="billing-dispute-detail"
          data-dispute={@selected_dispute.id}
          data-status={@selected_dispute.status}
          data-risk={@selected_dispute.risk}
          style="display: flex; flex-direction: column; gap: 1rem;"
        >
          <.alert
            kind={if @selected_dispute.risk == "high", do: "danger", else: "info"}
            title="Dispute evidence"
          >
            {@selected_dispute.evidence}
          </.alert>

          <.list>
            <:item title="Invoice">{@selected_dispute.invoice}</:item>
            <:item title="Amount">{"$#{@selected_dispute.amount}"}</:item>
            <:item title="Queue">{queue_label(@selected_dispute.queue)}</:item>
            <:item title="Status">{status_label(@selected_dispute.status)}</:item>
            <:item title="Reviewer">
              {if @selected_dispute.reviewer == "",
                do: "Not reviewed",
                else: reviewer_label(@selected_dispute.reviewer)}
            </:item>
          </.list>

          <ExoUI.Components.Form.form
            for={%{}}
            as={:review}
            phx-change="change-billing-review"
            phx-target={@myself}
            style="display: flex; flex-direction: column; gap: 1rem;"
          >
            <ExoUI.Components.Form.input
              id="billing-reviewer"
              name="review[reviewer]"
              type="select"
              label="Reviewer"
              value={@reviewer}
              options={reviewer_options()}
            />
            <ExoUI.Components.Form.input
              id="billing-note"
              name="review[note]"
              type="textarea"
              rows="5"
              label="Review note"
              value={@review_note}
              placeholder="Summarize the dispute evidence..."
              errors={@note_errors}
            />
          </ExoUI.Components.Form.form>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; gap: 0.5rem;">
              <.button
                type="button"
                variant="outline"
                phx-click="request-billing-evidence"
                phx-target={@myself}
              >
                Request evidence
              </.button>
              <.button
                type="button"
                variant="danger"
                phx-click="deny-billing-dispute"
                phx-target={@myself}
              >
                Deny dispute
              </.button>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
              <.button type="button" variant="ghost" phx-click={hide_drawer("billing-dispute-drawer")}>
                Close review
              </.button>
              <.button
                type="button"
                variant="primary"
                phx-click={prepare_credit_modal()}
              >
                Prepare credit
              </.button>
            </div>
          </div>
        </div>
      </.drawer>

      <.confirm_modal
        id="billing-credit-confirm"
        title={if @credit_ready?, do: "Issue customer credit", else: "Validate dispute credit"}
        message={
          if @credit_ready?,
            do: "The review note is recorded. Confirm the customer credit.",
            else: "Credit issuance is guarded until a review note explains the evidence."
        }
        confirm_text="Issue credit"
        cancel_text="Keep reviewing"
        variant={if @credit_ready?, do: "primary", else: "danger"}
        close_on_confirm={@credit_ready?}
        on_confirm={confirm_credit(@myself, @credit_ready?)}
      />
    </div>
    """
  end

  def row_id(dispute), do: "billing-dispute-#{dispute.id}"
  def row_label(dispute), do: "Review #{dispute.customer}"

  defp assign_initial(socket, last_action) do
    assign(socket,
      active_tab: "open",
      queue_filter: "all",
      query: "",
      decisions: %{},
      selected_dispute_id: nil,
      reviewer: "billing",
      review_note: "",
      errors: %{},
      evidence_count: 0,
      approved_count: 0,
      denied_count: 0,
      validation_count: 0,
      command_count: 0,
      last_action: last_action
    )
  end

  defp tab_click(tab, target),
    do: JS.push("change-billing-tab", value: %{tab: tab}, target: target)

  defp run_command(command, target) do
    JS.push("run-billing-command", value: %{command: command}, target: target)
    |> hide_command_palette("billing-command")
  end

  defp open_dispute(id, target) do
    JS.push("open-billing-dispute", value: %{id: id}, target: target)
    |> show_drawer_js("billing-dispute-drawer")
    |> hide_command_palette("billing-command")
  end

  defp prepare_credit_modal do
    hide_drawer("billing-dispute-drawer")
    |> show_modal_js("billing-credit-confirm")
  end

  defp confirm_credit(target, _credit_ready?),
    do: JS.push("approve-billing-dispute", target: target)

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

  defp decide_dispute(socket, status, verb, counter_key) do
    note = String.trim(socket.assigns.review_note)

    if String.length(note) < 15 do
      assign(socket,
        errors: %{note: ["Add at least 15 characters before saving the dispute decision."]},
        validation_count: socket.assigns.validation_count + 1,
        last_action: "blocked dispute decision"
      )
    else
      selected = dispute_by_id(socket.assigns.selected_dispute_id, socket.assigns.decisions)

      decisions =
        Map.put(socket.assigns.decisions, selected.id, %{
          status: status,
          reviewer: socket.assigns.reviewer,
          note: note
        })

      socket
      |> assign(
        decisions: decisions,
        active_tab: status,
        selected_dispute_id: nil,
        errors: %{},
        last_action: "#{verb} #{selected.customer}"
      )
      |> update(counter_key, &(&1 + 1))
    end
  end

  defp noreply(socket), do: {:noreply, socket}

  defp decorate_disputes(disputes, decisions) do
    Enum.map(disputes, fn dispute ->
      decision = Map.get(decisions, dispute.id, %{})
      status = Map.get(decision, :status, dispute.status)

      dispute
      |> Map.put(:status, status)
      |> Map.put(:status_variant, status_variant(status))
      |> Map.put(:reviewer, Map.get(decision, :reviewer, dispute.reviewer))
      |> Map.put(:note, Map.get(decision, :note, dispute.note))
    end)
  end

  defp visible_disputes(disputes, assigns) do
    disputes
    |> Enum.filter(&tab_status?(&1, assigns.active_tab))
    |> Enum.filter(fn dispute ->
      assigns.queue_filter == "all" || dispute.queue == assigns.queue_filter
    end)
    |> Enum.filter(&matches_query?(&1, assigns.query))
  end

  defp tab_status?(dispute, "open"), do: dispute.status in ["open", "evidence"]
  defp tab_status?(dispute, tab), do: dispute.status == tab

  defp matches_query?(_dispute, ""), do: true

  defp matches_query?(dispute, query) do
    haystack =
      [
        dispute.customer,
        dispute.invoice,
        dispute.queue,
        dispute.risk,
        dispute.evidence,
        dispute.status
      ]
      |> Enum.join(" ")
      |> String.downcase()

    String.contains?(haystack, String.downcase(String.trim(query)))
  end

  defp selected_dispute(_disputes, nil), do: empty_dispute()

  defp selected_dispute(disputes, id) do
    Enum.find(disputes, empty_dispute(), &(to_string(&1.id) == to_string(id)))
  end

  defp dispute_by_id(id, decisions),
    do: selected_dispute(decorate_disputes(disputes(), decisions), id)

  defp count_open(disputes), do: Enum.count(disputes, &(&1.status in ["open", "evidence"]))
  defp count_status(disputes, status), do: Enum.count(disputes, &(&1.status == status))
  defp count_high_value(disputes), do: Enum.count(disputes, &(&1.amount >= 1_000))
  defp visible_amount(disputes), do: disputes |> Enum.map(& &1.amount) |> Enum.sum()

  defp can_reset?(assigns) do
    assigns.active_tab != "open" ||
      assigns.queue_filter != "all" ||
      assigns.query != "" ||
      assigns.decisions != %{} ||
      assigns.evidence_count > 0 ||
      assigns.approved_count > 0 ||
      assigns.denied_count > 0 ||
      assigns.validation_count > 0 ||
      assigns.command_count > 0
  end

  defp normalize_tab(tab) when tab in ~w(open approved denied), do: tab
  defp normalize_tab(_tab), do: "open"

  defp normalize_queue(queue) when queue in ~w(all payments fraud support), do: queue
  defp normalize_queue(_queue), do: "all"

  defp normalize_reviewer(reviewer) when reviewer in ~w(billing fraud support manager),
    do: reviewer

  defp normalize_reviewer(_reviewer), do: "billing"

  defp field_errors(errors, key), do: Map.get(errors, key, [])

  defp status_variant("approved"), do: "success"
  defp status_variant("denied"), do: "danger"
  defp status_variant("evidence"), do: "info"
  defp status_variant(_status), do: "warning"

  defp risk_variant("high"), do: "danger"
  defp risk_variant("medium"), do: "warning"
  defp risk_variant(_risk), do: "secondary"

  defp status_label("approved"), do: "Approved"
  defp status_label("denied"), do: "Denied"
  defp status_label("evidence"), do: "Evidence requested"
  defp status_label(_status), do: "Open"

  defp tab_label("approved"), do: "approved"
  defp tab_label("denied"), do: "denied"
  defp tab_label(_tab), do: "open"

  defp risk_label("high"), do: "High"
  defp risk_label("medium"), do: "Medium"
  defp risk_label(_risk), do: "Low"

  defp queue_label("payments"), do: "Payments"
  defp queue_label("fraud"), do: "Fraud"
  defp queue_label("support"), do: "Support"
  defp queue_label(_queue), do: "All queues"

  defp reviewer_label("fraud"), do: "Fraud analyst"
  defp reviewer_label("support"), do: "Support lead"
  defp reviewer_label("manager"), do: "Billing manager"
  defp reviewer_label(_reviewer), do: "Billing specialist"

  defp queue_options do
    [
      {"All queues", "all"},
      {"Payments", "payments"},
      {"Fraud", "fraud"},
      {"Support", "support"}
    ]
  end

  defp reviewer_options do
    [
      {"Billing specialist", "billing"},
      {"Fraud analyst", "fraud"},
      {"Support lead", "support"},
      {"Billing manager", "manager"}
    ]
  end

  defp empty_dispute do
    %{
      id: "",
      customer: "No dispute selected",
      invoice: "",
      queue: "",
      risk: "low",
      amount: 0,
      evidence: "Open a billing dispute to review its evidence.",
      status: "open",
      status_variant: "warning",
      reviewer: "",
      note: ""
    }
  end

  defp disputes do
    [
      %{
        id: "duplicate-invoice",
        customer: "Acme Corp",
        invoice: "INV-2026-0148",
        queue: "payments",
        risk: "high",
        amount: 1420,
        evidence: "Customer reports a duplicate annual invoice charge after card retry.",
        status: "open",
        status_variant: "warning",
        reviewer: "",
        note: ""
      },
      %{
        id: "refund-window",
        customer: "Northstar Studio",
        invoice: "INV-2026-0191",
        queue: "support",
        risk: "medium",
        amount: 780,
        evidence: "Support promised a cancellation review inside the refund window.",
        status: "open",
        status_variant: "warning",
        reviewer: "",
        note: ""
      },
      %{
        id: "ach-reversal",
        customer: "Orbit Labs",
        invoice: "INV-2026-0220",
        queue: "fraud",
        risk: "high",
        amount: 2360,
        evidence: "ACH reversal requires fraud review before any credit is issued.",
        status: "open",
        status_variant: "warning",
        reviewer: "",
        note: ""
      },
      %{
        id: "service-credit",
        customer: "Ridge Health",
        invoice: "INV-2026-0176",
        queue: "payments",
        risk: "low",
        amount: 320,
        evidence: "SLA credit was approved by the billing manager.",
        status: "approved",
        status_variant: "success",
        reviewer: "manager",
        note: "Approved service credit after SLA review."
      },
      %{
        id: "fraud-denial",
        customer: "Bluebird Retail",
        invoice: "INV-2026-0133",
        queue: "fraud",
        risk: "high",
        amount: 1880,
        evidence: "Chargeback was denied after matched usage and signed order evidence.",
        status: "denied",
        status_variant: "danger",
        reviewer: "fraud",
        note: "Denied after fraud review matched usage and signed order evidence."
      }
    ]
  end
end
