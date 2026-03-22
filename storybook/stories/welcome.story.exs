defmodule Storybook.Welcome do
  use PhoenixStorybook.Story, :page

  def doc do
    """
    ExoUI — Headless LiveView component library with default CSS theme.

    Browse components in the sidebar. Each component shows all variants,
    sizes, and states.
    """
  end

  def render(assigns) do
    ~H"""
    <div style="max-width: 600px; font-family: system-ui, sans-serif;">
      <h1>ExoUI</h1>
      <p>Headless LiveView components with CSS custom property theming.</p>
      <h2>Quick Start</h2>
      <pre><code>{"  {:exo_ui, git: \"https://github.com/misho85/exo_ui.git\"}"}</code></pre>
      <pre><code>{"@import \"../../deps/exo_ui/priv/static/exo.css\";"}</code></pre>
    </div>
    """
  end
end
