const { test, expect } = require("@playwright/test");

const { gotoStory, story } = require("./helpers/storybook");

test.describe("context menu", () => {
  test("opens on right click and closes on outside click", async ({ page }) => {
    await gotoStory(page, "/components/context_menu");

    const canvas = story(page);
    const root = canvas.locator("#ctx-demo");
    const trigger = canvas.locator("#ctx-demo [data-exo=\"context-menu-trigger\"]");
    const menu = canvas.locator("#ctx-demo [data-exo=\"context-menu-content\"]");

    await expect(root).toHaveAttribute("data-ready", "");
    await expect(menu).not.toHaveAttribute("data-open", "");
    await expect(menu.locator('[data-exo="context-menu-item"]')).toHaveCount(4);

    await trigger.click({ button: "right" });
    await expect(menu).toHaveAttribute("data-open", "");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.mouse.click(0, 0);
    await expect(menu).not.toHaveAttribute("data-open", "");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
