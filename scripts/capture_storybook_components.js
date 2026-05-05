const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const STORY_ROOTS = [
  {
    dir: path.join(ROOT, "storybook", "stories", "components"),
    namePrefix: "",
    routePrefix: "/components"
  },
  {
    dir: path.join(ROOT, "storybook", "stories", "layouts"),
    namePrefix: "layouts/",
    routePrefix: "/layouts"
  }
];
const OUT_ROOT = path.join(ROOT, "output", "playwright", "exo-ui-components");
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4100";
const NAVIGATION_TIMEOUT = Number.parseInt(process.env.CAPTURE_NAVIGATION_TIMEOUT || "30000", 10);
const STORY_READY_TIMEOUT = Number.parseInt(process.env.CAPTURE_STORY_READY_TIMEOUT || "15000", 10);

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function listStories() {
  const stories = [];

  function walk(root, dir, prefix = "") {
    for (const entry of fs.readdirSync(dir).sort()) {
      const entryPath = path.join(dir, entry);
      const stat = fs.statSync(entryPath);

      if (stat.isDirectory()) {
        walk(root, entryPath, `${prefix}${entry}/`);
      } else if (entry.endsWith(".story.exs")) {
        const localName = `${prefix}${entry.replace(/\.story\.exs$/, "")}`;
        stories.push({
          name: `${root.namePrefix}${localName}`,
          route: `${root.routePrefix}/${localName}`
        });
      }
    }
  }

  for (const root of STORY_ROOTS) {
    if (fs.existsSync(root.dir)) walk(root, root.dir);
  }

  return stories.sort((a, b) => a.name.localeCompare(b.name));
}

