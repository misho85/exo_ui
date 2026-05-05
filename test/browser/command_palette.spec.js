const { test, expect } = require("@playwright/test");

const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

async function expectWithinInert(locator, expected) {
  await expect
    .poll(async () =>
      locator.evaluate((node) => Boolean(node.inert || node.closest("[inert]")))
    )
    .toBe(expected);
}

async function expectHtmlOverflow(page, expected) {
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.style.overflow))
    .toBe(expected);
}

test.describe("command palette", () => {
  test("opens with Ctrl+K, focuses the input, and closes with Escape", async ({ page }) => {
    await gotoStory(page, "/components/menus/command_palette");

    const canvas = story(page);
    const palette = canvas.locator("#command-palette-single-default");
    const input = canvas.locator('#command-palette-single-default [data-exo="command-palette-input"]');

    await expectAttribute(palette, "data-state", "closed");
    await expect(palette).toBeHidden();

    await page.keyboard.press("Control+k");

    await expectAttribute(palette, "data-state", "open");
    await expect(palette).toBeVisible();
    await expect(palette).toHaveClass(/open/);
    await expectFocused(input);

    await input.fill("docs");
    await input.press("Escape");

    await expectAttribute(palette, "data-state", "closed");
    await expect(palette).toBeHidden();
    await expect(input).toHaveValue("");
  });

  test("opens from a trigger, traps focus, and restores focus on close", async ({ page }) => {
    await gotoStory(page, "/components/menus/command_palette");

    const canvas = story(page);
    const trigger = canvas.locator('#default-component button[data-exo="btn"]').first();
    const palette = canvas.locator("#command-palette-single-default");
    const input = palette.locator('[data-exo="command-palette-input"]');
    const originalHtmlOverflow = await page.evaluate(() => document.documentElement.style.overflow);

    await expectAttribute(palette, "data-state", "closed");
    await trigger.click();

    await expectAttribute(palette, "data-state", "open");
    await expect(palette).toHaveAttribute("aria-hidden", "false");
    await expect(palette).toHaveAttribute("data-overlay-stack-index", /\d+/);
    await expectWithinInert(trigger, true);
    await expectHtmlOverflow(page, "hidden");
    await expectFocused(input);

    await page.keyboard.press("Tab");
    await expectFocused(input);

    await page.keyboard.press("Escape");
    await expectAttribute(palette, "data-state", "closed");
    await expect(palette).toHaveAttribute("aria-hidden", "true");
    await expectWithinInert(trigger, false);
    await expectHtmlOverflow(page, originalHtmlOverflow);
    await expectFocused(trigger);
  });

  test("can launch from a sheet, open a drawer command, and guard destructive actions", async ({
    page
  }) => {
    await gotoStory(page, "/components/menus/command_surface_stack");

    const canvas = story(page);
    const trigger = canvas.getByRole("button", { name: "Open command surface" });
    const sheet = canvas.locator("#command-surface-sheet");
    const palette = canvas.locator("#command-surface-palette");
    const drawer = canvas.locator("#command-surface-drawer");
    const confirm = canvas.locator("#command-surface-confirm");
    const openCommands = sheet.getByRole("button", { name: "Open filter commands" });
    const paletteInput = palette.locator('[data-exo="command-palette-input"]');
    const riskDrawerItem = palette.locator('[data-exo="command-palette-item"][data-value="risk-drawer"]');
    const drawerClose = drawer.locator('[data-exo="drawer-close"]');
    const archiveButton = drawer.getByRole("button", { name: "Archive segment" });
    const validateArchive = confirm.getByRole("button", { name: "Validate archive" });

    await trigger.click();
    await expectAttribute(sheet, "data-state", "open");
    await expect(sheet).toHaveAttribute("aria-hidden", "false");
    await expectWithinInert(sheet, false);
    await expectWithinInert(palette, false);

    await openCommands.click();
    await expectAttribute(palette, "data-state", "open");
    await expect(palette).toHaveAttribute("aria-hidden", "false");
    await expectAttribute(sheet, "data-overlay-covered", "true");
    await expectWithinInert(sheet, true);
    await expectFocused(paletteInput);

    await paletteInput.fill("risk");
    await expect(riskDrawerItem).toBeVisible();
    await expect(riskDrawerItem).toHaveAttribute("data-active", "true");
    await paletteInput.press("Enter");

    await expectAttribute(palette, "data-state", "closed");
    await expectAttribute(drawer, "data-state", "open");
    await expectAttribute(sheet, "data-overlay-covered", "true");
    await expectWithinInert(sheet, true);
    await expect(drawer).toHaveAttribute("aria-hidden", "false");
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

  test("matches custom shortcuts without letting manual palettes intercept them", async ({ page }) => {
    await gotoStory(page, "/components/menus/command_palette");

    const canvas = story(page);
    const defaultPalette = canvas.locator("#command-palette-single-default");
    const customPalette = canvas.locator("#command-palette-single-custom-shortcut");
    const manualPalette = canvas.locator("#command-palette-single-manual-only");
    const customInput = customPalette.locator('[data-exo="command-palette-input"]');

    await expectAttribute(defaultPalette, "data-state", "closed");
    await expectAttribute(customPalette, "data-state", "closed");
    await expectAttribute(manualPalette, "data-state", "closed");

    await page.keyboard.press("Control+j");

    await expectAttribute(customPalette, "data-state", "open");
    await expectAttribute(defaultPalette, "data-state", "closed");
    await expectAttribute(manualPalette, "data-state", "closed");
    await expectFocused(customInput);

    await page.keyboard.press("Escape");
    await expectAttribute(customPalette, "data-state", "closed");

    await page.keyboard.press("Control+k");
    await expectAttribute(defaultPalette, "data-state", "open");
    await expectAttribute(manualPalette, "data-state", "closed");
  });

  test("closes when the backdrop is clicked", async ({ page }) => {
    await gotoStory(page, "/components/menus/command_palette");

    const canvas = story(page);
    const palette = canvas.locator("#command-palette-single-default");
    const backdrop = canvas.locator('#command-palette-single-default [data-exo="command-palette-backdrop"]');

    await expectAttribute(palette, "data-state", "closed");
    await expect(palette).toBeHidden();

    await page.keyboard.press("Control+k");
    await expectAttribute(palette, "data-state", "open");
    await expect(palette).toBeVisible();

    await backdrop.click({ position: { x: 8, y: 8 } });

    await expectAttribute(palette, "data-state", "closed");
    await expect(palette).toBeHidden();
  });

  test("filters items and selects the active command with Enter", async ({ page }) => {
    await gotoStory(page, "/components/menus/command_palette");

    const canvas = story(page);
    const palette = canvas.locator("#command-palette-single-default");
    const input = canvas.locator('#command-palette-single-default [data-exo="command-palette-input"]');
    const docs = canvas.locator('#command-palette-single-default [data-exo="command-palette-item"][data-value="docs"]');
    const settings = canvas.locator(
      '#command-palette-single-default [data-exo="command-palette-item"][data-value="settings"]'
    );
    const empty = canvas.locator('#command-palette-single-default [data-exo="command-palette-empty"]');

    await expectAttribute(palette, "data-ready", "true");
    await expectAttribute(palette, "data-state", "closed");
    await page.keyboard.press("Control+k");
    await expectAttribute(palette, "data-state", "open");

    await input.fill("settings");
    await expect(docs).toBeHidden();
    await expect(settings).toBeVisible();
    await expect(empty).toBeHidden();
    await expect(settings).toHaveAttribute("data-active", "true");

    await input.press("Enter");

    await expectAttribute(palette, "data-state", "closed");
    await expect(palette).toBeHidden();
    await expect(input).toHaveValue("");
  });

  test("shows the empty state when filtering has no matches", async ({ page }) => {
    await gotoStory(page, "/components/menus/command_palette");

    const canvas = story(page);
    const input = canvas.locator('#command-palette-single-default [data-exo="command-palette-input"]');
    const empty = canvas.locator('#command-palette-single-default [data-exo="command-palette-empty"]');

    await expectAttribute(canvas.locator("#command-palette-single-default"), "data-ready", "true");
    await page.keyboard.press("Control+k");
    await input.fill("nope");

    await expect(empty).toBeVisible();
  });
});
