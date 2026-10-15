import Config

# An empty variable is a missing one (KRF-616, the fleet's env_value rule from
# dinaric-hub DIN-450): `PHX_HOST=` or `${VAR:-}` in a compose file arrives as
# "", and `System.get_env/1` would hand that on as a value.
env_value = fn key ->
  case System.get_env(key) do
    nil -> nil
    "" -> nil
    value -> value
  end
end

if config_env() == :prod do
  host = env_value.("PHX_HOST") || raise "environment variable PHX_HOST is missing or empty"

  secret_key_base =
    env_value.("SECRET_KEY_BASE") ||
      raise "environment variable SECRET_KEY_BASE is missing or empty"

  port =
    case Integer.parse(env_value.("PORT") || "4000") do
      {port, ""} -> port
      _ -> raise "environment variable PORT is not an integer: #{inspect(System.get_env("PORT"))}"
    end

  config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    # HTTP/2 off: Traefik talks HTTP/1.1 to the container, so h2 here only
    # served whoever reaches the port directly on `dokploy-network`, and Bandit's
    # h2 stack carries EEF-CVE-2026-105659 with no fixed release (KRF-290).
    http: [ip: {0, 0, 0, 0, 0, 0, 0, 0}, port: port, http_2_options: [enabled: false]],
    secret_key_base: secret_key_base
end
