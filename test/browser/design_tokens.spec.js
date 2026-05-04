const fs = require("fs");
const path = require("path");

const { test, expect } = require("@playwright/test");

const root = path.resolve(__dirname, "../..");
const cssRoot = path.join(root, "assets/css/src");
const bundledCss = path.join(root, "priv/static/exo.css");

function cssFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return cssFiles(entryPath);
      }

      return entry.name.endsWith(".css") ? [entryPath] : [];
    });
}

test.describe("design tokens", () => {
  test("all required exo CSS variables are defined", () => {
    const defined = new Set();
    const missing = [];

    for (const file of cssFiles(cssRoot)) {
      const css = fs.readFileSync(file, "utf8");

      for (const match of css.matchAll(/(--exo-[a-z0-9-]+)\s*:/g)) {
        defined.add(match[1]);
      }
    }

    for (const file of cssFiles(cssRoot)) {
      const css = fs.readFileSync(file, "utf8");

      for (const match of css.matchAll(/var\(\s*(--exo-[a-z0-9-]+)(\s*,[^)]*)?\)/g)) {
        const [, token, fallback] = match;

        if (!defined.has(token) && !fallback) {
          missing.push(`${token} in ${path.relative(root, file)}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  test("bundled CSS does not contain empty where selectors", () => {
    const css = fs.readFileSync(bundledCss, "utf8");

    expect(css).not.toContain(":where(){");
  });

  test("component elevation and backdrop styles use semantic tokens", () => {
    const checkedRoots = [
      path.join(cssRoot, "components"),
      path.join(cssRoot, "layouts")
    ];
    const hardcoded = [];
    const forbidden = [
      /rgb\(0 0 0\s*\/\s*[\d.]+\)/g,
      /oklch\(0% 0 0\s*\/\s*[\d.]+\)/g,
      /#[0-9a-f]{8}/gi
    ];

    for (const rootDir of checkedRoots) {
      for (const file of cssFiles(rootDir)) {
        const css = fs.readFileSync(file, "utf8");

        for (const pattern of forbidden) {
          for (const match of css.matchAll(pattern)) {
            hardcoded.push(`${match[0]} in ${path.relative(root, file)}`);
          }
        }
      }
    }

    expect(hardcoded).toEqual([]);
  });
});
