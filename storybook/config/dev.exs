import Config

playwright? = System.get_env("PLAYWRIGHT") in ["1", "true"]

config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4100],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: String.duplicate("exo_storybook_dev_secret_key_", 3),
  watchers:
    if(playwright?,
      do: [],
      else: [
        esbuild: {Esbuild, :install_and_run, [:storybook, ~w(--sourcemap=inline --watch)]}
      ]
    )

config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/assets/.*(js|css)$",
      ~r"lib/storybook_web/.*(ex|heex)$",
      ~r"stories/.*(exs)$",
      ~r"../lib/.*(ex)$",
      ~r"../assets/css/.*(css)$"
    ]
  ]
