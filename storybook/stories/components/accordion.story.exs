defmodule Storybook.Components.Accordion do
  use PhoenixStorybook.Story, :page

  def doc, do: "Collapsible sections using native HTML details/summary."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 1rem; max-width: 600px;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Default (chevron)</h3>
        <ExoUI.Components.accordion id="default">
          <:item title="What is ExoUI?" open>
            ExoUI is a headless component library for Phoenix LiveView. All components emit semantic HTML with data-exo attributes — no CSS classes are applied.
          </:item>
          <:item title="How do I style components?">
            Import the exo.css theme file, or write your own CSS targeting the data-exo attributes. The library ships with a complete default theme.
          </:item>
          <:item title="Does it support dark mode?">
            Yes. The default theme includes a dark mode via the data-theme="dark" attribute on the root element, plus automatic support via prefers-color-scheme.
          </:item>
        </ExoUI.Components.accordion>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Plus / minus</h3>
        <ExoUI.Components.accordion id="plus" variant="plus">
          <:item title="What is ExoUI?" open>
            ExoUI is a headless component library for Phoenix LiveView. All components emit semantic HTML with data-exo attributes — no CSS classes are applied.
          </:item>
          <:item title="How do I style components?">
            Import the exo.css theme file, or write your own CSS targeting the data-exo attributes. The library ships with a complete default theme.
          </:item>
          <:item title="Does it support dark mode?">
            Yes. The default theme includes a dark mode via the data-theme="dark" attribute on the root element, plus automatic support via prefers-color-scheme.
          </:item>
        </ExoUI.Components.accordion>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Joined</h3>
        <ExoUI.Components.accordion id="joined" joined>
          <:item title="What is ExoUI?" open>
            ExoUI is a headless component library for Phoenix LiveView. All components emit semantic HTML with data-exo attributes — no CSS classes are applied.
          </:item>
          <:item title="How do I style components?">
            Import the exo.css theme file, or write your own CSS targeting the data-exo attributes. The library ships with a complete default theme.
          </:item>
          <:item title="Does it support dark mode?">
            Yes. The default theme includes a dark mode via the data-theme="dark" attribute on the root element, plus automatic support via prefers-color-scheme.
          </:item>
        </ExoUI.Components.accordion>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Joined + plus</h3>
        <ExoUI.Components.accordion id="joined-plus" variant="plus" joined>
          <:item title="What is ExoUI?" open>
            ExoUI is a headless component library for Phoenix LiveView. All components emit semantic HTML with data-exo attributes — no CSS classes are applied.
          </:item>
          <:item title="How do I style components?">
            Import the exo.css theme file, or write your own CSS targeting the data-exo attributes. The library ships with a complete default theme.
          </:item>
          <:item title="Does it support dark mode?">
            Yes. The default theme includes a dark mode via the data-theme="dark" attribute on the root element, plus automatic support via prefers-color-scheme.
          </:item>
        </ExoUI.Components.accordion>
      </section>
    </div>
    """
  end
end
