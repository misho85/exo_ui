// The theme generator at /theme-generator — daisyUI's theme generator
// (daisyui.com/theme-generator, MIT) for ExoUI's tokens. The page renders the
// preview from real ExoUI components; this file builds the theme list and the
// editor, and writes the current theme's custom properties onto the preview.
//
// A theme is a flat object: `name`, `color-scheme`, `default`, `prefersdark`
// and the 28 `--exo-*` values daisyUI themes have (see daisy_themes.json,
// written by scripts/import_daisy_themes.js). Themes live in localStorage and
// the current one in the link (`#theme=<base64url JSON>`), as on daisyui.com.

import "../css/theme_generator.css"
import DAISY_THEMES from "./daisy_themes.json"
import PALETTE from "./tailwind_colors.json"

const STORAGE_THEMES = "exo-theme-generator:themes"
const STORAGE_CURRENT = "exo-theme-generator:current"

const COLOR_GROUPS = [
  ["base", ["--exo-base-100", "--exo-base-200", "--exo-base-300", "--exo-base-content"]],
  ["primary", ["--exo-primary", "--exo-primary-content"]],
  ["secondary", ["--exo-secondary", "--exo-secondary-content"]],
  ["accent", ["--exo-accent", "--exo-accent-content"]],
  ["neutral", ["--exo-neutral", "--exo-neutral-content"]],
  ["info", ["--exo-info", "--exo-info-content"]],
  ["success", ["--exo-success", "--exo-success-content"]],
  ["warning", ["--exo-warning", "--exo-warning-content"]],
  ["error", ["--exo-error", "--exo-error-content"]],
]
const COLOR_KEYS = COLOR_GROUPS.flatMap(([, keys]) => keys)

// Each colour and the colour of text on it, both ways.
const PAIRS = {}
for (const [group, keys] of COLOR_GROUPS) {
  if (group === "base") {
    for (const key of keys.slice(0, 3)) PAIRS[key] = "--exo-base-content"
    PAIRS["--exo-base-content"] = "--exo-base-100"
  } else {
    PAIRS[keys[0]] = keys[1]
    PAIRS[keys[1]] = keys[0]
  }
}

const RADIUS_VALUES = ["0rem", "0.25rem", "0.5rem", "1rem", "2rem"]
const RADII = [
  ["--exo-radius-box", "Boxes", "card, modal, alert"],
  ["--exo-radius-field", "Fields", "button, input, select, tab"],
  ["--exo-radius-selector", "Selectors", "checkbox, toggle, badge"],
]
const SIZE_VALUES = ["0.1875rem", "0.21875rem", "0.25rem", "0.28125rem", "0.3125rem"]
const SIZES = [
  ["--exo-size-field", "Fields", "button, input, select, tab", [6, 8, 10, 12, 14]],
  ["--exo-size-selector", "Selectors", "checkbox, toggle, badge", [4, 5, 6, 7, 8]],
]
const BORDER_VALUES = ["0.5px", "1px", "1.5px", "2px"]
const EFFECTS = [
  ["--exo-depth", "Depth effect", "3D depth on fields & selectors"],
  ["--exo-noise", "Noise effect", "Noise pattern on fields & selectors"],
]
const SHAPE_KEYS = [
  ...RADII.map(([key]) => key),
  ...SIZES.map(([key]) => key),
  "--exo-border-width",
  ...EFFECTS.map(([key]) => key),
]
const THEME_KEYS = [...COLOR_KEYS, ...SHAPE_KEYS]

// daisyUI's names for the CSS it exports.
const toDaisyKey = (key) =>
  ({
    "--exo-border-width": "--border",
    "--exo-depth": "--depth",
    "--exo-noise": "--noise",
  })[key] ??
  key
    .replace(/^--exo-(radius|size)-/, "--$1-")
    .replace(/^--exo-/, "--color-")

// --- colour maths: oklch <-> sRGB, WCAG contrast ---------------------------

const probe = document.createElement("span")

function parseColor(value) {
  if (!value || !CSS.supports("color", value)) return null
  const oklchMatch = value.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+|none)/i)
  if (oklchMatch) {
    const l = parseFloat(oklchMatch[1]) / (oklchMatch[2] ? 100 : 1)
    return { l, c: parseFloat(oklchMatch[3]), h: oklchMatch[4] === "none" ? 0 : parseFloat(oklchMatch[4]) }
  }
  probe.style.color = ""
  probe.style.color = value
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe).color
  probe.remove()
  const rgbMatch = computed.match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/)
  if (rgbMatch) return rgbToOklch(rgbMatch.slice(1, 4).map((n) => parseFloat(n) / 255))
  const srgbMatch = computed.match(/color\(srgb\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/)
  if (srgbMatch) return rgbToOklch(srgbMatch.slice(1, 4).map(parseFloat))
  const parsed = computed.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+|none)/)
  if (parsed) return { l: parseFloat(parsed[1]), c: parseFloat(parsed[2]), h: parseFloat(parsed[3]) || 0 }
  return null
}

