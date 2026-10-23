defmodule Storybook.Components.OptionalField do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.optional_field/1

  def template do
    """
    <div style="padding: 1rem; max-width: 520px;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :closed,
        attributes: %{id: "optional-field-closed", label: "Compare-at price"},
        slots: [
          ~s|<ExoUI.Components.input name="compare_at_price" label="Compare-at price" type="text" value="" />|
        ]
      },
      %Variation{
        id: :open_with_value,
        attributes: %{id: "optional-field-open", label: "HS code", open: true},
        slots: [
          ~s|<ExoUI.Components.input name="hs_code" label="HS code" type="text" value="610910" />|
        ]
      }
    ]
  end
end
