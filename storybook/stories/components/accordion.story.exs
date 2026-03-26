defmodule Storybook.Components.Accordion do
  use PhoenixStorybook.Story, :page

  def doc, do: "Collapsible sections using native HTML details/summary."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 3rem; padding: 1rem; max-width: 600px;">
      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Default (single, chevron)</h3>
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
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Multiple</h3>
        <ExoUI.Components.accordion id="multiple" type="multiple">
          <:item title="What is ExoUI?" open>
            ExoUI is a headless component library for Phoenix LiveView. All components emit semantic HTML with data-exo attributes — no CSS classes are applied.
          </:item>
          <:item title="How do I style components?" open>
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

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Disabled items</h3>
        <ExoUI.Components.accordion id="disabled">
          <:item title="This item works normally" open>
            You can open and close this item.
          </:item>
          <:item title="This item is disabled" disabled>
            You should not be able to see this.
          </:item>
          <:item title="This also works">
            Another normal item.
          </:item>
        </ExoUI.Components.accordion>
      </section>

      <section>
        <h3 style="margin-bottom: 0.75rem; font-weight: 600;">Non-collapsible (single, cannot close)</h3>
        <ExoUI.Components.accordion id="non-collapsible" collapsible={false}>
          <:item title="Always one open" open>
            Once opened, you can't close this — only switch to another item.
          </:item>
          <:item title="Click me to switch">
            Now the previous item closed and this one opened.
          </:item>
          <:item title="Or click me">
            Same behavior — always exactly one open.
          </:item>
        </ExoUI.Components.accordion>
      </section>
    </div>
    """
  end
end
