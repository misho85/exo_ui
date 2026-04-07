defmodule ExoUI.ComponentCase do
  @moduledoc """
  Test helper for ExoUI components.

  Provides a fluent, pipe-based DSL for asserting HTML structure
  rendered by Phoenix components using Floki for DOM parsing.

  ## Usage

      use ExoUI.ComponentCase, async: true

      test "renders button" do
        assigns = %{}

        ~H\"\"\"<.button variant="primary">Click</.button>\"\"\"
        |> parse_component()
        |> assert_component("button")
        |> assert_attribute("data-exo", "btn")
        |> assert_attribute("data-variant", "primary")
        |> assert_text("Click")
      end

  """

  use ExUnit.CaseTemplate

  using do
    quote do
      import Phoenix.LiveViewTest
      import Phoenix.Component
      import ExoUI.Components
      import ExoUI.ComponentCase
    end
  end

  @doc """
  Renders a HEEx template and parses it into a Floki HTML tree.
  Returns `{html_string, parsed_tree}`.
  """
  def parse_component(rendered) do
    html = Phoenix.LiveViewTest.rendered_to_string(rendered)
    {:ok, tree} = Floki.parse_fragment(html)
    {html, tree}
  end

  @doc """
  Asserts the root element matches a CSS selector.
  Returns the component tuple unchanged for pipe chaining.
  """
  def assert_component({html, tree} = component, selector) do
    found = Floki.find(tree, selector)

    assert length(found) > 0,
           "Expected to find element matching #{inspect(selector)} in:\n#{html}"

    component
  end

  @doc """
  Asserts an attribute exists with the expected value on elements matching a selector.
  If no selector is given, checks the root element.
  """
  def assert_attribute({html, tree} = component, attr, value, selector \\ nil) do
    elements =
      if selector do
        Floki.find(tree, selector)
      else
        Enum.filter(tree, &is_tuple/1)
      end

    found =
      Enum.any?(elements, fn el ->
        Floki.attribute([el], attr) |> Enum.member?(value)
      end)

    assert found,
           "Expected attribute #{inspect(attr)}=#{inspect(value)}#{if selector, do: " on #{inspect(selector)}", else: ""} in:\n#{html}"

    component
  end

  @doc """
  Asserts an attribute does NOT exist or does NOT have the given value.
  """
  def refute_attribute({html, tree} = component, attr, value, selector \\ nil) do
    elements =
      if selector do
        Floki.find(tree, selector)
      else
        Enum.filter(tree, &is_tuple/1)
      end

    found =
      Enum.any?(elements, fn el ->
        Floki.attribute([el], attr) |> Enum.member?(value)
      end)

    refute found,
           "Expected attribute #{inspect(attr)}=#{inspect(value)} to NOT be present#{if selector, do: " on #{inspect(selector)}", else: ""} in:\n#{html}"

    component
  end

  @doc """
  Asserts the component text contains the expected string.
  """
  def assert_text({html, tree} = component, expected) do
    text = Floki.text(tree)

    assert String.contains?(text, expected),
           "Expected text #{inspect(expected)} in rendered output:\n#{html}"

    component
  end

  @doc """
  Asserts the component text does NOT contain the expected string.
  """
  def refute_text({html, tree} = component, unexpected) do
    text = Floki.text(tree)

    refute String.contains?(text, unexpected),
           "Expected text #{inspect(unexpected)} to NOT be in rendered output:\n#{html}"

    component
  end

  @doc """
  Asserts a CSS class is present on elements matching the selector (or root).
  """
  def assert_class({html, tree} = component, expected_class, selector \\ nil) do
    elements =
      if selector do
        Floki.find(tree, selector)
      else
        tree
      end

    found =
      Enum.any?(elements, fn el ->
        classes =
          Floki.attribute([el], "class")
          |> Enum.flat_map(&String.split/1)

        expected_class
        |> String.split()
        |> Enum.all?(&(&1 in classes))
      end)

    assert found,
           "Expected class #{inspect(expected_class)}#{if selector, do: " on #{inspect(selector)}", else: ""} in:\n#{html}"

    component
  end

  @doc """
  Selects a nested element by CSS selector and runs assertions on it.
  The callback receives a `{html, sub_tree}` tuple for pipe chaining.
  """
  def select_element({html, tree}, selector, callback) when is_function(callback, 1) do
    found = Floki.find(tree, selector)

    assert length(found) > 0,
           "Expected to find element matching #{inspect(selector)} in:\n#{html}"

    callback.({html, found})
    {html, tree}
  end

  @doc """
  Asserts the count of elements matching a selector.
  """
  def assert_count({html, tree} = component, selector, expected_count) do
    found = Floki.find(tree, selector)

    assert length(found) == expected_count,
           "Expected #{expected_count} elements matching #{inspect(selector)}, found #{length(found)} in:\n#{html}"

    component
  end

  @doc """
  Asserts that no elements match the given selector.
  """
  def refute_element({html, tree} = component, selector) do
    found = Floki.find(tree, selector)

    refute found != [],
           "Expected NO elements matching #{inspect(selector)}, but found #{length(found)} in:\n#{html}"

    component
  end

  @doc """
  Returns the raw HTML string from the component tuple.
  """
  def raw_html({html, _tree}), do: html
end
