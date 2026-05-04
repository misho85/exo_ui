const { test, expect } = require("@playwright/test");

const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

test.describe("command palette", () => {
  test("opens with Ctrl+K, focuses the input, and closes with Escape", async ({ page }) => {
    await gotoStory(page, "/components/menus/command_palette");

    const canvas = story(page);
    const palette = canvas.locator("#cmd-demo");
    const input = canvas.locator("#cmd-demo [data-exo=\"command-palette-input\"]");

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

  test("closes when the backdrop is clicked", async ({ page }) => {
    await gotoStory(page, "/components/menus/command_palette");

    const canvas = story(page);
    const palette = canvas.locator("#cmd-demo");
    const backdrop = canvas.locator("#cmd-demo [data-exo=\"command-palette-backdrop\"]");

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
    const palette = canvas.locator("#cmd-demo");
    const input = canvas.locator("#cmd-demo [data-exo=\"command-palette-input\"]");
    const docs = canvas.locator("#cmd-demo [data-exo=\"command-palette-item\"][data-value=\"docs\"]");
    const settings = canvas.locator("#cmd-demo [data-exo=\"command-palette-item\"][data-value=\"settings\"]");
    const empty = canvas.locator("#cmd-demo [data-exo=\"command-palette-empty\"]");

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
    const input = canvas.locator("#cmd-demo [data-exo=\"command-palette-input\"]");
    const empty = canvas.locator("#cmd-demo [data-exo=\"command-palette-empty\"]");

    await expectAttribute(canvas.locator("#cmd-demo"), "data-ready", "true");
    await page.keyboard.press("Control+k");
    await input.fill("nope");

    await expect(empty).toBeVisible();
  });
});
