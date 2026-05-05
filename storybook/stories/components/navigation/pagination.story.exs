defmodule Storybook.Components.Pagination do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.pagination/1

  def template do
    """
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :first_page,
        attributes: %{
          page: 1,
          total_pages: 5,
          patch_fn: {:eval, "&Storybook.Components.Pagination.page_patch/1"}
        }
      },
      %Variation{
        id: :middle_page,
        attributes: %{
          page: 3,
          total_pages: 5,
          patch_fn: {:eval, "&Storybook.Components.Pagination.page_patch/1"}
        }
      },
      %Variation{
        id: :last_page,
        attributes: %{
          page: 5,
          total_pages: 5,
          patch_fn: {:eval, "&Storybook.Components.Pagination.page_patch/1"}
        }
      },
      %Variation{
        id: :with_ellipsis,
        attributes: %{
          page: 4,
          total_pages: 20,
          patch_fn: {:eval, "&Storybook.Components.Pagination.page_patch/1"}
        }
      },
      %Variation{
        id: :custom_labels,
        attributes: %{
          page: 2,
          total_pages: 4,
          patch_fn: {:eval, "&Storybook.Components.Pagination.report_patch/1"},
          aria_label: "Report pages",
          page_label: "Open report page %{page}"
        }
      }
    ]
  end

  def page_patch(page), do: "#page-#{page}"
  def report_patch(page), do: "#report-page-#{page}"
end