function artifactName(name) {
  return name.replace(/[\\/]/g, "__");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function commandExists(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${command}`], {
    encoding: "utf8",
    stdio: "pipe"
  });
  return result.status === 0;
}

async function safe(locator, action) {
  try {
    if ((await locator.count()) === 0) return false;
    await action(locator.first());
    return true;
  } catch (_err) {
    return false;
  }
}

async function clickFirst(page, selector) {
  return safe(page.locator(selector), (node) => node.click({ timeout: 1500 }));
}

async function hoverFirst(page, selector) {
  return safe(page.locator(selector), (node) => node.hover({ timeout: 1500 }));
}

async function focusFirst(page, selector) {
  return safe(page.locator(selector), (node) => node.focus({ timeout: 1500 }));
}

async function waitForLiveView(page) {
  await page.waitForFunction(
    () => document.querySelector("[data-phx-main]")?.classList.contains("phx-connected"),
    null,
    { timeout: STORY_READY_TIMEOUT }
  );
}

async function openOverlayIfClosed(page, overlaySelector, triggerSelector) {
  const overlay = page.locator(`#story-live ${overlaySelector}`).first();

  if ((await overlay.count()) > 0) {
    const state = await overlay.getAttribute("data-state");
    const hidden = await overlay.getAttribute("aria-hidden");

    if (state === "open" || hidden === "false") return;
  }

  await clickFirst(page, triggerSelector);
}

async function componentDemo(page, name) {
  const demoName = name.split("/").pop();

  await page.waitForTimeout(250);

  switch (demoName) {
    case "accordion":
      await clickFirst(page, '#story-live [data-exo="accordion-trigger"]');
      await page.waitForTimeout(300);
      await clickFirst(page, '#story-live [data-exo="accordion-trigger"] >> nth=1');
      break;
    case "carousel":
      await clickFirst(page, '#story-live [data-exo="carousel-next"]');
      await page.waitForTimeout(500);
      await clickFirst(page, '#story-live [data-exo="carousel-prev"]');
      break;
    case "collapsible":
      await clickFirst(page, '#story-live [data-exo="collapsible-trigger"]');
      break;
    case "combobox":
      await clickFirst(page, '#story-live [data-exo-combobox="trigger"]');
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live [data-exo="combobox-search"]'), (node) =>
        node.fill("ser", { timeout: 1500 })
      );
      break;
    case "combobox_async":
      await clickFirst(page, '#story-live [data-exo-combobox="trigger"]');
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live [data-exo="combobox-search"]'), (node) =>
        node.fill("maria", { timeout: 1500 })
      );
      await page.waitForTimeout(900);
      break;
    case "command_palette":
      await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
      await page.waitForTimeout(400);
      await safe(page.locator('#story-live [data-exo="command-palette-input"]'), (node) =>
        node.fill("settings", { timeout: 1500 })
      );
      await page.waitForTimeout(350);
      await page.keyboard.press("Escape");
      break;
    case "context_menu": {
      const trigger = page.locator('#story-live [data-exo="context-menu-trigger"]').first();
      if ((await trigger.count()) > 0) {
        await trigger.click({ button: "right", timeout: 1500 });
        await page.waitForTimeout(400);
        await page.mouse.click(8, 8);
      }
      break;
    }
    case "date_picker":
      await clickFirst(page, '#story-live [data-exo="date-picker-nav"]:not([disabled])');
      await page.waitForTimeout(250);
      await clickFirst(page, '#story-live [data-exo="date-picker-day"]:not([disabled])');
      break;
    case "dropdown":
    case "dropdown_menu":
      await clickFirst(page, '#story-live [data-exo="popover-trigger"]');
      await page.waitForTimeout(400);
      await page.keyboard.press("Escape");
      break;
    case "form":
      await focusFirst(page, '#story-live [data-exo="input"]');
      await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
      await page.keyboard.type("Grace Hopper");
      break;
    case "hover_card":
      await hoverFirst(page, '#story-live [data-exo="hover-card-trigger"]');
      await page.waitForTimeout(650);
      break;
    case "sidebar_layout":
      await clickFirst(page, '#story-live [data-exo="sidebar-hamburger"]');
      await page.waitForTimeout(300);
      await clickFirst(page, '#story-live [data-exo="sidebar-hamburger"]');
      break;
    case "confirm_modal":
    case "modal":
      await openOverlayIfClosed(page, '[data-exo="modal"]', '#story-live button, #story-live [role="button"]');
      await page.waitForTimeout(400);
      break;
    case "menubar":
      await clickFirst(page, '#story-live [data-exo="menubar-trigger"]');
      await page.waitForTimeout(300);
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(250);
      await page.keyboard.press("ArrowRight");
      break;
    case "popover":
      await clickFirst(page, '#story-live [data-exo="popover-trigger"]');
      await page.waitForTimeout(400);
      await page.keyboard.press("Escape");
      break;
    case "rating":
      await clickFirst(page, '#story-live [data-exo="rating-star"] >> nth=4');
      break;
    case "select":
      await clickFirst(page, '#story-live [data-exo-select="trigger"]');
      await page.waitForTimeout(250);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      break;
    case "sheet":
      await openOverlayIfClosed(page, '[data-exo="sheet"]', '#story-live button, #story-live [role="button"]');
      await page.waitForTimeout(400);
      break;
    case "drawer":
      await openOverlayIfClosed(page, '[data-exo="drawer"]', '#story-live button, #story-live [role="button"]');
      await page.waitForTimeout(400);
      break;
    case "tabs":
      await clickFirst(page, '#story-live [role="tab"] >> nth=1');
      break;
    case "theme_toggle":
      await clickFirst(page, '#story-live [data-theme-value="dark"]');
      await page.waitForTimeout(250);
      await clickFirst(page, '#story-live [data-theme-value="light"]');
      break;
    case "swap":
      await focusFirst(page, '#story-live [data-exo="swap"]');
      await page.keyboard.press("Space");
      break;
    case "toggle":
      await clickFirst(page, '#story-live [data-exo="toggle"], #story-live input[type="checkbox"]');
      break;
    case "tooltip":
      await hoverFirst(page, '#story-live [data-exo="tooltip-anchor"]');
      await page.waitForTimeout(650);
      await focusFirst(page, '#story-live [data-exo="tooltip-anchor"]');
      break;
    default:
      await hoverFirst(page, "#story-live");
      await page.waitForTimeout(350);
  }

  await page.waitForTimeout(400);
}

