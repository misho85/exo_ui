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
    await expect(trigger).toHaveAttribute("role", "button");
    await expect(trigger).toHaveAttribute("tabindex", "0");
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
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

const { mountHook, fixture } = require('./helpers/hooks');

test('destroying an opening context menu cancels deferred positioning and focus', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install();
  await fixture(page, `<div id="menu">
    <div data-exo="context-menu-trigger">Open</div>
    <div data-exo="context-menu-content"><button data-exo="context-menu-item">Action</button></div>
  </div>`);
  await mountHook(page, 'ExoContextMenu', 'context_menu.js', '#menu');
  await page.evaluate(() => {
    const hook = window.testHooks['#menu'];
    hook._openAt(10, 10);
    hook.destroyed();
  });
  await page.clock.runFor(50);
  expect(errors).toEqual([]);
});
