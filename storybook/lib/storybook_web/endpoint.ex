defmodule ExoUI.Storybook.Web.Endpoint do
  use Phoenix.Endpoint, otp_app: :exo_ui_storybook

  @session_options [
    store: :cookie,
    key: "_exo_storybook_key",
    signing_salt: "exo_storybook"
  ]

  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]],
    longpoll: false

  plug Plug.Static,
    at: "/",
    from: :exo_ui_storybook,
    gzip: false,
    only: ~w(assets)

  plug Plug.Static,
    at: "/exo",
    from: {:exo_ui, "priv/static"},
    gzip: false

  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId
  plug Plug.Parsers, parsers: [:urlencoded, :multipart, :json], json_decoder: Jason
  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug ExoUI.Storybook.Web.Router
end
