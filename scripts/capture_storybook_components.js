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
const STORY_READY_TIMEOUT = Number.parseInt(process.env.CAPTURE_STORY_READY_TIMEOUT || "30000", 10);

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

async function clickButton(page, name) {
  return safe(page.getByRole("button", { name }), (node) => node.click({ timeout: 1500 }));
}

async function fillByLabel(page, name, value) {
  return safe(page.getByLabel(name), (node) => node.fill(value, { timeout: 1500 }));
}

async function checkByLabel(page, name) {
  return (
    (await safe(page.getByLabel(name), (node) => node.check({ timeout: 1500, force: true }))) ||
    safe(page.getByText(name, { exact: true }), (node) => node.click({ timeout: 1500 }))
  );
}

async function uncheckByLabel(page, name) {
  return (
    (await safe(page.getByLabel(name), (node) => node.uncheck({ timeout: 1500, force: true }))) ||
    safe(page.getByText(name, { exact: true }), (node) => node.click({ timeout: 1500 }))
  );
}

async function chooseSelectOption(page, selectId, value) {
  const trigger = page.locator(`#story-live #${selectId}-select [data-exo-select="trigger"]`);
  const option = page.locator(`#story-live #${selectId} [data-exo="select-option"][data-value="${value}"]`);

  if (!(await safe(trigger, (node) => node.click({ timeout: 1500 })))) return false;
  await page.waitForTimeout(150);
  return safe(option, (node) => node.click({ timeout: 1500 }));
}