function oklchToLinear({ l, c, h }) {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

const gamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)
const ungamma = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)

function rgbToOklch([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map(ungamma)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(A, B)
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return { l: L, c, h }
}

const trim = (n, digits) => {
  const text = n.toFixed(digits)
  return text.includes(".") ? text.replace(/\.?0+$/, "") : text
}
const formatOklch = ({ l, c, h }) => `oklch(${trim(l * 100, 1)}% ${trim(c, 3)} ${trim(h, 3)})`

function luminance(value) {
  const color = parseColor(value)
  if (!color) return 0
  const [r, g, b] = oklchToLinear(color).map((x) => Math.min(1, Math.max(0, x)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

// --- themes ----------------------------------------------------------------

const builtinThemes = () =>
  DAISY_THEMES.map((theme) => ({
    ...theme,
    id: `daisy:${theme.name}`,
    type: "builtin",
    default: false,
    prefersdark: false,
  }))

const isValidTheme = (theme) =>
  theme &&
  typeof theme.name === "string" &&
  ["light", "dark"].includes(theme["color-scheme"]) &&
  THEME_KEYS.every((key) => typeof theme[key] === "string" && theme[key] !== "")

const state = {
  themes: [],
  currentId: null,
  panel: "editor",
}

const current = () => state.themes.find((theme) => theme.id === state.currentId) ?? state.themes[0]

function readStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_THEMES) ?? "null")
    if (Array.isArray(stored) && stored.every(isValidTheme)) return stored
  } catch {}
  return null
}

function save() {
  try {
    localStorage.setItem(STORAGE_THEMES, JSON.stringify(state.themes))
    localStorage.setItem(STORAGE_CURRENT, state.currentId)
  } catch {}
  writeHash()
}

let hashTimer = null
function writeHash() {
  clearTimeout(hashTimer)
  hashTimer = setTimeout(() => {
    const { id, type, ...theme } = current()
    history.replaceState(null, "", `#theme=${encodeTheme(theme)}`)
  }, 250)
}

