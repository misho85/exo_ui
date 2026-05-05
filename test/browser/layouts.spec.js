const { test, expect } = require("@playwright/test");
const {
  expectAttribute,
  expectFocused,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

async function expectWithinInert(locator, expected) {
  await expect
    .poll(async () =>
      locator.evaluate((node) => Boolean(node.inert || node.closest("[inert]")))
    )
    .toBe(expected);
}

test.describe("layout components", () => {
  test("sidebar layout syncs expanded state with button semantics and storage", async ({ page }) => {
    await gotoStory(page, "/layouts/sidebar_layout");

    const root = story(page).locator("#sidebar-layout-single-app-shell");
    const trigger = root.locator('[data-exo="sidebar-hamburger"]');
    const panel = root.locator("#sidebar-layout-single-app-shell-panel");
    const toggle = root.locator("#sidebar-layout-single-app-shell-toggle");

    await expectAttribute(root, "data-ready", "");
    await expectAttribute(root, "data-state", "open");
    await expectAttribute(panel, "data-state", "open");
    await expect(root.locator('[data-exo="sidebar-icon"] svg')).toHaveCount(4);
    await expect(trigger).toHaveAttribute("aria-controls", "sidebar-layout-single-app-shell-panel");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toBeChecked();

    await trigger.click();

    await expectAttribute(root, "data-state", "closed");
    await expectAttribute(panel, "data-state", "closed");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).not.toBeChecked();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("exo-sidebar-collapsed"))).toBe("true");

    await trigger.click();
    await expectAttribute(root, "data-state", "open");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("exo-sidebar-collapsed"))).toBe("false");

    await page.keyboard.press("Escape");
    await expectAttribute(root, "data-state", "closed");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expectFocused(trigger);
  });

  test("sidebar layout starts closed on mobile and overlay closes it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await gotoStory(page, "/layouts/sidebar_layout");

    const root = story(page).locator("#sidebar-layout-single-app-shell");
    const trigger = root.locator('[data-exo="sidebar-hamburger"]');
    const overlay = root.locator('[data-exo="sidebar-overlay"]');

    await expectAttribute(root, "data-ready", "");
    await expectAttribute(root, "data-state", "closed");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    await expectAttribute(root, "data-state", "open");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await overlay.click({ position: { x: 360, y: 40 } });
    await expectAttribute(root, "data-state", "closed");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("app shell workflow combines table, menus, forms, and overlay actions", async ({ page }) => {
    await gotoStory(page, "/components/layout/app_shell_workflow");

    const canvas = story(page);
    const root = canvas.locator("#app-shell-workflow");
    const actionsTrigger = canvas.getByRole("button", { name: "Workspace actions" });
    const actionsPopover = canvas.locator("#app-shell-actions");
    const paletteTrigger = canvas.getByRole("button", { name: "Open command palette" });
    const palette = canvas.locator("#app-shell-command");
    const paletteInput = palette.locator('[data-exo="command-palette-input"]');
    const filterCommand = palette.locator('[data-exo="command-palette-item"][data-value="filters"]');
    const sheet = canvas.locator("#app-shell-filter-sheet");
    const drawer = canvas.locator("#app-shell-account-drawer");
    const confirm = canvas.locator("#app-shell-archive-confirm");
    const ownerFilter = sheet.getByLabel("Risk owner");
    const reviewFilteredAccount = sheet.getByRole("button", { name: "Review filtered account" });
    const drawerClose = drawer.locator('[data-exo="drawer-close"]');
    const archiveButton = drawer.getByRole("button", { name: "Archive segment" });
    const validateArchive = confirm.getByRole("button", { name: "Validate archive" });

    await expect(root.locator('[data-exo="sidebar-icon"] svg')).toHaveCount(4);
    await expect(canvas.locator("#app-shell-accounts [data-exo=\"table-row\"]")).toHaveCount(4);
    await expect(canvas.getByRole("cell", { name: "Acme Corp", exact: true })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Review Acme Corp" })).toBeVisible();

    await actionsTrigger.click();
    await expectPopoverState(actionsPopover, true);
    await expect(canvas.getByRole("menuitem", { name: "Export CSV" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expectPopoverState(actionsPopover, false);

    await paletteTrigger.click();
    await expectAttribute(palette, "data-state", "open");
    await expectFocused(paletteInput);

    await paletteInput.fill("filters");
    await expect(filterCommand).toBeVisible();
    await expect(filterCommand).toHaveAttribute("data-active", "true");
    await paletteInput.press("Enter");

    await expectAttribute(palette, "data-state", "closed");
    await expectAttribute(sheet, "data-state", "open");
    await expectWithinInert(root, true);
    await expectWithinInert(sheet, false);
    await expect(ownerFilter).toHaveAttribute("aria-invalid", "true");
    await expect(sheet.locator('[data-exo="field-error"]')).toContainText(
      "Risk owner is required"
    );

    await reviewFilteredAccount.click();
    await expectAttribute(drawer, "data-state", "open");
    await expectAttribute(sheet, "data-overlay-covered", "true");
    await expectWithinInert(sheet, true);
    await expectWithinInert(drawer, false);
    await expectFocused(drawerClose);

    await archiveButton.click();
    await expectAttribute(confirm, "data-state", "open");
    await expectAttribute(drawer, "data-overlay-covered", "true");
    await expectWithinInert(drawer, true);

    await validateArchive.click();
    await expectAttribute(confirm, "data-state", "open");

    await page.keyboard.press("Escape");
    await expectAttribute(confirm, "data-state", "closed");
    await expectAttribute(drawer, "data-state", "open");
    await expect(drawer).not.toHaveAttribute("data-overlay-covered", "true");
    await expectWithinInert(drawer, false);
    await expectFocused(archiveButton);
  });
});
