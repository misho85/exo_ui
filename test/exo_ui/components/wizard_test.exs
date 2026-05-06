defmodule ExoUI.Components.WizardTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders wizard with steps" do
    assigns = %{
      steps: [
        %{id: "s1", label: "Details", status: :completed},
        %{id: "s2", label: "Payment", status: :current},
        %{id: "s3", label: "Confirm", status: :pending}
      ]
    }

    html = rendered_to_string(~H|<.wizard_sidebar steps={@steps} target="#wizard-owner" />|)
    {:ok, tree} = Floki.parse_fragment(html)

    assert html =~ ~s(data-exo="wizard")
    assert html =~ ~s(aria-label="Wizard progress")
    assert html =~ ~s(phx-target="#wizard-owner")
    assert html =~ ~s(data-status="completed")
    assert html =~ ~s(data-status="current")
    assert html =~ ~s(data-status="pending")
    assert html =~ ~s(type="button")
    assert html =~ ~s(aria-current="step")
    assert html =~ ~s(aria-disabled="true")
    assert html =~ ~s(data-disabled)
    assert html =~ ~s(disabled)
    assert html =~ ~s(aria-label="Step 2, Payment, current")
    assert html =~ "Details"
    assert html =~ "Payment"
    assert html =~ "Confirm"

    assert Floki.find(
             tree,
             ~s([data-status="completed"] [data-exo="wizard-indicator"] [data-exo="icon"])
           ) != []

    refute html =~ "✓"
  end
end
