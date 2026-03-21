defmodule ExoUI.Storybook.Web.StorybookConfig do
  use PhoenixStorybook,
    otp_app: :exo_ui_storybook,
    content_path: Path.expand("../../stories", __DIR__),
    css_path: "/exo/exo.css",
    js_path: "/assets/storybook.js",
    sandbox_class: "exo-sandbox",
    title: "ExoUI",
    themes: [
      default: [name: "Light", dropdown_class: ""],
      dark: [name: "Dark", dropdown_class: ""]
    ],
    themes_strategies: [
      sandbox_class: "exo"
    ]
end