function encodeTheme(theme) {
  const bytes = new TextEncoder().encode(JSON.stringify(theme))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function decodeTheme(text) {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=")
  const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

function themeFromHash() {
  if (!location.hash.startsWith("#theme=")) return null
  try {
    const theme = decodeTheme(location.hash.slice(7))
    return isValidTheme(theme) ? theme : null
  } catch {
    return null
  }
}

const sameColors = (a, b) => a.name === b.name && COLOR_KEYS.every((key) => a[key] === b[key])

function load() {
  state.themes = readStorage() ?? builtinThemes()
  let currentId = null
  try {
    currentId = localStorage.getItem(STORAGE_CURRENT)
  } catch {}

  const linked = themeFromHash()
  if (linked) {
    const match = state.themes.find((theme) => theme.type === "custom" && sameColors(theme, linked))
    if (match) {
      currentId = match.id
    } else {
      const theme = { ...linked, id: crypto.randomUUID(), type: "custom" }
      state.themes.unshift(theme)
      currentId = theme.id
    }
  }

  state.currentId = state.themes.some((theme) => theme.id === currentId)
    ? currentId
    : state.themes[0].id
}

function setValue(key, value) {
  current()[key] = value
  applyPreview()
  save()
}

function selectTheme(id) {
  state.currentId = id
  applyPreview()
  save()
  renderThemes()
  renderEditor()
}

function addTheme(values) {
  const theme = {
    ...values,
    name: values.name ?? themeName(),
    id: crypto.randomUUID(),
    type: "custom",
    default: false,
    prefersdark: false,
  }
  state.themes.unshift(theme)
  selectTheme(theme.id)
}

// --- the random theme: daisyUI's randomizer (themeGeneratorRandomizer.js) ---

const pick = (list) => list[Math.floor(Math.random() * list.length)]

function paletteColor(names, shades) {
  const matches = Object.entries(PALETTE).filter(([name]) => {
    const [family, shade] = name.split("-")
    return (names.includes(family) && shades.includes(shade)) || names.includes(name)
  })
  return pick(matches)[1]
}

const familyOf = (value) => Object.entries(PALETTE).find(([, color]) => color === value)?.[0].split("-")[0]

function contentFor(family, shade) {
  if (family === "black") return PALETTE.white
  if (family === "white") return PALETTE.black
  return paletteColor([family], [parseInt(shade, 10) > 400 ? "50" : "950"])
}

function randomTheme() {
  const theme = {
    "--exo-radius-selector": pick(RADIUS_VALUES),
    "--exo-radius-field": pick(RADIUS_VALUES),
    "--exo-radius-box": pick(RADIUS_VALUES),
    "--exo-size-selector": "0.25rem",
    "--exo-size-field": "0.25rem",
    "--exo-border-width": pick(["1px", "1px", "1px", "1px", "1px", "1px", "1px", "1px", "1.5px", "2px"]),
    "--exo-depth": pick(["0", "1"]),
    "--exo-noise": pick(["0", "1"]),
  }
  const dark = Math.random() > 0.5
  theme["color-scheme"] = dark ? "dark" : "light"

  const greys = ["slate", "gray", "zinc", "neutral", "stone"]
  const hues = [
    "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan",
    "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
  ]
  const base = pick(Math.random() < 0.3 ? hues : greys)
  const [s100, s200, s300, content] = dark ? ["950", "900", "800", "100"] : ["50", "100", "200", "900"]
  theme["--exo-base-100"] = paletteColor([base], [s100])
  theme["--exo-base-200"] = paletteColor([base], [s200])
  theme["--exo-base-300"] = paletteColor([base], [s300])
  theme["--exo-base-content"] = paletteColor([base], [content])
  theme["--exo-neutral"] = paletteColor([base], ["600", "700", "800", "900", "950"])
  theme["--exo-neutral-content"] = contentFor(base, "700")

  const semantic = pick(["400", "500", "600"])
  for (const [key, families] of [
    ["info", ["cyan", "sky", "blue"]],
    ["success", ["lime", "green", "emerald", "teal"]],
    ["warning", ["yellow", "amber", "orange"]],
    ["error", ["red", "pink", "rose"]],
  ]) {
    theme[`--exo-${key}`] = paletteColor(families, [semantic])
    theme[`--exo-${key}-content`] = contentFor(familyOf(theme[`--exo-${key}`]), semantic)
  }

  const weights = {
    amber: 3, black: 5, blue: 4, cyan: 2, emerald: 3, fuchsia: 1, gray: 1, green: 3,
    indigo: 4, lime: 3, neutral: 1, orange: 3, pink: 3, purple: 3, red: 3, rose: 1,
    sky: 2, slate: 1, stone: 1, teal: 3, violet: 3, yellow: 3, zinc: 1,
  }
  const pool = Object.entries(weights).flatMap(([family, n]) => Array(n).fill(family))
  const brands = []
  while (brands.length < 3) {
    const family = pick(pool)
    if (!brands.includes(family)) brands.push(family)
  }
  const brandShade = pick(["300", "400", "500", "600"])
  ;["primary", "secondary", "accent"].forEach((key, i) => {
    theme[`--exo-${key}`] = paletteColor([brands[i]], [brandShade])
    theme[`--exo-${key}-content`] = contentFor(brands[i], brandShade)
  })
  return theme
}

const ADJECTIVES = ["quiet", "bold", "lucky", "misty", "sunny", "stormy", "gentle", "brisk", "velvet", "amber", "frosty", "wild"]
const NOUNS = ["harbor", "meadow", "comet", "canyon", "orchard", "lagoon", "summit", "ember", "willow", "delta", "prairie", "atlas"]
const themeName = () => `${pick(ADJECTIVES)}${pick(NOUNS)}`

// --- CSS export ------------------------------------------------------------

function exoCSS(theme) {
  const name = theme.name.trim()
  const values = [`  color-scheme: ${theme["color-scheme"]};`, ...THEME_KEYS.map((key) => `  ${key}: ${theme[key]};`)]
  const selector = theme.default ? `:root,\n[data-theme="${name}"]` : `[data-theme="${name}"]`
  let css = `/* ${name} — ExoUI theme generator */\n${selector} {\n${values.join("\n")}\n}\n`
  if (theme.prefersdark) {
    css += `\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {\n${values
      .map((line) => `  ${line}`)
      .join("\n")}\n  }\n}\n`
  }
  return css
}

function daisyCSS(theme) {
  const lines = [
    `  name: "${theme.name.trim()}";`,
    `  default: ${theme.default ? "true" : "false"};`,
    `  prefersdark: ${theme.prefersdark ? "true" : "false"};`,
    `  color-scheme: "${theme["color-scheme"]}";`,
    ...THEME_KEYS.map((key) => `  ${toDaisyKey(key)}: ${theme[key]};`),
  ]
  return `@plugin "daisyui/theme" {\n${lines.join("\n")}\n}\n`
}

// --- DOM helpers -----------------------------------------------------------

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue
    if (key.startsWith("on")) el.addEventListener(key.slice(2), value)
    else if (key === "style" && typeof value === "object") Object.assign(el.style, value)
    else el.setAttribute(key, value === true ? "" : value)
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue
    el.append(child instanceof Node ? child : document.createTextNode(child))
  }
  return el
}

