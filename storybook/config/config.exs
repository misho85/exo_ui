import Config

config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  pubsub_server: ExoUI.Storybook.PubSub,
  live_view: [signing_salt: "exo_storybook"]

config :esbuild,
  version: "0.24.2",
  storybook: [
    args: ~w(js/storybook.js --bundle --target=es2020 --outdir=../priv/static/assets),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => Path.expand("../../deps", __DIR__)}
  ]

config :phoenix_storybook, :gzip, false

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

import_config "#{config_env()}.exs"
