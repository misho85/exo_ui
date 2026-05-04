defmodule Storybook.Components.Footer do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Core.footer/1

  def template do
    """
    <div style="padding: 1rem; max-width: 50rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :columns,
        slots: [
          ~s|<:column title="Company"><a href="#">About</a><a href="#">Careers</a><a href="#">Blog</a></:column>|,
          ~s|<:column title="Product"><a href="#">Features</a><a href="#">Pricing</a><a href="#">Documentation</a></:column>|,
          ~s|<:column title="Support"><a href="#">Help Center</a><a href="#">Contact</a><a href="#">Status</a></:column>|
        ]
      },
      %Variation{
        id: :with_bottom,
        slots: [
          ~s|<:column title="Resources"><a href="#">Docs</a><a href="#">API</a></:column>|,
          ~s|<:column title="Legal"><a href="#">Privacy</a><a href="#">Terms</a></:column>|,
          ~s|<:bottom><p>2026 ExoUI. All rights reserved.</p></:bottom>|
        ]
      }
    ]
  end
end
