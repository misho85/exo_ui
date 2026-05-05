defmodule Storybook.Components.Fieldset do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.fieldset/1

  def template do
    """
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; max-width: 520px;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :personal_information,
        attributes: %{
          legend: "Personal Information",
          description: "Enter your details below."
        },
        slots: [
          ~s|<ExoUI.Components.input name="name" label="Name" type="text" value="" />|,
          ~s|<ExoUI.Components.input name="email" label="Email" type="email" value="" />|
        ]
      },
      %Variation{
        id: :with_error,
        attributes: %{
          legend: "Notification channels",
          description: "Pick at least one way to receive product updates.",
          errors: ["Select at least one channel."]
        },
        slots: [
          ~s|<ExoUI.Components.input type="checkbox" name="email_notifications" label="Email notifications" value="true" />|,
          ~s|<ExoUI.Components.input type="checkbox" name="sms_notifications" label="SMS notifications" value="false" />|
        ]
      },
      %Variation{
        id: :disabled,
        attributes: %{legend: "Disabled fieldset", disabled: true},
        slots: [
          ~s|<ExoUI.Components.input name="disabled_field" label="Can't edit this" type="text" value="disabled" />|
        ]
      }
    ]
  end
end
