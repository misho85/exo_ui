defmodule ExoUI.Utils do
  @moduledoc """
  Shared utilities for ExoUI components.

  Provides CSS class building, conditional class helpers, and shared constants
  used across all component modules.
  """

  @doc """
  Builds a CSS class string from a list, filtering out `nil` and empty values.

  Accepts strings, lists, and nil values. Flattens nested lists,
  removes nils, trims whitespace, and joins with a single space.

  ## Examples

      iex> ExoUI.Utils.classes(["btn", nil, "btn-primary", ""])
      "btn btn-primary"

      iex> ExoUI.Utils.classes(["card", maybe_add_class(true, "card-bordered"), nil])
      "card card-bordered"

      iex> ExoUI.Utils.classes([nil, nil])
      nil

  """
  @spec classes(list()) :: String.t() | nil
  def classes(list) when is_list(list) do
    result =
      list
      |> List.flatten()
      |> Enum.reject(&is_nil/1)
      |> Enum.map(&to_string/1)
      |> Enum.map(&String.trim/1)
      |> Enum.reject(&(&1 == ""))
      |> Enum.join(" ")

    if result == "", do: nil, else: result
  end

  @doc """
  Conditionally returns a class string when `condition` is truthy.

  Returns the class string if the condition is truthy, `nil` otherwise.
  Designed to be used inside `classes/1` lists.

  ## Examples

      iex> ExoUI.Utils.maybe_add_class(true, "active")
      "active"

      iex> ExoUI.Utils.maybe_add_class(false, "active")
      nil

      iex> ExoUI.Utils.maybe_add_class(nil, "active")
      nil

  """
  @spec maybe_add_class(boolean() | nil, String.t()) :: String.t() | nil
  def maybe_add_class(condition, class) when is_binary(class) do
    if condition, do: class, else: nil
  end

  @doc """
  Returns the standard list of variant color names.
  """
  @spec colors() :: [String.t()]
  def colors, do: ~w(primary secondary danger warning success info)

  @doc """
  Returns the standard list of component sizes.
  """
  @spec sizes() :: [String.t()]
  def sizes, do: ~w(xs sm md lg xl)

  @doc """
  Returns the standard list of placement directions.
  """
  @spec directions() :: [String.t()]
  def directions, do: ~w(top bottom left right)

  @doc """
  Translates an error message.

  Uses the configured translate function from application config if available.
  Falls back to simple string interpolation.

  ## Configuration

  Configure a custom translate function in your application config:

      config :exo_ui, :translate_function, {MyAppWeb.CoreComponents, :translate_error}

  Or using gettext:

      config :exo_ui, :translate_function, {MyAppWeb.Gettext, :dgettext_error}

  If no function is configured, performs basic `%{key}` interpolation.
  """
  @spec translate_error({String.t(), keyword()}) :: String.t()
  def translate_error({msg, opts}) do
    case Application.get_env(:exo_ui, :translate_function) do
      {mod, fun} ->
        apply(mod, fun, [{msg, opts}])

      nil ->
        Enum.reduce(opts, msg, fn {key, value}, acc ->
          String.replace(acc, "%{#{key}}", fn _ -> to_string(value) end)
        end)
    end
  end
end
