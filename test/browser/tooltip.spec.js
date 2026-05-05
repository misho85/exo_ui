const { test, expect } = require("@playwright/test");

const {
  expectAttribute,
  expectFocused,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("tooltip", () => {
  test("opens on hover and closes on mouse leave", async ({ page }) => {
    await gotoStory(page, "/components/overlays/tooltip");

    const canvas = story(page);
    const anchor = canvas.locator('#tooltip-single-fast-delay [data-exo="tooltip-anchor"]');
    const content = canvas.locator("#tooltip-single-fast-delay-content");

    await expectAttribute(content, "popover", "manual");
    await expectPopoverState(content, false);

    await anchor.hover();

    await expectPopoverState(content, true);
    await expect(content).toBeVisible();

    await page.mouse.move(0, 0);

    await expectPopoverState(content, false);
  });

  test("opens on focus and closes on escape", async ({ page }) => {
    await gotoStory(page, "/components/overlays/tooltip");

    const canvas = story(page);
    const anchor = canvas.locator('#tooltip-single-fast-delay [data-exo="tooltip-anchor"]');
    const content = canvas.locator("#tooltip-single-fast-delay-content");

    await expectAttribute(content, "popover", "manual");
    await anchor.focus();
    await expectFocused(anchor);
    await expectPopoverState(content, true);
    await expect(content).toBeVisible();

    await anchor.press("Escape");

    await expectPopoverState(content, false);
    await expect(content).toBeHidden();
  });
});
