defmodule ExoUI.Components.TableTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders table with data" do
    assigns = %{users: [%{id: 1, name: "John", email: "john@example.com"}]}

    html =
      rendered_to_string(~H"""
      <.table id="users" rows={@users} row_id={fn u -> "user-#{u.id}" end}>
        <:col :let={u} label="Name">{u.name}</:col>
        <:col :let={u} label="Email">{u.email}</:col>
      </.table>
      """)

    assert html =~ ~s(data-exo="table")
    assert html =~ "Name"
    assert html =~ "Email"
    assert html =~ "John"
    assert html =~ "john@example.com"
    assert html =~ ~s(scope="col")
  end

  test "renders table with actions" do
    assigns = %{users: [%{id: 1, name: "John"}]}

    html =
      rendered_to_string(~H"""
      <.table id="users" rows={@users} row_id={fn u -> "user-#{u.id}" end}>
        <:col :let={u} label="Name">{u.name}</:col>
        <:action>Edit</:action>
      </.table>
      """)

    assert html =~ ~s(data-exo="table-actions")
    assert html =~ "Edit"
    assert html =~ "sr-only"
  end

  test "renders caption and empty state" do
    assigns = %{users: []}

    html =
      rendered_to_string(~H"""
      <.table id="users" rows={@users} caption="Team members" empty_label="No users found">
        <:col label="Name">Name</:col>
        <:col label="Email">Email</:col>
      </.table>
      """)

    assert html =~ ~s(data-exo="table-caption")
    assert html =~ "Team members"
    assert html =~ ~s(data-exo="table-empty")
    assert html =~ ~s(colspan="2")
    assert html =~ "No users found"
  end

  test "renders custom empty slot and column alignment" do
    assigns = %{rows: []}

    html =
      rendered_to_string(~H"""
      <.table id="orders" rows={@rows}>
        <:col label="Amount" align="end">$0</:col>
        <:empty>No orders yet</:empty>
      </.table>
      """)

    assert html =~ ~s(data-align="end")
    assert html =~ "No orders yet"
  end

  test "renders row labels for clickable rows" do
    assigns = %{users: [%{id: 1, name: "John"}]}

    html =
      rendered_to_string(~H"""
      <.table
        id="users"
        rows={@users}
        row_click={fn _u -> "select-user" end}
        row_label={fn u -> "Open #{u.name}" end}
      >
        <:col :let={u} label="Name">{u.name}</:col>
      </.table>
      """)

    assert html =~ ~s(data-clickable)
    assert html =~ ~s(aria-label="Open John")
    assert html =~ ~s(phx-click="select-user")
  end
end
