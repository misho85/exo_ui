defmodule Storybook.Components.Footer do
  use PhoenixStorybook.Story, :page

  def doc, do: "Page footer with link columns and bottom section."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; max-width: 800px;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">With columns</h3>
        <ExoUI.Components.footer>
          <:column title="Company">
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
          </:column>
          <:column title="Product">
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Documentation</a>
          </:column>
          <:column title="Support">
            <a href="#">Help Center</a>
            <a href="#">Contact</a>
            <a href="#">Status</a>
          </:column>
        </ExoUI.Components.footer>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">With bottom section</h3>
        <ExoUI.Components.footer>
          <:column title="Resources">
            <a href="#">Docs</a>
            <a href="#">API</a>
          </:column>
          <:column title="Legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </:column>
          <:bottom>
            <p>2026 ExoUI. All rights reserved.</p>
          </:bottom>
        </ExoUI.Components.footer>
      </section>
    </div>
    """
  end
end
