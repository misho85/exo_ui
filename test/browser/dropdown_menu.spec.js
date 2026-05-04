const { test, expect } = require("@playwright/test");

const {
  expectFocused,
  expectPopoverState,
  gotoStory,
  story
} = require("./helpers/storybook");

test.describe("dropdown menu", () => {
  test("opens with a button trigger without nested button markup", async ({ page }) => {
    await gotoStory(page, "/components/menus/dropdown");

    const canvas = story(page);
    const root = canvas.locator("#dd-basic-popover");
    const triggerButton = root.locator('[data-exo="popover-trigger"] [data-exo="btn"]');
    const popover = page.locator("#dd-basic");

    await expect(root.locator("button button")).toHaveCount(0);
    await expect(root).toHaveAttribute("data-ready", "");

    await triggerButton.click();

    await expectPopoverState(popover, true);
    await expect(triggerButton).toHaveAttribute("aria-expanded", "true");

    const edit = popover.getByRole("menuitem", { name: /Edit/ });
    const duplicate = popover.getByRole("menuitem", { name: /Duplicate/ });
    const del = popover.getByRole("menuitem", { name: /Delete/ });

    await expectFocused(edit);
    await page.keyboard.press("ArrowDown");
    await expectFocused(duplicate);
    await page.keyboard.press("End");
    await expectFocused(del);
    await page.keyboard.press("Escape");
    await expectPopoverState(popover, false);
    await expectFocused(triggerButton);
  });

  test("skips disabled link items", async ({ page }) => {
    await gotoStory(page, "/components/menus/dropdown");

    const canvas = story(page);
    const root = canvas.locator("#dd-links-popover");
    const triggerButton = root.locator('[data-exo="popover-trigger"] [data-exo="btn"]');
    const popover = page.locator("#dd-links");
    const home = popover.getByRole("menuitem", { name: /Home/ });
    const settings = popover.getByRole("menuitem", { name: /Settings/ });
    const billing = popover.getByRole("menuitem", { name: /Billing/ });

    await expect(root).toHaveAttribute("data-ready", "");
    await triggerButton.click();

    await expectPopoverState(popover, true);
    await expectFocused(home);
    await expect(billing).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("End");
    await expectFocused(settings);
  });
});