const icon = (paths, size = 16) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("viewBox", "0 0 24 24")
  svg.setAttribute("width", size)
  svg.setAttribute("height", size)
  svg.setAttribute("fill", "none")
  svg.setAttribute("stroke", "currentColor")
  svg.setAttribute("stroke-width", "2")
  svg.setAttribute("stroke-linecap", "round")
  svg.setAttribute("stroke-linejoin", "round")
  svg.setAttribute("aria-hidden", "true")
  svg.innerHTML = paths
  return svg
}

const ICONS = {
  dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  reset: '<path d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  pencil: '<path d="M4 20h16M4 20v-4L16 4l4 4L8 20H4z"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  warn: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
}

const toggle = (checked, onchange, label) =>
  h(
    "label",
    { "data-exo": "toggle", "data-size": "xs", "data-checked": checked || null },
    h("input", {
      type: "checkbox",
      checked,
      "aria-label": label,
      onchange: (e) => {
        e.target.closest("[data-exo=toggle]").toggleAttribute("data-checked", e.target.checked)
        onchange(e.target.checked)
      },
    }),
    h("span", { "data-exo": "toggle-track" }, h("span", { "data-exo": "toggle-thumb" })),
  )

const heading = (text, paths) => h("h3", { "data-tg": "heading" }, icon(paths, 14), text)

// --- theme list ------------------------------------------------------------

function themeItem(theme) {
  const swatch = h(
    "span",
    { "data-tg": "mini", style: { backgroundColor: theme["--exo-base-100"] } },
    ...["--exo-base-content", "--exo-primary", "--exo-secondary", "--exo-accent"].map((key) =>
      h("span", { style: { backgroundColor: theme[key] } }),
    ),
  )
  return h(
    "li",
    {},
    h(
      "button",
      {
        type: "button",
        "data-tg": "theme-item",
        "aria-current": theme.id === state.currentId ? "true" : null,
        onclick: () => selectTheme(theme.id),
      },
      swatch,
      h("span", { "data-tg": "theme-name" }, theme.name || "untitled"),
    ),
  )
}

function renderThemes() {
  const root = document.getElementById("tg-themes")
  const custom = state.themes.filter((theme) => theme.type === "custom")
  const builtin = state.themes.filter((theme) => theme.type === "builtin")

  const menu = h(
    "details",
    { "data-tg": "menu" },
    h("summary", { "data-exo": "btn", "data-variant": "base", "data-appearance": "ghost", "data-size": "sm", "data-shape": "square", "aria-label": "Options" }, icon(ICONS.more)),
    h(
      "ul",
      { "data-tg": "menu-list" },
      h("li", {}, h("button", { type: "button", onclick: removeCustomThemes }, icon(ICONS.trash, 14), "Remove my themes")),
      h("li", {}, h("button", { type: "button", onclick: resetBuiltinThemes }, icon(ICONS.reset, 14), "Reset daisyUI themes")),
    ),
  )

  root.replaceChildren(
    h("div", { "data-tg": "themes-head" }, h("h2", {}, "Themes"), menu),
    h(
      "button",
      { type: "button", "data-exo": "btn", "data-variant": "base", "data-shape": "block", "data-tg": "add", onclick: () => addTheme(randomTheme()) },
      icon(ICONS.plus),
      "Add a random theme",
    ),
    h("p", { "data-tg": "list-title" }, "My themes"),
    custom.length
      ? h("ul", { "data-tg": "theme-list" }, custom.map(themeItem))
      : h("p", { "data-tg": "empty" }, "None yet. Add one, or change a daisyUI theme and save it as yours."),
    h("p", { "data-tg": "list-title" }, "daisyUI themes"),
    h("ul", { "data-tg": "theme-list" }, builtin.map(themeItem)),
  )
}

function removeCustomThemes() {
  if (!confirm("Remove all your themes?")) return
  state.themes = state.themes.filter((theme) => theme.type === "builtin")
  selectTheme(state.themes[0].id)
}

function resetBuiltinThemes() {
  if (!confirm("Reset all daisyUI themes to their values?")) return
  const fresh = builtinThemes()
  state.themes = [...state.themes.filter((theme) => theme.type === "custom"), ...fresh]
  if (!state.themes.some((theme) => theme.id === state.currentId)) state.currentId = fresh[0].id
  selectTheme(state.currentId)
}

// --- editor ----------------------------------------------------------------

function swatch(key) {
  const theme = current()
  const content = key.endsWith("-content")
  const pair = theme[PAIRS[key]]
  const label = content ? "A" : (key.match(/base-(\d+)/)?.[1] ?? "")
  return h(
    "button",
    {
      type: "button",
      "data-tg": "swatch",
      "data-key": key,
      "aria-label": `${key.replace("--exo-", "")}: ${theme[key]}`,
      title: theme[key],
      style: content ? { backgroundColor: pair, color: theme[key] } : { backgroundColor: theme[key], color: pair },
      onclick: () => openPicker(key),
    },
    label,
  )
}