async function captureComponent(browser, runDir, story) {
  const { name, route } = story;
  const artifact = artifactName(name);
  const rawVideoDir = path.join(runDir, "videos-raw");
  const screenshotsDir = path.join(runDir, "screenshots");
  const videosDir = path.join(runDir, "videos");
  fs.mkdirSync(rawVideoDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(videosDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: {
      dir: rawVideoDir,
      size: { width: 1280, height: 900 }
    }
  });

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  const url = `${BASE_URL}${route}`;
  const screenshotPath = path.join(screenshotsDir, `${artifact}.png`);
  const videoPath = path.join(videosDir, `${artifact}.webm`);

  let ok = false;
  let dataExoCount = 0;
  let error = null;

  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT
    });
    await page.locator("#story-live").waitFor({ state: "visible", timeout: STORY_READY_TIMEOUT });
    await waitForLiveView(page);
    await componentDemo(page, name);
    dataExoCount = await page.locator("#story-live [data-exo]").count();
    await page.screenshot({ path: screenshotPath, fullPage: true });
    ok = Boolean(response?.ok());
  } catch (err) {
    error = err.message;
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (_screenshotErr) {}
  } finally {
    const video = page.video();
    await page.close();
    await context.close();
    if (video) {
      try {
        await video.saveAs(videoPath);
      } catch (_err) {
        try {
          const rawPath = await video.path();
          fs.copyFileSync(rawPath, videoPath);
        } catch (_copyErr) {}
      }
    }
  }

  return {
    name,
    route,
    url,
    ok,
    dataExoCount,
    screenshot: path.relative(runDir, screenshotPath),
    video: fs.existsSync(videoPath) ? path.relative(runDir, videoPath) : null,
    errors,
    error
  };
}

