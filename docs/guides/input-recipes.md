# Input Recipes

Use this pattern when inputs need production validation and accessibility state:
text/email fields, textarea limits, checkbox requirements, readonly values,
disabled controls, and submit safety.

## Structure

```heex
<ExoUI.Components.Form.form
  for={%{}}
  as={:profile}
  phx-change="validate-profile"
  phx-submit="save-profile"
>
  <ExoUI.Components.Form.input
    id="profile-name"
    name="profile[name]"
    label="Display name"
    value={@draft.name}
    description="Use at least 3 visible characters."
    errors={Map.get(@errors, :name, [])}
    required
  />

  <ExoUI.Components.Form.input
    id="profile-email"
    type="email"
    name="profile[email]"
    label="Work email"
    value={@draft.email}
    description="Used for assignment notifications."
    errors={Map.get(@errors, :email, [])}
    autocomplete="email"
    required
  />

  <ExoUI.Components.Form.input
    id="profile-notes"
    type="textarea"
    name="profile[notes]"
    label="Reviewer notes"
    value={@draft.notes}
    description={"#{String.length(@draft.notes)}/120 characters."}
    errors={Map.get(@errors, :notes, [])}
  />

  <ExoUI.Components.Form.input
    id="profile-terms"
    type="checkbox"
    name="profile[terms]"
    label="I confirm that required fields are accurate"
    value={@draft.terms}
    description="Required before saving."
    errors={Map.get(@errors, :terms, [])}
  />

  <.button type="submit" disabled={@errors != %{}}>
    Save profile
  </.button>
</ExoUI.Components.Form.form>
```

## Event Shape

```elixir
def handle_event("validate-profile", %{"profile" => params}, socket) do
  draft = merge_profile(socket.assigns.draft, params)
  errors = validate_profile(draft)

  {:noreply, assign(socket, draft: draft, errors: errors)}
end

def handle_event("save-profile", %{"profile" => params}, socket) do
  draft = merge_profile(socket.assigns.draft, params)
  errors = validate_profile(draft)

  if errors == %{} do
    {:noreply, assign(socket, draft: draft, saved: draft, errors: %{})}
  else
    {:noreply, assign(socket, draft: draft, errors: errors)}
  end
end
```

## Rules

- Always pass stable `id` values when a field has `description` or `errors`.
- Keep `description` visible for helper text; ExoUI joins description and first
  error ID into `aria-describedby`.
- Use `type="email"` and browser-native attributes like `autocomplete`,
  `required`, `readonly`, and `disabled` instead of custom data flags.
- Remember that readonly controls still submit values, while disabled controls
  do not submit values.
- Keep checkbox validation on the same `input/1` component so the hidden
  `false` input, visible checkbox, description, and error all stay wired.
- Disable submit while server-owned errors exist, and re-enable it only after
  `phx-change` clears those errors.
- Browser coverage should verify invalid ARIA state, `aria-describedby`,
  `role="alert"` errors, readonly/disabled behavior, checkbox changes,
  textarea limits, and successful submit/reset state.
