import Config

playwright? = System.get_env("PLAYWRIGHT") in ["1", "true"]

config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4100],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: String.duplicate("exo_storybook_dev_secret_key_", 3),
  # Watchers go through `ExoUI.Storybook.Web.AssetWatcher`, not `{Esbuild, :install_and_run, …}`
  # directly: a binary that dies there leaves the built assets stale without a single log line
  # (KRF-460). `ExoUI.Storybook.Web.AssetWatcherTest` holds every entry to it.
  watchers:
    if(playwright?,
      do: [],
      else: [
        esbuild:
          {ExoUI.Storybook.Web.AssetWatcher, :watch,
           [Esbuild, :storybook, ~w(--sourcemap=inline --watch)]}
      ]
    )

config :exo_ui_storybook, ExoUI.Storybook.Web.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/assets/.*(js|css)\z",
      ~r"lib/storybook_web/.*(ex|heex)\z",
      ~r"stories/.*(exs)\z",
      ~r"../lib/.*(ex)\z",
      ~r"../assets/css/.*(css)\z"
    ]
  ]
