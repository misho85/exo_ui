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

    html = rendered_to_string(~H|<.wizard_sidebar steps={@steps} />|)
    assert html =~ ~s(data-exo="wizard")
    assert html =~ ~s(data-status="completed")
    assert html =~ ~s(data-status="current")
    assert html =~ ~s(data-status="pending")
    assert html =~ "Details"
    assert html =~ "Payment"
    assert html =~ "Confirm"
    assert html =~ "✓"
  end
end
