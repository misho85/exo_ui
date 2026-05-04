defmodule Storybook.Components.Icon do
  use PhoenixStorybook.Story, :page

  def doc, do: "Lucide icons via ExoUI.Components.icon/1."

  def render(assigns) do
    icons = ~w(
      house search settings user users bell mail calendar
      check x plus minus arrow-left arrow-right chevron-down
      pencil trash-2 copy download upload eye eye-off
      star heart bookmark flag tag funnel arrow-up-narrow-wide
      chart-bar chart-pie trending-up trending-down
      circle-alert triangle-alert info circle-check
      lock lock-open key shield
      loader refresh-cw clock
      grid-2x2 list layout-dashboard
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
          <span style="font-size: 0.65rem; color: var(--exo-muted-foreground); text-align: center; word-break: break-all;">
            {name}
          </span>
        </div>
      </div>
    </div>
    """
  end
end
