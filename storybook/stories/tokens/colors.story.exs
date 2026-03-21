defmodule Storybook.Tokens.Colors do
  use PhoenixStorybook.Story, :page

  def doc, do: "ExoUI color token palette"

  def render(assigns) do
    ~H"""
    <div style="font-family: system-ui; display: flex; flex-direction: column; gap: 2rem;">
      <section>
        <h2>Semantic Colors</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
          <.color_swatch name="Primary" bg="var(--exo-primary)" fg="var(--exo-primary-foreground)" />
          <.color_swatch name="Secondary" bg="var(--exo-secondary)" fg="var(--exo-secondary-foreground)" />
          <.color_swatch name="Danger" bg="var(--exo-danger)" fg="var(--exo-danger-foreground)" />
          <.color_swatch name="Warning" bg="var(--exo-warning)" fg="var(--exo-warning-foreground)" />
          <.color_swatch name="Success" bg="var(--exo-success)" fg="var(--exo-success-foreground)" />
          <.color_swatch name="Info" bg="var(--exo-info)" fg="var(--exo-info-foreground)" />
        </div>
      </section>
      <section>
        <h2>Surfaces</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
          <.color_swatch name="Background" bg="var(--exo-background)" fg="var(--exo-foreground)" />
          <.color_swatch name="Card" bg="var(--exo-card)" fg="var(--exo-card-foreground)" />
          <.color_swatch name="Muted" bg="var(--exo-muted)" fg="var(--exo-muted-foreground)" />
        </div>
      </section>
    </div>
    """
  end

  defp color_swatch(assigns) do
    ~H"""
    <div style={"background: #{@bg}; color: #{@fg}; padding: 1rem; border-radius: var(--exo-radius); border: 1px solid var(--exo-border);"}>
      <div style="font-weight: 600;"><%= @name %></div>
      <div style="font-size: 0.75rem; opacity: 0.8;">foreground text</div>
    </div>
    """
  end
end
