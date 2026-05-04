defmodule ExoUI.Components.ProgressTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component
  import ExoUI.Components

  test "renders progress with data-exo attribute" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={50} />|)
    assert html =~ ~s(data-exo="progress")
    assert html =~ ~s(data-exo="progress-field")
    assert html =~ ~s(data-exo="progress-bar")
  end

  test "renders progress with role progressbar" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={50} />|)
    assert html =~ ~s(role="progressbar")
  end

  test "renders progress with aria attributes" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={30} max={100} label="Upload" />|)
    assert html =~ ~s(aria-label="Upload")
    assert html =~ ~s(aria-valuenow="30")
    assert html =~ ~s(aria-valuemin="0")
    assert html =~ ~s(aria-valuemax="100")
    assert html =~ ~s(aria-valuetext="30%")
  end

  test "renders progress bar width as percentage" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={75} />|)
    assert html =~ ~s(width: 75%)
  end

  test "renders progress with custom max" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={5} max={10} />|)
    assert html =~ ~s(width: 50%)
    assert html =~ ~s(aria-valuemax="10")
  end

  test "renders progress with label" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={60} label="Upload" />|)
    assert html =~ ~s(data-exo="label")
    assert html =~ "Upload"
    assert html =~ ~s(data-exo="progress-header")
    assert html =~ ~s(data-exo="progress-value")
    assert html =~ "60%"
  end

  test "renders progress without label when not provided" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={50} />|)
    refute html =~ ~s(data-exo="progress-header")
  end

  test "renders progress at 0 percent" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={0} />|)
    assert html =~ ~s(width: 0%)
    assert html =~ ~s(aria-valuenow="0")
  end

  test "renders progress at 100 percent" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={100} />|)
    assert html =~ ~s(width: 100%)
  end

  test "caps progress at 100 percent when value exceeds max" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={150} max={100} />|)
    assert html =~ ~s(width: 100%)
    assert html =~ ~s(aria-valuenow="100")
    assert html =~ ~s(aria-valuetext="100%")
  end

  test "clamps progress at 0 percent when value is negative" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={-10} max={100} />|)
    assert html =~ ~s(width: 0%)
    assert html =~ ~s(aria-valuenow="0")
    assert html =~ ~s(aria-valuetext="0%")
  end

  test "handles zero max gracefully" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={50} max={0} />|)
    assert html =~ ~s(width: 0%)
    assert html =~ ~s(aria-valuenow="0")
    assert html =~ ~s(aria-valuemax="0")
  end

  test "renders progress with class" do
    assigns = %{}
    html = rendered_to_string(~H|<.progress value={50} class="my-progress" />|)
    assert html =~ ~s(class="my-progress")
  end
end
