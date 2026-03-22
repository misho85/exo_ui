defmodule Storybook.Components.Icon do
  use PhoenixStorybook.Story, :page

  def doc, do: "Lucide icons via ExoUI.Components.icon/1."

  def render(assigns) do
    icons = ~w(
      home search settings user users bell mail calendar
      check x plus minus arrow-left arrow-right chevron-down
      edit trash-2 copy download upload eye eye-off
      star heart bookmark flag tag filter sort-asc
      bar-chart-2 pie-chart trending-up trending-down
      alert-circle alert-triangle info check-circle
      lock unlock key shield
      loader refresh-cw clock
      grid list layout-dashboard
    )

    assigns = assign(assigns, :icons, icons)

    ~H"""
    <div style="padding: 1rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 1.5rem;">
        <div
          :for={name <- @icons}
          style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; width: 5rem;"
        >
          <ExoUI.Components.icon name={name} class="size-6" />
          <span style="font-size: 0.65rem; color: var(--exo-muted-foreground); text-align: center; word-break: break-all;">{name}</span>
        </div>
      </div>
    </div>
    """
  end
end
