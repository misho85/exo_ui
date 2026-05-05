defmodule Storybook.Layouts.SidebarLayout do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Layouts.sidebar_layout/1

  def layout, do: :one_column

  def template do
    """
    <div style="height: 500px; border: 1px solid var(--exo-border); border-radius: var(--exo-radius); overflow: hidden; position: relative;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :app_shell,
        attributes: %{content_class: "storybook-sidebar-content"},
        slots: [
          ~s|<:brand><span style="font-weight: 700; font-size: 1.125rem;">ExoUI</span></:brand>|,
          ~s|<:nav><ul style="list-style: none; padding: 0; margin: 0;"><ExoUI.Layouts.sidebar_item href="#" icon="house" label="Dashboard" active /><ExoUI.Layouts.sidebar_item href="#" icon="users" label="Users" badge={3} /><ExoUI.Layouts.sidebar_item href="#" icon="chart-bar" label="Analytics" /><ExoUI.Layouts.sidebar_item href="#" icon="settings" label="Settings" /></ul></:nav>|,
          ~s|<:topbar_end><ExoUI.Components.avatar name="Admin User" size="sm" /></:topbar_end>|,
          ~s|<:footer><div style="font-size: 0.75rem; color: var(--exo-muted-foreground);">ExoUI v0.1.0</div></:footer>|,
          ~s|<div style="padding: 1rem;"><ExoUI.Components.header>Dashboard<:subtitle>Welcome back. Here's what's happening today.</:subtitle></ExoUI.Components.header><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;"><ExoUI.Components.stat_card title="Users" value="1,204" trend="+12%" trend_direction="up" /><ExoUI.Components.stat_card title="Revenue" value="$8,400" trend="+4%" trend_direction="up" /><ExoUI.Components.stat_card title="Orders" value="342" trend="-2%" trend_direction="down" /></div></div>|
        ]
      }
    ]
  end
end
