const fs = require("fs");
const path = require("path");

const { test, expect } = require("@playwright/test");
const { gotoStory } = require("./helpers/storybook");

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

  test("native parts of controls follow the theme through color-scheme", async ({ page }) => {
    // The browser paints the calendar icon of a date input, number spinners,
    // scrollbars and the list of a native select itself, in the scheme that
    // `color-scheme` names; custom properties never reach them. Without it the
    // dark theme kept a black calendar icon on a dark field (TRG-348).
    const scheme = (host) =>
      page.evaluate((host) => {
        const input = document.createElement("input");
        input.type = "date";
        input.setAttribute("data-exo", "input");
        let wrapper = null;

        if (host) {
          wrapper = document.createElement("div");
          if (host.theme) wrapper.setAttribute("data-theme", host.theme);
          if (host.className) wrapper.className = host.className;
          wrapper.append(input);
          document.body.append(wrapper);
        } else {
          document.body.append(input);
        }

        const value = getComputedStyle(input).colorScheme;
        (wrapper || input).remove();
        return value;
      }, host);

    const setRootTheme = (theme) =>
      page.evaluate((theme) => {
        if (theme) {
          document.documentElement.setAttribute("data-theme", theme);
        } else {
          document.documentElement.removeAttribute("data-theme");
        }
      }, theme);

    await gotoStory(page, "/components/forms/input");

    for (const system of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: system });

      // Without `data-theme` on <html> the page follows the system.
      await setRootTheme(null);
      expect(await scheme(null), `system ${system}, no data-theme`).toBe(system);

      // A theme pinned on <html> wins over the system.
      for (const theme of ["light", "dark"]) {
        await setRootTheme(theme);
        expect(await scheme(null), `system ${system}, <html data-theme="${theme}">`).toBe(theme);
      }

      // A themed wrapper switches what is inside it, whatever the page is.
      await setRootTheme(null);
      for (const [host, expected] of [
        [{ theme: "dark" }, "dark"],
        [{ className: "exo-dark" }, "dark"],
        [{ theme: "light" }, "light"],
        [{ className: "exo-default" }, "light"]
      ]) {
        expect(await scheme(host), `system ${system}, wrapper ${JSON.stringify(host)}`).toBe(expected);
      }
    }
  });
});
