defmodule ExoUI.Storybook.Web.ErrorHTML do
  @moduledoc """
  Renders the error pages of the storybook endpoint.

  The storybook is mounted at `/`, so every unknown path reaches
  phoenix_storybook, which raises an exception carrying `plug_status: 404`.
  Without an error view Phoenix fell back to `ExoUI.ErrorView`, a module that
  does not exist, crashed while rendering the error and answered every unknown
  path with an empty 500 (KRF-246).
  """

  # "404.html" -> "Not Found", "500.html" -> "Internal Server Error".
  def render(template, _assigns) do
    Phoenix.Controller.status_message_from_template(template)
  end
end
