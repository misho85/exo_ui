const { test, expect } = require("@playwright/test");

const { expectPopoverState, gotoStory, story } = require("./helpers/storybook");

test.describe("popover", () => {
  test("opens, closes, and keeps aria-expanded in sync", async ({ page }) => {
    await gotoStory(page, "/components/popover");

    const canvas = story(page);
    const trigger = canvas.locator("#pop-default-popover [data-exo=\"popover-trigger\"]");
    const content = canvas.locator("#pop-default");

    await expect(canvas.locator("#pop-default-popover")).toHaveAttribute("data-ready", "");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expectPopoverState(content, false);

    await trigger.click();

    await expectPopoverState(content, true);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");

    await expectPopoverState(content, false);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("updates aria-expanded when the popover closes via its close button", async ({ page }) => {
    await gotoStory(page, "/components/popover");

    const canvas = story(page);
    const trigger = canvas.locator("#pop-close-popover [data-exo=\"popover-trigger\"]");
    const content = canvas.locator("#pop-close");
    const closeButton = canvas.getByRole("button", { name: "Close" });

    await expect(canvas.locator("#pop-close-popover")).toHaveAttribute("data-ready", "");
    await trigger.click();

    await expectPopoverState(content, true);
    await closeButton.click();

    await expectPopoverState(content, false);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
