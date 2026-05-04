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

  test("reduced motion media query shortens component transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoStory(page, "/components/actions/button");

    const defaultButton = story(page).locator('button[data-exo="btn"]').first();
    const durations = await defaultButton.evaluate((node) =>
      getComputedStyle(node)
        .transitionDuration.split(",")
        .map((duration) => duration.trim())
    );

    expect(durations.every((duration) => duration === "0.001s" || duration === "0s")).toBe(true);
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

  test("theme toggle keeps working when localStorage writes fail", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await gotoStory(page, "/components/actions/theme_toggle");

    const toggle = story(page).locator('[data-exo="theme-toggle"]');
    const dark = toggle.getByRole("button", { name: "Dark theme" });

    await expect(toggle).toHaveAttribute("data-ready", "");
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new Error("storage blocked");
      };
    });

    await dark.click();

    await expect(dark).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(errors).toEqual([]);
  });

  test("swap toggles switch state with keyboard and pointer", async ({ page }) => {
    await gotoStory(page, "/components/actions/swap");

    const canvas = story(page);
    const swap = canvas.getByRole("switch", { name: "Enable notifications" });
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

  test("toggle exposes switch semantics and updates visual state from the checked input", async ({ page }) => {
    await gotoStory(page, "/components/actions/toggle");

    const canvas = story(page);
    const toggle = canvas.locator('[data-exo="toggle"]').first();
    const input = toggle.locator('input[type="checkbox"]');
    const thumb = toggle.locator('[data-exo="toggle-thumb"]');

    await expect(input).toHaveAttribute("role", "switch");
    await expect(input).toHaveAccessibleName("Toggle");
    await expect(input).not.toBeChecked();

    const before = await thumb.evaluate((node) => getComputedStyle(node).transform);
    await toggle.click();

    await expect(input).toBeChecked();
    await expect
      .poll(async () => thumb.evaluate((node) => getComputedStyle(node).transform))
      .not.toBe(before);
  });
});
