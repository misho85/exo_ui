defmodule Storybook.Components.Table do
  use PhoenixStorybook.Story, :page

  def doc, do: "Data table with columns and optional action column."

  def render(assigns) do
    users = [
      %{id: 1, name: "Alice Smith", email: "alice@example.com", role: "Admin", status: "Active"},
      %{id: 2, name: "Bob Jones", email: "bob@example.com", role: "Editor", status: "Active"},
      %{id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "Viewer", status: "Inactive"},
      %{id: 4, name: "Diana Prince", email: "diana@example.com", role: "Editor", status: "Active"}
    ]

    assigns = assign(assigns, :users, users)

    ~H"""
    <div style="padding: 1rem;">
      <ExoUI.Components.table id="users-table" rows={@users} row_id={fn u -> "user-#{u.id}" end}>
        <:col :let={u} label="Name">{u.name}</:col>
        <:col :let={u} label="Email">{u.email}</:col>
        <:col :let={u} label="Role">
          <ExoUI.Components.badge variant={if u.role == "Admin", do: "primary", else: "secondary"}>
            {u.role}
          </ExoUI.Components.badge>
        </:col>
        <:col :let={u} label="Status">
          <ExoUI.Components.badge variant={if u.status == "Active", do: "success", else: "secondary"}>
            {u.status}
          </ExoUI.Components.badge>
        </:col>
        <:action :let={u}>
          <ExoUI.Components.button size="sm" variant="ghost">{u.name} →</ExoUI.Components.button>
        </:action>
      </ExoUI.Components.table>
    </div>
    """
  end
end
