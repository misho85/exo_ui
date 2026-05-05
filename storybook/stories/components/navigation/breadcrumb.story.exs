defmodule Storybook.Components.Breadcrumb do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.DataDisplay.breadcrumb/1

  def template do
    """
    <div style="padding: 1rem;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :catalog,
        attributes: %{aria_label: "Catalog breadcrumb"},
        slots: [
          ~s|<:item href="#">Home</:item>|,
          ~s|<:item href="#">Products</:item>|,
          ~s|<:item>Current Page</:item>|
        ]
      },
      %Variation{
        id: :custom_separator,
        attributes: %{separator: "›"},
        slots: [
          ~s|<:item href="#">Dashboard</:item>|,
          ~s|<:item href="#">Settings</:item>|,
          ~s|<:item href="#">Team</:item>|,
          ~s|<:item>Members</:item>|
        ]
      },
      %Variation{
        id: :docs_current,
        attributes: %{aria_label: "Docs breadcrumb", separator: "→"},
        slots: [~s|<:item href="#">Home</:item>|, ~s|<:item href="#" current>About</:item>|]
      }
    ]
  end
end