function radiusGroup([key, label, desc]) {
  const theme = current()
  return h(
    "div",
    { "data-tg": "field", role: "radiogroup", "aria-label": `${label} radius` },
    h("div", { "data-tg": "label" }, h("span", {}, label), h("small", {}, desc)),
    h(
      "div",
      { "data-tg": "radius-row" },
      RADIUS_VALUES.map((value) =>
        h(
          "label",
          { "data-tg": "radius", title: value },
          h("input", {
            type: "radio",
            name: key,
            value,
            checked: theme[key] === value,
            "aria-label": `${value} radius`,
            onchange: () => {
              setValue(key, value)
              renderEditor()
            },
          }),
          h("span", { style: { borderStartEndRadius: value } }),
        ),
      ),
    ),
  )
}

function sizeGroup([key, label, desc, scale]) {
  const theme = current()
  const bars = h("div", { "data-tg": "size-bars" })
  const big = h("strong", {})
  const draw = () => {
    const unit = parseFloat(current()[key]) * 16
    big.textContent = unit.toFixed(1)
    bars.replaceChildren(
      ...scale.map((n, i) =>
        h(
          "div",
          { "data-tg": "size-bar" },
          h("span", { style: { height: `${unit * n}px` } }),
          h("small", {}, ["xs", "sm", "md", "lg", "xl"][i]),
          h("small", {}, (unit * n).toFixed(0)),
        ),
      ),
    )
  }
  draw()
  return h(
    "div",
    { "data-tg": "field" },
    h("div", { "data-tg": "label" }, h("span", {}, label), h("small", {}, desc)),
    h(
      "div",
      { "data-tg": "size-box" },
      bars,
      h(
        "div",
        { "data-tg": "size-control" },
        h("small", {}, `${label} base size`),
        big,
        h("small", {}, "pixels"),
        h("input", {
          type: "range",
          "data-exo": "slider",
          "data-size": "xs",
          min: 0,
          max: SIZE_VALUES.length - 1,
          step: 1,
          value: Math.max(0, SIZE_VALUES.indexOf(theme[key])),
          "aria-label": `${label} base size`,
          oninput: (e) => {
            setValue(key, SIZE_VALUES[e.target.value])
            draw()
          },
        }),
      ),
    ),
  )
}

function borderGroup() {
  const theme = current()
  const value = h("output", {}, theme["--exo-border-width"])
  return h(
    "div",
    { "data-tg": "field" },
    h("div", { "data-tg": "label" }, h("span", {}, "Border width"), h("small", {}, "All components")),
    h(
      "div",
      { "data-tg": "border-box" },
      value,
      h("input", {
        type: "range",
        "data-exo": "slider",
        "data-size": "xs",
        min: 0,
        max: BORDER_VALUES.length - 1,
        step: 1,
        value: Math.max(0, BORDER_VALUES.indexOf(theme["--exo-border-width"])),
        "aria-label": "Border width",
        oninput: (e) => {
          setValue("--exo-border-width", BORDER_VALUES[e.target.value])
          value.textContent = BORDER_VALUES[e.target.value]
        },
      }),
    ),
  )
}

function switchRow(label, desc, checked, onchange) {
  return h(
    "div",
    { "data-tg": "switch-row" },
    h("div", { "data-tg": "label" }, h("span", {}, label), desc && h("small", {}, desc)),
    toggle(checked, onchange, label),
  )
}

