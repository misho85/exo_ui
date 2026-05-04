const { test, expect } = require("@playwright/test");
const { expectAttribute, expectFocused, gotoStory, story } = require("./helpers/storybook");

test.describe("layout components", () => {
  test("sidebar layout syncs expanded state with button semantics and storage", async ({ page }) => {
    await gotoStory(page, "/layouts/sidebar_layout");

    const root = story(page).locator("#demo-sidebar");
    const trigger = root.locator('[data-exo="sidebar-hamburger"]');
    const panel = root.locator("#demo-sidebar-panel");
    const toggle = root.locator("#demo-sidebar-toggle");

    await expectAttribute(root, "data-ready", "");
    await expectAttribute(root, "data-state", "open");
    await expectAttribute(panel, "data-state", "open");
    await expect(trigger).toHaveAttribute("aria-controls", "demo-sidebar-panel");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toBeChecked();

    await trigger.click();

    await expectAttribute(root, "data-state", "closed");
    await expectAttribute(panel, "data-state", "closed");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).not.toBeChecked();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("exo-sidebar-collapsed"))).toBe("true");

    await trigger.click();
    await expectAttribute(root, "data-state", "open");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("exo-sidebar-collapsed"))).toBe("false");

    await page.keyboard.press("Escape");
    await expectAttribute(root, "data-state", "closed");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expectFocused(trigger);
  });

  test("sidebar layout starts closed on mobile and overlay closes it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await gotoStory(page, "/layouts/sidebar_layout");

    const root = story(page).locator("#demo-sidebar");
    const trigger = root.locator('[data-exo="sidebar-hamburger"]');
    const overlay = root.locator('[data-exo="sidebar-overlay"]');

    await expectAttribute(root, "data-ready", "");
    await expectAttribute(root, "data-state", "closed");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    await expectAttribute(root, "data-state", "open");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await overlay.click({ position: { x: 360, y: 40 } });
    await expectAttribute(root, "data-state", "closed");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
