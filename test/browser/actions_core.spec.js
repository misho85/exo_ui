const { test, expect } = require("@playwright/test");

const { gotoStory, story } = require("./helpers/storybook");

test.describe("core action components", () => {
  test("button defaults to type button and disables link variants safely", async ({ page }) => {
    await gotoStory(page, "/components/actions/button");

    const canvas = story(page);
    const defaultButton = canvas.locator('button[data-exo="btn"]').first();
    const disabledLink = canvas.locator('[data-exo="btn"][aria-disabled="true"]');

    await expect(defaultButton).toHaveAttribute("type", "button");
    await expect(disabledLink).toHaveAttribute("role", "link");
    await expect(disabledLink).toHaveAttribute("tabindex", "-1");
    await expect(disabledLink).not.toHaveAttribute("href", /.+/);
  });

  test("theme toggle syncs active state and aria-pressed", async ({ page }) => {
    await gotoStory(page, "/components/actions/theme_toggle");

    const canvas = story(page);
    const toggle = canvas.locator('[data-exo="theme-toggle"]');
    const dark = toggle.getByRole("button", { name: "Dark theme" });

    await expect(toggle).toHaveAttribute("data-ready", "");
    await expect(toggle).toHaveAttribute("role", "group");
    await dark.click();

    await expect(dark).toHaveAttribute("data-active", "");
    await expect(dark).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("swap toggles switch state with keyboard and pointer", async ({ page }) => {
    await gotoStory(page, "/components/actions/swap");

    const canvas = story(page);
    const swap = canvas.locator("#swap-1");
    const input = swap.locator('[data-exo="swap-state"]');

    await expect(swap).toHaveAttribute("data-ready", "");
    await expect(swap).toHaveAttribute("role", "switch");
    await expect(swap).toHaveAttribute("aria-label", "Enable notifications");
    await expect(swap).toHaveAttribute("aria-checked", "false");
    await expect(input).not.toBeChecked();

    await swap.focus();
    await page.keyboard.press("Space");
    await expect(swap).toHaveAttribute("aria-checked", "true");
    await expect(input).toBeChecked();

    await swap.click();
    await expect(swap).toHaveAttribute("aria-checked", "false");
    await expect(input).not.toBeChecked();
  });
});