function renderEditor() {
  const theme = current()
  const root = document.getElementById("tg-editor")

  const name = h("input", {
    "data-exo": "input",
    "data-size": "sm",
    type: "text",
    value: theme.name,
    placeholder: "mytheme",
    "aria-label": "Theme name",
    oninput: (e) => {
      current().name = e.target.value.replace(/[^a-z0-9_-]/gi, "").toLowerCase()
      if (e.target.value !== current().name) e.target.value = current().name
      save()
      renderThemes()
    },
  })

  root.replaceChildren(
    ...[
    h("label", { "data-tg": "name" }, h("small", {}, "Name"), name, icon(ICONS.pencil, 14)),
    h(
      "div",
      { "data-tg": "actions" },
      h("button", { type: "button", "data-exo": "btn", "data-variant": "base", "data-size": "sm", onclick: randomizeCurrent }, icon(ICONS.dice), "Random"),
      h("button", { type: "button", "data-exo": "btn", "data-variant": "neutral", "data-size": "sm", onclick: openCSS }, icon(ICONS.code), "CSS"),
    ),
    heading("Change colors", '<path d="M19 11 11 3 3 11l8 8 8-8z"/><path d="M20 15s2 2.5 2 4a2 2 0 0 1-4 0c0-1.5 2-4 2-4z"/>'),
    h(
      "div",
      { "data-tg": "colors" },
      COLOR_GROUPS.map(([group, keys]) =>
        h(
          "div",
          { "data-tg": "color-group", "data-group": group },
          h("div", { "data-tg": "swatches" }, keys.map(swatch)),
          h("small", {}, group),
        ),
      ),
    ),
    heading("Radius", '<path d="M21 3h-9a9 9 0 0 0-9 9v9"/>'),
    RADII.map(radiusGroup),
    heading("Effects", '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>'),
    EFFECTS.map(([key, label, desc]) =>
      switchRow(label, desc, theme[key] === "1", (on) => setValue(key, on ? "1" : "0")),
    ),
    heading("Sizes", '<path d="M21 3 3 21"/><path d="m7 17 2 2M11 13l3 3M15 9l2 2"/>'),
    SIZES.map(sizeGroup),
    borderGroup(),
    heading("Options", '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'),
    switchRow("Default theme", "Sets :root too", theme.default, (on) => {
      current().default = on
      save()
    }),
    switchRow("Default dark theme", "prefers-color-scheme: dark", theme.prefersdark, (on) => {
      current().prefersdark = on
      save()
    }),
    switchRow("Dark color scheme", "Color of browser-provided UI", theme["color-scheme"] === "dark", (on) =>
      setValue("color-scheme", on ? "dark" : "light"),
    ),
    h(
      "button",
      { type: "button", "data-exo": "btn", "data-variant": "error", "data-appearance": "ghost", "data-shape": "block", "data-size": "sm", onclick: removeCurrent },
      theme.type === "builtin" ? [icon(ICONS.reset), "Reset theme"] : [icon(ICONS.trash), "Remove theme"],
    ),
    ].flat(),
  )
}

function randomizeCurrent() {
  Object.assign(current(), randomTheme())
  applyPreview()
  save()
  renderThemes()
  renderEditor()
}

function removeCurrent() {
  const theme = current()
  if (theme.type === "builtin") {
    if (!confirm(`Reset "${theme.name}" to its daisyUI values?`)) return
    const fresh = builtinThemes().find((t) => t.id === theme.id)
    Object.assign(theme, fresh)
    selectTheme(theme.id)
  } else {
    if (!confirm(`Remove "${theme.name}"?`)) return
    state.themes = state.themes.filter((t) => t.id !== theme.id)
    selectTheme(state.themes[0].id)
  }
}

// --- the preview -----------------------------------------------------------

function applyPreview() {
  const theme = current()
  const preview = document.getElementById("tg-preview")
  for (const key of THEME_KEYS) preview.style.setProperty(key, theme[key])
  preview.style.colorScheme = theme["color-scheme"]
  document.querySelectorAll("[data-tg=swatch]").forEach((button) => {
    const key = button.dataset.key
    const content = key.endsWith("-content")
    button.style.backgroundColor = content ? theme[PAIRS[key]] : theme[key]
    button.style.color = content ? theme[key] : theme[PAIRS[key]]
    button.title = theme[key]
  })
}

// --- colour picker ---------------------------------------------------------

const FAMILIES = [...new Set(Object.keys(PALETTE).filter((n) => n.includes("-")).map((n) => n.split("-")[0]))]
const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]
const MAX_CHROMA = 0.37

let picker = null