async function chooseComboboxOption(page, comboboxId, query, value, trigger = "button") {
  const hook = page.locator(`#story-live #${comboboxId}-combobox`);
  const opener =
    trigger === "input"
      ? hook.locator('[data-exo-combobox="input-trigger"]')
      : hook.locator('[data-exo-combobox="trigger"]');
  const popover = page.locator(`#story-live #${comboboxId}`);
  const search =
    trigger === "input" ? opener : popover.locator('[data-exo="combobox-search"]');
  const option = popover.locator(
    `[data-exo="combobox-option"][data-value="${value}"]`
  );

  if (trigger === "input") {
    if (!(await safe(opener, (node) => node.focus({ timeout: 1500 })))) return false;
  } else if (!(await safe(opener, (node) => node.click({ timeout: 1500 })))) {
    return false;
  }

  await page.waitForTimeout(150);
  await safe(search, (node) => node.fill(query, { timeout: 1500 }));
  await page.waitForTimeout(250);
  return safe(option, (node) => node.click({ timeout: 1500 }));
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
    case "app_shell_workflow":
      await clickButton(page, "Open command palette");
      await page.waitForTimeout(300);
      await safe(page.locator('#story-live [data-exo="command-palette-input"]'), (node) =>
        node.fill("filters", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(350);
      await clickButton(page, "Review filtered account");
      await page.waitForTimeout(350);
      await clickButton(page, "Archive segment");
      await page.waitForTimeout(300);
      await clickButton(page, "Validate archive");
      await page.waitForTimeout(400);
      break;
    case "async_save_workflow":
      await safe(page.locator('#story-live #async-save-title'), (node) =>
        node.fill("Launch checklist v2", { timeout: 1500 })
      );
      await page.waitForTimeout(300);
      await clickButton(page, "Save changes");
      await page.waitForTimeout(900);
      break;
    case "bulk_action_workflow":
      await safe(page.locator('#story-live #bulk-filter-query'), (node) =>
        node.fill("north", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #bulk-filter-status'), (node) =>
        node.selectOption("blocked", { timeout: 1500 })
      );
      await page.waitForTimeout(300);
      await clickButton(page, "Select filtered");
      await page.waitForTimeout(250);
      await clickButton(page, "Queue bulk archive");
      await page.waitForTimeout(350);
      await clickButton(page, "Validate bulk archive");
      await page.waitForTimeout(400);
      break;
    case "bulk_edit_workflow":
      await safe(page.locator('#story-live #bulk-edit-status-filter'), (node) =>
        node.selectOption("needs_review", { timeout: 1500 })
      );
      await page.waitForTimeout(300);
      await clickButton(page, "Select filtered");
      await page.waitForTimeout(300);
      await safe(page.locator('#story-live #bulk-edit-owner'), (node) =>
        node.selectOption("Mina", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #bulk-edit-status'), (node) =>
        node.selectOption("ready", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await clickButton(page, "Apply bulk edit");
      await page.waitForTimeout(450);
      await clickButton(page, "Clear filters");
      await page.waitForTimeout(350);
      break;
    case "button_recipes":
      await clickButton(page, "Use Danger");
      await page.waitForTimeout(250);
      await clickButton(page, "Save draft");
      await page.waitForTimeout(300);
      await clickButton(page, "Finish save");
      await page.waitForTimeout(300);
      await clickButton(page, "Delete draft");
      await page.waitForTimeout(300);
      await clickButton(page, "Confirm delete");
      await page.waitForTimeout(350);
      break;
    case "input_recipes":
      await fillByLabel(page, "Work email", "bad-email");
      await page.waitForTimeout(250);
      await uncheckByLabel(page, "I confirm that required fields are accurate");
      await page.waitForTimeout(250);
      await fillByLabel(
        page,
        "Reviewer notes",
        "This note is intentionally too long for the recipe guard so the textarea can expose an aria-describedby error while preserving the description."
      );
      await page.waitForTimeout(300);
      await fillByLabel(page, "Work email", "lead@example.com");
      await fillByLabel(page, "Reviewer notes", "Ready for the next review.");
      await checkByLabel(page, "I confirm that required fields are accurate");
      await page.waitForTimeout(300);
      await clickButton(page, "Save input record");
      await page.waitForTimeout(350);
      break;
    case "select_recipes":
      await clickButton(page, "Clear required selections");
      await page.waitForTimeout(300);
      await chooseSelectOption(page, "select-recipe-status", "blocked");
      await page.waitForTimeout(250);
      await chooseSelectOption(page, "select-recipe-priority", "high");
      await page.waitForTimeout(250);
      await chooseSelectOption(page, "select-recipe-owner", "support");
      await page.waitForTimeout(300);
      await clickButton(page, "Save select record");
      await page.waitForTimeout(350);
      break;
    case "combobox_recipes":
      await clickButton(page, "Clear required comboboxes");
      await page.waitForTimeout(300);
      await chooseComboboxOption(page, "combobox-recipe-assignee", "nik", "nikola");
      await page.waitForTimeout(300);
      await chooseComboboxOption(page, "combobox-recipe-remote", "maria", "maria");
      await page.waitForTimeout(350);
      await chooseComboboxOption(page, "combobox-recipe-city", "bel", "bg", "input");
      await page.waitForTimeout(300);
      await clickButton(page, "Save combobox record");
      await page.waitForTimeout(350);
      break;
    case "table_recipes":
      await clickFirst(page, '#story-live #table-recipe-northstar [data-exo="table-cell"]');
      await page.waitForTimeout(250);
      await clickButton(page, "Review Northstar CRM");
      await page.waitForTimeout(300);
      await clickButton(page, "Blocked rows");
      await page.waitForTimeout(250);
      await clickButton(page, "Escalate Helio Labs");
      await page.waitForTimeout(300);
      await clickButton(page, "Empty state");
      await page.waitForTimeout(350);
      break;
    case "modal_recipes":
      await clickButton(page, "Open editor modal");
      await page.waitForTimeout(300);
      await fillByLabel(page, "Workspace owner", "Mina");
      await page.waitForTimeout(250);
      await clickButton(page, "Save modal changes");
      await page.waitForTimeout(350);
      await clickButton(page, "Open labelled modal");
      await page.waitForTimeout(300);
      await fillByLabel(page, "Invite email", "design@example.com");
      await page.waitForTimeout(250);
      await clickButton(page, "Send labelled invite");
      await page.waitForTimeout(350);
      await clickButton(page, "Open guarded confirm");
      await page.waitForTimeout(300);
      await clickButton(page, "Validate archive");
      await page.waitForTimeout(400);
      break;
    case "drawer_recipes":
      await clickButton(page, "Open review drawer");
      await page.waitForTimeout(300);
      await fillByLabel(page, "Account owner", "");
      await page.waitForTimeout(250);
      await clickButton(page, "Save drawer review");
      await page.waitForTimeout(350);
      await fillByLabel(page, "Account owner", "Mina");
      await page.waitForTimeout(250);
      await clickButton(page, "Save drawer review");
      await page.waitForTimeout(350);
      await clickButton(page, "Open navigation drawer");
      await page.waitForTimeout(300);
      await clickButton(page, "Open billing queue");
      await page.waitForTimeout(350);
      await clickButton(page, "Open filter drawer");
      await page.waitForTimeout(300);
      await safe(page.locator('#story-live #drawer-recipe-segment'), (node) =>
        node.selectOption("enterprise", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await checkByLabel(page, "Include archived accounts");
      await page.waitForTimeout(300);
      break;
    case "command_palette_recipes":
      await clickButton(page, "Open command palette");
      await page.waitForTimeout(300);
      await safe(
        page.locator('#story-live #command-recipe-primary [data-exo="command-palette-input"]'),
        (node) => node.fill("risk", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(350);
      await clickButton(page, "Open manual commands");
      await page.waitForTimeout(300);
      await safe(
        page.locator('#story-live #command-recipe-manual [data-exo="command-palette-input"]'),
        (node) => node.fill("preview", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(350);
      await safe(
        page.locator('#story-live #command-recipe-manual [data-exo="command-palette-input"]'),
        (node) => node.fill("apply", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(400);
      break;
    case "date_picker_recipes":
      await clickFirst(page, '#story-live #date-recipe-booking-date [aria-label="Next month"]');
      await page.waitForTimeout(350);
      await clickFirst(
        page,
        '#story-live #date-recipe-booking-date [data-exo="date-picker-day"][phx-value-date="2026-04-12"]'
      );
      await page.waitForTimeout(300);
      await clickButton(page, "Save booking date");
      await page.waitForTimeout(300);
      await clickButton(page, "Clear booking date");
      await page.waitForTimeout(300);
      await clickButton(page, "Save booking date");
      await page.waitForTimeout(400);
      break;
    case "access_review_workflow":
      await clickButton(page, "Open access commands");
      await page.waitForTimeout(300);
      await safe(
        page.locator('#story-live #access-review-command [data-exo="command-palette-input"]'),
        (node) => node.fill("high risk", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(350);
      await clickButton(page, "Open access review for Ana Markovic");
      await page.waitForTimeout(350);
      await clickButton(page, "Request evidence");
      await page.waitForTimeout(250);
      await fillByLabel(page, "Decision note", "Manager approval is missing.");
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #access-review-owner'), (node) =>
        node.selectOption("manager", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await clickButton(page, "Request evidence");
      await page.waitForTimeout(300);
      await clickButton(page, "Prepare revoke");
      await page.waitForTimeout(300);
      await clickButton(page, "Revoke access");
      await page.waitForTimeout(400);
      break;
    case "incident_response_workflow":
      await clickButton(page, "Open incident commands");
      await page.waitForTimeout(300);
      await safe(
        page.locator('#story-live #incident-command [data-exo="command-palette-input"]'),
        (node) => node.fill("critical", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(350);
      await clickButton(page, "Open incident Checkout API latency");
      await page.waitForTimeout(350);
      await clickButton(page, "Escalate incident");
      await page.waitForTimeout(250);
      await fillByLabel(page, "Triage note", "Payments rollback is ready.");
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #incident-owner'), (node) =>
        node.selectOption("payments", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await clickButton(page, "Escalate incident");
      await page.waitForTimeout(300);
      await clickButton(page, "Prepare resolve");
      await page.waitForTimeout(300);
      await clickButton(page, "Resolve incident");
      await page.waitForTimeout(400);
      break;
    case "release_readiness_workflow":
      await clickButton(page, "Prepare launch");
      await page.waitForTimeout(300);
      await clickButton(page, "Launch release");
      await page.waitForTimeout(300);
      await clickButton(page, "Keep reviewing");
      await page.waitForTimeout(250);
      await clickButton(page, "Open release commands");
      await page.waitForTimeout(300);
      await safe(
        page.locator('#story-live #release-command [data-exo="command-palette-input"]'),
        (node) => node.fill("engineering", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(350);
      await clickButton(page, "Review Migration smoke test");
      await page.waitForTimeout(350);
      await clickButton(page, "Approve check");
      await page.waitForTimeout(250);
      await fillByLabel(page, "Review note", "Smoke test reviewed and approved.");
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #release-reviewer'), (node) =>
        node.selectOption("engineering-lead", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await clickButton(page, "Approve check");
      await page.waitForTimeout(300);
      await clickButton(page, "Close review");
      await page.waitForTimeout(300);
      break;
    case "billing_dispute_workflow":
      await clickButton(page, "Open billing commands");
      await page.waitForTimeout(300);
      await safe(
        page.locator('#story-live #billing-command [data-exo="command-palette-input"]'),
        (node) => node.fill("payments", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(350);
      await clickButton(page, "Review Acme Corp");
      await page.waitForTimeout(350);
      await clickButton(page, "Prepare credit");
      await page.waitForTimeout(300);
      await clickButton(page, "Issue credit");
      await page.waitForTimeout(300);
      await clickButton(page, "Keep reviewing");
      await page.waitForTimeout(250);
      await clickButton(page, "Review Acme Corp");
      await page.waitForTimeout(350);
      await fillByLabel(page, "Review note", "Duplicate charge confirmed by invoice retry logs.");
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #billing-reviewer'), (node) =>
        node.selectOption("manager", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await clickButton(page, "Request evidence");
      await page.waitForTimeout(300);
      await clickButton(page, "Prepare credit");
      await page.waitForTimeout(300);
      await clickButton(page, "Issue credit");
      await page.waitForTimeout(400);
      break;
    case "onboarding_provisioning_workflow":
      await clickButton(page, "Open onboarding commands");
      await page.waitForTimeout(300);
      await safe(
        page.locator('#story-live #onboarding-command [data-exo="command-palette-input"]'),
        (node) => node.fill("identity", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(350);
      await clickButton(page, "Review Ana Markovic");
      await page.waitForTimeout(350);
      await clickButton(page, "Prepare activation");
      await page.waitForTimeout(300);
      await clickButton(page, "Activate account");
      await page.waitForTimeout(300);
      await clickButton(page, "Keep reviewing");
      await page.waitForTimeout(250);
      await clickButton(page, "Review Ana Markovic");
      await page.waitForTimeout(350);
      await fillByLabel(page, "Setup note", "SSO role mapping and workspace defaults are approved.");
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #onboarding-provisioner'), (node) =>
        node.selectOption("identity", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await clickButton(page, "Request setup info");
      await page.waitForTimeout(300);
      await clickButton(page, "Prepare activation");
      await page.waitForTimeout(300);
      await clickButton(page, "Activate account");
      await page.waitForTimeout(400);
      break;
    case "dashboard_drilldown_workflow":
      await clickButton(page, "At risk");
      await page.waitForTimeout(300);
      await safe(
        page.locator('#story-live #dashboard-account-northstar').getByRole("button", {
          name: "Open details"
        }),
        (node) => node.click({ timeout: 1500 })
      );
      await page.waitForTimeout(350);
      await clickButton(page, "Mark reviewed");
      await page.waitForTimeout(350);
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
      await clickButton(page, "Open command palette");
      await page.waitForTimeout(400);
      await safe(page.locator('#story-live [data-exo="command-palette-input"]'), (node) =>
        node.fill("settings", { timeout: 1500 })
      );
      await page.waitForTimeout(350);
      await page.keyboard.press("Escape");
      break;
    case "command_routing_workflow":
      await clickButton(page, "Review accounts");
      await page.waitForTimeout(350);
      await clickButton(page, "Open routing commands");
      await page.waitForTimeout(350);
      await safe(page.locator('#story-live [data-exo="command-palette-input"]'), (node) =>
        node.fill("risk", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(450);
      break;
    case "command_surface_stack":
      await clickButton(page, "Open command surface");
      await page.waitForTimeout(300);
      await clickButton(page, "Open filter commands");
      await page.waitForTimeout(300);
      await safe(page.locator('#story-live [data-exo="command-palette-input"]'), (node) =>
        node.fill("risk", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(350);
      await clickButton(page, "Archive segment");
      await page.waitForTimeout(300);
      await clickButton(page, "Validate archive");
      await page.waitForTimeout(400);
      break;
    case "data_table_workflow":
      await safe(page.locator('#story-live #data-table-segment'), (node) =>
        node.selectOption("emea", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #data-table-sort'), (node) =>
        node.selectOption("risk_desc", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #data-table-page-size'), (node) =>
        node.selectOption("2", { timeout: 1500 })
      );
      await page.waitForTimeout(300);
      await clickButton(page, "Next page");
      await page.waitForTimeout(400);
      break;
    case "import_export_workflow":
      await safe(page.locator('#story-live #import-export-file'), (node) =>
        node.setInputFiles({
          name: "accounts.csv",
          mimeType: "text/csv",
          buffer: Buffer.from("account,owner,amount\\nNorthstar,Iva,18000\\n")
        })
      );
      await page.waitForTimeout(250);
      await clickButton(page, "Review sample import");
      await page.waitForTimeout(300);
      await clickButton(page, "Validate import");
      await page.waitForTimeout(300);
      await clickButton(page, "Commit import");
      await page.waitForTimeout(300);
      await safe(page.locator('#story-live #export-format'), (node) =>
        node.selectOption("json", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await clickButton(page, "Prepare export");
      await page.waitForTimeout(400);
      break;
    case "role_operations_workflow":
      await clickButton(page, "Support");
      await page.waitForTimeout(300);
      await clickButton(page, "Blocked");
      await page.waitForTimeout(300);
      await safe(
        page.locator('#story-live #role-operation-task-helio-domain').getByRole("button", {
          name: "Open task"
        }),
        (node) => node.click({ timeout: 1500 })
      );
      await page.waitForTimeout(350);
      await clickButton(page, "Acknowledge task");
      await page.waitForTimeout(350);
      break;
    case "saved_filters_workflow":
      await safe(page.locator('#story-live #saved-filter-query'), (node) =>
        node.fill("north", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #saved-filter-status'), (node) =>
        node.selectOption("blocked", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await safe(page.locator('#story-live #saved-filter-owner'), (node) =>
        node.selectOption("unassigned", { timeout: 1500 })
      );
      await page.waitForTimeout(300);
      await clickButton(page, "Save current filter");
      await page.waitForTimeout(300);
      await clickButton(page, "Clear filters");
      await page.waitForTimeout(300);
      await clickButton(page, "Saved: north");
      await page.waitForTimeout(400);
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
    case "date_picker_controlled":
      await clickButton(page, "Next month");
      await page.waitForTimeout(350);
      await clickFirst(
        page,
        '#story-live [data-exo="date-picker-day"][phx-value-date="2026-04-12"]'
      );
      await page.waitForTimeout(300);
      break;
    case "dropdown":
    case "dropdown_menu":
      await clickFirst(page, '#story-live [data-exo="popover-trigger"]');
      await page.waitForTimeout(400);
      await page.keyboard.press("Escape");
      break;
    case "editable_record_workflow":
      await clickButton(page, "Open record commands");
      await page.waitForTimeout(350);
      await safe(page.locator('#story-live [data-exo="command-palette-input"]'), (node) =>
        node.fill("northstar", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(450);
      await clickButton(page, "Save record");
      await page.waitForTimeout(350);
      await clickButton(page, "Next month");
      await page.waitForTimeout(300);
      await clickFirst(
        page,
        '#story-live [data-exo="date-picker-day"][phx-value-date="2026-08-12"]'
      );
      await page.waitForTimeout(300);
      await clickButton(page, "Delete record");
      await page.waitForTimeout(300);
      await clickButton(page, "Validate delete");
      await page.waitForTimeout(400);
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
    case "overlay_stack":
      await clickButton(page, "Open stacked overlay flow");
      await page.waitForTimeout(250);
      await clickButton(page, "Open audit sheet");
      await page.waitForTimeout(250);
      await clickButton(page, "Open stacked drawer");
      await page.waitForTimeout(300);
      await clickButton(page, "Request rollback");
      await page.waitForTimeout(300);
      await clickButton(page, "Validate rollback");
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
    case "component_recipe_matrix":
      await clickButton(page, "Open command palette");
      await page.waitForTimeout(350);
      await safe(page.locator('#story-live [data-exo="command-palette-input"]'), (node) =>
        node.fill("drawer", { timeout: 1500 })
      );
      await page.waitForTimeout(250);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(400);
      await clickButton(page, "Open confirm modal");
      await page.waitForTimeout(300);
      await clickButton(page, "Validate recipe");
      await page.waitForTimeout(400);
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
