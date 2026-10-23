defmodule Storybook.Components.FormLayout do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.form_layout/1

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
        id: :main_and_aside,
        attributes: %{id: "form-layout-main-and-aside"},
        slots: [
          """
          <:main>
            <ExoUI.Components.content_card title="Basics">
              <ExoUI.Components.input name="title" label="Title" type="text" value="Linen shirt" />
            </ExoUI.Components.content_card>
          </:main>
          """,
          """
          <:aside>
            <ExoUI.Components.content_card title="Status">
              <ExoUI.Components.input name="status" label="Status" type="text" value="Draft" />
            </ExoUI.Components.content_card>
          </:aside>
          """
        ]
      },
      %Variation{
        id: :main_only,
        attributes: %{id: "form-layout-main-only"},
        slots: [
          """
          <:main>
            <ExoUI.Components.content_card title="Basics">
              <ExoUI.Components.input name="name" label="Name" type="text" value="Summer sale" />
            </ExoUI.Components.content_card>
          </:main>
          """
        ]
      }
    ]
  end
end
