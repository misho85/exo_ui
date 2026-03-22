import Config

if config_env() == :prod do
  host = System.get_env("PHX_HOST") || raise "PHX_HOST env var is missing"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [ip: {0, 0, 0, 0, 0, 0, 0, 0}, port: port],
    secret_key_base: System.fetch_env!("SECRET_KEY_BASE")
end
