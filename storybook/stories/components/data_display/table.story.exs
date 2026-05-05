defmodule Storybook.Components.Table do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.table/1

  def template do
    """
    <div style="padding: 1rem; display: grid; gap: 2rem;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :users,
        attributes: %{
          id: "users-table",
          rows: users(),
          row_id: {:eval, "&Storybook.Components.Table.row_id/1"},
          caption: "Team members and access levels",
          row_label: {:eval, "&Storybook.Components.Table.row_label/1"}
        },
        slots: user_table_slots()
      },
      %Variation{
        id: :empty,
        attributes: %{id: "empty-users-table", rows: [], caption: "Archived members"},
        slots: [
          ~s|<:col label="Name">Name</:col>|,
          ~s|<:col label="Email">Email</:col>|,
          ~s|<:empty>No archived members.</:empty>|
        ]
      }
    ]
  end

  defp users do
    [
      %{id: 1, name: "Alice Smith", email: "alice@example.com", role: "Admin", status: "Active"},
      %{id: 2, name: "Bob Jones", email: "bob@example.com", role: "Editor", status: "Active"},
      %{
        id: 3,
        name: "Charlie Brown",
        email: "charlie@example.com",
        role: "Viewer",
        status: "Inactive"
      },
      %{id: 4, name: "Diana Prince", email: "diana@example.com", role: "Editor", status: "Active"}
    ]
  end

  def row_id(user), do: "user-#{user.id}"

  def row_label(user), do: "Open #{user.name}"

  defp user_table_slots do
    [
      ~s|<:col :let={user} label="Name">{user.name}</:col>|,
      ~s|<:col :let={user} label="Email">{user.email}</:col>|,
      ~s|<:col :let={user} label="Role"><ExoUI.Components.badge variant={if user.role == "Admin", do: "primary", else: "secondary"}>{user.role}</ExoUI.Components.badge></:col>|,
      ~s|<:col :let={user} label="Status" align="center"><ExoUI.Components.badge variant={if user.status == "Active", do: "success", else: "secondary"}>{user.status}</ExoUI.Components.badge></:col>|,
      ~s|<:action :let={user}><ExoUI.Components.button size="sm" variant="ghost">{user.name} →</ExoUI.Components.button></:action>|
    ]
  end
end
