const { test, expect } = require("@playwright/test");

const { gotoStory, story, expectPopoverState } = require("./helpers/storybook");

test.describe("dropdown menu", () => {
  test("opens with a button trigger without nested button markup", async ({ page }) => {
    await gotoStory(page, "/components/dropdown");

    const canvas = story(page);
    const root = canvas.locator("#dd-basic-popover");
    const triggerButton = root.locator('[data-exo="popover-trigger"] [data-exo="btn"]');
    const popover = page.locator("#dd-basic");

    await expect(root.locator("button button")).toHaveCount(0);
    await expect(root).toHaveAttribute("data-ready", "");

    await triggerButton.click();

    await expectPopoverState(popover, true);
    await expect(triggerButton).toHaveAttribute("aria-expanded", "true");
  });
});
