defmodule ExoUI.Components.PaginationTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders pagination" do
    assigns = %{patch_fn: &"/items?page=#{&1}"}
    html = rendered_to_string(~H|<.pagination page={1} total_pages={5} patch_fn={@patch_fn} />|)
    assert html =~ ~s(data-exo="pagination")
    assert html =~ ~s(aria-label="Pagination")
    assert html =~ ~s(aria-label="Previous page")
    assert html =~ ~s(aria-disabled="true")
    assert html =~ ~s(type="button")
    assert html =~ ~s(disabled)
    assert html =~ ~s(data-exo="pagination-status")
    assert html =~ "Page 1 of 5"
    assert html =~ ~s(aria-label="Page 1, current page")
    assert html =~ ~s(aria-label="Page 2")
  end

  test "hides when total_pages is 1" do
    assigns = %{patch_fn: &"/items?page=#{&1}"}
    html = rendered_to_string(~H|<.pagination page={1} total_pages={1} patch_fn={@patch_fn} />|)
    refute html =~ ~s(data-exo="pagination")
  end

  test "shows ellipsis for many pages" do
    assigns = %{patch_fn: &"/items?page=#{&1}"}
    html = rendered_to_string(~H|<.pagination page={1} total_pages={20} patch_fn={@patch_fn} />|)
    assert html =~ "…"
    assert html =~ ~s(data-exo="pagination-ellipsis" aria-hidden="true")
  end

  test "clamps out-of-range page values" do
    assigns = %{patch_fn: &"/items?page=#{&1}"}
    html = rendered_to_string(~H|<.pagination page={99} total_pages={3} patch_fn={@patch_fn} />|)

    assert html =~ ~s(aria-label="Page 3, current page")
    assert html =~ ~s(aria-label="Next page")
    assert html =~ ~s(aria-disabled="true")
    assert html =~ "Page 3 of 3"
  end

  test "supports custom page labels" do
    assigns = %{patch_fn: &"/items?page=#{&1}"}

    html =
      rendered_to_string(
        ~H|<.pagination page={2} total_pages={3} patch_fn={@patch_fn} page_label="Go to page %{page}" />|
      )

    assert html =~ ~s(aria-label="Go to page 2, current page")
  end

  test "supports event-driven pagination with target" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.pagination page={2} total_pages={3} on_click="set-page" target="#pager" />|
      )

    assert html =~ ~s(phx-click="set-page")
    assert html =~ ~s(phx-value-page="1")
    assert html =~ ~s(phx-value-page="2")
    assert html =~ ~s(phx-value-page="3")
    assert html =~ ~s(phx-target="#pager")
    assert html =~ ~s(aria-label="Page 2, current page")
    refute html =~ "<a "
  end
end
