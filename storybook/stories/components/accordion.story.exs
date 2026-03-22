defmodule Storybook.Components.Accordion do
  use PhoenixStorybook.Story, :page

  def doc, do: "Collapsible sections using native HTML details/summary."

  def render(assigns) do
    ~H"""
    <div style="padding: 1rem; max-width: 600px;">
      <ExoUI.Components.accordion id="faq">
        <:item title="What is ExoUI?" open>
          ExoUI is a headless component library for Phoenix LiveView. All components emit semantic HTML with data-exo attributes — no CSS classes are applied.
        </:item>
        <:item title="How do I style components?">
          Import the exo.css theme file, or write your own CSS targeting the data-exo attributes. The library ships with a complete default theme.
        </:item>
        <:item title="Does it support dark mode?">
          Yes. The default theme includes a dark mode via the data-theme="dark" attribute on the root element, plus automatic support via prefers-color-scheme.
        </:item>
        <:item title="Can I use it outside LiveView?">
          The components use Phoenix.Component, so they work in any Phoenix template. Some interactive features (modals, dropdowns) require LiveView JS commands.
        </:item>
      </ExoUI.Components.accordion>
    </div>
    """
  end
end
