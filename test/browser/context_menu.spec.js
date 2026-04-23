const { test, expect } = require("@playwright/test");

const { gotoStory, story } = require("./helpers/storybook");

test.describe("context menu", () => {
  test("opens on right click and closes on outside click", async ({ page }) => {
    await gotoStory(page, "/components/context_menu");

    const canvas = story(page);
    const trigger = canvas.locator("#ctx-demo [data-exo=\"context-menu-trigger\"]");
    const menu = canvas.locator("#ctx-demo [data-exo=\"context-menu-content\"]");

    await expect(menu).not.toHaveAttribute("data-open", "");

    await trigger.click({ button: "right" });
    await expect(menu).toHaveAttribute("data-open", "");

    await page.mouse.click(0, 0);
    await expect(menu).not.toHaveAttribute("data-open", "");
  });
});