function writeIndex(runDir, results) {
  const lines = [
    "# ExoUI Component Playwright Artifacts",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${BASE_URL}`,
    "",
    "| Component | Status | Screenshot | Video |",
    "| --- | --- | --- | --- |"
  ];

  for (const result of results) {
    const status = result.ok && !result.error ? "ok" : "check";
    const screenshot = result.screenshot ? `[png](${result.screenshot})` : "";
    const video = result.videoMp4
      ? `[mp4](${result.videoMp4})`
      : result.video
        ? `[webm](${result.video})`
        : "";
    lines.push(`| ${result.name} | ${status} | ${screenshot} | ${video} |`);
  }

  fs.writeFileSync(path.join(runDir, "index.md"), `${lines.join("\n")}\n`);
}

function convertVideos(runDir, results) {
  if (!commandExists("ffmpeg")) {
    return { converted: 0, skipped: results.filter((result) => result.video).length, ffmpeg: false };
  }

  const outDir = path.join(runDir, "videos-mp4");
  fs.mkdirSync(outDir, { recursive: true });

  let converted = 0;

  for (const result of results) {
    if (!result.video) continue;

    const source = path.join(runDir, result.video);
    const target = path.join(outDir, `${artifactName(result.name)}.mp4`);
    const ffmpeg = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-loglevel",
        "error",
        "-i",
        source,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        target
      ],
      { stdio: "pipe" }
    );

    if (ffmpeg.status === 0 && fs.existsSync(target)) {
      result.videoMp4 = path.relative(runDir, target);
      converted += 1;
    } else {
      result.videoMp4Error = ffmpeg.stderr?.toString() || "ffmpeg failed";
    }
  }

  return {
    converted,
    skipped: results.filter((result) => result.video && !result.videoMp4).length,
    ffmpeg: true
  };
}

function writeViewer(runDir, results, conversion) {
  const rows = results
    .map((result) => {
      const status = result.ok && !result.error ? "ok" : "check";
      const screenshot = result.screenshot
        ? `<img src="${escapeHtml(result.screenshot)}" alt="${escapeHtml(result.name)} screenshot" loading="lazy">`
        : "";
      const sources = [
        result.videoMp4
          ? `<source src="${escapeHtml(result.videoMp4)}" type="video/mp4">`
          : "",
        result.video
          ? `<source src="${escapeHtml(result.video)}" type="video/webm">`
          : ""
      ].join("");
      const video = sources ? `<video controls muted preload="metadata">${sources}</video>` : "";
      const errors = [result.error, ...(result.errors || [])].filter(Boolean);

      return `
        <article class="card">
          <header>
            <a href="${escapeHtml(result.url)}">${escapeHtml(result.name)}</a>
            <span class="status ${status}">${status}</span>
          </header>
          <div class="media">
            <div>${screenshot}</div>
            <div>${video}</div>
          </div>
          <p>data-exo nodes: ${escapeHtml(result.dataExoCount)}</p>
          ${
            errors.length
              ? `<pre>${escapeHtml(errors.join("\n"))}</pre>`
              : ""
          }
        </article>
      `;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ExoUI Component Capture</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; padding: 24px; background: Canvas; color: CanvasText; }
    main { display: grid; gap: 16px; }
    .summary { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    .card { border: 1px solid color-mix(in srgb, CanvasText 18%, transparent); border-radius: 8px; padding: 14px; display: grid; gap: 12px; }
    header { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
    a { color: inherit; font-weight: 700; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .status { border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .status.ok { background: color-mix(in srgb, #16a34a 18%, transparent); color: #15803d; }
    .status.check { background: color-mix(in srgb, #dc2626 18%, transparent); color: #b91c1c; }
    .media { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; align-items: start; }
    img, video { width: 100%; max-height: 540px; object-fit: contain; border-radius: 6px; background: color-mix(in srgb, CanvasText 6%, transparent); }
    p { margin: 0; color: color-mix(in srgb, CanvasText 72%, transparent); font-size: 13px; }
    pre { margin: 0; white-space: pre-wrap; color: #b91c1c; font-size: 12px; }
  </style>
</head>
<body>
  <main>
    <section class="summary">
      <strong>ExoUI component capture</strong>
      <span>${results.length} components</span>
      <span>${conversion.converted} MP4 videos</span>
      <span>Generated ${escapeHtml(new Date().toISOString())}</span>
    </section>
    ${rows}
  </main>
</body>
</html>
`;

  fs.writeFileSync(path.join(runDir, "viewer.html"), html);
}

async function main() {
  const stories = listStories();
  const runDir = path.join(OUT_ROOT, timestamp());
  fs.mkdirSync(runDir, { recursive: true });

  const browser = await chromium.launch();
  const results = [];

  try {
    for (const story of stories) {
      process.stdout.write(`capture ${story.name} ... `);
      const result = await captureComponent(browser, runDir, story);
      results.push(result);
      process.stdout.write(`${result.ok ? "ok" : "check"}\n`);
    }
  } finally {
    await browser.close();
  }

  const conversion = convertVideos(runDir, results);
  writeViewer(runDir, results, conversion);
  fs.writeFileSync(path.join(runDir, "manifest.json"), JSON.stringify(results, null, 2));
  writeIndex(runDir, results);
  fs.writeFileSync(
    path.join(OUT_ROOT, "latest.json"),
    JSON.stringify({ runDir, generatedAt: new Date().toISOString(), count: results.length }, null, 2)
  );

  const failed = results.filter((result) => !result.ok || result.error);
  console.log(JSON.stringify({ runDir, count: results.length, conversion, failed }, null, 2));

  if (failed.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
