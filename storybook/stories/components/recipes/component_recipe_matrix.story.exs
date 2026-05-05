defmodule Storybook.Components.ComponentRecipeMatrix do
  use PhoenixStorybook.Story, :example

  def doc,
    do:
      "Executable recipe matrix for high-traffic component states and table/menu/overlay composition."

  @impl true
  def render(assigns) do
    assigns = assign(assigns, :records, records())

    ~H"""
    <div
      id="component-recipe-matrix"
      data-exo="component-recipe-matrix"
      style="min-height: 720px; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;"
    >
      <ExoUI.Components.header>
        Component recipe matrix
        <:subtitle>
          Common action, field, table, menu, and overlay states in one executable reference.
        </:subtitle>
        <:actions>
          <ExoUI.Components.button
            type="button"
            variant="outline"
            phx-click={ExoUI.Components.Overlay.show_command_palette("recipe-command")}
          >
            Open command palette
          </ExoUI.Components.button>
          <ExoUI.Components.button
            type="button"
            phx-click={ExoUI.Components.Overlay.show_drawer("recipe-drawer")}
          >
            Open edit drawer
          </ExoUI.Components.button>
        </:actions>
      </ExoUI.Components.header>

      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;">
        <ExoUI.Components.content_card title="Action states">
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <ExoUI.Components.button type="button">Default action</ExoUI.Components.button>
            <ExoUI.Components.button type="button" variant="outline">
              Secondary action
            </ExoUI.Components.button>
            <ExoUI.Components.button type="button" variant="danger">
              Destructive action
            </ExoUI.Components.button>
            <ExoUI.Components.button type="button" variant="danger" disabled>
              Disabled destructive
            </ExoUI.Components.button>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;">
            <ExoUI.Components.badge variant="success">Ready</ExoUI.Components.badge>
            <ExoUI.Components.badge variant="warning">Needs review</ExoUI.Components.badge>
            <ExoUI.Components.badge variant="danger">Blocked</ExoUI.Components.badge>
          </div>
        </ExoUI.Components.content_card>

        <ExoUI.Components.content_card title="Field states">
          <div style="display: grid; gap: 0.875rem;">
            <ExoUI.Components.Form.input
              id="recipe-owner"
              name="recipe[owner]"
              label="Owner"
              value=""
              description="Required before saving this recipe record."
              errors={["Owner is required before saving."]}
            />
            <ExoUI.Components.Form.input
              id="recipe-locked"
              name="recipe[locked]"
              label="Locked field"
              value="Imported from billing"
              disabled
            />
            <ExoUI.Components.Form.select
              id="recipe-priority"
              name="recipe[priority]"
              label="Priority"
              value="high"
              description="Select keeps label, error, and hidden value wiring."
            >
              <:option value="low" icon="arrow-down">Low</:option>
              <:option value="medium" icon="minus">Medium</:option>
              <:option value="high" icon="arrow-up">High</:option>
              <:option value="blocked" disabled>Blocked by policy</:option>
            </ExoUI.Components.Form.select>
          </div>
        </ExoUI.Components.content_card>
      </div>

      <ExoUI.Components.content_card title="Table and empty states">
        <ExoUI.Components.DataDisplay.table
          id="recipe-state-table"
          rows={@records}
          row_id={&row_id/1}
          row_label={&row_label/1}
          caption="Recipe records"
        >
          <:col :let={record} label="Name">{record.name}</:col>
          <:col :let={record} label="Owner">{record.owner}</:col>
          <:col :let={record} label="Status">
            <ExoUI.Components.badge variant={record.variant}>{record.status}</ExoUI.Components.badge>
          </:col>
          <:action :let={record}>
            <ExoUI.Components.Overlay.dropdown_menu id={"recipe-row-actions-#{record.id}"}>
              <:trigger>
                <ExoUI.Components.button type="button" size="sm" variant="ghost">
                  Actions for {record.name}
                </ExoUI.Components.button>
              </:trigger>
              <:entry
                icon="pencil"
                click={ExoUI.Components.Overlay.show_drawer("recipe-drawer")}
              >
                Edit row
              </:entry>
              <:entry type="separator" />
              <:entry
                icon="trash-2"
                variant="danger"
                click={ExoUI.Components.Overlay.show_modal("recipe-confirm")}
              >
                Validate delete
              </:entry>
            </ExoUI.Components.Overlay.dropdown_menu>
          </:action>
        </ExoUI.Components.DataDisplay.table>

        <div style="margin-top: 1rem;">
          <ExoUI.Components.DataDisplay.table
            id="recipe-empty-table"
            rows={[]}
            caption="Archived recipe records"
          >
            <:col label="Name">Name</:col>
            <:col label="Owner">Owner</:col>
            <:empty>No archived recipe records.</:empty>
          </ExoUI.Components.DataDisplay.table>
        </div>
      </ExoUI.Components.content_card>

      <ExoUI.Components.Overlay.command_palette
        id="recipe-command"
        label="Recipe command palette"
        placeholder="Search recipe commands..."
        shortcut="ctrl+shift+r"
      >
        <:item
          label="Open edit drawer"
          value="drawer"
          search="drawer edit form field"
          shortcut="D"
          click={ExoUI.Components.Overlay.show_drawer("recipe-drawer")}
        />
        <:item
          label="Open guarded confirm"
          value="confirm"
          search="modal confirm destructive"
          shortcut="C"
          click={ExoUI.Components.Overlay.show_modal("recipe-confirm")}
        />
      </ExoUI.Components.Overlay.command_palette>

      <ExoUI.Components.Overlay.drawer id="recipe-drawer" side="right">
        <:title>Edit recipe record</:title>
        <div style="display: grid; gap: 1rem;">
          <ExoUI.Components.Form.input
            id="recipe-drawer-owner"
            name="drawer[owner]"
            label="Owner"
            value=""
            description="Drawer forms keep the same field error contract."
            errors={["Owner is required."]}
          />
          <ExoUI.Components.Form.input
            id="recipe-drawer-note"
            name="drawer[note]"
            label="Review note"
            type="textarea"
            rows="4"
            value="Check table row ownership, validation state, and destructive confirmation before saving."
          />
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
            <ExoUI.Components.button
              type="button"
              variant="ghost"
              phx-click={ExoUI.Components.Overlay.hide_drawer("recipe-drawer")}
            >
              Close drawer
            </ExoUI.Components.button>
            <ExoUI.Components.button
              type="button"
              variant="danger"
              phx-click={ExoUI.Components.Overlay.show_modal("recipe-confirm")}
            >
              Open confirm modal
            </ExoUI.Components.button>
          </div>
        </div>
      </ExoUI.Components.Overlay.drawer>

      <ExoUI.Components.Overlay.confirm_modal
        id="recipe-confirm"
        title="Validate destructive recipe"
        message="This confirm stays open to demonstrate server-validated destructive actions."
        confirm_text="Validate recipe"
        cancel_text="Keep editing"
        close_on_confirm={false}
      />
    </div>
    """
  end

  def row_id(record), do: "recipe-record-#{record.id}"
  def row_label(record), do: "Open recipe record #{record.name}"

  defp records do
    [
      %{id: "alpha", name: "Alpha", owner: "Mina", status: "Ready", variant: "success"},
      %{id: "beta", name: "Beta", owner: "Sara", status: "Blocked", variant: "danger"}
    ]
  end
end
