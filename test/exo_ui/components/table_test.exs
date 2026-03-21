defmodule ExoUI.Components.TableTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders table with data" do
    assigns = %{users: [%{id: 1, name: "John", email: "john@example.com"}]}
    html = rendered_to_string(~H"""
    <.table id="users" rows={@users} row_id={fn u -> "user-#{u.id}" end}>
      <:col label="Name" :let={u}>{u.name}</:col>
      <:col label="Email" :let={u}>{u.email}</:col>
    </.table>
    """)
    assert html =~ ~s(data-exo="table")
    assert html =~ "Name"
    assert html =~ "Email"
    assert html =~ "John"
    assert html =~ "john@example.com"
  end

  test "renders table with actions" do
    assigns = %{users: [%{id: 1, name: "John"}]}
    html = rendered_to_string(~H"""
    <.table id="users" rows={@users} row_id={fn u -> "user-#{u.id}" end}>
      <:col label="Name" :let={u}>{u.name}</:col>
      <:action>Edit</:action>
    </.table>
    """)
    assert html =~ ~s(data-exo="table-actions")
    assert html =~ "Edit"
    assert html =~ "sr-only"
  end
end
