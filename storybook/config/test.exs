import Config

config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4102],
  secret_key_base: String.duplicate("exo_storybook_test_secret_key", 3),
  server: false

config :logger, level: :warning
