defmodule ExoUI.Storybook.Web.NotFoundTest do
  # The storybook is mounted at "/", so every unknown path reaches
  # phoenix_storybook, which raises an exception carrying `plug_status: 404`.
  # The endpoint must turn that into a 404 page. Without an error view it
  # crashed while rendering the error and answered an empty 500 instead
  # (KRF-246).
  use ExUnit.Case, async: true

  import Plug.Conn
  import Phoenix.ConnTest

  @endpoint ExoUI.Storybook.Web.Endpoint

  test "the root still redirects to the welcome story" do
    assert redirected_to(get(build_conn(), "/"), 302) == "/welcome"
  end

  test "a known story renders" do
    assert html_response(get(build_conn(), "/welcome"), 200) =~ "ExoUI"
  end

  for path <- ["/health", "/does-not-exist", "/components/actions/nope"] do
    test "GET #{path} answers 404 Not Found, not 500" do
      conn = get_not_found(:get, unquote(path))

      assert conn.status == 404
      assert conn.resp_body =~ "Not Found"
      assert ["text/html" <> _] = get_resp_header(conn, "content-type")
    end
  end

  # The endpoint renders Phoenix.Router.NoRouteError and does not re-raise it,
  # so this one is a plain request rather than `assert_error_sent/2`.
  test "a method no route accepts answers 404, not 500" do
    conn = post(build_conn(), "/health")

    assert conn.status == 404
    assert conn.resp_body =~ "Not Found"
  end

  # `assert_error_sent/2` runs the request the way the endpoint does in
  # production: the exception is rendered by `render_errors`, then re-raised.
  defp get_not_found(method, path) do
    {status, headers, body} =
      assert_error_sent(404, fn -> dispatch(build_conn(), @endpoint, method, path) end)

    %Plug.Conn{status: status, resp_headers: headers, resp_body: body}
  end
end
