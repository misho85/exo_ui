#!/usr/bin/env node
// Writes daisyUI's built-in themes as ExoUI themes:
//
//   node scripts/import_daisy_themes.js <daisyui checkout>/packages/daisyui/src/themes
//
// - assets/css/src/themes/daisy.css — every theme as `[data-theme="<name>"]`,
//   bundled to priv/static/exo.themes.css (`bun run build:themes`); an app
//   imports it only if it offers those themes.
// - storybook/assets/js/daisy_themes.json — the same values for the theme
//   generator's list.
//
// The names map one to one: `--color-x` -> `--exo-x`, `--radius-x` ->
// `--exo-radius-x`, `--size-x` -> `--exo-size-x`, `--border` ->
// `--exo-border-width`, `--depth` and `--noise` -> `--exo-depth`, `--exo-noise`.
// The order is daisyUI's own (functions/themeOrder.js next to src/).

const fs = require("node:fs")
const path = require("node:path")

const dir = process.argv[2]
if (!dir) {
  console.error("usage: node scripts/import_daisy_themes.js <daisyui>/packages/daisyui/src/themes")
  process.exit(1)
}

const root = path.resolve(__dirname, "..")
const orderFile = path.resolve(dir, "../../functions/themeOrder.js")
const order = fs.existsSync(orderFile)
  ? [...fs.readFileSync(orderFile, "utf8").matchAll(/"([a-z]+)"/g)].map((m) => m[1])
  : fs.readdirSync(dir).filter((f) => f.endsWith(".css")).map((f) => f.slice(0, -4)).sort()

const rename = (key) => {
  if (key === "--border") return "--exo-border-width"
  if (key === "--depth") return "--exo-depth"
  if (key === "--noise") return "--exo-noise"
  return key
    .replace(/^--color-/, "--exo-")
    .replace(/^--radius-/, "--exo-radius-")
    .replace(/^--size-/, "--exo-size-")
}

const themes = order.map((name) => {
  const values = {}
  for (const line of fs.readFileSync(path.join(dir, `${name}.css`), "utf8").split("\n")) {
    const match = line.trim().match(/^([a-z-]+[a-z0-9-]*):\s*(.+?);?$/)
    if (match) values[match[1] === "color-scheme" ? "color-scheme" : rename(match[1])] = match[2]
  }
  return { name, ...values }
})

const css = [
  "/*! daisyUI themes (v5.7.50), MIT License, Copyright (c) 2020 Pouya Saadeghi.",
  " * Written by scripts/import_daisy_themes.js — do not edit by hand. */",
  "",
  ...themes.map(({ name, ...values }) =>
    [
      `[data-theme="${name}"] {`,
      ...Object.entries(values).map(([key, value]) => `  ${key}: ${value};`),
      "}",
      "",
    ].join("\n"),
  ),
].join("\n")

fs.writeFileSync(path.join(root, "assets/css/src/themes/daisy.css"), css)
fs.writeFileSync(
  path.join(root, "storybook/assets/js/daisy_themes.json"),
  JSON.stringify(themes, null, 2) + "\n",
)
console.log(`${themes.length} themes: ${themes.map((t) => t.name).join(" ")}`)
