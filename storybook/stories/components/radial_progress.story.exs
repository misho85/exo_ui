defmodule Storybook.Components.RadialProgress do
  use PhoenixStorybook.Story, :page

  def doc, do: "Circular SVG progress indicator with optional value display."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 1rem;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Values</h3>
        <div style="display: flex; gap: 2rem; align-items: center;">
          <ExoUI.Components.radial_progress value={0} show_value={true} />
          <ExoUI.Components.radial_progress value={25} show_value={true} />
          <ExoUI.Components.radial_progress value={50} show_value={true} />
          <ExoUI.Components.radial_progress value={75} show_value={true} />
          <ExoUI.Components.radial_progress value={100} show_value={true} />
        </div>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Sizes</h3>
        <div style="display: flex; gap: 2rem; align-items: center;">
          <ExoUI.Components.radial_progress value={65} size="sm" show_value={true} />
          <ExoUI.Components.radial_progress value={65} size="md" show_value={true} />
          <ExoUI.Components.radial_progress value={65} size="lg" show_value={true} />
        </div>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Without value display</h3>
        <div style="display: flex; gap: 2rem; align-items: center;">
          <ExoUI.Components.radial_progress value={40} />
          <ExoUI.Components.radial_progress value={80} />
        </div>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Custom max</h3>
        <div style="display: flex; gap: 2rem; align-items: center;">
          <ExoUI.Components.radial_progress value={3} max={5} show_value={true} />
          <ExoUI.Components.radial_progress value={7} max={10} show_value={true} />
        </div>
      </section>
    </div>
    """
  end
end