function openPicker(key) {
  picker?.dialog.remove()
  const theme = current()
  const original = theme[key]
  let color = parseColor(original) ?? { l: 0.5, c: 0.1, h: 250 }
  let mode = "palette"

  const pairKey = PAIRS[key]
  const content = key.endsWith("-content")
  const sample = h("div", { "data-tg": "sample" }, "A")
  const valueInput = h("input", {
    "data-exo": "input",
    "data-size": "sm",
    type: "text",
    spellcheck: "false",
    "aria-label": `${key} value`,
  })
  const meter = h("div", { "data-tg": "contrast" })
  const body = h("div", { "data-tg": "picker-body" })

  const paint = () => {
    const value = current()[key]
    sample.style.backgroundColor = content ? current()[pairKey] : value
    sample.style.color = content ? value : current()[pairKey]
    if (document.activeElement !== valueInput) valueInput.value = value
    const ratio = contrast(value, current()[pairKey])
    const rating = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large" : null
    meter.replaceChildren(
      rating
        ? h("span", { "data-exo": "badge", "data-appearance": "dash", "data-size": "sm" }, rating)
        : h("span", { "data-tg": "low" }, icon(ICONS.warn, 14), "Low contrast"),
      h("small", {}, `${ratio.toFixed(2)}:1`),
    )
    body.querySelectorAll("[data-tg=chip]").forEach((chip) => {
      chip.toggleAttribute("data-selected", chip.dataset.value === value)
    })
  }

  const set = (value) => {
    setValue(key, value)
    paint()
  }

  valueInput.addEventListener("input", () => {
    const parsed = parseColor(valueInput.value.trim())
    if (parsed) {
      color = parsed
      set(valueInput.value.trim())
      if (mode === "picker") drawPlane()
    }
  })

  // Palette: Tailwind's colours, a row per family, as on daisyui.com.
  const palette = () =>
    h(
      "div",
      { "data-tg": "palette", role: "listbox", "aria-label": "Palette" },
      FAMILIES.map((family) =>
        h(
          "div",
          { "data-tg": "palette-row" },
          h("small", {}, family),
          SHADES.map((shade) => {
            const name = `${family}-${shade}`
            return h("button", {
              type: "button",
              "data-tg": "chip",
              "data-value": PALETTE[name],
              title: name,
              "aria-label": name,
              style: { backgroundColor: PALETTE[name] },
              onclick: () => {
                color = parseColor(PALETTE[name]) ?? color
                set(PALETTE[name])
              },
            })
          }),
        ),
      ),
      h(
        "div",
        { "data-tg": "palette-row" },
        h("small", {}, "mono"),
        ["black", "white"].map((name) =>
          h("button", {
            type: "button",
            "data-tg": "chip",
            "data-value": PALETTE[name],
            title: name,
            "aria-label": name,
            style: { backgroundColor: PALETTE[name] },
            onclick: () => {
              color = parseColor(PALETTE[name]) ?? color
              set(PALETTE[name])
            },
          }),
        ),
      ),
    )

  // Picker: lightness × chroma at the current hue, and a hue slider.
  const plane = h("canvas", { width: 400, height: 240, "data-tg": "plane", "aria-label": "Lightness and chroma" })
  const handle = h("span", { "data-tg": "handle" })
  const hue = h("input", {
    type: "range",
    "data-tg": "hue",
    min: 0,
    max: 360,
    step: 0.5,
    "aria-label": "Hue",
  })

  function drawPlane() {
    const ctx = plane.getContext("2d")
    const { width, height } = plane
    const image = ctx.createImageData(width, height)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rgb = oklchToLinear({ l: 1 - y / (height - 1), c: (x / (width - 1)) * MAX_CHROMA, h: color.h })
        const i = (y * width + x) * 4
        const inGamut = rgb.every((v) => v >= -0.0005 && v <= 1.0005)
        image.data[i] = gamma(Math.min(1, Math.max(0, rgb[0]))) * 255
        image.data[i + 1] = gamma(Math.min(1, Math.max(0, rgb[1]))) * 255
        image.data[i + 2] = gamma(Math.min(1, Math.max(0, rgb[2]))) * 255
        image.data[i + 3] = inGamut ? 255 : 40
      }
    }
    ctx.putImageData(image, 0, 0)
    handle.style.left = `${(Math.min(color.c, MAX_CHROMA) / MAX_CHROMA) * 100}%`
    handle.style.top = `${(1 - color.l) * 100}%`
    hue.value = color.h
  }

  const pickAt = (event) => {
    const rect = plane.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    color = { ...color, l: 1 - y, c: x * MAX_CHROMA }
    handle.style.left = `${x * 100}%`
    handle.style.top = `${y * 100}%`
    set(formatOklch(color))
  }
  plane.addEventListener("pointerdown", (event) => {
    plane.setPointerCapture(event.pointerId)
    pickAt(event)
  })
  plane.addEventListener("pointermove", (event) => {
    if (plane.hasPointerCapture(event.pointerId)) pickAt(event)
  })
  hue.addEventListener("input", () => {
    color = { ...color, h: parseFloat(hue.value) }
    drawPlane()
    set(formatOklch(color))
  })

  const pickerView = () => h("div", { "data-tg": "picker" }, h("div", { "data-tg": "plane-wrap" }, plane, handle), hue)

  const show = (next) => {
    mode = next
    tabs.querySelectorAll("[data-exo=tab]").forEach((tab) => {
      const active = tab.dataset.mode === mode
      tab.toggleAttribute("data-active", active)
      tab.setAttribute("aria-selected", active)
    })
    body.replaceChildren(mode === "palette" ? palette() : pickerView())
    if (mode === "picker") drawPlane()
    paint()
  }

  const tabs = h(
    "div",
    { "data-exo": "tabs", "data-appearance": "box", "data-size": "sm", role: "tablist" },
    ["palette", "picker"].map((m) =>
      h("button", { type: "button", role: "tab", "data-exo": "tab", "data-mode": m, onclick: () => show(m) }, m === "palette" ? "Palette" : "Picker"),
    ),
  )

  const dialog = h(
    "dialog",
    { "data-tg": "dialog", "aria-label": `Pick a color for ${key.replace("--exo-", "")}` },
    h(
      "div",
      { "data-tg": "dialog-head" },
      sample,
      h("h2", {}, h("span", {}, "Pick a color for "), key.replace("--exo-", "").replace("-", " ").replace(/^./, (c) => c.toUpperCase())),
      tabs,
    ),
    body,
    h(
      "div",
      { "data-tg": "dialog-foot" },
      h("label", { "data-tg": "value" }, h("small", {}, "Color value"), valueInput),
      meter,
      h(
        "div",
        { "data-tg": "dialog-actions" },
        h(
          "button",
          { type: "button", "data-exo": "btn", "data-variant": "base", "data-appearance": "ghost", "data-size": "sm", onclick: () => { set(original); close() } },
          "Cancel",
        ),
        h("button", { type: "button", "data-exo": "btn", "data-variant": "primary", "data-size": "sm", onclick: () => close() }, "Done"),
      ),
    ),
  )

  const close = () => {
    dialog.close()
    dialog.remove()
    picker = null
    renderEditor()
  }
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault()
    close()
  })
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close()
  })

  document.body.append(dialog)
  picker = { dialog }
  show("palette")
  dialog.showModal()
}

