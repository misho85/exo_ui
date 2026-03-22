defmodule Storybook.Components.Pagination do
  use PhoenixStorybook.Story, :page

  def doc, do: "Pagination with prev/next and ellipsis for large page counts."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem;">
      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">Page 1 of 5</p>
        <ExoUI.Components.pagination page={1} total_pages={5} patch_fn={fn p -> "#page-#{p}" end} />
      </div>
      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">Page 3 of 5</p>
        <ExoUI.Components.pagination page={3} total_pages={5} patch_fn={fn p -> "#page-#{p}" end} />
      </div>
      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">Page 5 of 5</p>
        <ExoUI.Components.pagination page={5} total_pages={5} patch_fn={fn p -> "#page-#{p}" end} />
      </div>
      <div>
        <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--exo-muted-foreground);">Page 4 of 20 (ellipsis)</p>
        <ExoUI.Components.pagination page={4} total_pages={20} patch_fn={fn p -> "#page-#{p}" end} />
      </div>
    </div>
    """
  end
end
