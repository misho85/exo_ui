const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const ROOT = path.resolve(__dirname, "..");
const CAPTURE_ROOT = path.join(ROOT, "output", "playwright", "exo-ui-components");
const DIFF_ROOT = path.join(ROOT, "output", "playwright", "exo-ui-visual-diffs");
const DEFAULT_BASELINE = path.join(ROOT, "test", "visual-baselines", "exo-ui-components");

function parseArgs(argv) {
  const args = {
    command: "check",
    baseline: process.env.VISUAL_BASELINE_DIR || DEFAULT_BASELINE,
    run: process.env.VISUAL_RUN_DIR || null,
    maxDiffRatio: Number.parseFloat(process.env.VISUAL_MAX_DIFF_RATIO || "0.005"),
    threshold: Number.parseFloat(process.env.VISUAL_PIXEL_THRESHOLD || "0.1")
  };

  const rest = [...argv];
  if (rest[0] && !rest[0].startsWith("--")) args.command = rest.shift();

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    const next = rest[index + 1];

    if (arg === "--baseline") {
      args.baseline = path.resolve(next);
      index += 1;
    } else if (arg === "--run") {
      args.run = path.resolve(next);
      index += 1;
    } else if (arg === "--max-diff-ratio") {
      args.maxDiffRatio = Number.parseFloat(next);
      index += 1;
    } else if (arg === "--threshold") {
      args.threshold = Number.parseFloat(next);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!["check", "update", "validate"].includes(args.command)) {
    throw new Error(`Unknown command "${args.command}". Use check, update, or validate.`);
  }

  return args;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function latestRunDir() {
  const pointerPath = path.join(CAPTURE_ROOT, "latest.json");

  if (fs.existsSync(pointerPath)) {
    const pointer = JSON.parse(fs.readFileSync(pointerPath, "utf8"));
    if (pointer.runDir && fs.existsSync(pointer.runDir)) return pointer.runDir;
  }

  if (!fs.existsSync(CAPTURE_ROOT)) {
    throw new Error(`No capture output directory found at ${CAPTURE_ROOT}`);
  }

  const runs = fs
    .readdirSync(CAPTURE_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(CAPTURE_ROOT, entry.name))
    .filter((entryPath) => fs.existsSync(path.join(entryPath, "manifest.json")))
    .sort();

  if (!runs.length) throw new Error(`No capture manifest found under ${CAPTURE_ROOT}`);
  return runs[runs.length - 1];
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readRun(runDir) {
  const manifestPath = path.join(runDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) throw new Error(`Missing capture manifest: ${manifestPath}`);

  const entries = readJson(manifestPath);
  if (!Array.isArray(entries)) throw new Error(`Capture manifest must be an array: ${manifestPath}`);

  return { runDir, entries };
}

function hashFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function validateRunArtifacts(run) {
  const failures = [];

  for (const entry of run.entries) {
    if (!entry.ok) failures.push(`${entry.name}: capture status is not ok`);
    if (entry.error) failures.push(`${entry.name}: ${entry.error}`);
    if ((entry.errors || []).length > 0) failures.push(`${entry.name}: browser errors: ${entry.errors.join("; ")}`);

    for (const key of ["screenshot", "video", "videoMp4"]) {
      const relative = entry[key];
      const filePath = relative ? path.join(run.runDir, relative) : null;
      if (!relative || !fs.existsSync(filePath)) {
        failures.push(`${entry.name}: missing ${key}`);
      } else if (fs.statSync(filePath).size === 0) {
        failures.push(`${entry.name}: empty ${key}`);
      }
    }
  }

  return failures;
}

function ensureCleanDir(dir) {
  fs.rmSync(dir, { force: true, recursive: true });
  fs.mkdirSync(dir, { recursive: true });
}

function updateBaseline(run, baselineDir) {
  const failures = validateRunArtifacts(run);
  if (failures.length) {
    return { ok: false, failures };
  }

  const screenshotsDir = path.join(baselineDir, "screenshots");
  ensureCleanDir(screenshotsDir);

  const entries = run.entries.map((entry) => {
    const source = path.join(run.runDir, entry.screenshot);
    const screenshot = path.basename(entry.screenshot);
    const target = path.join(screenshotsDir, screenshot);
    fs.copyFileSync(source, target);

    const png = readPng(target);

    return {
      name: entry.name,
      route: entry.route,
      screenshot: path.join("screenshots", screenshot),
      dataExoCount: entry.dataExoCount,
      width: png.width,
      height: png.height,
      sha256: hashFile(target)
    };
  });

  const manifest = {
    version: 1,
    updatedAt: new Date().toISOString(),
    sourceRun: path.relative(ROOT, run.runDir),
    count: entries.length,
    entries
  };

  fs.writeFileSync(path.join(baselineDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return { ok: true, count: entries.length, baselineDir };
}

function entriesByName(entries) {
  return new Map(entries.map((entry) => [entry.name, entry]));
}

async function checkBaseline(run, baselineDir, options) {
  const pixelmatch = (await import("pixelmatch")).default;
  const baselineManifestPath = path.join(baselineDir, "manifest.json");
  if (!fs.existsSync(baselineManifestPath)) {
    throw new Error(`Missing visual baseline manifest: ${baselineManifestPath}`);
  }

  const baseline = readJson(baselineManifestPath);
  const baselineEntries = baseline.entries || [];
  const runEntriesByName = entriesByName(run.entries);
  const baselineEntriesByName = entriesByName(baselineEntries);
  const failures = validateRunArtifacts(run);
  const diffDir = path.join(DIFF_ROOT, timestamp());

  for (const entry of baselineEntries) {
    if (!runEntriesByName.has(entry.name)) failures.push(`${entry.name}: missing from current capture`);
  }

  for (const entry of run.entries) {
    if (!baselineEntriesByName.has(entry.name)) failures.push(`${entry.name}: missing from visual baseline`);
  }

  for (const baselineEntry of baselineEntries) {
    const currentEntry = runEntriesByName.get(baselineEntry.name);
    if (!currentEntry) continue;

    const baselinePath = path.join(baselineDir, baselineEntry.screenshot);
    const currentPath = path.join(run.runDir, currentEntry.screenshot);

    if (!fs.existsSync(baselinePath)) {
      failures.push(`${baselineEntry.name}: missing baseline screenshot`);
      continue;
    }

    const baselinePng = readPng(baselinePath);
    const currentPng = readPng(currentPath);

    if (baselinePng.width !== currentPng.width || baselinePng.height !== currentPng.height) {
      failures.push(
        `${baselineEntry.name}: size changed from ${baselinePng.width}x${baselinePng.height} to ${currentPng.width}x${currentPng.height}`
      );
      continue;
    }

    const diff = new PNG({ width: baselinePng.width, height: baselinePng.height });
    const diffPixels = pixelmatch(
      baselinePng.data,
      currentPng.data,
      diff.data,
      baselinePng.width,
      baselinePng.height,
      { threshold: options.threshold }
    );
    const diffRatio = diffPixels / (baselinePng.width * baselinePng.height);

    if (diffRatio > options.maxDiffRatio) {
      fs.mkdirSync(diffDir, { recursive: true });
      const diffPath = path.join(diffDir, currentEntry.screenshot.replace(/[\\/]/g, "__"));
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
      failures.push(
        `${baselineEntry.name}: visual diff ${(diffRatio * 100).toFixed(3)}% exceeds ${(options.maxDiffRatio * 100).toFixed(3)}% (${diffPath})`
      );
    }
  }

  return {
    ok: failures.length === 0,
    count: run.entries.length,
    baselineCount: baselineEntries.length,
    baselineDir,
    runDir: run.runDir,
    diffDir: fs.existsSync(diffDir) ? diffDir : null,
    failures
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = args.run || latestRunDir();
  const run = readRun(runDir);

  let result;

  if (args.command === "validate") {
    const failures = validateRunArtifacts(run);
    result = { ok: failures.length === 0, count: run.entries.length, runDir, failures };
  } else if (args.command === "update") {
    result = updateBaseline(run, args.baseline);
  } else {
    result = await checkBaseline(run, args.baseline, args);
  }

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
