defmodule ExoUI.Components.FormTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest
  import Phoenix.Component, except: [form: 1]
  import ExoUI.Components

  test "renders form with data-exo attribute" do
    assigns = %{}
    html = rendered_to_string(~H|<.form for={%{}}>Submit</.form>|)
    assert html =~ ~s(data-exo="form")
    assert html =~ "Submit"
  end

  test "renders form with class" do
    assigns = %{}
    html = rendered_to_string(~H|<.form for={%{}} class="my-form">Content</.form>|)
    assert html =~ ~s(class="my-form")
  end

  test "renders form with as attribute" do
    assigns = %{}
    html = rendered_to_string(~H|<.form for={%{}} as={:user}>Content</.form>|)
    assert html =~ "Content"
  end

  test "renders form with action attribute" do
    assigns = %{}
    html = rendered_to_string(~H|<.form for={%{}} action="/submit">Content</.form>|)
    assert html =~ ~s(action="/submit")
  end

  test "renders form with novalidate" do
    assigns = %{}
    html = rendered_to_string(~H|<.form for={%{}} novalidate>Content</.form>|)
    assert html =~ "novalidate"
  end

  test "renders form with method" do
    assigns = %{}
    html = rendered_to_string(~H|<.form for={%{}} method="put">Content</.form>|)
    assert html =~ "put"
  end
end
