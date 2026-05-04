defmodule Storybook.Components.Fieldset do
  use PhoenixStorybook.Story, :page

  def doc, do: "Groups related form elements with an optional legend."

  def render(assigns) do
    ~H"""
    <div style="display: flex; flex-direction: column; gap: 2rem; padding: 1rem; max-width: 520px;">
      <ExoUI.Components.fieldset legend="Personal Information" description="Enter your details below.">
        <ExoUI.Components.input name="name" label="Name" type="text" value="" />
        <ExoUI.Components.input name="email" label="Email" type="email" value="" />
      </ExoUI.Components.fieldset>

      <ExoUI.Components.fieldset
        legend="Notification channels"
        description="Pick at least one way to receive product updates."
        errors={["Select at least one channel."]}
      >
        <ExoUI.Components.input
          type="checkbox"
          name="email_notifications"
          label="Email notifications"
          value="true"
        />
        <ExoUI.Components.input
          type="checkbox"
          name="sms_notifications"
          label="SMS notifications"
          value="false"
        />
      </ExoUI.Components.fieldset>

      <ExoUI.Components.fieldset legend="Disabled fieldset" disabled>
        <ExoUI.Components.input
          name="disabled_field"
          label="Can't edit this"
          type="text"
          value="disabled"
        />
      </ExoUI.Components.fieldset>
    </div>
    """
  end
end
