const { test, expect } = require("@playwright/test");

const { expectFocused, gotoStory, story } = require("./helpers/storybook");

test.describe("context menu", () => {
  test("opens on right click and closes on outside click", async ({ page }) => {
    await gotoStory(page, "/components/menus/context_menu");

    const canvas = story(page);
    const root = canvas.locator("#context-menu-single-default");
    const trigger = canvas.locator('#context-menu-single-default [data-exo="context-menu-trigger"]');
    const menu = canvas.locator('#context-menu-single-default [data-exo="context-menu-content"]');

    await expect(root).toHaveAttribute("data-ready", "");
    await expect(trigger).toHaveAttribute("aria-controls", "context-menu-single-default-content");
    await expect(menu).not.toHaveAttribute("data-open", "");
    await expect(menu.locator('[data-exo="context-menu-item"]')).toHaveCount(4);

    await trigger.click({ button: "right" });
    await expect(menu).toHaveAttribute("data-open", "");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expectFocused(menu.getByRole("menuitem", { name: "Copy" }));

    await page.mouse.click(0, 0);
    await expect(menu).not.toHaveAttribute("data-open", "");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("opens from keyboard and skips disabled items", async ({ page }) => {
    await gotoStory(page, "/components/menus/context_menu");

    const canvas = story(page);
    const root = canvas.locator("#context-menu-single-default");
    const trigger = canvas.locator('#context-menu-single-default [data-exo="context-menu-trigger"]');
    const menu = canvas.locator('#context-menu-single-default [data-exo="context-menu-content"]');
    const copy = menu.getByRole("menuitem", { name: "Copy" });
    const paste = menu.getByRole("menuitem", { name: "Paste" });
    const del = menu.getByRole("menuitem", { name: "Delete" });

    await expect(root).toHaveAttribute("data-ready", "");
    await trigger.focus();
    await page.keyboard.press("ContextMenu");

    await expect(menu).toHaveAttribute("data-open", "");
    await expectFocused(copy);
    await expect(del).toHaveAttribute("aria-disabled", "true");

    await page.keyboard.press("End");
    await expectFocused(paste);

    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveAttribute("data-open", "");
    await expectFocused(trigger);
  });
});
