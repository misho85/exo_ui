import Config

if config_env() == :prod do
  host = System.get_env("PHX_HOST") || raise "PHX_HOST env var is missing"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    # HTTP/2 off: Traefik talks HTTP/1.1 to the container, so h2 here only
    # served whoever reaches the port directly on `dokploy-network`, and Bandit's
    # h2 stack carries EEF-CVE-2026-105659 with no fixed release (KRF-290).
    http: [ip: {0, 0, 0, 0, 0, 0, 0, 0}, port: port, http_2_options: [enabled: false]],
    secret_key_base: System.fetch_env!("SECRET_KEY_BASE")
end
