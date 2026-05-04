defmodule Storybook.Components.Avatar do
  use PhoenixStorybook.Story, :page

  def doc, do: "Avatar with auto-generated initials or image, in multiple sizes."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 2rem;">
      <div>
        <p style="font-size: 0.75rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
          Sizes
        </p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <ExoUI.Components.avatar name="Alice Smith" size="xs" />
          <ExoUI.Components.avatar name="Bob Jones" size="sm" />
          <ExoUI.Components.avatar name="Charlie Brown" size="md" />
          <ExoUI.Components.avatar name="Diana Prince" size="lg" />
          <ExoUI.Components.avatar name="Eve Adams" size="xl" />
        </div>
      </div>

      <div>
        <p style="font-size: 0.75rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
          With image
        </p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <ExoUI.Components.avatar name="Frank Ocean" src="https://i.pravatar.cc/150?img=3" size="sm" />
          <ExoUI.Components.avatar name="Frank Ocean" src="https://i.pravatar.cc/150?img=3" size="md" />
          <ExoUI.Components.avatar name="Frank Ocean" src="https://i.pravatar.cc/150?img=3" size="lg" />
        </div>
      </div>

      <div>
        <p style="font-size: 0.75rem; font-weight: 600; color: var(--exo-muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
          Group
        </p>
        <div style="display: flex;">
          <ExoUI.Components.avatar name="Alice Smith" size="md" />
          <div style="margin-left: -0.5rem;">
            <ExoUI.Components.avatar name="Bob Jones" size="md" />
          </div>
          <div style="margin-left: -0.5rem;">
            <ExoUI.Components.avatar name="Charlie Brown" size="md" />
          </div>
          <div style="margin-left: -0.5rem;">
            <ExoUI.Components.avatar name="Diana Prince" size="md" />
          </div>
        </div>
      </div>
    </div>
    """
  end
end
