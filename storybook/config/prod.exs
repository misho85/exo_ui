import Config

config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
  server: true

config :logger, level: :info

config :phoenix_storybook, :gzip, true
