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
  end
end
