defmodule Storybook.Components.Input do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.Form.input/1

  def template do
    """
    <div style="max-width: 320px;" psb-code-hidden>
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :text,
        attributes: %{
          type: "text",
          id: "input-name",
          name: "name",
          value: "",
          label: "Full Name",
          description: "Use the name shown on invoices.",
          placeholder: "John Doe"
        }
      },
      %Variation{
        id: :with_prefix_suffix,
        attributes: %{
          type: "text",
          id: "input-budget",
          name: "budget",
          value: "1250",
          label: "Budget",
          prefix: "$",
          suffix: "USD"
        }
      },
      %Variation{
        id: :with_icons,
        attributes: %{
          type: "search",
          id: "input-search",
          name: "query",
          value: "northstar",
          label: "Search",
          leading_icon: "search",
          trailing_icon: "circle-question-mark"
        }
      },
      %Variation{
        id: :email,
        attributes: %{type: "email", id: "input-email", name: "email", value: "", label: "Email"}
      },
      %Variation{
        id: :password,
        attributes: %{
          type: "password",
          id: "input-password",
          name: "pass",
          value: "",
          label: "Password"
        }
      },
      %Variation{
        id: :textarea,
        attributes: %{
          type: "textarea",
          id: "input-bio",
          name: "bio",
          value: "",
          label: "Bio",
          description: "Max 160 characters."
        }
      },
      %Variation{
        id: :with_error,
        attributes: %{
          type: "text",
          id: "input-email-error",
          name: "email",
          value: "bad",
          label: "Email",
          description: "We'll send a confirmation link.",
          errors: ["is invalid"]
        }
      },
      %Variation{
        id: :checkbox,
        attributes: %{
          type: "checkbox",
          id: "input-agree",
          name: "agree",
          label: "I agree to the terms",
          description: "Required before creating an account.",
          value: "false"
        }
      },
      %Variation{
        id: :checkbox_error,
        attributes: %{
          type: "checkbox",
          id: "input-terms-error",
          name: "terms",
          label: "Accept terms",
          description: "You need to accept the current terms.",
          errors: ["must be accepted"],
          value: "false"
        }
      },
      %Variation{
        id: :checkbox_checked,
        attributes: %{
          type: "checkbox",
          id: "input-agree-checked",
          name: "agree",
          label: "Already checked",
          value: "true"
        }
      }
    ]
  end
end
