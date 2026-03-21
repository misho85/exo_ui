defmodule ExoUI.Storybook.Web.Router do
  use ExoUI.Storybook.Web, :router
  import PhoenixStorybook.Router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  scope "/" do
    storybook_assets()
  end

  scope "/", ExoUI.Storybook.Web do
    pipe_through :browser

    live_storybook "/",
      backend_module: ExoUI.Storybook.Web.StorybookConfig,
      live_socket_path: "/live"
  end
end