// --- CSS dialog ------------------------------------------------------------

function openCSS() {
  const theme = current()
  let format = "exo"
  const code = h("pre", { "data-tg": "code" })
  const copied = h("span", { "data-tg": "copied", hidden: true }, icon(ICONS.check, 14), "Copied")
  const render = () => {
    code.textContent = format === "exo" ? exoCSS(theme) : daisyCSS(theme)
    tabs.querySelectorAll("[data-exo=tab]").forEach((tab) => {
      const active = tab.dataset.format === format
      tab.toggleAttribute("data-active", active)
      tab.setAttribute("aria-selected", active)
    })
  }
  const tabs = h(
    "div",
    { "data-exo": "tabs", "data-appearance": "box", "data-size": "sm", role: "tablist" },
    [
      ["exo", "ExoUI"],
      ["daisy", "daisyUI"],
    ].map(([value, label]) =>
      h("button", { type: "button", role: "tab", "data-exo": "tab", "data-format": value, onclick: () => { format = value; render() } }, label),
    ),
  )
  const hint = h(
    "p",
    { "data-tg": "hint" },
    "ExoUI: paste into your app's CSS after exo.css, and set data-theme on <html> or any element. daisyUI: paste into the CSS file that loads daisyUI (Tailwind v4).",
  )
  const dialog = h(
    "dialog",
    { "data-tg": "dialog", "data-wide": true, "aria-label": "Theme CSS" },
    h("div", { "data-tg": "dialog-head" }, h("h2", {}, `CSS for ${theme.name}`), tabs),
    hint,
    code,
    h(
      "div",
      { "data-tg": "dialog-foot" },
      copied,
      h(
        "div",
        { "data-tg": "dialog-actions" },
        h("button", { type: "button", "data-exo": "btn", "data-variant": "base", "data-appearance": "ghost", "data-size": "sm", onclick: () => close() }, "Close"),
        h(
          "button",
          {
            type: "button",
            "data-exo": "btn",
            "data-variant": "primary",
            "data-size": "sm",
            onclick: async () => {
              try {
                await navigator.clipboard.writeText(code.textContent)
                copied.hidden = false
                setTimeout(() => (copied.hidden = true), 2000)
              } catch {
                getSelection().selectAllChildren(code)
              }
            },
          },
          icon(ICONS.copy),
          "Copy",
        ),
      ),
    ),
  )
  const close = () => {
    dialog.close()
    dialog.remove()
  }
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close()
  })
  dialog.addEventListener("close", () => dialog.remove())
  document.body.append(dialog)
  render()
  dialog.showModal()
}

// --- panels on a phone -------------------------------------------------------

function showPanel(panel) {
  state.panel = panel
  document.body.dataset.tgPanel = panel
  document.querySelectorAll("[data-tg-show]").forEach((button) => {
    button.setAttribute("aria-current", button.dataset.tgShow === panel ? "true" : "false")
  })
}

// --- start -----------------------------------------------------------------

function start() {
  load()
  applyPreview()
  renderThemes()
  renderEditor()
  showPanel("editor")
  document.querySelectorAll("[data-tg-show]").forEach((button) =>
    button.addEventListener("click", () => showPanel(button.dataset.tgShow)),
  )
  // Links in the preview go nowhere.
  document.getElementById("tg-preview").addEventListener("click", (event) => {
    if (event.target.closest("a[href]")) event.preventDefault()
  })
  save()
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start)
else start()
