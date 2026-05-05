defmodule Storybook.Components.AppShellWorkflow do
  use PhoenixStorybook.Story, :example

  def doc,
    do: "Production-style app shell combining navigation, tables, menus, forms, and overlays."

  @impl true
  def render(assigns) do
    assigns = assign(assigns, :accounts, accounts())

    ~H"""
    <div style="height: 720px; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); overflow: hidden; position: relative;">
      <ExoUI.Layouts.sidebar_layout id="app-shell-workflow" content_class="storybook-sidebar-content">
        <:brand>
          <span style="font-weight: 700; font-size: 1.125rem;">Exo Ops</span>
        </:brand>
        <:nav>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <ExoUI.Layouts.sidebar_item href="#" icon="layout-dashboard" label="Overview" active />
            <ExoUI.Layouts.sidebar_item href="#" icon="building-2" label="Accounts" badge={4} />
            <ExoUI.Layouts.sidebar_item href="#" icon="shield-alert" label="Risk queue" badge={2} />
            <ExoUI.Layouts.sidebar_item href="#" icon="settings" label="Settings" />
          </ul>
        </:nav>
        <:topbar_start>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <ExoUI.Components.button
              type="button"
              variant="outline"
              phx-click={ExoUI.Components.Overlay.show_command_palette("app-shell-command")}
            >
              Open command palette
            </ExoUI.Components.button>
            <ExoUI.Components.badge variant="warning">4 reviews</ExoUI.Components.badge>
          </div>
        </:topbar_start>
        <:topbar_end>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <ExoUI.Components.Overlay.dropdown_menu id="app-shell-actions" align="end">
              <:trigger>
                <ExoUI.Components.button type="button" variant="ghost">
                  Workspace actions
                </ExoUI.Components.button>
              </:trigger>
              <:entry type="label">Workspace</:entry>
              <:entry href="#" icon="download">Export CSV</:entry>
              <:entry href="#" icon="history">View activity</:entry>
              <:entry type="separator" />
              <:entry href="#" icon="settings">Workspace settings</:entry>
            </ExoUI.Components.Overlay.dropdown_menu>
            <ExoUI.Components.avatar name="Mina Ops" size="sm" />
          </div>
        </:topbar_end>
        <:footer>
          <div style="font-size: 0.75rem; color: var(--exo-muted-foreground);">
            Production workspace
          </div>
        </:footer>

        <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
          <ExoUI.Components.header>
            Account operations
            <:subtitle>Review risky customers, update owners, and archive stale segments.</:subtitle>
            <:actions>
              <ExoUI.Components.button
                type="button"
                variant="outline"
                phx-click={ExoUI.Components.Overlay.show_sheet("app-shell-filter-sheet")}
              >
                Filters
              </ExoUI.Components.button>
              <ExoUI.Components.button
                type="button"
                phx-click={ExoUI.Components.Overlay.show_drawer("app-shell-account-drawer")}
              >
                Review account
              </ExoUI.Components.button>
            </:actions>
          </ExoUI.Components.header>

          <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem;">
            <ExoUI.Components.stat_card
              title="At-risk ARR"
              value="$428K"
              trend="+8%"
              trend_direction="up"
              subtitle="last 7 days"
            />
            <ExoUI.Components.stat_card
              title="Pending reviews"
              value="18"
              trend="-3"
              trend_direction="down"
              subtitle="since Monday"
            />
            <ExoUI.Components.stat_card
              title="SLA health"
              value="94%"
              trend="+2%"
              trend_direction="up"
              subtitle="current queue"
            />
          </div>

          <ExoUI.Components.content_card title="Accounts requiring review">
            <:action>
              <ExoUI.Components.button
                type="button"
                size="sm"
                variant="ghost"
                phx-click={ExoUI.Components.Overlay.show_command_palette("app-shell-command")}
              >
                Commands
              </ExoUI.Components.button>
            </:action>

            <ExoUI.Components.DataDisplay.table
              id="app-shell-accounts"
              rows={@accounts}
              row_id={&row_id/1}
              row_label={&row_label/1}
              caption="Accounts requiring review"
            >
              <:col :let={account} label="Account">{account.name}</:col>
              <:col :let={account} label="Owner">
                <span style="color: var(--exo-muted-foreground);">{account.owner}</span>
              </:col>
              <:col :let={account} label="Risk" align="center">
                <ExoUI.Components.badge variant={account.risk_variant}>
                  {account.risk}
                </ExoUI.Components.badge>
              </:col>
              <:col :let={account} label="ARR" align="right">{account.arr}</:col>
              <:action :let={account}>
                <ExoUI.Components.button
                  type="button"
                  size="sm"
                  variant="ghost"
                  phx-click={ExoUI.Components.Overlay.show_drawer("app-shell-account-drawer")}
                >
                  Review {account.name}
                </ExoUI.Components.button>
              </:action>
            </ExoUI.Components.DataDisplay.table>
          </ExoUI.Components.content_card>
        </div>
      </ExoUI.Layouts.sidebar_layout>

      <ExoUI.Components.Overlay.command_palette
        id="app-shell-command"
        label="Account operations command palette"
        placeholder="Search account commands..."
        shortcut="ctrl+shift+k"
      >
        <:item
          label="Open filters"
          value="filters"
          search="filters segment owner risk"
          shortcut="F"
          click={ExoUI.Components.Overlay.show_sheet("app-shell-filter-sheet")}
        />
        <:item
          label="Open account review"
          value="review"
          search="account review drawer notes"
          shortcut="R"
          click={ExoUI.Components.Overlay.show_drawer("app-shell-account-drawer")}
        />
        <:item
          label="Export current queue"
          value="export"
          search="export queue csv"
          shortcut="E"
        />
      </ExoUI.Components.Overlay.command_palette>

      <ExoUI.Components.Overlay.sheet id="app-shell-filter-sheet" side="right">
        <:title>Review filters</:title>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <ExoUI.Components.Form.input
            id="app-shell-filter-query"
            name="filters[query]"
            label="Search accounts"
            value="enterprise renewal"
            description="Used for account name, owner, and review notes."
          />
          <ExoUI.Components.Form.input
            id="app-shell-filter-owner"
            name="filters[owner]"
            label="Risk owner"
            value=""
            errors={["Risk owner is required before exporting this segment."]}
          />
          <ExoUI.Components.Form.input
            id="app-shell-filter-note"
            name="filters[note]"
            type="textarea"
            rows="4"
            label="Review note"
            value="Focus on enterprise renewals with unresolved security reviews."
          />
        </div>
        <:footer>
          <ExoUI.Components.button
            type="button"
            variant="ghost"
            phx-click={ExoUI.Components.Overlay.hide_sheet("app-shell-filter-sheet")}
          >
            Close filters
          </ExoUI.Components.button>
          <ExoUI.Components.button
            type="button"
            phx-click={ExoUI.Components.Overlay.show_drawer("app-shell-account-drawer")}
          >
            Review filtered account
          </ExoUI.Components.button>
        </:footer>
      </ExoUI.Components.Overlay.sheet>

      <ExoUI.Components.Overlay.drawer id="app-shell-account-drawer" side="right">
        <:title>Acme account review</:title>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <ExoUI.Components.list>
            <:item title="Account">Acme Corp</:item>
            <:item title="Owner">Mina</:item>
            <:item title="Risk">High renewal risk</:item>
            <:item title="ARR">$128K</:item>
          </ExoUI.Components.list>
          <ExoUI.Components.Form.input
            id="app-shell-review-note"
            name="review[note]"
            type="textarea"
            rows="5"
            label="Internal note"
            value="Security review is blocked by missing audit evidence. Escalate before exporting the queue."
          />
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
            <ExoUI.Components.button
              type="button"
              variant="ghost"
              phx-click={ExoUI.Components.Overlay.hide_drawer("app-shell-account-drawer")}
            >
              Close review
            </ExoUI.Components.button>
            <ExoUI.Components.button
              type="button"
              variant="danger"
              phx-click={ExoUI.Components.Overlay.show_modal("app-shell-archive-confirm")}
            >
              Archive segment
            </ExoUI.Components.button>
          </div>
        </div>
      </ExoUI.Components.Overlay.drawer>

      <ExoUI.Components.Overlay.confirm_modal
        id="app-shell-archive-confirm"
        title="Archive account segment"
        message="This action stays open while the server validates filters, owners, and audit notes."
        confirm_text="Validate archive"
        cancel_text="Keep reviewing"
        variant="danger"
        close_on_confirm={false}
      />
    </div>
    """
  end

  def row_id(account), do: "app-shell-account-#{account.id}"
  def row_label(account), do: "Review #{account.name}"

  defp accounts do
    [
      %{
        id: 1,
        name: "Acme Corp",
        owner: "Mina",
        risk: "High",
        risk_variant: "danger",
        arr: "$128K"
      },
      %{
        id: 2,
        name: "Northstar",
        owner: "Ivan",
        risk: "Medium",
        risk_variant: "warning",
        arr: "$94K"
      },
      %{
        id: 3,
        name: "Orbit Labs",
        owner: "Sara",
        risk: "Medium",
        risk_variant: "warning",
        arr: "$76K"
      },
      %{
        id: 4,
        name: "Helio Bank",
        owner: "Mina",
        risk: "Low",
        risk_variant: "success",
        arr: "$130K"
      }
    ]
  end
end
