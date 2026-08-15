defmodule ExoUI.Components.InputTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders text input with data-exo attribute" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="text" name="email" value="" />|)
    assert html =~ ~s(data-exo="input")
    assert html =~ ~s(type="text")
    assert html =~ ~s(name="email")
  end

  test "renders input with label" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="text" name="email" value="" label="Email" />|)
    assert html =~ ~s(data-exo="label")
    assert html =~ "Email"
  end

  test "renders input with prefix and suffix adornments" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.input
  id="budget"
  type="text"
  name="budget"
  value="1250"
  description="Monthly cap"
  errors={["is too high"]}
  prefix="$"
  suffix="USD"
/>|)

    assert html =~ ~s(data-exo="input-frame")
    assert html =~ ~s(data-invalid)
    assert html =~ ~s(aria-describedby="budget-description budget-error")
    assert html =~ ~s(aria-invalid="true")
    assert html =~ ~s(data-exo="input-prefix")
    assert html =~ ~s(data-exo="input-suffix")
    assert html =~ ~s(data-adorned)
    assert html =~ "$"
    assert html =~ "USD"
    assert html =~ ~s(name="budget")
  end

  test "renders input icons as hidden decorative adornments" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="search" name="query" value="" leading_icon="search" trailing_icon="mail" />|
      )

    assert html =~ ~s(data-exo="input-icon")
    assert html =~ ~s(data-position="leading")
    assert html =~ ~s(data-position="trailing")
    assert html =~ ~s(aria-hidden="true")
    assert html =~ ~s(type="search")
  end

  test "renders textarea" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="textarea" name="bio" value="hello" />|)
    assert html =~ "textarea"
    assert html =~ ~s(data-exo="input")
  end

  test "renders single select input through ExoUI select" do
    assigns = %{options: [{"Active", "active"}, {"Inactive", "inactive"}]}

    html =
      rendered_to_string(~H|<.input
  id="status"
  type="select"
  name="status"
  value="active"
  label="Status"
  prompt="Choose status"
  options={@options}
/>|)

    assert html =~ ~s(data-exo="popover")
    assert html =~ ~s(data-exo-select="trigger")
    assert html =~ ~s(role="listbox")
    assert html =~ ~s(name="status")
    assert html =~ "Active"

    # The popover is the UI; the value rides on a real <select> underneath it
    # (see ExoUI.Components.Form.select/1). This used to assert the opposite —
    # a hidden input, and `refute html =~ "<select"` — which is exactly the
    # shape that made `phx-change` inert and blocked Phoenix.LiveViewTest.
    refute html =~ ~s(type="hidden")

    {:ok, doc} = Floki.parse_document(html)
    [native] = Floki.find(doc, ~s(select[data-exo="select-native"][name="status"]))
    assert Floki.attribute(Floki.find([native], "option[selected]"), "value") == ["active"]
  end

  test "keeps native select fallback for multiple select input" do
    assigns = %{options: [{"A", "a"}, {"B", "b"}]}

    html =
      rendered_to_string(~H|<.input
  id="tags"
  type="select"
  name="tags[]"
  value={["a"]}
  label="Tags"
  options={@options}
  multiple
/>|)

    assert html =~ "<select"
    assert html =~ ~s(multiple)
    assert html =~ ~s(name="tags[]")
  end

  test "renders hidden input" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="hidden" name="id" value="123" />|)
    assert html =~ ~s(type="hidden")
    assert html =~ ~s(value="123")
  end

  test "renders checkbox" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.input type="checkbox" name="agree" value="true" label="I agree" />|)

    assert html =~ ~s(type="checkbox")
    assert html =~ ~s(data-exo="checkbox-indicator")
    assert html =~ ~s(data-exo="icon")
    assert html =~ "I agree"
  end

  test "does not submit checkbox false fallback when disabled" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="checkbox" name="agree" disabled />|)

    assert html =~ ~s(type="hidden" name="agree" value="false" disabled)
  end

  test "does not render checkbox false fallback without a name" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="checkbox" label="Agree" />|)

    refute html =~ ~s(type="hidden")
  end

  test "shows errors" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="text" name="email" value="" errors={["is required"]} />|
      )

    assert html =~ ~s(data-invalid)
    assert html =~ "is required"
  end

  test "connects description and errors with aria-describedby" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="email" name="email" value="" description="Work email" errors={["is invalid"]} />|
      )

    assert html =~ ~s(id="email")
    assert html =~ ~s(id="email-description")
    assert html =~ ~s(id="email-error")
    assert html =~ ~s(aria-describedby="email-description email-error")
    assert html =~ ~s(aria-invalid="true")
    assert html =~ ~s(role="alert")
  end

  test "connects textarea description and errors with aria" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="textarea" name="bio" value="" description="Short bio" errors={["too short"]} />|
      )

    assert html =~ ~s(id="bio")
    assert html =~ ~s(aria-describedby="bio-description bio-error")
    assert html =~ ~s(aria-invalid="true")
  end

  test "connects checkbox description and errors with aria" do
    assigns = %{}

    html =
      rendered_to_string(~H|<.input
  type="checkbox"
  name="agree"
  label="Agree"
  description="Required for signup"
  errors={["must be accepted"]}
/>|)

    assert html =~ ~s(id="agree")
    assert html =~ ~s(id="agree-description")
    assert html =~ ~s(id="agree-error")
    assert html =~ ~s(aria-describedby="agree-description agree-error")
    assert html =~ ~s(aria-invalid="true")
  end

  test "renders description" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="text" name="email" value="" description="Your work email" />|
      )

    assert html =~ ~s(data-exo="field-description")
    assert html =~ "Your work email"
  end

  test "does not render description when not provided" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="text" name="email" value="" />|)
    refute html =~ "field-description"
  end

  test "renders textarea with description" do
    assigns = %{}

    html =
      rendered_to_string(
        ~H|<.input type="textarea" name="bio" value="" description="Tell us about yourself" />|
      )

    assert html =~ ~s(data-exo="field-description")
    assert html =~ "Tell us about yourself"
  end

  test "renders disabled input" do
    assigns = %{}
    html = rendered_to_string(~H|<.input type="text" name="email" value="" disabled />|)
    assert html =~ "disabled"
  end
end
