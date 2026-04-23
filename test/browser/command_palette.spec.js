const { test, expect } = require("@playwright/test");

const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

test.describe("command palette", () => {
  test("opens with Ctrl+K, focuses the input, and closes with Escape", async ({ page }) => {
    await gotoStory(page, "/components/command_palette");

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
    await gotoStory(page, "/components/command_palette");

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
});
